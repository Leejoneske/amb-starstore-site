import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ApproveRequest = {
  applicationId: string;
  applicantEmail: string;
  applicantName: string;
};

function genTempPassword() {
  const s = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `STAR${s}`;
}

function genReferralCode() {
  return Math.random().toString().slice(2, 10); // 8 digits
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!;

    const authHeader = req.headers.get('Authorization') || '';
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const serviceClient = createClient(supabaseUrl, serviceKey);

    // Verify requester is admin
    const { data: userRes, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userRes.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const adminId = userRes.user.id;
    const { data: roleRow, error: roleErr } = await userClient
      .from('user_roles')
      .select('role')
      .eq('user_id', adminId)
      .maybeSingle();
    if (roleErr || !roleRow || roleRow.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin only' }), { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const { applicationId, applicantEmail, applicantName }: ApproveRequest = await req.json();
    if (!applicationId || !applicantEmail || !applicantName) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const tempPassword = genTempPassword();
    const referralCode = genReferralCode().toUpperCase();

    // 1) Create or find user in Auth
    let newUserId: string | null = null;
    const createRes = await serviceClient.auth.admin.createUser({
      email: applicantEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: applicantName },
    });

    if (createRes.error) {
      // If already exists, fetch by email (scan first page)
      const list = await serviceClient.auth.admin.listUsers({ page: 1, perPage: 200 });
      const existing = list.data?.users?.find((u: { email?: string }) => u.email?.toLowerCase() === applicantEmail.toLowerCase());
      if (!existing) {
        // Admin create user failed
        return new Response(JSON.stringify({ error: 'Failed to create user' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }
      newUserId = existing.id;
    } else {
      newUserId = createRes.data.user?.id || null;
    }

    if (!newUserId) {
      return new Response(JSON.stringify({ error: 'User creation returned no ID' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    // 2) Upsert profile
    const { error: profileErr } = await serviceClient
      .from('profiles')
      .upsert({ id: newUserId, email: applicantEmail, full_name: applicantName })
      .eq('id', newUserId);
    if (profileErr) {
      // Profile upsert error
      return new Response(JSON.stringify({ error: 'Failed to create profile' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    // 3) Upsert ambassador profile
    const { error: ambErr } = await serviceClient
      .from('ambassador_profiles')
      .upsert({ user_id: newUserId, referral_code: referralCode, status: 'active', approved_at: new Date().toISOString(), approved_by: adminId })
      .eq('user_id', newUserId);
    if (ambErr) {
      // Ambassador upsert error
      return new Response(JSON.stringify({ error: 'Failed to create ambassador profile' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    // 4) Update application status
    const { error: appErr } = await serviceClient
      .from('applications')
      .update({ status: 'approved', reviewed_at: new Date().toISOString(), reviewed_by: adminId })
      .eq('id', applicationId);
    if (appErr) {
      // Application update error
      return new Response(JSON.stringify({ error: 'Failed to update application' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    // 5) Create message record and send approval email
    let emailSent = false;
    let emailError = null;
    let messageId = null;
    
    try {
      // First create a message record
      const { data: messageData, error: messageErr } = await serviceClient
        .from('messages')
        .insert({
          recipient_email: applicantEmail,
          recipient_name: applicantName,
          user_id: newUserId,
          ambassador_id: ambassadorId,
          subject: 'Congratulations! Your Ambassador Application is Approved',
          message_type: 'approval',
          template_name: 'approval_email',
          priority: 'high',
          sent_by: adminId,
          sent_via: 'system',
          variables: {
            name: applicantName,
            email: applicantEmail,
            password: tempPassword,
            referralCode: referralCode,
            login_url: `${req.headers.get('origin') || 'https://amb.starstore.site'}/auth`
          },
          metadata: {
            source: 'ambassador_approval',
            applicationId: applicationId
          }
        })
        .select('id')
        .single();

      if (messageErr) {
        console.error('Failed to create message record:', messageErr);
        emailError = 'Failed to create message record';
      } else {
        messageId = messageData.id;
        
        // Generate email content from template
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Congratulations ${applicantName}!</h1>
            <p>Your ambassador application has been approved. You can now start earning commissions!</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin-top: 0;">Your Login Credentials:</h2>
              <p><strong>Email:</strong> ${applicantEmail}</p>
              <p><strong>Temporary Password:</strong> ${tempPassword}</p>
              <p><strong>Referral Code:</strong> ${referralCode}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${req.headers.get('origin') || 'https://amb.starstore.site'}/auth" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Login to Your Dashboard
              </a>
            </div>
            
            <p>Welcome to the StarStore Ambassador Program! 🎉</p>
            <p>Best regards,<br>The StarStore Team</p>
          </div>
        `;

        // Send email using the new send-email function
        const fnRes = await serviceClient.functions.invoke('send-email', {
          body: { 
            to: applicantEmail, 
            subject: 'Congratulations! Your Ambassador Application is Approved',
            html: emailHtml,
            messageId: messageId
          },
        });
        
        if (fnRes.error) {
          emailError = fnRes.error.message || 'Email function returned error';
          console.error('Email function error:', fnRes.error);
          
          // Update message status to failed
          await serviceClient
            .from('messages')
            .update({ 
              status: 'failed',
              error_message: emailError,
              failed_at: new Date().toISOString()
            })
            .eq('id', messageId);
        } else {
          emailSent = true;
          console.log('Approval email sent successfully');
        }
      }
    } catch (e) {
      emailError = e instanceof Error ? e.message : 'Email send exception';
      console.error('Email exception:', e);
      
      // Update message status to failed if we have a messageId
      if (messageId) {
        await serviceClient
          .from('messages')
          .update({ 
            status: 'failed',
            error_message: emailError,
            failed_at: new Date().toISOString()
          })
          .eq('id', messageId);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId: newUserId, 
        referralCode, 
        tempPassword, // Include temp password for manual email fallback
        emailSent,
        emailError: emailError,
        message: emailSent 
          ? 'Ambassador approved and email sent successfully' 
          : `Ambassador approved but email failed: ${emailError}. Please send credentials manually.`
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error: unknown) {
    // admin-approve-application error
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
});