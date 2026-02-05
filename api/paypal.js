
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
    const sbUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
                  process.env.SUPABASE_ANON_KEY; // Fallback only

    if (!sbUrl || !sbKey) {
      console.error("[PayPal API] Missing Supabase Credentials");
      return res.status(500).json({ error: "Server configuration missing (Supabase)." });
    }

    const supabase = createClient(sbUrl, sbKey);

    // 2. Fetch Payment Settings from Database (Row 1)
    const { data: settings, error: settingsError } = await supabase
        .from('app_settings')
        .select('paypal_client_id, paypal_secret_key, paypal_mode')
        .eq('id', 1)
        .single();

    if (settingsError || !settings) {
        console.error("[PayPal API] DB Error:", settingsError);
        throw new Error("Failed to fetch payment settings from database registry.");
    }

    // CRITICAL: Trim whitespace which often causes 'invalid_client' errors during manual entry
    const clientId = (settings.paypal_client_id || '').trim();
    const secretKey = (settings.paypal_secret_key || '').trim();
    const mode = settings.paypal_mode || 'sandbox';

    if (!clientId || !secretKey) {
        throw new Error("PayPal Client ID or Secret Key is missing in database app_settings.");
    }

    // 3. Authenticate with PayPal
    const auth = Buffer.from(`${clientId}:${secretKey}`).toString('base64');
    const baseUrl = mode === 'live' 
        ? 'https://api-m.paypal.com' 
        : 'https://api-m.sandbox.paypal.com';

    console.log(`[PayPal API] Attempting token exchange with ${mode} environment...`);

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
        console.error("[PayPal API] Auth Failure:", errorText);
        throw new Error(`PayPal Auth Failed: ${errorText}`);
    }
    
    const tokenData = await tokenRes.json();

    // 4. Capture the Order
    console.log(`[PayPal API] Capturing PayPal order ${paypalOrderId} for DB order ${orderId}...`);
    
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
        throw new Error(`PayPal Capture returned unparseable response. Status: ${captureRes.status}`);
    }

    // Handle "Order Already Captured" gracefully (idempotency)
    if (!captureRes.ok) {
        const issue = captureData.details?.[0]?.issue;
        if (issue !== 'ORDER_ALREADY_CAPTURED') {
            console.error("[PayPal API] Capture Error:", JSON.stringify(captureData));
            throw new Error(captureData.message || "Payment capture failed at PayPal.");
        }
        console.log("[PayPal API] Order already captured, proceeding to DB sync.");
    }

    const captureId = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id || paypalOrderId;

    // 5. Update Database Order
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        payment_status: 'paid', 
        status: 'Processing',
        payment_intent_id: captureId, 
      })
      .eq('id', orderId);

    if (updateError) {
        console.error("[PayPal API] DB Update Error:", updateError);
        throw new Error("Payment captured but failed to update order registry.");
    }

    console.log(`[PayPal API] Success. Order ${orderId} updated.`);
    return res.status(200).json({ success: true, transactionId: captureId });

  } catch (error) {
    console.error("[PayPal API] Exception:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}
