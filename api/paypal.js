
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit } from './_lib/rate-limit.js';
import { verifyAuth } from './_lib/auth.js';

// Helper to retry fetches
async function retryFetch(url, options, retries = 3, delay = 1000) {
  try {
    const res = await fetch(url, options);
    // If 5xx error, throw to retry
    if (res.status >= 500) throw new Error(`Server error: ${res.status}`);
    return res;
  } catch (err) {
    if (retries <= 0) throw err;
    await new Promise(r => setTimeout(r, delay));
    return retryFetch(url, options, retries - 1, delay * 1.5);
  }
}

const fetchWithTimeout = (url, options, timeout = 10000) => {
  return Promise.race([
    retryFetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]);
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Rate Limit: 5 requests per minute
  const rateLimitResult = await checkRateLimit(req, 5, "60 s");
  if (!rateLimitResult.success) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  const { type = 'capture', orderId, paypalOrderId } = req.body;

  try {
    const sbUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!sbUrl || !sbKey) {
        console.error("CRITICAL: Supabase server credentials are not configured in Vercel environment.");
        throw new Error("Server configuration error.");
    }

    const supabase = createClient(sbUrl, sbKey);

    // SECURITY: Only Admins can trigger refunds via API
    if (type === 'refund') {
        try {
            await verifyAuth(req, true);
        } catch (e) {
            return res.status(403).json({ error: "Forbidden: Only admins can issue refunds." });
        }
    }

    const { data: settings, error: settingsError } = await supabase.from('app_settings').select('*').eq('id', 1).single();
    if (settingsError || !settings?.paypal_client_id || !settings?.paypal_secret_key) {
      console.error("DB Error fetching PayPal keys:", settingsError?.message);
      throw new Error("PayPal configuration is missing or incomplete in the database.");
    }

    const baseUrl = settings.paypal_mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
    const auth = Buffer.from(`${settings.paypal_client_id}:${settings.paypal_secret_key}`).toString('base64');

    const tokenRes = await fetchWithTimeout(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials'
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) throw new Error(tokenData.error_description || 'Failed to get PayPal token');
    const { access_token } = tokenData;

    if (type === 'refund') {
        const { data: order } = await supabase.from('orders').select('payment_intent_id, total').eq('id', orderId).single();
        if (!order || !order.payment_intent_id) throw new Error("Capture ID not found for this order.");
        
        const refundRes = await fetchWithTimeout(`${baseUrl}/v2/payments/captures/${order.payment_intent_id}/refund`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${access_token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: { value: order.total.toFixed(2), currency_code: settings.currency || 'GBP' },
                note_to_payer: "Refund from Jambo Apparels"
            })
        });

        const refundData = await refundRes.json();
        if (!refundRes.ok) throw new Error(refundData.message || "Refund failed via PayPal API");

        await supabase.from('orders').update({
            status: 'Refunded',
            payment_status: 'refunded',
            notes: `Full refund issued. PayPal Refund ID: ${refundData.id}`
        }).eq('id', orderId);

        return res.status(200).json({ success: true, refundId: refundData.id });
    }
    
    // CAPTURE (Publicly accessible for guest checkout flow)
    const captureRes = await fetchWithTimeout(`${baseUrl}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    const captureData = await captureRes.json();

    if (!captureRes.ok) {
        const issue = captureData.details?.[0]?.issue;
        console.warn(`[PayPal Capture Failed] Order: ${orderId}, Issue: ${issue || 'Unknown'}`);
        return res.status(400).json({
            success: false,
            message: captureData.message || 'Payment capture failed.',
            issue: issue
        });
    }

    const capture = captureData.purchase_units?.[0]?.payments?.captures?.[0];
    await supabase.from('orders').update({
      payment_status: 'paid',
      status: 'Processing',
      payment_intent_id: capture?.id
    }).eq('id', orderId);

    return res.status(200).json({ success: true, captureId: capture?.id });

  } catch (error) {
    console.error("[PayPal API] Fatal Exception:", error.message);
    return res.status(500).json({ success: false, message: error.message || 'An internal server error occurred.' });
  }
}
