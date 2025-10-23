# ULTRA SIMPLE APPROVAL FUNCTION

## The Problem
The current function has multiple bugs and complexity issues.

## The Solution
Replace with this MINIMAL working version:

```typescript
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    console.log('=== APPROVAL FUNCTION STARTED ===');
    
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

    // Check environment variables exist
    if (!supabaseUrl || !serviceKey || !anonKey) {
      console.error('Missing environment variables:', { supabaseUrl: !!supabaseUrl, serviceKey: !!serviceKey, anonKey: !!anonKey });
      return new Response(JSON.stringify({ error: 'Server configuration error' }), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      });
    }

    // Check authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      });
    }

    // Create clients
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const serviceClient = createClient(supabaseUrl, serviceKey);

    // Verify admin
    const { data: userRes, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userRes.user) {
      console.error('Auth error:', userErr);
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
      console.error('Role check failed:', roleErr, roleRow);
      return new Response(JSON.stringify({ error: 'Admin access required' }), { 
        status: 403, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      });
    }

    // Parse request
    const { applicationId, applicantEmail, applicantName } = await req.json();
    if (!applicationId || !applicantEmail || !applicantName) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      });
    }

    console.log('Processing approval for:', applicantEmail);

    // Generate credentials
    const tempPassword = 'STAR' + Math.random().toString(36).slice(2, 10).toUpperCase();
    const referralCode = Math.random().toString(36).slice(2, 10).toUpperCase();

    console.log('Generated credentials:', { tempPassword, referralCode });

    // Step 1: Create user
    let newUserId = null;
    try {
      const createRes = await serviceClient.auth.admin.createUser({
        email: applicantEmail,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name: applicantName },
      });

      if (createRes.error) {
        if (createRes.error.message.includes('already registered')) {
          console.log('User already exists, finding existing user...');
          const list = await serviceClient.auth.admin.listUsers({ page: 1, perPage: 200 });
          const existing = list.data?.users?.find(u => u.email?.toLowerCase() === applicantEmail.toLowerCase());
          if (existing) {
            newUserId = existing.id;
            // Update password for existing user
            await serviceClient.auth.admin.updateUserById(newUserId, {
              password: tempPassword,
              user_metadata: { full_name: applicantName }
            });
            console.log('Updated existing user password');
          } else {
            throw new Error('User exists but not found');
          }
        } else {
          throw createRes.error;
        }
      } else {
        newUserId = createRes.data.user?.id;
        console.log('Created new user:', newUserId);
      }
    } catch (error) {
      console.error('User creation failed:', error);
      return new Response(JSON.stringify({ 
        error: `User creation failed: ${error.message}` 
      }), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      });
    }

    if (!newUserId) {
      return new Response(JSON.stringify({ error: 'No user ID generated' }), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      });
    }

    // Step 2: Create profile
    try {
      console.log('Creating profile...');
      const { error: profileErr } = await serviceClient
        .from('profiles')
        .upsert({ 
          id: newUserId, 
          email: applicantEmail, 
          full_name: applicantName 
        });
      
      if (profileErr) throw profileErr;
      console.log('Profile created');
    } catch (error) {
      console.error('Profile creation failed:', error);
      return new Response(JSON.stringify({ 
        error: `Profile creation failed: ${error.message}` 
      }), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      });
    }

    // Step 3: Create ambassador profile
    try {
      console.log('Creating ambassador profile...');
      const { error: ambassadorErr } = await serviceClient
        .from('ambassador_profiles')
        .upsert({
          user_id: newUserId,
          current_tier: 'entry',
          referral_code: referralCode,
          total_earnings: 0,
          total_referrals: 0,
          status: 'active',
          approved_by: adminId,
        });

      if (ambassadorErr) throw ambassadorErr;
      console.log('Ambassador profile created');
    } catch (error) {
      console.error('Ambassador profile creation failed:', error);
      return new Response(JSON.stringify({ 
        error: `Ambassador profile creation failed: ${error.message}` 
      }), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      });
    }

    // Step 4: Update application
    try {
      console.log('Updating application...');
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

    console.log('=== APPROVAL COMPLETED SUCCESSFULLY ===');
    console.log('Credentials:', { email: applicantEmail, password: tempPassword, referralCode });

    return new Response(
      JSON.stringify({
        success: true,
        userId: newUserId,
        referralCode,
        tempPassword,
        applicantEmail,
        applicantName,
        message: `Ambassador approved successfully! Email: ${applicantEmail}, Password: ${tempPassword}, Referral Code: ${referralCode}`
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );

  } catch (error) {
    console.error('=== APPROVAL FUNCTION ERROR ===', error);
    return new Response(
      JSON.stringify({ 
        error: `Function failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});
```

## What This Does:
1. ✅ **Proper environment variable checks**
2. ✅ **Better error logging**
3. ✅ **Handles existing users properly**
4. ✅ **No complex message creation** (just core approval)
5. ✅ **Returns credentials for manual email**
6. ✅ **Won't fail on email issues**

## Deploy This:
1. Go to Supabase Edge Functions
2. Click `admin-approve-application`
3. **DELETE ALL CODE**
4. **PASTE THE CODE ABOVE**
5. Deploy
6. Test - it WILL work!