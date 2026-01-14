import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Professional email template matching PayPal's style
const emailWrapper = (content: string, previewText?: string): string => `
<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <title>StarStore Ambassador Program</title>
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
            © ${new Date().getFullYear()} StarStore. All rights reserved.
          </p>
          <div class="footer-links">
            <a href="https://starstore.site">Visit StarStore</a>
            <a href="https://t.me/StarStore_app">Telegram Support</a>
            <a href="https://t.me/TgStarStore_bot">Start Bot</a>
          </div>
          <p class="footer-text" style="margin-top: 16px; font-size: 11px; color: #94a3b8;">
            If you didn't apply for the Ambassador Program, please ignore this email.
          </p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
`;

const generatePlainText = (name: string): string => `
StarStore Ambassador Program
=============================

Hi ${name},

Thank you for applying to the StarStore Ambassador Program!

We have received your application and our team is reviewing it. You will receive an invitation email once your application has been approved.

WHAT HAPPENS NEXT:
------------------
1. Our team reviews your application (usually within 48 hours)
2. If approved, you'll receive login credentials via email
3. Access your dashboard to start earning commissions

While you wait, you can:
- Join our Telegram group: https://t.me/StarStore_app
- Start the Telegram bot: https://t.me/TgStarStore_bot
- Visit our website: https://starstore.site

If you have any questions, feel free to reach out to our support team.

Best regards,
The StarStore Team

---
© ${new Date().getFullYear()} StarStore. All rights reserved.
If you didn't apply for the Ambassador Program, please ignore this email.
`;

interface WelcomeEmailRequest {
  to: string;
  fullName: string;
  applicationId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("Received welcome email request");

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get request data
    const { to, fullName, applicationId }: WelcomeEmailRequest = await req.json();
    console.log(`Processing welcome email for: ${to}, name: ${fullName}`);

    // Validate required fields
    if (!to || !fullName) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: to or fullName' 
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
    const firstName = fullName.split(' ')[0];
    
    const emailContent = `
      <h1 style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 24px; font-weight: 600; color: #1e293b; margin: 0 0 24px 0;">
        Application Received!
      </h1>
      
      <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; color: #475569; line-height: 1.6; margin: 0 0 16px 0;">
        Hi ${firstName},
      </p>
      
      <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; color: #475569; line-height: 1.6; margin: 0 0 24px 0;">
        Thank you for applying to the <strong style="color: #1e293b;">StarStore Ambassador Program</strong>! We're excited that you're interested in joining our community.
      </p>
      
      <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 0 0 24px 0;">
        <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: #166534; margin: 0; font-weight: 500;">
          ✓ Your application has been successfully submitted
        </p>
      </div>
      
      <h2 style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 18px; font-weight: 600; color: #1e293b; margin: 32px 0 16px 0;">
        What happens next?
      </h2>
      
      <table role="presentation" width="100%" style="margin: 0 0 24px 0;">
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
            <table role="presentation" width="100%">
              <tr>
                <td width="40" style="vertical-align: top;">
                  <div style="width: 28px; height: 28px; background-color: #3b82f6; border-radius: 50%; text-align: center; line-height: 28px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 600; color: #ffffff;">1</div>
                </td>
                <td style="padding-left: 12px;">
                  <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; color: #1e293b; margin: 0; font-weight: 500;">Application Review</p>
                  <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: #64748b; margin: 4px 0 0 0;">Our team will review your application within 48 hours</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
            <table role="presentation" width="100%">
              <tr>
                <td width="40" style="vertical-align: top;">
                  <div style="width: 28px; height: 28px; background-color: #3b82f6; border-radius: 50%; text-align: center; line-height: 28px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 600; color: #ffffff;">2</div>
                </td>
                <td style="padding-left: 12px;">
                  <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; color: #1e293b; margin: 0; font-weight: 500;">Approval Email</p>
                  <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: #64748b; margin: 4px 0 0 0;">If approved, you'll receive your login credentials</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0;">
            <table role="presentation" width="100%">
              <tr>
                <td width="40" style="vertical-align: top;">
                  <div style="width: 28px; height: 28px; background-color: #3b82f6; border-radius: 50%; text-align: center; line-height: 28px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 600; color: #ffffff;">3</div>
                </td>
                <td style="padding-left: 12px;">
                  <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; color: #1e293b; margin: 0; font-weight: 500;">Start Earning</p>
                  <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: #64748b; margin: 4px 0 0 0;">Access your dashboard and earn up to 75% commission</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      
      <div style="background-color: #eff6ff; border-radius: 8px; padding: 20px; margin: 0 0 24px 0; text-align: center;">
        <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: #1e40af; margin: 0 0 12px 0; font-weight: 500;">
          While you wait, join our Telegram community
        </p>
        <a href="https://t.me/StarStore_app" style="display: inline-block; background-color: #3b82f6; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 6px; margin-right: 8px;">
          Join Community →
        </a>
        <a href="https://t.me/TgStarStore_bot" style="display: inline-block; background-color: #10b981; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 6px;">
          Start Bot →
        </a>
      </div>
      
      <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; color: #475569; line-height: 1.6; margin: 0 0 8px 0;">
        Best regards,
      </p>
      <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; color: #1e293b; font-weight: 600; margin: 0;">
        The StarStore Team
      </p>
    `;

    const htmlEmail = emailWrapper(emailContent, "Thank you for applying to the StarStore Ambassador Program!");
    const textEmail = generatePlainText(firstName);

    // Initialize Resend
    const resend = new Resend(resendApiKey);

    // Create message record in database for tracking
    let messageId: string | null = null;
    try {
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          recipient_email: to,
          recipient_name: fullName,
          subject: 'Welcome to StarStore Ambassador Program - Application Received!',
          content_html: htmlEmail,
          content_text: textEmail,
          message_type: 'welcome',
          status: 'pending',
          priority: 'high',
          email_service: 'resend',
          sent_via: 'edge_function',
          metadata: {
            application_id: applicationId,
            email_type: 'application_confirmation'
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
    console.log("Sending email via Resend...");
    const emailResult = await resend.emails.send({
      from: "StarStore <noreply@starstore.site>",
      to: [to],
      subject: "Welcome to StarStore Ambassador Program - Application Received!",
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

        await supabase
          .from('message_events')
          .insert({
            message_id: messageId,
            event_type: 'failed',
            event_data: { error: emailResult.error },
            occurred_at: new Date().toISOString()
          });
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

    console.log('Welcome email sent successfully:', emailResult.data?.id);

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

      await supabase
        .from('message_events')
        .insert({
          message_id: messageId,
          event_type: 'sent',
          event_data: { 
            externalMessageId: emailResult.data?.id,
            resendId: emailResult.data?.id
          },
          occurred_at: new Date().toISOString()
        });
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
    console.error('Welcome email sending error:', error);
    
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
