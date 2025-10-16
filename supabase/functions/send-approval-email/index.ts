import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApprovalEmailRequest {
  userEmail: string;
  userName: string;
  tempPassword: string;
  referralCode: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, userName, tempPassword, referralCode }: ApprovalEmailRequest = await req.json();

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

    // Validate required fields
    if (!userEmail || !userName || !tempPassword || !referralCode) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: userEmail, userName, tempPassword, or referralCode' 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Sending approval email to ${userEmail} for ${userName}`);

    const emailResponse = await resend.emails.send({
      from: "StarStore Ambassador Program <onboarding@resend.dev>",
      to: [userEmail],
      subject: "🎉 Welcome to StarStore Ambassador Program!",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px; }
              .credentials { background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #667eea; }
              .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
              code { background: #fff3cd; padding: 2px 6px; border-radius: 3px; font-family: monospace; color: #856404; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 28px;">✨ Welcome to StarStore!</h1>
              </div>
              <div class="content">
                <p>Hi ${userName},</p>
                
                <p><strong>Congratulations!</strong> Your application to become a StarStore Ambassador has been approved! 🎊</p>
                
                <div class="credentials">
                  <h3 style="margin-top: 0; color: #667eea;">Your Login Credentials</h3>
                  <p><strong>Email:</strong> ${userEmail}</p>
                  <p><strong>Temporary Password:</strong> <code>${tempPassword}</code></p>
                  <p><strong>Your Referral Code:</strong> <code>${referralCode}</code></p>
                </div>
                
                <p><strong>⚠️ Important:</strong> Please change your password after your first login for security.</p>
                
                <a href="https://jrtqbntwwkqxpexpplly.supabase.co" class="button">Login to Your Dashboard</a>
                
                <h3>🚀 Next Steps:</h3>
                <ol>
                  <li>Log in to your ambassador dashboard</li>
                  <li>Complete your profile setup</li>
                  <li>Start sharing your referral code: <code>${referralCode}</code></li>
                  <li>Track your earnings and referrals in real-time</li>
                </ol>
                
                <p>If you have any questions, please don't hesitate to reach out to our support team.</p>
                
                <p>Best regards,<br><strong>The StarStore Team</strong></p>
              </div>
              <div class="footer">
                <p>This email was sent to ${userEmail}</p>
                <p>© ${new Date().getFullYear()} StarStore. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (emailResponse.error) {
      console.error('Resend API error:', emailResponse.error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Email delivery failed: ${emailResponse.error.message || 'Unknown Resend error'}` 
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Email sent successfully to ${userEmail}. Message ID: ${emailResponse.data?.id}`);

    return new Response(JSON.stringify({ 
      success: true, 
      data: emailResponse.data,
      message: `Approval email sent successfully to ${userEmail}`
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: unknown) {
    console.error('Error in send-approval-email function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Email function error: ${errorMessage}` 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
