import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CURRENT_YEAR = new Date().getFullYear();

// Professional email template matching the welcome/approval email style
const emailWrapper = (content: string, previewText?: string): string => `
<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <title>StarStore - Password Reset</title>
  ${previewText ? `<!--[if !mso]><!--><meta name="description" content="${previewText}"><!--<![endif]-->` : ''}
  <style>
    body { margin: 0; padding: 0; width: 100%; word-spacing: normal; background-color: #f5f7fa; }
    table { border-collapse: collapse; }
    img { border: 0; line-height: 100%; vertical-align: middle; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #f5f7fa; padding: 40px 0; }
    .main { max-width: 600px; background-color: #ffffff; margin: 0 auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden; }
    .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 32px 40px; text-align: center; }
    .header-logo { font-size: 28px; font-weight: bold; color: #ffffff; letter-spacing: -0.5px; }
    .header-logo span { color: #fbbf24; }
    .content { padding: 40px; }
    .footer { background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0; }
    .footer-text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #64748b; line-height: 1.6; }
    .footer-links { margin-top: 12px; }
    .footer-links a { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #3b82f6; text-decoration: none; margin: 0 8px; }
    @media screen and (max-width: 600px) {
      .content { padding: 24px 20px !important; }
      .header { padding: 24px 20px !important; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <table role="presentation" class="main" width="100%">
      <tr>
        <td class="header">
          <div class="header-logo">Star<span>Store</span></div>
          <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: #94a3b8; margin: 8px 0 0 0;">Ambassador Program</p>
        </td>
      </tr>
      <tr>
        <td class="content">
          ${content}
        </td>
      </tr>
      <tr>
        <td class="footer">
          <p class="footer-text">
            This email was sent by StarStore Ambassador Program.<br>
            © ${CURRENT_YEAR} StarStore. All rights reserved.
          </p>
          <div class="footer-links">
            <a href="https://starstore.site">Visit StarStore</a>
            <a href="https://t.me/StarStore_app">Telegram Support</a>
            <a href="https://t.me/TgStarStore_bot">Start Bot</a>
          </div>
          <p class="footer-text" style="margin-top: 16px; font-size: 11px; color: #94a3b8;">
            If you didn't request a password reset, please ignore this email or contact support.
          </p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
`;

const generatePlainText = (resetUrl: string): string => `
StarStore Ambassador Program
=============================

Password Reset Request

You've requested to reset your password for your StarStore Ambassador account.

Click the link below to set a new password:
${resetUrl}

This link will expire in 1 hour for security purposes.

SECURITY TIPS:
- Never share your password with anyone
- Use a strong, unique password
- Enable two-factor authentication when available

If you didn't request this password reset, please ignore this email. Your account is safe.

---
© ${CURRENT_YEAR} StarStore. All rights reserved.
Visit: https://starstore.site
Telegram: https://t.me/StarStore_app
`;

interface PasswordResetRequest {
  email: string;
  resetUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("Received password reset email request");

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get request data
    const { email, resetUrl }: PasswordResetRequest = await req.json();
    console.log(`Processing password reset email for: ${email}`);

    // Validate required fields
    if (!email || !resetUrl) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: email or resetUrl' 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if RESEND_API_KEY is configured
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error('RESEND_API_KEY environment variable is not set');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Email service not configured. Please set RESEND_API_KEY environment variable.' 
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Build email content
    const emailContent = `
      <h1 style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 24px; font-weight: 600; color: #1e293b; margin: 0 0 24px 0;">
        Password Reset Request
      </h1>
      
      <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; color: #475569; line-height: 1.6; margin: 0 0 24px 0;">
        We received a request to reset your password for your <strong style="color: #1e293b;">StarStore Ambassador</strong> account. Click the button below to create a new password.
      </p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 8px; box-shadow: 0 4px 14px rgba(26, 26, 46, 0.25);">
          Reset Password
        </a>
      </div>
      
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 24px 0;">
        <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: #92400e; margin: 0; font-weight: 500;">
          ⏱️ This link will expire in 1 hour for security purposes.
        </p>
      </div>
      
      <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: #64748b; line-height: 1.6; margin: 24px 0 16px 0;">
        If the button doesn't work, copy and paste this link into your browser:
      </p>
      
      <div style="background-color: #f1f5f9; border-radius: 6px; padding: 12px 16px; margin: 0 0 24px 0; word-break: break-all;">
        <a href="${resetUrl}" style="font-family: monospace; font-size: 12px; color: #3b82f6; text-decoration: none;">
          ${resetUrl}
        </a>
      </div>
      
      <h2 style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; font-weight: 600; color: #1e293b; margin: 32px 0 12px 0;">
        Security Tips
      </h2>
      
      <ul style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: #475569; line-height: 1.8; padding-left: 20px; margin: 0 0 24px 0;">
        <li>Never share your password with anyone</li>
        <li>Use a strong, unique password</li>
        <li>Consider using a password manager</li>
      </ul>
      
      <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; margin-top: 32px;">
        <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: #64748b; line-height: 1.6; margin: 0;">
          <strong style="color: #475569;">Didn't request this?</strong><br>
          If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
        </p>
      </div>
    `;

    const htmlEmail = emailWrapper(emailContent, "Reset your StarStore Ambassador password");
    const textEmail = generatePlainText(resetUrl);

    // Initialize Resend
    const resend = new Resend(resendApiKey);

    // Create message record in database for tracking
    let messageId: string | null = null;
    try {
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          recipient_email: email,
          subject: 'Reset Your StarStore Password',
          content_html: htmlEmail,
          content_text: textEmail,
          message_type: 'password_reset',
          status: 'pending',
          priority: 'urgent',
          email_service: 'resend',
          sent_via: 'edge_function',
          metadata: {
            email_type: 'password_reset'
          }
        })
        .select('id')
        .single();

      if (!messageError && messageData) {
        messageId = messageData.id;
        console.log(`Created message record: ${messageId}`);
      }
    } catch (dbError) {
      console.warn('Failed to create message record:', dbError);
      // Continue sending email even if DB logging fails
    }

    // Send email via Resend
    console.log("Sending password reset email via Resend...");
    const emailResult = await resend.emails.send({
      from: "StarStore <noreply@starstore.site>",
      to: [email],
      subject: "Reset Your StarStore Password",
      html: htmlEmail,
      text: textEmail,
    });

    if (emailResult.error) {
      console.error('Resend API error:', emailResult.error);
      
      // Update message status to failed
      if (messageId) {
        await supabase
          .from('messages')
          .update({ 
            status: 'failed',
            error_message: `Resend API error: ${emailResult.error.message}`,
            failed_at: new Date().toISOString()
          })
          .eq('id', messageId);
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to send email: ${emailResult.error.message}` 
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log('Password reset email sent successfully:', emailResult.data?.id);

    // Update message status to sent
    if (messageId) {
      await supabase
        .from('messages')
        .update({ 
          status: 'sent',
          external_message_id: emailResult.data?.id,
          sent_at: new Date().toISOString()
        })
        .eq('id', messageId);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: emailResult.data?.id,
        internalMessageId: messageId
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error) {
    console.error('Password reset email sending error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
