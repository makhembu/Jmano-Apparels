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
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, subject, htmlBody }: EmailRequest = await req.json();

    // 1. Validate Config
    const useResend = Deno.env.get('EMAIL_PROVIDER') === 'resend';
    const smtpHost = Deno.env.get('SMTP_HOST');
    const smtpUser = Deno.env.get('SMTP_USER');
    const smtpPass = Deno.env.get('SMTP_PASS');
    const fromEmail = Deno.env.get('SMTP_FROM') || 'noreply@jamboapparels.com';

    let info;

    // 2. Wrap content in a professional template
    const finalHtml = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; border-top: 4px solid #2E7D32;">
          <h1 style="color: #1B5E20; font-size: 24px; margin-bottom: 20px;">Jambo Apparels</h1>
          <div style="color: #333; line-height: 1.6;">
            ${htmlBody}
          </div>
          <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #888; font-size: 12px;">
            <p>&copy; ${new Date().getFullYear()} Jambo Apparels. Divinely Threaded.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // 3. Send via Selected Provider
    if (useResend) {
      const resendKey = Deno.env.get('RESEND_API_KEY');
      if (!resendKey) {
         console.warn("RESEND_API_KEY missing. Email not sent.");
         return new Response(JSON.stringify({ success: false, error: "Email configuration missing (Resend)" }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200, 
         });
      }

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendKey}`
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [to],
          subject: subject,
          html: finalHtml
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(data));
      info = { id: data.id, provider: 'resend' };

    } else {
      // Use Nodemailer for SMTP
      if (!smtpHost || !smtpUser || !smtpPass) {
         console.warn("SMTP credentials missing. Email not sent.");
         return new Response(JSON.stringify({ success: false, error: "Email configuration missing (SMTP)" }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200, 
         });
      }

      const transporter = createTransport({
        host: smtpHost,
        port: 465, // or 587 for TLS
        secure: true, // true for 465, false for other ports
        auth: { user: smtpUser, pass: smtpPass },
      });

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

  } catch (error) {
    console.error('Email Error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});