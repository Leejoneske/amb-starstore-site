-- Create password reset email template
INSERT INTO public.message_templates (
  name,
  message_type,
  subject_template,
  html_template,
  text_template,
  variables,
  is_active
) VALUES (
  'password_reset',
  'password_reset',
  'Reset Your StarStore Ambassador Password',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">StarStore Ambassador</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #333; margin-top: 0;">Password Reset Request</h2>
    
    <p>Hi {{userName}},</p>
    
    <p>We received a request to reset your password for your StarStore Ambassador account. Click the button below to create a new password:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{resetLink}}" 
         style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 14px 30px; 
                text-decoration: none; 
                border-radius: 5px; 
                display: inline-block;
                font-weight: bold;">
        Reset Password
      </a>
    </div>
    
    <p style="color: #666; font-size: 14px;">
      Or copy and paste this link into your browser:<br>
      <a href="{{resetLink}}" style="color: #667eea; word-break: break-all;">{{resetLink}}</a>
    </p>
    
    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; color: #856404; font-size: 14px;">
        <strong>⚠️ Security Notice:</strong><br>
        This link will expire in 1 hour. If you didn''t request this password reset, please ignore this email and your password will remain unchanged.
      </p>
    </div>
    
    <p style="color: #666; font-size: 14px; margin-top: 30px;">
      If you have any questions or need assistance, please don''t hesitate to reach out to our support team.
    </p>
    
    <p style="color: #666; font-size: 14px;">
      Best regards,<br>
      <strong>The StarStore Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
    <p>© 2025 StarStore. All rights reserved.</p>
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>',
  'Password Reset Request

Hi {{userName}},

We received a request to reset your password for your StarStore Ambassador account.

Click the link below to reset your password:
{{resetLink}}

⚠️ Security Notice:
This link will expire in 1 hour. If you didn''t request this password reset, please ignore this email and your password will remain unchanged.

If you have any questions, please contact our support team.

Best regards,
The StarStore Team

---
© 2025 StarStore. All rights reserved.
This is an automated message, please do not reply to this email.',
  '{"userName": "User Name", "resetLink": "https://example.com/reset"}',
  true
)
ON CONFLICT (name) DO UPDATE SET
  subject_template = EXCLUDED.subject_template,
  html_template = EXCLUDED.html_template,
  text_template = EXCLUDED.text_template,
  variables = EXCLUDED.variables,
  is_active = EXCLUDED.is_active,
  updated_at = now();