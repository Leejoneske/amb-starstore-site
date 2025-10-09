// Email service for sending approval notifications
// This integrates with Resend (recommended) or other email services

interface ApprovalEmailData {
  userEmail: string;
  userName: string;
  tempPassword: string;
  referralCode: string;
}

export const sendApprovalEmail = async (data: ApprovalEmailData) => {
  const { userEmail, userName, tempPassword, referralCode } = data;

  const emailContent = {
    to: userEmail,
    subject: '🎉 Welcome to StarStore Ambassador Program!',
    html: `
      <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🌟 StarStore Ambassador Program</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Congratulations! Your application has been approved!</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-top: 0;">Welcome, ${userName}!</h2>
          
          <p>Your application to join the StarStore Ambassador Program has been <strong style="color: #28a745;">APPROVED</strong>!</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="color: #333; margin-top: 0;">🔑 Your Login Credentials</h3>
            <p><strong>Email:</strong> ${userEmail}</p>
            <p><strong>Temporary Password:</strong> <code style="background: #f1f3f4; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${tempPassword}</code></p>
            <p><strong>Referral Code:</strong> <code style="background: #f1f3f4; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${referralCode}</code></p>
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
            <a href="${window.location.origin}/auth" 
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
    `
  };

  try {
    // For now, we'll use a simple fetch to a backend endpoint
    // In production, you'd integrate with Resend, SendGrid, or AWS SES
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailContent),
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

// Alternative: Direct integration with Resend (recommended)
export const sendApprovalEmailWithResend = async (data: ApprovalEmailData) => {
  const { userEmail, userName, tempPassword, referralCode } = data;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'StarStore <noreply@starstore.site>',
        to: [userEmail],
        subject: '🎉 Welcome to StarStore Ambassador Program!',
        html: `
          <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">🌟 StarStore Ambassador Program</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Congratulations! Your application has been approved!</p>
            </div>
            
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #333; margin-top: 0;">Welcome, ${userName}!</h2>
              
              <p>Your application to join the StarStore Ambassador Program has been <strong style="color: #28a745;">APPROVED</strong>!</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
                <h3 style="color: #333; margin-top: 0;">🔑 Your Login Credentials</h3>
                <p><strong>Email:</strong> ${userEmail}</p>
                <p><strong>Temporary Password:</strong> <code style="background: #f1f3f4; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${tempPassword}</code></p>
                <p><strong>Referral Code:</strong> <code style="background: #f1f4; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${referralCode}</code></p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${window.location.origin}/auth" 
                   style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  🎯 Access Your Dashboard
                </a>
              </div>
            </div>
          </body>
          </html>
        `
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send email via Resend');
    }

    return { success: true };
  } catch (error) {
    console.error('Resend email error:', error);
    return { success: false, error: error.message };
  }
};