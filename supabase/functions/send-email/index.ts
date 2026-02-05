
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface EmailRequest {
  to: string;
  subject: string;
  htmlBody: string;
  // Optional override for testing ONLY
  providerConfig?: {
    apiKey?: string;
    from?: string;
  };
  testMode?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    // 1. Initialize Supabase Admin Client
    const sbUrl = Deno.env.get('SUPABASE_URL');
    const sbServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!sbUrl || !sbServiceKey) {
       throw new Error("Missing server configuration (SUPABASE_URL or SERVICE_ROLE_KEY)");
    }

    const supabaseAdmin = createClient(sbUrl, sbServiceKey);

    // 2. Parse Request
    const { to, subject, htmlBody, providerConfig, testMode }: EmailRequest = await req.json();

    // 3. Resolve API Key & From Address
    let resendApiKey = providerConfig?.apiKey;
    let resendFrom = providerConfig?.from;

    // If not provided in payload (standard flow), fetch from Database
    if (!resendApiKey) {
        console.log("[send-email] No key in payload. Fetching from Database...");
        
        const { data: dbSettings, error: dbError } = await supabaseAdmin
            .from('app_settings')
            .select('resend_api_key, resend_from_email')
            .eq('id', 1)
            .single();

        if (dbError || !dbSettings || !dbSettings.resend_api_key) {
            throw new Error('Resend API Key not configured. Please set it in Admin > Settings > Notifications.');
        }

        resendApiKey = dbSettings.resend_api_key;
        resendFrom = dbSettings.resend_from_email || 'onboarding@resend.dev';
    }

    if (!resendApiKey) throw new Error("Resend API Key is missing.");
    if (!resendFrom) resendFrom = 'onboarding@resend.dev';

    // Ensure HTML wrapper
    let finalHtml = htmlBody;
    if (!htmlBody.trim().toLowerCase().startsWith('<!doctype') && !htmlBody.trim().toLowerCase().startsWith('<html')) {
       finalHtml = `<!DOCTYPE html><html><body style="font-family: sans-serif; padding: 20px;">${htmlBody}</body></html>`;
    }

    // 4. Send Email via native fetch (No SDK dependency)
    console.log(`[send-email] Sending to ${to} from ${resendFrom}...`);
    
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: resendFrom,
        to: [to],
        subject: subject,
        html: finalHtml
      })
    });

    const data = await res.json();

    if (!res.ok) {
        console.error('[send-email] Resend API Error:', data);
        throw new Error(`Resend Error: ${data.message || res.statusText}`);
    }

    console.log("[send-email] Success:", data.id);

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('[send-email] Exception:', error.message);
    return new Response(JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
