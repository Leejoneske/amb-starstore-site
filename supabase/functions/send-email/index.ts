import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  text?: string;
  messageId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get request data
    const { to, subject, html, text, messageId }: EmailRequest = await req.json();

    // Validate required fields
    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: to, subject, or html' 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if RESEND_API_KEY is configured
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error('RESEND_API_KEY environment variable is not set');
      
      // Update message status to failed if messageId provided
      if (messageId) {
        await supabase
          .from('messages')
          .update({ 
            status: 'failed',
            error_message: 'Email service not configured. RESEND_API_KEY missing.',
            failed_at: new Date().toISOString()
          })
          .eq('id', messageId);
      }
      
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

    // Initialize Resend
    const resend = new Resend(resendApiKey);

    // Send email via Resend
    const emailResult = await resend.emails.send({
      from: "StarStore <noreply@starstore.site>",
      to: [to],
      subject: subject,
      html: html,
      text: text,
    });

    if (emailResult.error) {
      console.error('Resend API error:', emailResult.error);
      
      // Update message status to failed if messageId provided
      if (messageId) {
        await supabase
          .from('messages')
          .update({ 
            status: 'failed',
            error_message: `Resend API error: ${emailResult.error.message}`,
            failed_at: new Date().toISOString()
          })
          .eq('id', messageId);

        // Log the failure event
        await supabase
          .from('message_events')
          .insert({
            message_id: messageId,
            event_type: 'failed',
            event_data: { error: emailResult.error },
            occurred_at: new Date().toISOString()
          });
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to send email: ${emailResult.error.message}` 
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log('Email sent successfully:', emailResult.data?.id);

    // Update message status to sent if messageId provided
    if (messageId) {
      await supabase
        .from('messages')
        .update({ 
          status: 'sent',
          external_message_id: emailResult.data?.id,
          sent_at: new Date().toISOString()
        })
        .eq('id', messageId);

      // Log the sent event
      await supabase
        .from('message_events')
        .insert({
          message_id: messageId,
          event_type: 'sent',
          event_data: { 
            externalMessageId: emailResult.data?.id,
            resendId: emailResult.data?.id
          },
          occurred_at: new Date().toISOString()
        });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: emailResult.data?.id,
        internalMessageId: messageId
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error) {
    console.error('Email sending error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);