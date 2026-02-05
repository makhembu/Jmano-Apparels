
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

    // --- CONFIGURATION RESOLUTION STRATEGY ---
    // 1. Use passed config (Test Button / Specific Mode)
    // 2. Fallback to Database (Primary Source of Truth)
    // 3. Fallback to Env Vars (Legacy/Development)
    
    let activeConfig = providerConfig;

    // If config is missing or incomplete (no mode specified), fetch from DB
    if (!activeConfig || !activeConfig.mode) {
        console.log("Fetching SMTP settings from Database...");
        const sbAdmin = createClient(sbUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
        const { data: dbSettings, error: dbError } = await sbAdmin
            .from('app_settings')
            .select('smtp_settings, email_provider')
            .eq('id', 1)
            .single();

        if (dbSettings && dbSettings.smtp_settings) {
            console.log("Using Database SMTP Settings");
            activeConfig = {
                ...dbSettings.smtp_settings,
                provider: dbSettings.email_provider || 'smtp',
                mode: 'custom' // Treat DB settings as custom mode
            };
        } else {
            console.log("No DB settings found, falling back to ENV");
            // Fall back to env vars
            activeConfig = { mode: 'env', provider: 'smtp' };
        }
    }

    const useCustomMode = activeConfig?.mode === 'custom';
    const envProvider = Deno.env.get('EMAIL_PROVIDER');
    const effectiveProvider = useCustomMode ? (activeConfig?.provider || 'smtp') : (envProvider || 'smtp');
    const useResend = effectiveProvider === 'resend';

    let resendKey, smtpHost, smtpUser, smtpPass, smtpPort, fromEmail;

    if (useCustomMode) {
        resendKey = activeConfig?.apiKey;
        smtpHost = activeConfig?.host;
        smtpUser = activeConfig?.user;
        smtpPass = activeConfig?.pass;
        smtpPort = activeConfig?.port ? parseInt(String(activeConfig.port), 10) : 465;
        fromEmail = activeConfig?.from || 'noreply@jamboapparels.com';
    } else {
        // Env Fallback
        resendKey = Deno.env.get('RESEND_API_KEY');
        smtpHost = Deno.env.get('SMTP_HOST');
        smtpUser = Deno.env.get('SMTP_USER');
        smtpPass = Deno.env.get('SMTP_PASS');
        smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '465');
        fromEmail = Deno.env.get('SMTP_FROM') || 'noreply@jamboapparels.com';
    }

    let info;
    let finalHtml = htmlBody;
    if (!htmlBody.trim().toLowerCase().startsWith('<!doctype') && !htmlBody.trim().toLowerCase().startsWith('<html')) {
       finalHtml = `<!DOCTYPE html><html><body style="font-family: sans-serif; padding: 20px;">${htmlBody}</body></html>`;
    }

    if (useResend) {
      if (!resendKey) throw new Error(`Resend API Key missing in ${useCustomMode ? 'DB Settings' : 'Env Vars'}.`);

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
      if (!smtpHost) throw new Error(`SMTP Host missing in ${useCustomMode ? 'DB Settings' : 'Env Vars'}.`);
      
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
