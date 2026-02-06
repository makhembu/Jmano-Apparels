import { createClient } from '@supabase/supabase-js';

const fetchWithTimeout = (url, options, timeout = 10000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]);
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { type = 'capture', orderId, paypalOrderId } = req.body;

  try {
    const sbUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    // FIX: Use the correct server-side environment variable for Vercel.
    const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!sbUrl || !sbKey) {
        console.error("CRITICAL: Supabase server credentials are not configured in Vercel environment.");
        throw new Error("Server configuration error.");
    }

    const supabase = createClient(sbUrl, sbKey);

    // Get Credentials from DB (must use service key)
    const { data: settings, error: settingsError } = await supabase.from('app_settings').select('*').eq('id', 1).single();
    if (settingsError || !settings?.paypal_client_id || !settings?.paypal_secret_key) {
      console.error("DB Error fetching PayPal keys:", settingsError?.message);
      throw new Error("PayPal configuration is missing or incomplete in the database.");
    }

    const baseUrl = settings.paypal_mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
    const auth = Buffer.from(`${settings.paypal_client_id}:${settings.paypal_secret_key}`).toString('base64');

    // 1. Get Access Token
    const tokenRes = await fetchWithTimeout(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials'
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) throw new Error(tokenData.error_description || 'Failed to get PayPal token');
    const { access_token } = tokenData;

    // 2. Handle Actions (Capture or Refund)
    if (type === 'refund') {
        // REFUND LOGIC
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
    
    // DEFAULT: CAPTURE LOGIC
    const captureRes = await fetchWithTimeout(`${baseUrl}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    const captureData = await captureRes.json();

    if (!captureRes.ok) {
        const issue = captureData.details?.[0]?.issue;
        console.warn(`[PayPal Capture Failed] Order: ${orderId}, Issue: ${issue || 'Unknown'}`);
        // Return a structured error for the frontend to handle gracefully
        return res.status(400).json({
            success: false,
            message: captureData.message || 'Payment capture failed.',
            issue: issue // e.g., 'INSTRUMENT_DECLINED'
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