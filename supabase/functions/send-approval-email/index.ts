import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import emailTemplates from "../_shared/email-templates.ts";

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

// Dashboard URL - update this to your actual domain
const DASHBOARD_URL = "https://starstore.site/auth";

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

    // Build professional HTML email
    const emailContent = `
      ${emailTemplates.greeting(userName)}
      ${emailTemplates.heading("Your application has been approved.")}
      ${emailTemplates.paragraph("Congratulations! You have been accepted into the StarStore Ambassador Program. We're excited to have you on board and can't wait to see the impact you'll make.")}
      ${emailTemplates.credentialsBox([
        { label: 'Email', value: userEmail },
        { label: 'Temporary Password', value: tempPassword },
        { label: 'Your Referral Code', value: referralCode }
      ])}
      ${emailTemplates.notice("Please change your password immediately after your first login for security.", "warning")}
      ${emailTemplates.ctaButton("Login to Dashboard", DASHBOARD_URL)}
      ${emailTemplates.paragraph("Here's how to get started:")}
      ${emailTemplates.numberedList([
        "Log in to your ambassador dashboard using the credentials above",
        "Complete your profile and change your password",
        "Share your unique referral code with friends and followers",
        "Track your earnings and referrals in real-time"
      ])}
      ${emailTemplates.paragraph('If you have questions about your account or the program, please don\'t hesitate to <a href="https://t.me/thestarstore" style="color: #1a1a2e; text-decoration: underline;">get in touch</a> with us.')}
      ${emailTemplates.signature()}
    `;

    const htmlEmail = emailTemplates.emailWrapper(
      emailContent, 
      "Your StarStore Ambassador application has been approved! Here are your login credentials."
    );

    // Generate plain text version for anti-spam
    const plainTextEmail = emailTemplates.generatePlainText([
      { type: 'greeting', content: userName },
      { type: 'heading', content: 'Your application has been approved.' },
      { type: 'paragraph', content: 'Congratulations! You have been accepted into the StarStore Ambassador Program.' },
      { type: 'credentials', content: [
        { label: 'Email', value: userEmail },
        { label: 'Temporary Password', value: tempPassword },
        { label: 'Your Referral Code', value: referralCode }
      ]},
      { type: 'notice', content: { type: 'warning', text: 'Please change your password immediately after your first login.' }},
      { type: 'button', content: { text: 'Login to Dashboard', url: DASHBOARD_URL }},
      { type: 'paragraph', content: "Here's how to get started:" },
      { type: 'list', content: [
        'Log in to your ambassador dashboard',
        'Complete your profile and change your password', 
        'Share your unique referral code',
        'Track your earnings in real-time'
      ]}
    ]);

    // Initialize Resend
    const resend = new Resend(resendApiKey);

    const emailResponse = await resend.emails.send({
      from: "StarStore <noreply@starstore.site>",
      to: [userEmail],
      subject: "Your StarStore Ambassador Application is Approved",
      html: htmlEmail,
      text: plainTextEmail,
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
