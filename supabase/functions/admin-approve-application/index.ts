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
    // Initialize Supabase client (same pattern as send-email function)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get request data
    const { applicationId, applicantEmail, applicantName }: ApproveRequest = await req.json();

    // Validate required fields
    if (!applicationId || !applicantEmail || !applicantName) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: applicationId, applicantEmail, or applicantName' 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log('Processing approval for:', { applicationId, applicantEmail, applicantName });

    const tempPassword = genTempPassword();
    const referralCode = genReferralCode().toUpperCase();

    // 1) Create or find user in Auth
    let newUserId: string | null = null;
    const createRes = await supabase.auth.admin.createUser({
      email: applicantEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: applicantName },
    });

    if (createRes.error) {
      console.log('User creation failed, checking if user exists:', createRes.error.message);
      // If already exists, fetch by email (scan first page)
      const list = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
      const existing = list.data?.users?.find((u: { email?: string }) => u.email?.toLowerCase() === applicantEmail.toLowerCase());
      if (!existing) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Failed to create user: ${createRes.error.message}` 
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
      newUserId = existing.id;
    } else {
      newUserId = createRes.data.user?.id || null;
    }

    if (!newUserId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'User creation returned no ID' 
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log('User ID:', newUserId);

    // 2) Upsert profile
    const { error: profileErr } = await supabase
      .from('profiles')
      .upsert({ id: newUserId, email: applicantEmail, full_name: applicantName })
      .eq('id', newUserId);
    if (profileErr) {
      console.error('Profile creation error:', profileErr);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to create profile: ${profileErr.message}` 
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log('Profile created successfully');

    // 3) Upsert ambassador profile
    const { data: ambassadorData, error: ambErr } = await supabase
      .from('ambassador_profiles')
      .upsert({ 
        user_id: newUserId, 
        referral_code: referralCode, 
        status: 'active', 
        approved_at: new Date().toISOString(), 
        approved_by: newUserId // Using newUserId as approver for now
      })
      .eq('user_id', newUserId)
      .select('id')
      .single();
      
    if (ambErr) {
      console.error('Ambassador profile creation error:', ambErr);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to create ambassador profile: ${ambErr.message}` 
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const ambassadorId = ambassadorData?.id;
    console.log('Ambassador profile created with ID:', ambassadorId);

    // 4) Update application status
    const { error: appErr } = await supabase
      .from('applications')
      .update({ 
        status: 'approved', 
        reviewed_at: new Date().toISOString(), 
        reviewed_by: newUserId // Using newUserId as reviewer for now
      })
      .eq('id', applicationId);
      
    if (appErr) {
      console.error('Application update error:', appErr);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to update application: ${appErr.message}` 
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log('Application status updated successfully');

    // 5) Send approval email
    let emailSent = false;
    let emailError = null;
    
    try {
      // Generate email content
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

      console.log('Attempting to send approval email to:', applicantEmail);

      // Send email using the send-email function (same as working message system)
      const { data: emailResult, error: emailFunctionError } = await supabase.functions.invoke('send-email', {
        body: { 
          to: applicantEmail, 
          subject: 'Congratulations! Your Ambassador Application is Approved',
          html: emailHtml
        },
      });
      
      if (emailFunctionError) {
        emailError = emailFunctionError.message || 'Email function returned error';
        console.error('Email function error:', emailFunctionError);
        emailSent = false;
      } else if (emailResult && !emailResult.success) {
        emailError = emailResult.error || 'Email sending failed';
        console.error('Email sending failed:', emailResult);
        emailSent = false;
      } else {
        emailSent = true;
        console.log('Approval email sent successfully to:', applicantEmail);
      }
    } catch (e) {
      emailError = e instanceof Error ? e.message : 'Email send exception';
      console.error('Email exception:', e);
      emailSent = false;
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        userId: newUserId, 
        referralCode, 
        tempPassword,
        emailSent,
        emailError: emailError,
        message: emailSent 
          ? 'Ambassador approved and email sent successfully' 
          : `Ambassador approved but email failed: ${emailError}. Please send credentials manually.`
      }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );

  } catch (error: unknown) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: 'Check function logs for more information'
      }), 
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }
});