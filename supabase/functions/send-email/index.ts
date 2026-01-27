
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createTransport } from "https://esm.sh/nodemailer@6.9.1";

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
    const { to, subject, htmlBody, providerConfig, testMode }: EmailRequest = await req.json();

    // --- Configuration Logic ---
    // 1. Determine Source: If mode is 'custom', we use the DB payload. Otherwise, we default to Env vars.
    const useCustomMode = providerConfig?.mode === 'custom';
    
    // 2. Resolve Provider
    const envProvider = Deno.env.get('EMAIL_PROVIDER'); // 'resend' or 'smtp'
    // If custom, use DB provider. If env, use Env provider. Default to 'smtp' if undefined.
    const effectiveProvider = useCustomMode ? (providerConfig?.provider || 'smtp') : (envProvider || 'smtp');
    const useResend = effectiveProvider === 'resend';

    // 3. Resolve Credentials
    let resendKey, smtpHost, smtpUser, smtpPass, smtpPort, fromEmail;

    if (useCustomMode) {
        // --- CUSTOM MODE: Use DB Settings ---
        resendKey = providerConfig?.apiKey;
        smtpHost = providerConfig?.host;
        smtpUser = providerConfig?.user;
        smtpPass = providerConfig?.pass;
        smtpPort = providerConfig?.port || 465;
        fromEmail = providerConfig?.from || 'noreply@jamboapparels.com';
    } else {
        // --- ENV MODE: Use Secrets ---
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
      if (!resendKey) {
         throw new Error(`Resend API Key missing in ${useCustomMode ? 'App Settings' : 'Environment Variables'}.`);
      }

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
      if (!res.ok) {
          throw new Error(`Resend Error: ${JSON.stringify(data)}`);
      }
      info = { id: data.id, provider: 'resend' };

    } else {
      // SMTP
      if (!smtpHost) {
         throw new Error(`SMTP Host missing in ${useCustomMode ? 'App Settings' : 'Environment Variables'}.`);
      }

      // Construct auth object only if user/pass exist
      const auth = (smtpUser && smtpPass) ? { user: smtpUser, pass: smtpPass } : undefined;

      const transporter = createTransport({
        host: smtpHost,
        port: smtpPort, 
        secure: smtpPort === 465, // True for 465, false for 587 usually
        auth: auth,
      });

      // Verify connection if in test mode
      if (testMode) {
          await transporter.verify();
      }

      info = await transporter.sendMail({
        from: `Jambo Apparels <${fromEmail}>`,
        to,
        subject,
        html: finalHtml,
      });
    }

    return new Response(JSON.stringify({ success: true, info, mode: useCustomMode ? 'custom' : 'env' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Email Error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, 
    });
  }
});
