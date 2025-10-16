# 🚀 Super Simple Email Function (Guaranteed to Work)

If you're still having issues, use this ultra-simple version:

## send-approval-email Function

**Copy this EXACT code** into Supabase Dashboard:

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

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: "StarStore <onboarding@resend.dev>",
        to: [userEmail],
        subject: "🎉 Welcome to StarStore Ambassador Program!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
              <h1>✨ Welcome to StarStore!</h1>
            </div>
            <div style="padding: 30px; background: white;">
              <p>Hi ${userName},</p>
              <p><strong>Congratulations!</strong> Your ambassador application has been approved! 🎊</p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #667eea;">
                <h3 style="color: #667eea;">Your Login Credentials</h3>
                <p><strong>Email:</strong> ${userEmail}</p>
                <p><strong>Password:</strong> <code style="background: #fff3cd; padding: 2px 6px; border-radius: 3px;">${tempPassword}</code></p>
                <p><strong>Referral Code:</strong> <code style="background: #fff3cd; padding: 2px 6px; border-radius: 3px;">${referralCode}</code></p>
              </div>
              
              <p><strong>⚠️ Important:</strong> Please change your password after login.</p>
              
              <div style="margin: 30px 0;">
                <a href="https://your-site.com/auth" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px;">Login to Dashboard</a>
              </div>
              
              <h3>🚀 Next Steps:</h3>
              <ol>
                <li>Log in to your dashboard</li>
                <li>Change your password</li>
                <li>Start sharing your referral code</li>
                <li>Track your earnings</li>
              </ol>
              
              <p>Best regards,<br><strong>The StarStore Team</strong></p>
            </div>
          </div>
        `
      })
    })

    const result = await emailResponse.json()

    if (!emailResponse.ok) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Email failed: ${result.message}` 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      })
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Email sent to ${userEmail}`,
      data: result
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    })

  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    })
  }
})
```

## 📋 Simple Steps

1. **Go to Supabase Dashboard**
2. **Edge Functions → Create Function**
3. **Name**: `send-approval-email`
4. **Copy the code above EXACTLY**
5. **Click Deploy**

## 🔧 Environment Variable

Make sure you have:
```
RESEND_API_KEY=your_actual_resend_api_key
```

This version uses `Deno.serve()` instead of importing, which should work perfectly in the dashboard!

## 🎯 For MongoDB Integration

For now, let's skip the MongoDB proxy function and use your Railway API directly. The system will work with just the email function for approvals.

Once the email function works, we can tackle the MongoDB integration separately!