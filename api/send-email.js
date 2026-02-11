
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit } from './_lib/rate-limit.js';
import { verifyAuth } from './_lib/auth.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).send('ok');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate Limit: 10 requests per day (Strict for public forms)
  const rateLimitResult = await checkRateLimit(req, 10, "86400 s"); // 24 hours
  if (!rateLimitResult.success) {
      return res.status(429).json({ error: 'Daily email limit reached.' });
  }

  try {
    const { to, subject, htmlBody, providerConfig, testMode } = req.body;

    // SECURITY: Check if user is trying to inject custom provider keys
    if (providerConfig && Object.keys(providerConfig).length > 0) {
        try {
            // Only admins can test/use custom keys
            await verifyAuth(req, true);
        } catch (e) {
            return res.status(403).json({ error: "Forbidden: Custom provider configuration requires admin privileges." });
        }
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                        process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
       return res.status(500).json({ error: "Server configuration missing (Supabase Credentials)" });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    let resendApiKey = providerConfig?.apiKey;
    let resendFrom = providerConfig?.from;

    // If no custom config provided (standard flow), fetch from DB
    if (!resendApiKey) {
        const { data: dbSettings, error: dbError } = await supabaseAdmin
            .from('app_settings')
            .select('resend_api_key, resend_from_email')
            .eq('id', 1)
            .single();

        if (dbError || !dbSettings || !dbSettings.resend_api_key) {
            return res.status(400).json({ error: 'Resend API Key not configured in Admin Settings.' });
        }

        resendApiKey = dbSettings.resend_api_key;
        resendFrom = dbSettings.resend_from_email || 'onboarding@resend.dev';
    }

    if (!resendApiKey) {
        return res.status(400).json({ error: "Resend API Key is missing." });
    }
    
    if (!resendFrom) resendFrom = 'onboarding@resend.dev';

    const resend = new Resend(resendApiKey);

    const { data, error } = await resend.emails.send({
      from: resendFrom,
      to: Array.isArray(to) ? to : [to],
      subject: subject,
      html: htmlBody,
    });

    if (error) {
        console.error('[send-email] Resend API Error:', error);
        return res.status(400).json({ success: false, error: error.message || 'Failed to send email' });
    }

    return res.status(200).json({ success: true, id: data.id });

  } catch (error) {
    console.error('[send-email] Exception:', error.message);
    return res.status(500).json({ 
        success: false, 
        error: error.message || 'Internal Server Error',
    });
  }
}
