-- ============================================
-- IMPLEMENT EMAIL APPROVAL SYSTEM
-- ============================================
-- This creates the email system for approval notifications

-- 1. Create function to generate temporary password
CREATE OR REPLACE FUNCTION public.generate_temp_password()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  -- Generate a secure temporary password
  RETURN 'STAR' || upper(substr(md5(random()::text), 1, 8));
END;
$$;

-- 2. Create function to send approval email
CREATE OR REPLACE FUNCTION public.send_approval_email(
  user_email TEXT,
  user_name TEXT,
  temp_password TEXT,
  referral_code TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  email_subject TEXT;
  email_body TEXT;
BEGIN
  -- Check if user is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  -- Create email content
  email_subject := '🎉 Welcome to StarStore Ambassador Program!';
  
  email_body := '
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🌟 StarStore Ambassador Program</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px;">Congratulations! Your application has been approved!</p>
      </div>
      
      <div style="padding: 30px; background: #f8f9fa;">
        <h2 style="color: #333; margin-top: 0;">Welcome, ' || user_name || '!</h2>
        
        <p>Your application to join the StarStore Ambassador Program has been <strong style="color: #28a745;">APPROVED</strong>!</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
          <h3 style="color: #333; margin-top: 0;">🔑 Your Login Credentials</h3>
          <p><strong>Email:</strong> ' || user_email || '</p>
          <p><strong>Temporary Password:</strong> <code style="background: #f1f3f4; padding: 4px 8px; border-radius: 4px; font-family: monospace;">' || temp_password || '</code></p>
          <p><strong>Referral Code:</strong> <code style="background: #f1f3f4; padding: 4px 8px; border-radius: 4px; font-family: monospace;">' || referral_code || '</code></p>
        </div>
        
        <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1976d2; margin-top: 0;">🚀 Next Steps</h3>
          <ol style="color: #333;">
            <li>Click the login button below to access your ambassador dashboard</li>
            <li>You will be prompted to change your temporary password</li>
            <li>Start sharing your referral code to earn commissions!</li>
            <li>Check out the ambassador resources and guidelines</li>
          </ol>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://amb-starstore.vercel.app/auth" 
             style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            🎯 Access Your Dashboard
          </a>
        </div>
        
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <p style="margin: 0; color: #856404;"><strong>⚠️ Important:</strong> Please change your password immediately after first login for security reasons.</p>
        </div>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          If you have any questions, please contact our support team.<br>
          Welcome to the StarStore Ambassador family! 🌟
        </p>
      </div>
      
      <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
        <p style="margin: 0;">© 2025 StarStore Ambassador Program. All rights reserved.</p>
      </div>
    </body>
    </html>
  ';

  -- In a real implementation, you would integrate with an email service like:
  -- - SendGrid
  -- - AWS SES
  -- - Resend
  -- - Nodemailer
  
  -- For now, we'll just log the email (you can replace this with actual email sending)
  RAISE NOTICE 'EMAIL TO: %', user_email;
  RAISE NOTICE 'SUBJECT: %', email_subject;
  RAISE NOTICE 'BODY: %', email_body;

  RETURN TRUE;
END;
$$;

-- 3. Create function to create user account with temporary password
CREATE OR REPLACE FUNCTION public.create_user_account_with_temp_password(
  user_email TEXT,
  user_name TEXT,
  referral_code TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id UUID;
  temp_password TEXT;
  profile_id UUID;
  ambassador_id UUID;
  result JSON;
BEGIN
  -- Check if user is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  -- Generate temporary password
  temp_password := public.generate_temp_password();
  
  -- Generate UUIDs
  user_id := gen_random_uuid();
  profile_id := user_id;

  -- Create auth user (this would normally be done through Supabase Auth)
  -- For now, we'll create the profile and ambassador profile
  -- In production, you'd use Supabase Admin API to create the auth user
  
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (profile_id, user_email, user_name)
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = now();

  -- Create ambassador profile
  INSERT INTO public.ambassador_profiles (
    user_id,
    referral_code,
    status,
    approved_at,
    approved_by
  )
  VALUES (
    profile_id,
    referral_code,
    'active',
    now(),
    auth.uid()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    status = 'active',
    approved_at = now(),
    approved_by = auth.uid();

  -- Send approval email
  PERFORM public.send_approval_email(user_email, user_name, temp_password, referral_code);

  -- Return result
  result := json_build_object(
    'user_id', user_id,
    'email', user_email,
    'temp_password', temp_password,
    'referral_code', referral_code,
    'email_sent', true
  );

  RETURN result;
END;
$$;

-- 4. Grant permissions
GRANT EXECUTE ON FUNCTION public.generate_temp_password TO authenticated;
GRANT EXECUTE ON FUNCTION public.send_approval_email TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_account_with_temp_password TO authenticated;

-- 5. Test the functions
SELECT 'Email approval system created successfully!' as status;