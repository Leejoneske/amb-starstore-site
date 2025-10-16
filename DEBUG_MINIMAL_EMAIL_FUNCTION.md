# 🔍 Minimal Debug Email Function

## Ultra-Simple Version for Debugging

**Replace your send-approval-email function with this minimal version to identify the exact issue:**

```typescript
Deno.serve(async (req) => {
  console.log("🚀 Function started")
  
  try {
    // Handle CORS
    if (req.method === "OPTIONS") {
      console.log("✅ CORS preflight handled")
      return new Response(null, { 
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        }
      })
    }

    console.log("📥 Parsing request body...")
    const body = await req.json()
    console.log("📋 Request body:", JSON.stringify(body, null, 2))

    const { userEmail, userName, tempPassword, referralCode } = body

    console.log("🔑 Checking environment variables...")
    const resendApiKey = Deno.env.get("RESEND_API_KEY")
    console.log("🔑 API Key exists:", !!resendApiKey)
    console.log("🔑 API Key length:", resendApiKey?.length || 0)

    if (!resendApiKey) {
      console.log("❌ No API key found")
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'RESEND_API_KEY not configured' 
      }), {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      })
    }

    if (!userEmail || !userName || !tempPassword || !referralCode) {
      console.log("❌ Missing required fields")
      console.log("Missing:", { userEmail: !userEmail, userName: !userName, tempPassword: !tempPassword, referralCode: !referralCode })
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing required fields' 
      }), {
        status: 400,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      })
    }

    console.log("📧 Preparing to send email...")
    console.log("📧 To:", userEmail)
    console.log("📧 User:", userName)

    const emailPayload = {
      from: "StarStore <noreply@starstore.site>",
      to: [userEmail],
      subject: "Welcome to StarStore Ambassador Program!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333;">Welcome ${userName}!</h1>
          <p>Your application has been approved!</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Login Credentials:</h3>
            <p><strong>Email:</strong> ${userEmail}</p>
            <p><strong>Temporary Password:</strong> ${tempPassword}</p>
            <p><strong>Referral Code:</strong> ${referralCode}</p>
          </div>
          <p><a href="https://starstore.site/auth" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Login Now</a></p>
          <p>Best regards,<br>The StarStore Team</p>
        </div>
      `
    }

    console.log("📧 Email payload prepared")
    console.log("📧 From:", emailPayload.from)
    console.log("📧 Subject:", emailPayload.subject)

    console.log("🌐 Making request to Resend API...")
    
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload)
    })

    console.log("📡 Resend API response status:", emailResponse.status)
    console.log("📡 Resend API response ok:", emailResponse.ok)

    const result = await emailResponse.json()
    console.log("📡 Resend API response body:", JSON.stringify(result, null, 2))

    if (!emailResponse.ok) {
      console.log("❌ Email failed")
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Email delivery failed: ${result.message || 'Unknown error'}`,
        details: result,
        status: emailResponse.status
      }), {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      })
    }

    console.log("✅ Email sent successfully!")

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Email sent successfully to ${userEmail}`,
      data: result
    }), {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    })

  } catch (error) {
    console.log("💥 Function error occurred")
    console.log("💥 Error name:", error.name)
    console.log("💥 Error message:", error.message)
    console.log("💥 Error stack:", error.stack)
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: `Function error: ${error.message}`,
      errorName: error.name,
      errorStack: error.stack
    }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    })
  }
})
```

## 🎯 **What This Debug Version Does:**

1. **Extensive Logging**: Every step is logged with emojis for easy identification
2. **Error Details**: Captures exact error names, messages, and stack traces
3. **Simplified HTML**: Basic email template to avoid any parsing issues
4. **Step-by-Step Tracking**: Shows exactly where the function fails
5. **Environment Check**: Verifies API key existence and length

## 📋 **Deploy This and Test:**

1. **Replace your function** with this debug version
2. **Deploy it**
3. **Try approving an application**
4. **Check the logs** in Supabase Dashboard → Edge Functions → send-approval-email → Logs

## 🔍 **What to Look For:**

The logs will show you **exactly** where the function fails:
- ✅ Function started
- ✅ Request parsed
- ✅ API key found
- ✅ Email payload prepared
- ❌ **[ERROR WILL APPEAR HERE]**

## 📊 **After Testing:**

Share the **console logs** from the Supabase function logs, and I'll identify the exact issue and provide the final fix!

This debug version will pinpoint exactly what's causing the "EarlyDrop" shutdown. 🔍