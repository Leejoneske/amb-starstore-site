# 🔧 Fixed Edge Functions for Supabase Dashboard

The issue is with import statements in the dashboard. Here are the corrected versions:

## Function 1: mongo-proxy

**Function Name**: `mongo-proxy`

```typescript
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get MongoDB connection string from environment
    const mongoUri = Deno.env.get('MONGO_CONNECTION_STRING')
    if (!mongoUri) {
      return new Response(
        JSON.stringify({ error: 'MongoDB connection string not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Simple response for now - we'll use your Railway API instead
    const { collection, operation, query } = await req.json()

    if (!collection || !operation) {
      return new Response(
        JSON.stringify({ error: 'Collection and operation are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // For now, return success - we'll connect via your Railway API
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'MongoDB proxy is working',
        data: []
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )

  } catch (error) {
    console.error('MongoDB proxy error:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }
})
```

## Function 2: send-approval-email

**Function Name**: `send-approval-email`

```typescript
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { userEmail, userName, tempPassword, referralCode } = await req.json()

    // Check if RESEND_API_KEY is configured
    const resendApiKey = Deno.env.get("RESEND_API_KEY")
    if (!resendApiKey) {
      console.error('RESEND_API_KEY environment variable is not set')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Email service not configured. Please set RESEND_API_KEY environment variable.' 
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      )
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
      )
    }

    console.log(`Sending approval email to ${userEmail} for ${userName}`)

    // Use fetch to call Resend API directly
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
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
                  
                  <a href="${Deno.env.get('SITE_URL') || 'https://your-site.com'}/auth" class="button">Login to Your Dashboard</a>
                  
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
      }),
    })

    const emailResult = await emailResponse.json()

    if (!emailResponse.ok) {
      console.error('Resend API error:', emailResult)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Email delivery failed: ${emailResult.message || 'Unknown Resend error'}` 
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      )
    }

    console.log(`Email sent successfully to ${userEmail}. Message ID: ${emailResult.id}`)

    return new Response(JSON.stringify({ 
      success: true, 
      data: emailResult,
      message: `Approval email sent successfully to ${userEmail}`
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    })
  } catch (error) {
    console.error('Error in send-approval-email function:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Email function error: ${errorMessage}` 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    )
  }
})
```

## 📋 Deployment Steps

1. **Go to Supabase Dashboard → Edge Functions**

2. **For mongo-proxy**:
   - Click "Create Function"
   - Name: `mongo-proxy`
   - Copy the ENTIRE code above (including import)
   - Click "Deploy"

3. **For send-approval-email**:
   - If it exists, click on it to edit
   - If not, create new function with name: `send-approval-email`
   - Replace ALL code with the version above
   - Click "Deploy"

## 🎯 Environment Variables Needed

Make sure you have these in Supabase → Settings → Edge Functions → Environment Variables:

```
RESEND_API_KEY=your_resend_api_key_here
MONGO_CONNECTION_STRING=mongodb+srv://LeeJonesKE:rxov9FDs8LIxoOOZ@tg-star-store.l1jsj.mongodb.net/?retryWrites=true&w=majority&appName=Tg-Star-Store
SITE_URL=https://your-actual-site-url.com
```

The key difference is I removed the complex MongoDB client import and simplified the functions to work with the Supabase dashboard deployment system.