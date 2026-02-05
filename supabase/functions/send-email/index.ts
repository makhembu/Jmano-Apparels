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
    mode?: 'env' | 'custom';
    provider: 'resend' | 'smtp';
    apiKey?: string;
    host?: string;
    port?: number | string;
    user?: string;
    pass?: string;
    from?: string;
  };
  testMode?: boolean;
}

function validateSmtpConfig(config: any): { valid: boolean; message?: string } {
  if (!config) {
    return { valid: false, message: 'SMTP configuration is required' };
  }

  if (config.provider === 'resend') {
    if (!config.apiKey) return { valid: false, message: 'Resend API Key is missing' };
    if (!config.from) return { valid: false, message: 'From address is missing' };
  } else if (config.provider === 'smtp') {
    if (!config.host) return { valid: false, message: 'SMTP Host is missing' };
    if (!config.port) return { valid: false, message: 'SMTP Port is missing' };
    if (!config.user) return { valid: false, message: 'SMTP Username is missing' };
    if (!config.pass) return { valid: false, message: 'SMTP Password is missing' };
    if (!config.from) return { valid: false, message: 'From address is missing' };
  }

  return { valid: true };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const sbUrl = Deno.env.get('SUPABASE_URL');
    const sbPublishableKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_PUBLISHABLE_DEFAULT_KEY');

    if (!sbUrl || !sbPublishableKey) {
       throw new Error("Missing server configuration");
    }

    const supabaseClient = createClient(sbUrl, sbPublishableKey, { global: { headers: { Authorization: authHeader! } } });
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    // Check for Service Role (Triggers) or Admin User (Frontend Test)
    const isServiceRole = authHeader?.includes(Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'INVALID_KEY');
    
    let isAdmin = false;
    if (user) {
        const { data: profile } = await supabaseClient.from('users').select('role').eq('id', user.id).single();
        isAdmin = profile?.role === 'admin';
    }

    if (!isServiceRole && !isAdmin) {
       throw new Error("Unauthorized: Email service restricted to administrators.");
    }

    const { to, subject, htmlBody, providerConfig, testMode }: EmailRequest = await req.json();

    // --- CONFIGURATION RESOLUTION STRATEGY (DATABASE ONLY) ---
    let activeConfig = providerConfig;

    // If config is not provided or incomplete (missing explicit mode), fetch from database
    if (!activeConfig || !activeConfig.mode) {
        console.log("[send-email] Fetching SMTP settings from database...");
        const sbAdmin = createClient(sbUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
        const { data: dbSettings, error: dbError } = await sbAdmin
            .from('app_settings')
            .select('smtp_settings, email_provider')
            .eq('id', 1)
            .single();

        if (dbError || !dbSettings || !dbSettings.smtp_settings) {
            throw new Error(
                'SMTP settings not configured. Please configure email settings in the admin panel (Settings > Email Infrastructure).'
            );
        }

        activeConfig = {
            ...dbSettings.smtp_settings,
            provider: dbSettings.email_provider || 'smtp',
            mode: 'custom'
        };
    }

    // Validate configuration
    const validation = validateSmtpConfig(activeConfig);
    if (!validation.valid) {
        throw new Error(`Configuration error: ${validation.message}`);
    }

    const provider = activeConfig.provider || 'smtp';
    const useResend = provider === 'resend';

    // Extract credentials
    const resendKey = activeConfig.apiKey;
    const smtpHost = activeConfig.host;
    const smtpUser = activeConfig.user;
    const smtpPass = activeConfig.pass;
    const smtpPort = activeConfig.port ? parseInt(String(activeConfig.port), 10) : 465;
    const fromEmail = activeConfig.from || 'noreply@jamboapparels.com';

    console.log(`[send-email] Using ${useResend ? 'Resend' : 'SMTP'} provider`);

    let info;
    let finalHtml = htmlBody;
    if (!htmlBody.trim().toLowerCase().startsWith('<!doctype') && !htmlBody.trim().toLowerCase().startsWith('<html')) {
       finalHtml = `<!DOCTYPE html><html><body style="font-family: sans-serif; padding: 20px;">${htmlBody}</body></html>`;
    }

    if (useResend) {
      if (!resendKey) throw new Error(`Resend API Key missing in DB Settings.`);

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendKey}`
        },
        body: JSON.stringify({
          from: `Jambo Apparels <${fromEmail}>`,
          to: [to],
          subject: subject,
          html: finalHtml
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(`Resend Error: ${JSON.stringify(data)}`);
      info = { id: data.id, provider: 'resend' };

    } else {
      if (!smtpHost) throw new Error(`SMTP Host missing in DB Settings.`);
      
      const auth = (smtpUser && smtpPass) ? { user: smtpUser, pass: smtpPass } : undefined;
      const isSecure = smtpPort === 465;

      const transporter = createTransport({
        host: smtpHost,
        port: smtpPort, 
        secure: isSecure,
        auth: auth,
        // Allow self-signed certs for some SMTP servers
        tls: {
            rejectUnauthorized: false
        }
      });

      if (testMode) await transporter.verify();

      info = await transporter.sendMail({
        from: `Jambo Apparels <${fromEmail}>`,
        to,
        subject,
        html: finalHtml,
      });
    }

    return new Response(JSON.stringify({ success: true, info }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Email Function Error:', error);
    return new Response(JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error',
        stack: error.stack 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400, 
    });
  }
});