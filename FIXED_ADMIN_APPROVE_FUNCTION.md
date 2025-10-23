# FIXED ADMIN APPROVE FUNCTION

## Problem
The `admin-approve-application` function calls `send-approval-email` which has domain verification issues.
The `send-email` function works perfectly for manual emails.

## Solution
Update `admin-approve-application` to use the working `send-email` function directly.

## Updated Code for `admin-approve-application`:

```typescript
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
  return Math.random().toString().slice(2, 10).toUpperCase();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    console.log('=== APPROVAL FUNCTION STARTED ===');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !serviceKey || !anonKey) {
      console.error('Missing environment variables');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      });
    }

    const authHeader = req.headers.get('Authorization') || '';
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      });
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const serviceClient = createClient(supabaseUrl, serviceKey);

    // Verify admin
    const { data: userRes, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userRes.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      });
    }

    const adminId = userRes.user.id;
    const { data: roleRow, error: roleErr } = await userClient
      .from('user_roles')
      .select('role')
      .eq('user_id', adminId)
      .maybeSingle();
    
    if (roleErr || !roleRow || roleRow.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), { 
        status: 403, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      });
    }

    const { applicationId, applicantEmail, applicantName }: ApproveRequest = await req.json();
    if (!applicationId || !applicantEmail || !applicantName) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      });
    }

    console.log('Processing approval for:', applicantEmail);

    const tempPassword = genTempPassword();
    const referralCode = genReferralCode();

    // Create user
    let newUserId: string | null = null;
    try {
      console.log('Creating user account...');
      const createRes = await serviceClient.auth.admin.createUser({
        email: applicantEmail,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name: applicantName, needs_password_change: true },
      });

      if (createRes.error) {
        if (createRes.error.message.includes('already registered')) {
          console.log('User exists, finding existing user...');
          const list = await serviceClient.auth.admin.listUsers({ page: 1, perPage: 200 });
          const existing = list.data?.users?.find((u: { email?: string }) => u.email?.toLowerCase() === applicantEmail.toLowerCase());
          if (!existing) {
            throw new Error('User exists but cannot be found');
          }
          newUserId = existing.id;
        } else {
          throw new Error(createRes.error.message);
        }
      } else {
        newUserId = createRes.data.user?.id || null;
      }
    } catch (error) {
      console.error('User creation failed:', error);
      return new Response(JSON.stringify({ 
        error: `Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`
      }), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      });
    }

    if (!newUserId) {
      return new Response(JSON.stringify({ error: 'No user ID returned' }), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      });
    }

    console.log('User created/found:', newUserId);

    // Create profile
    try {
      console.log('Creating profile...');
      const { error: profileErr } = await serviceClient
        .from('profiles')
        .upsert({ id: newUserId, email: applicantEmail, full_name: applicantName });
      
      if (profileErr) {
        throw profileErr;
      }
      console.log('Profile created');
    } catch (error) {
      console.error('Profile creation failed:', error);
      await serviceClient.auth.admin.deleteUser(newUserId);
      return new Response(JSON.stringify({ 
        error: `Failed to create profile: ${error instanceof Error ? error.message : 'Unknown error'}`
      }), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      });
    }

    // Create ambassador profile
    let ambassadorId: string;
    try {
      console.log('Creating ambassador profile...');
      const { data: ambassadorData, error: ambassadorErr } = await serviceClient
        .from('ambassador_profiles')
        .insert({
          user_id: newUserId,
          current_tier: 'entry',
          referral_code: referralCode,
          total_earnings: 0,
          total_referrals: 0,
          status: 'active',
          approved_by: adminId,
        })
        .select('id')
        .single();

      if (ambassadorErr) {
        throw ambassadorErr;
      }
      
      ambassadorId = ambassadorData.id;
      console.log('Ambassador profile created:', ambassadorId);
    } catch (error) {
      console.error('Ambassador profile creation failed:', error);
      await serviceClient.auth.admin.deleteUser(newUserId);
      return new Response(JSON.stringify({ 
        error: `Failed to create ambassador profile: ${error instanceof Error ? error.message : 'Unknown error'}`
      }), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      });
    }

    // Update application
    try {
      console.log('Updating application status...');
      const { error: appErr } = await serviceClient
        .from('applications')
        .update({ status: 'approved' })
        .eq('id', applicationId);
      
      if (appErr) {
        console.warn('Application update failed:', appErr);
      } else {
        console.log('Application updated');
      }
    } catch (error) {
      console.warn('Application update error:', error);
    }

    // NOW SEND EMAIL USING THE WORKING send-email FUNCTION
    try {
      console.log('Sending approval email...');
      
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin-bottom: 10px;">Congratulations ${applicantName}!</h1>
            <p style="font-size: 18px; color: #4b5563;">Your ambassador application has been approved! 🎉</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 12px; margin: 25px 0;">
            <h2 style="margin-top: 0; text-align: center;">Your Login Credentials</h2>
            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin-top: 15px;">
              <p style="margin: 8px 0;"><strong>📧 Email:</strong> ${applicantEmail}</p>
              <p style="margin: 8px 0;"><strong>🔑 Temporary Password:</strong> <code style="background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px;">${tempPassword}</code></p>
              <p style="margin: 8px 0;"><strong>🔗 Referral Code:</strong> <code style="background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px;">${referralCode}</code></p>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://amb.starstore.site/auth" 
               style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              🚀 Login to Your Dashboard
            </a>
          </div>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
            <h3 style="color: #065f46; margin-top: 0;">Next Steps:</h3>
            <ol style="color: #374151; line-height: 1.6;">
              <li>Login with your credentials above</li>
              <li>Change your password (required on first login)</li>
              <li>Connect your Telegram account</li>
              <li>Start sharing your referral code and earning commissions!</li>
            </ol>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280;">Welcome to the StarStore Ambassador Program!</p>
            <p style="color: #374151; font-weight: bold;">The StarStore Team</p>
          </div>
        </div>
      `;

      // Use the WORKING send-email function
      const { data: emailResult, error: emailError } = await serviceClient.functions.invoke('send-email', {
        body: {
          to: applicantEmail,
          subject: "🎉 Congratulations! Your Ambassador Application is Approved",
          html: emailHtml
        }
      });

      if (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't fail the whole process - just log it
        console.log('Approval completed but email failed. Manual email needed.');
      } else {
        console.log('Email sent successfully!');
      }

    } catch (emailError) {
      console.error('Email function error:', emailError);
      // Don't fail the approval process
    }

    console.log('=== APPROVAL COMPLETED SUCCESSFULLY ===');

    return new Response(
      JSON.stringify({
        success: true,
        userId: newUserId,
        ambassadorId: ambassadorId,
        referralCode,
        tempPassword,
        applicantEmail,
        applicantName,
        message: `Ambassador approved successfully! Login credentials: Email: ${applicantEmail}, Password: ${tempPassword}, Referral Code: ${referralCode}`
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );

  } catch (error: unknown) {
    console.error('=== APPROVAL FUNCTION ERROR ===', error);
    return new Response(
      JSON.stringify({ 
        error: `Approval failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});
```

## What Changed:
1. **Removed** call to `send-approval-email` function
2. **Added** direct call to `send-email` function (the working one)
3. **Added** beautiful HTML email template inline
4. **Made** email sending non-blocking (won't fail approval if email fails)

## Deploy This:
1. Go to your `admin-approve-application` Edge Function
2. Replace ALL code with the code above
3. Deploy
4. Test approval - it should work AND send emails!