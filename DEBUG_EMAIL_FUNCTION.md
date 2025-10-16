# 🔍 Debug Email Function Issues

## Step 1: Check Function Logs

1. **Go to Supabase Dashboard**
2. **Navigate to**: Edge Functions → `send-approval-email`
3. **Click on "Logs" tab**
4. **Look for recent error messages**

## Step 2: Test the Function Directly

Let's test the function to see what error it's returning:

### Test in Supabase Dashboard

1. **Go to**: Edge Functions → `send-approval-email`
2. **Click "Invoke" tab**
3. **Use this test payload**:

```json
{
  "userEmail": "test@example.com",
  "userName": "Test User",
  "tempPassword": "STAR12345678",
  "referralCode": "12345678"
}
```

4. **Click "Send Request"**
5. **Check the response** - it will show you the exact error

## Step 3: Common Issues & Fixes

### Issue 1: RESEND_API_KEY Not Set
**Error**: "RESEND_API_KEY not configured"
**Fix**: Add the environment variable in Settings → Edge Functions → Environment Variables

### Issue 2: Invalid Resend API Key
**Error**: "Email failed: Invalid API key"
**Fix**: Double-check your Resend API key is correct

### Issue 3: Domain Not Verified
**Error**: "Email failed: Domain not verified"
**Fix**: In Resend dashboard, verify your domain or use their test domain

## Step 4: Updated Function with Better Error Handling

Replace your function with this version that has better debugging:

```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

Deno.serve(async (req) => {
  console.log('Email function called:', req.method)
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    console.log('Request body:', body)
    
    const { userEmail, userName, tempPassword, referralCode } = body
    const resendApiKey = Deno.env.get("RESEND_API_KEY")
    
    console.log('Environment check - RESEND_API_KEY exists:', !!resendApiKey)
    console.log('Required fields check:', { userEmail: !!userEmail, userName: !!userName, tempPassword: !!tempPassword, referralCode: !!referralCode })
    
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not found in environment')
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'RESEND_API_KEY not configured in environment variables' 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      })
    }

    if (!userEmail || !userName || !tempPassword || !referralCode) {
      console.error('Missing required fields:', { userEmail, userName, tempPassword, referralCode })
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing required fields: userEmail, userName, tempPassword, or referralCode' 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      })
    }

    console.log('Attempting to send email to:', userEmail)

    const emailPayload = {
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
    }

    console.log('Email payload prepared, calling Resend API...')

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload)
    })

    console.log('Resend API response status:', emailResponse.status)
    
    const result = await emailResponse.json()
    console.log('Resend API response:', result)

    if (!emailResponse.ok) {
      console.error('Resend API error:', result)
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Email delivery failed: ${result.message || result.error || 'Unknown error'}`,
        details: result
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      })
    }

    console.log('Email sent successfully!')
    
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
      error: `Function error: ${error.message}`,
      stack: error.stack
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    })
  }
})
```

## Step 5: Quick Checklist

- [ ] RESEND_API_KEY is set in environment variables
- [ ] Resend API key is valid (check in Resend dashboard)
- [ ] Function deployed successfully
- [ ] Test the function with the invoke tab
- [ ] Check function logs for specific errors

## Step 6: Alternative - Use Manual Email for Now

If the function still doesn't work, the system has a **Manual Email Sender** that appears when automatic email fails. You can use that as a backup while we debug the function.

Try the updated function above and let me know what the logs show!