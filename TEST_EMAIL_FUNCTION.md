# 🧪 Test Email Function

Let's create a simple test to see exactly what's happening with your email function.

## Step 1: Test Your Current Function

1. **Go to Supabase Dashboard → Edge Functions → send-approval-email**
2. **Click "Invoke" tab**
3. **Use this test payload**:

```json
{
  "userEmail": "your-email@example.com",
  "userName": "Test User",
  "tempPassword": "STAR12345678",
  "referralCode": "12345678"
}
```

4. **Click "Send Request"**
5. **Tell me what response you get!**

## Step 2: Check Environment Variables

1. **Go to Settings → Edge Functions → Environment Variables**
2. **Make sure you have**:
   - `RESEND_API_KEY` with your actual API key from Resend

## Step 3: Check Your Resend Account

1. **Go to [resend.com](https://resend.com) dashboard**
2. **Check if your API key is active**
3. **Make sure you haven't hit any limits**

## Step 4: Simple Debug Version

If the test fails, replace your function with this debug version:

```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

Deno.serve(async (req) => {
  console.log('=== EMAIL FUNCTION DEBUG START ===')
  console.log('Method:', req.method)
  
  if (req.method === "OPTIONS") {
    console.log('CORS preflight request')
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Parse request body
    const body = await req.json()
    console.log('Request body received:', JSON.stringify(body, null, 2))
    
    const { userEmail, userName, tempPassword, referralCode } = body
    
    // Check environment variables
    const resendApiKey = Deno.env.get("RESEND_API_KEY")
    console.log('RESEND_API_KEY exists:', !!resendApiKey)
    console.log('RESEND_API_KEY length:', resendApiKey ? resendApiKey.length : 0)
    
    // Check required fields
    console.log('Field validation:')
    console.log('- userEmail:', userEmail ? '✓' : '✗')
    console.log('- userName:', userName ? '✓' : '✗') 
    console.log('- tempPassword:', tempPassword ? '✓' : '✗')
    console.log('- referralCode:', referralCode ? '✓' : '✗')
    
    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY not found')
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'RESEND_API_KEY not configured in environment variables',
        debug: 'Environment variable RESEND_API_KEY is missing'
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      })
    }

    if (!userEmail || !userName || !tempPassword || !referralCode) {
      console.error('❌ Missing required fields')
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing required fields',
        debug: {
          userEmail: !!userEmail,
          userName: !!userName,
          tempPassword: !!tempPassword,
          referralCode: !!referralCode
        }
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      })
    }

    console.log('✅ All validations passed, attempting to send email...')

    // Prepare email payload
    const emailPayload = {
      from: "StarStore <onboarding@resend.dev>",
      to: [userEmail],
      subject: "🎉 Welcome to StarStore Ambassador Program!",
      html: `<h1>Welcome ${userName}!</h1><p>Your password: ${tempPassword}</p><p>Your referral code: ${referralCode}</p>`
    }
    
    console.log('Email payload:', JSON.stringify(emailPayload, null, 2))

    // Call Resend API
    console.log('Calling Resend API...')
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload)
    })

    console.log('Resend API response status:', emailResponse.status)
    console.log('Resend API response headers:', Object.fromEntries(emailResponse.headers.entries()))
    
    const result = await emailResponse.json()
    console.log('Resend API response body:', JSON.stringify(result, null, 2))

    if (!emailResponse.ok) {
      console.error('❌ Resend API failed')
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Resend API error: ${result.message || result.error || 'Unknown error'}`,
        debug: {
          status: emailResponse.status,
          response: result
        }
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      })
    }

    console.log('✅ Email sent successfully!')
    console.log('=== EMAIL FUNCTION DEBUG END ===')
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: `Email sent successfully to ${userEmail}`,
      data: result
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    })

  } catch (error) {
    console.error('❌ Function error:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: `Function error: ${error.message}`,
      debug: {
        stack: error.stack,
        name: error.name
      }
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    })
  }
})
```

## Step 5: What to Tell Me

After testing, please tell me:

1. **What response do you get from the test?**
2. **What do the function logs show?** (Go to Edge Functions → send-approval-email → Logs)
3. **Is your RESEND_API_KEY set correctly?**
4. **What's your Resend account status?**

This debug version will give us detailed information about exactly what's failing! 🔍