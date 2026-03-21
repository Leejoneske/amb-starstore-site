import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const { name, email, subject, message }: ContactRequest = await req.json();

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Name, email, and message are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate lengths
    if (name.length > 100 || email.length > 255 || message.length > 2000) {
      return new Response(
        JSON.stringify({ error: "Input exceeds maximum length" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send email to support
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "StarStore Ambassador <noreply@starstore.site>",
        to: ["support@starstore.site"],
        reply_to: email,
        subject: `[Ambassador Contact] ${subject}: ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a1a2e; border-bottom: 2px solid #7c3aed; padding-bottom: 10px;">New Contact Form Submission</h2>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr><td style="padding: 8px 0; font-weight: bold; color: #555; width: 100px;">Name:</td><td style="padding: 8px 0;">${escapeHtml(name)}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Subject:</td><td style="padding: 8px 0;">${escapeHtml(subject)}</td></tr>
            </table>
            <div style="background: #f5f5f5; border-radius: 8px; padding: 16px; margin-top: 10px;">
              <p style="font-weight: bold; color: #555; margin: 0 0 8px 0;">Message:</p>
              <p style="color: #333; white-space: pre-wrap; margin: 0;">${escapeHtml(message)}</p>
            </div>
            <p style="color: #999; font-size: 12px; margin-top: 20px;">Sent from the StarStore Ambassador Program contact form.</p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("Resend error:", errBody);
      throw new Error(`Resend API error: ${res.status}`);
    }

    // Send confirmation to user
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "StarStore Ambassador <noreply@starstore.site>",
        to: [email],
        subject: "We received your message — StarStore Ambassador Program",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a1a2e;">Thank you, ${escapeHtml(name)}!</h2>
            <p style="color: #555; line-height: 1.6;">We've received your message regarding <strong>"${escapeHtml(subject)}"</strong> and our team will get back to you within 1–3 business days.</p>
            <p style="color: #555; line-height: 1.6;">In the meantime, you can also reach us via:</p>
            <ul style="color: #555; line-height: 1.8;">
              <li>Telegram Bot: <a href="https://t.me/TgStarStore_bot" style="color: #7c3aed;">@TgStarStore_bot</a></li>
              <li>Community: <a href="https://t.me/StarStore_app" style="color: #7c3aed;">t.me/StarStore_app</a></li>
            </ul>
            <p style="color: #999; font-size: 12px; margin-top: 20px;">— StarStore Ambassador Team</p>
          </div>
        `,
      }),
    });

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Contact email error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send email" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
