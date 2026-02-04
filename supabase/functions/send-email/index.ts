
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createTransport } from "https://esm.sh/nodemailer@6.9.1";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    port?: number;
    user?: string;
    pass?: string;
    from?: string;
  };
  testMode?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. SECURITY CHECK: Validate Authorization
    // We only allow this function to be called by Admins (JWT) or Service Role (Internal Triggers)
    const authHeader = req.headers.get('Authorization');
    const sbUrl = Deno.env.get('SUPABASE_URL');
    const sbAnon = Deno.env.get('SUPABASE_ANON_KEY');

    if (!authHeader || !sbUrl || !sbAnon) {
       // If internal trigger using ANON key, we need another way to trust it.
       // However, securely, we should require Service Role.
       // For this prototype/fix, we will assume requests MUST have a valid JWT.
       // If called via Postgres Trigger (pg_net), it usually passes the key configured in the trigger function.
       // We'll proceed but perform a User Role check if it's a user JWT.
    }

    // Initialize Client to check permissions
    const supabaseClient = createClient(sbUrl, sbAnon, { global: { headers: { Authorization: authHeader! } } });
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    // If no user found, it might be a Service Role call (which bypasses RLS), or an Anon call.
    // To distinguish, we check if the JWT has role 'service_role'.
    // NOTE: This check is simplified. In high security, verify JWT signature.
    const isServiceRole = authHeader?.includes(Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'INVALID_KEY');
    
    // Check if user is Admin
    let isAdmin = false;
    if (user) {
        const { data: profile } = await supabaseClient.from('users').select('role').eq('id', user.id).single();
        isAdmin = profile?.role === 'admin';
    }

    if (!isServiceRole && !isAdmin) {
       // Only Admins or Internal System can send emails
       throw new Error("Unauthorized: Email service restricted.");
    }

    const { to, subject, htmlBody, providerConfig, testMode }: EmailRequest = await req.json();

    // --- Configuration Logic ---
    const useCustomMode = providerConfig?.mode === 'custom';
    const envProvider = Deno.env.get('EMAIL_PROVIDER');
    const effectiveProvider = useCustomMode ? (providerConfig?.provider || 'smtp') : (envProvider || 'smtp');
    const useResend = effectiveProvider === 'resend';

    // 3. Resolve Credentials
    let resendKey, smtpHost, smtpUser, smtpPass, smtpPort, fromEmail;

    if (useCustomMode) {
        // Custom Mode (DB Settings)
        resendKey = providerConfig?.apiKey;
        smtpHost = providerConfig?.host;
        smtpUser = providerConfig?.user;
        smtpPass = providerConfig?.pass;
        smtpPort = providerConfig?.port || 465;
        fromEmail = providerConfig?.from || 'noreply@jamboapparels.com';
    } else {
        // Env Mode (Secrets)
        resendKey = Deno.env.get('RESEND_API_KEY');
        smtpHost = Deno.env.get('SMTP_HOST');
        smtpUser = Deno.env.get('SMTP_USER');
        smtpPass = Deno.env.get('SMTP_PASS');
        smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '465');
        fromEmail = Deno.env.get('SMTP_FROM') || 'noreply@jamboapparels.com';
    }

    let info;

    // 4. Prepare HTML Wrapper
    let finalHtml = htmlBody;
    if (!htmlBody.trim().toLowerCase().startsWith('<!doctype') && !htmlBody.trim().toLowerCase().startsWith('<html')) {
       finalHtml = `
        <!DOCTYPE html>
        <html>
        <body style="font-family: sans-serif; padding: 20px;">
          ${htmlBody}
        </body>
        </html>
       `;
    }

    // 5. Send
    if (useResend) {
      if (!resendKey) throw new Error(`Resend API Key missing.`);

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
      // SMTP
      if (!smtpHost) throw new Error(`SMTP Host missing.`);

      const auth = (smtpUser && smtpPass) ? { user: smtpUser, pass: smtpPass } : undefined;
      const transporter = createTransport({
        host: smtpHost,
        port: smtpPort, 
        secure: smtpPort === 465,
        auth: auth,
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
    console.error('Email Error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400, 
    });
  }
});
