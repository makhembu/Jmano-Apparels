
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit } from './_lib/rate-limit.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).send('ok');
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate Limit for safety
  const rateLimitResult = await checkRateLimit(req, 20, "60 s");
  if (!rateLimitResult.success) {
      return res.status(429).json({ error: 'Rate limit exceeded.' });
  }

  const { to, text, type } = req.body;
  if (!to || !text) {
      return res.status(400).json({ error: 'Recipient and text are required.' });
  }

  try {
    const sbUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

    if (!sbUrl || !sbKey) throw new Error("Server configuration error.");

    const supabaseAdmin = createClient(sbUrl, sbKey);

    // Fetch credentials securely
    const { data: settings, error: dbError } = await supabaseAdmin
        .from('app_settings')
        .select('whatsapp_access_token, whatsapp_phone_number_id, enable_whatsapp_notifications')
        .eq('id', 1)
        .single();

    if (dbError || !settings?.whatsapp_access_token || !settings?.whatsapp_phone_number_id) {
        throw new Error("WhatsApp not configured in admin settings.");
    }

    if (!settings.enable_whatsapp_notifications) {
        return res.status(200).json({ status: 'skipped', message: 'WhatsApp disabled in settings.' });
    }

    // Format phone number: Remove +, spaces, dashes. Ensure country code if possible.
    // Assuming 'to' comes in a usable international format (e.g., 447938...)
    const cleanPhone = to.replace(/[^0-9]/g, '');

    // Send Message via Graph API
    // Note: For initiating conversations, businesses must use templates.
    // For this prototype, we attempt 'text' messages (works if user messaged business recently)
    // or assume the user has configured 'standard' templates if 'type' is template.
    // Here we default to simple text for the "working prototype" request.
    
    const version = 'v17.0';
    const url = `https://graph.facebook.com/${version}/${settings.whatsapp_phone_number_id}/messages`;

    const payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanPhone,
        type: "text",
        text: { preview_url: false, body: text }
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${settings.whatsapp_access_token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
        console.error("WhatsApp API Error:", result);
        throw new Error(result.error?.message || "Failed to send WhatsApp message.");
    }

    return res.status(200).json({ success: true, id: result.messages?.[0]?.id });

  } catch (error) {
    console.error("WhatsApp Send Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
