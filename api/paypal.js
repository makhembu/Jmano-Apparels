
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).send('ok');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderId, paypalOrderId } = req.body;

  if (!orderId || !paypalOrderId) {
    return res.status(400).json({ error: 'Missing orderId or paypalOrderId' });
  }

  try {
    // 1. Initialize Supabase Admin Client
    // Prioritize Service Role Key for backend operations
    const sbUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

    if (!sbUrl || !sbKey) {
      console.error("Missing Supabase Credentials");
      return res.status(500).json({ error: "Server configuration missing." });
    }

    const supabase = createClient(sbUrl, sbKey);

    // 2. Fetch Payment Settings from Database
    const { data: settings, error: settingsError } = await supabase
        .from('app_settings')
        .select('paypal_client_id, paypal_secret_key, paypal_mode')
        .single();

    if (settingsError || !settings) {
        throw new Error("Failed to fetch payment settings from database.");
    }

    const { paypal_client_id, paypal_secret_key, paypal_mode } = settings;

    if (!paypal_client_id || !paypal_secret_key) {
        throw new Error("PayPal credentials are not configured in App Settings.");
    }

    // 3. Authenticate with PayPal
    const auth = Buffer.from(`${paypal_client_id}:${paypal_secret_key}`).toString('base64');
    const baseUrl = paypal_mode === 'live' 
        ? 'https://api-m.paypal.com' 
        : 'https://api-m.sandbox.paypal.com';

    const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    if (!tokenRes.ok) {
        const errorText = await tokenRes.text();
        throw new Error(`PayPal Auth Failed: ${errorText}`);
    }
    
    const tokenData = await tokenRes.json();

    // 4. Capture the Order
    const captureRes = await fetch(`${baseUrl}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    });

    let captureData;
    try {
        captureData = await captureRes.json();
    } catch {
        throw new Error(`PayPal Capture returned invalid JSON. Status: ${captureRes.status}`);
    }

    // Handle "Order Already Captured" gracefully
    if (!captureRes.ok) {
        const issue = captureData.details?.[0]?.issue;
        if (issue !== 'ORDER_ALREADY_CAPTURED') {
            console.error("PayPal Capture Error:", JSON.stringify(captureData));
            throw new Error(captureData.message || "Payment capture failed");
        }
    }

    const captureId = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id || paypalOrderId;
    const status = captureData.status;

    // 5. Update Database Order
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        payment_status: 'paid', 
        status: 'Processing',
        payment_intent_id: captureId, 
      })
      .eq('id', orderId);

    if (updateError) throw updateError;

    return res.status(200).json({ success: true, transactionId: captureId });

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
