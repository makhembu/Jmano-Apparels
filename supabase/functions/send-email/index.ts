import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createTransport } from "https://esm.sh/nodemailer@6.9.1";
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
  providerConfig?: {
    host?: string;
    port?: number | string;
    user?: string;
    pass?: string;
    from?: string;
  };
  testMode?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const sbUrl = Deno.env.get('SUPABASE_URL');
    const sbServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!sbUrl || !sbServiceKey) {
       throw new Error("Missing server configuration (SUPABASE_URL or SERVICE_ROLE_KEY)");
    }

    // Initialize Admin Client to fetch settings if needed
    const supabaseAdmin = createClient(sbUrl, sbServiceKey);

    // Parse Request
    const { to, subject, htmlBody, providerConfig, testMode }: EmailRequest = await req.json();

    // --- CONFIGURATION RESOLUTION ---
    let activeConfig = providerConfig;

    // If no config provided (Automated Trigger), fetch from Database
    if (!activeConfig) {
        console.log("[send-email] No config provided in payload. Fetching from Database...");
        
        const { data: dbSettings, error: dbError } = await supabaseAdmin
            .from('app_settings')
            .select('smtp_settings')
            .eq('id', 1)
            .single();

        if (dbError || !dbSettings || !dbSettings.smtp_settings) {
            throw new Error('SMTP settings not found in database. Please configure in Admin > Settings > Notifications.');
        }

        activeConfig = dbSettings.smtp_settings;
    }

    if (!activeConfig) throw new Error("Failed to resolve email configuration.");

    // Validate SMTP
    if (!activeConfig.host) throw new Error("SMTP Host is missing.");
    
    const port = activeConfig.port ? parseInt(String(activeConfig.port), 10) : 587;
    const fromEmail = activeConfig.from || 'noreply@jamboapparels.com';

    console.log(`[send-email] Using Custom SMTP (${activeConfig.host}:${port})`);

    const transporter = createTransport({
        host: activeConfig.host,
        port: port,
        secure: port === 465, // True for 465, false for other ports
        auth: (activeConfig.user && activeConfig.pass) ? {
            user: activeConfig.user,
            pass: activeConfig.pass
        } : undefined,
        tls: {
            rejectUnauthorized: false // Helps with some self-hosted SMTPs
        }
    });

    // --- SENDING ---
    if (testMode) {
        await transporter.verify();
        console.log("[send-email] Connection Verified");
    }

    // Ensure HTML wrapper
    let finalHtml = htmlBody;
    if (!htmlBody.trim().toLowerCase().startsWith('<!doctype') && !htmlBody.trim().toLowerCase().startsWith('<html')) {
       finalHtml = `<!DOCTYPE html><html><body style="font-family: sans-serif; padding: 20px;">${htmlBody}</body></html>`;
    }

    const info = await transporter.sendMail({
        from: `Jambo Apparels <${fromEmail}>`,
        to: to,
        subject: subject,
        html: finalHtml,
    });

    console.log("[send-email] Message sent: %s", info.messageId);

    return new Response(JSON.stringify({ success: true, id: info.messageId }), {
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
      status: 400, // Return 400 so client knows it failed
    });
  }
});