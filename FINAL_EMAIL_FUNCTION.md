# 🎉 Final Email Function for starstore.site

## Updated send-approval-email Function

**Replace your function with this code that uses your verified domain:**

```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { userEmail, userName, tempPassword, referralCode } = await req.json()
    const resendApiKey = Deno.env.get("RESEND_API_KEY")
    
    if (!resendApiKey) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'RESEND_API_KEY not configured' 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      })
    }

    if (!userEmail || !userName || !tempPassword || !referralCode) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing required fields' 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      })
    }

    console.log(`Sending approval email to ${userEmail} for ${userName}`)

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: "StarStore Ambassador Program <noreply@starstore.site>",
        to: [userEmail],
        subject: "🎉 Welcome to StarStore Ambassador Program!",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0; }
                .content { background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px; }
                .credentials { background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 5px solid #667eea; }
                .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; margin: 25px 0; font-weight: 600; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                code { background: #fff3cd; padding: 4px 8px; border-radius: 4px; font-family: 'SF Mono', Monaco, monospace; color: #856404; font-weight: 600; }
                .steps { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .steps ol { margin: 10px 0; padding-left: 20px; }
                .steps li { margin: 8px 0; }
                h1 { margin: 0; font-size: 32px; font-weight: 700; }
                h3 { color: #667eea; margin-top: 0; font-size: 18px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>✨ Welcome to StarStore!</h1>
                  <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">You're now an official ambassador!</p>
                </div>
                <div class="content">
                  <p style="font-size: 16px;">Hi <strong>${userName}</strong>,</p>
                  
                  <p style="font-size: 16px;"><strong>Congratulations!</strong> Your application to become a StarStore Ambassador has been <strong>approved</strong>! 🎊</p>
                  
                  <div class="credentials">
                    <h3>🔐 Your Login Credentials</h3>
                    <p><strong>Email:</strong> ${userEmail}</p>
                    <p><strong>Temporary Password:</strong> <code>${tempPassword}</code></p>
                    <p><strong>Your Referral Code:</strong> <code>${referralCode}</code></p>
                  </div>
                  
                  <p style="background: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107;"><strong>⚠️ Important:</strong> Please change your password after your first login for security.</p>
                  
                  <div style="text-align: center;">
                    <a href="https://starstore.site/auth" class="button">🚀 Login to Your Dashboard</a>
                  </div>
                  
                  <div class="steps">
                    <h3>🎯 Your Next Steps:</h3>
                    <ol>
                      <li><strong>Log in</strong> to your ambassador dashboard using the credentials above</li>
                      <li><strong>Change your password</strong> for security (you'll be prompted)</li>
                      <li><strong>Complete your profile</strong> setup in the dashboard</li>
                      <li><strong>Start sharing</strong> your referral code: <code>${referralCode}</code></li>
                      <li><strong>Track your earnings</strong> and referrals in real-time</li>
                    </ol>
                  </div>
                  
                  <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #28a745;">
                    <h3 style="color: #28a745; margin-top: 0;">🌟 Ambassador Benefits:</h3>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                      <li>Earn commissions on every referral transaction</li>
                      <li>Access to exclusive ambassador tools and analytics</li>
                      <li>Real-time earnings and performance tracking</li>
                      <li>Tier-based rewards and bonuses</li>
                      <li>Professional referral links and sharing tools</li>
                    </ul>
                  </div>
                  
                  <p style="font-size: 16px;">If you have any questions or need assistance, please don't hesitate to reach out to our support team.</p>
                  
                  <p style="font-size: 16px;">Welcome to the StarStore family! 🌟</p>
                  
                  <p style="font-size: 16px;">Best regards,<br><strong>The StarStore Team</strong></p>
                </div>
                <div class="footer">
                  <p>This email was sent to ${userEmail}</p>
                  <p>© ${new Date().getFullYear()} StarStore. All rights reserved.</p>
                  <p style="margin-top: 10px;"><a href="https://starstore.site" style="color: #667eea;">starstore.site</a></p>
                </div>
              </div>
            </body>
          </html>
        `,
      })
    })

    const result = await emailResponse.json()

    if (!emailResponse.ok) {
      console.error('Resend API error:', result)
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Email delivery failed: ${result.message || 'Unknown error'}`,
        details: result
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      })
    }

    console.log(`Email sent successfully to ${userEmail}`)

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Approval email sent successfully to ${userEmail}`,
      data: result
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    })

  } catch (error) {
    console.error('Function error:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: `Function error: ${error.message}` 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    })
  }
})
```

## 🎯 **What This Does:**

1. **Uses your domain**: `noreply@starstore.site`
2. **Professional email design**: Beautiful branded template
3. **Correct login URL**: Points to `https://starstore.site/auth`
4. **Enhanced styling**: Modern, professional appearance
5. **Clear instructions**: Step-by-step onboarding guide

## 📋 **To Deploy:**

1. **Go to Supabase Dashboard → Edge Functions → send-approval-email**
2. **Replace ALL the code** with the version above
3. **Click Deploy**
4. **Test by approving an ambassador application**

## ✅ **This Should Work Now Because:**

- ✅ Your domain `starstore.site` is verified in Resend
- ✅ Your new API key is active
- ✅ The function uses your verified domain
- ✅ Professional email template included
- ✅ Correct site URLs

Once you deploy this updated function, the "non-2xx status code" error should disappear and ambassadors will receive beautiful, professional welcome emails! 🚀

Deploy this and try approving an application - it should work perfectly now! 💪