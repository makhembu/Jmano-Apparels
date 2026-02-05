
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).send('ok');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, subject, htmlBody, providerConfig, testMode } = req.body;

    // 1. Initialize Supabase Admin Client to fetch settings if needed
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                        process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 
                        process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
       return res.status(500).json({ error: "Server configuration missing (Supabase Credentials)" });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    // 2. Resolve API Key & From Address
    let resendApiKey = providerConfig?.apiKey;
    let resendFrom = providerConfig?.from;

    // If not provided in payload (standard flow), fetch from Database
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

    // 3. Initialize Resend SDK
    const resend = new Resend(resendApiKey);

    // 4. Send Email
    // "for email infrastracture use html resend not edge function"
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
