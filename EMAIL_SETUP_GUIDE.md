# Email Setup Guide for StarStore Ambassador System

## Issue: Email Delivery Failure

The ambassador approval system is working correctly, but automatic email delivery is failing because the email service is not configured.

## Quick Fix Options

### Option 1: Configure Resend Email Service (Recommended)

1. **Get Resend API Key**:
   - Go to [resend.com](https://resend.com)
   - Sign up for a free account (100 emails/day free)
   - Get your API key from the dashboard

2. **Add to Supabase**:
   - Go to your Supabase project dashboard
   - Navigate to Settings → Edge Functions
   - Add environment variable:
     - Name: `RESEND_API_KEY`
     - Value: `your_resend_api_key_here`

3. **Redeploy Functions**:
   ```bash
   supabase functions deploy send-approval-email
   ```

### Option 2: Use Manual Email Sending (Current Workaround)

The system now includes a **Manual Email Sender** that appears when automatic email fails:

1. **When you approve an application**:
   - If email fails, you'll see "Send Manual Email" button
   - Click it to get the email template with all credentials
   - Copy the template or open your email client
   - Send manually to the new ambassador

### Option 3: Alternative Email Services

You can modify the email function to use other services:

#### Gmail/SMTP:
```typescript
// Replace Resend with nodemailer or similar
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: Deno.env.get('GMAIL_USER'),
    pass: Deno.env.get('GMAIL_APP_PASSWORD')
  }
});
```

#### SendGrid:
```typescript
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(Deno.env.get('SENDGRID_API_KEY'));
```

## Current System Status

✅ **Working Features**:
- User account creation
- Ambassador profile setup
- Application approval workflow
- Admin dashboard tracking
- Manual email fallback

❌ **Not Working**:
- Automatic email delivery (due to missing API key)

## Email Template

The system generates professional emails with:
- Welcome message
- Login credentials (email + temporary password)
- Referral code
- Next steps instructions
- Security reminders

## Recommendation

**Use Option 1 (Resend)** - it's the easiest and most reliable:
- Free tier: 100 emails/day, 3,000/month
- Simple API, great deliverability
- Already integrated in the code
- Just needs the API key added

## Testing

After setting up email:
1. Approve a test application
2. Check if email is delivered
3. Verify all credentials are included
4. Test the login flow

The manual email sender will always be available as a backup option.