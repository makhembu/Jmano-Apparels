
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@3.2.0";

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-jambo-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Shared secret for DB Triggers
const JAMBO_INTERNAL_SECRET = "jambo_secure_trigger_8823";

interface EmailRequest {
  to: string;
  subject: string;
  htmlBody: string;
  providerConfig?: {
    resendApiKey?: string;
    senderEmail?: string;
  };
  testMode?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const sbUrl = Deno.env.get('SUPABASE_URL');
    const sbServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const sbAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!sbUrl || !sbServiceKey) {
       throw new Error("Missing server configuration (SUPABASE_URL or SERVICE_ROLE_KEY)");
    }

    // --- SECURITY CHECK ---
    const authHeader = req.headers.get('Authorization');
    const internalSecret = req.headers.get('x-jambo-secret');
    let isAuthorized = false;

    // 1. Check for Internal Secret (DB Triggers)
    if (internalSecret === JAMBO_INTERNAL_SECRET) {
      console.log("[send-email] Authorized via Internal Secret");
      isAuthorized = true;
    } 
    // 2. Check for Admin User (Browser/UI)
    else if (authHeader) {
      const supabaseClient = createClient(sbUrl, sbAnonKey || '', {
        global: { headers: { Authorization: authHeader } }
      });
      
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
      
      if (user && !userError) {
        const supabaseAdmin = createClient(sbUrl, sbServiceKey);
        const { data: profile } = await supabaseAdmin.from('users').select('role').eq('id', user.id).single();
        
        if (profile?.role === 'admin') {
           console.log(`[send-email] Authorized Admin: ${user.email}`);
           isAuthorized = true;
        }
      }
    }

    if (!isAuthorized) {
      console.error("[send-email] Authorization Failed");
      return new Response(JSON.stringify({ error: "Unauthorized" }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401 
      });
    }

    // --- PROCESSING ---
    const supabaseAdmin = createClient(sbUrl, sbServiceKey);
    const { to, subject, htmlBody, providerConfig, testMode }: EmailRequest = await req.json();

    let resendApiKey = providerConfig?.resendApiKey;
    let senderEmail = providerConfig?.senderEmail;

    // If config not provided in request, fetch from DB
    if (!resendApiKey || !senderEmail) {
        const { data: dbSettings, error: dbError } = await supabaseAdmin
            .from('app_settings')
            .select('resend_api_key, sender_email')
            .eq('id', 1)
            .single();

        if (dbError || !dbSettings) {
            throw new Error('Could not fetch email settings from database.');
        }
        
        resendApiKey = resendApiKey || dbSettings.resend_api_key;
        senderEmail = senderEmail || dbSettings.sender_email;
    }

    if (!resendApiKey) throw new Error("Resend API Key not configured.");
    if (!senderEmail) throw new Error("Sender Email not configured.");

    const resend = new Resend(resendApiKey);

    // Ensure valid HTML wrapper
    let finalHtml = htmlBody;
    if (!htmlBody.trim().toLowerCase().startsWith('<!doctype') && !htmlBody.trim().toLowerCase().startsWith('<html')) {
       finalHtml = `<!DOCTYPE html><html><body style="font-family: sans-serif; padding: 20px;">${htmlBody}</body></html>`;
    }

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: `Jambo Apparels <${senderEmail}>`,
      to: [to],
      subject: subject,
      html: finalHtml,
    });

    if (emailError) {
      console.error("Resend Error:", emailError);
      throw new Error(`Resend Error: ${emailError.message}`);
    }

    console.log("[send-email] Sent:", emailData?.id);

    return new Response(JSON.stringify({ success: true, id: emailData?.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('[send-email] Error:', error.message);
    return new Response(JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
