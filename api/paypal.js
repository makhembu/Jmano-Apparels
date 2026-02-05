
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
    // CRITICAL: We MUST use a Service Role key to read the paypal_secret_key from app_settings.
    // The anon key will fail due to RLS policies.
    const sbUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

    if (!sbUrl || !sbKey) {
      console.error("[PayPal API] CRITICAL ERROR: SUPABASE_SERVICE_ROLE_KEY is missing from environment.");
      return res.status(500).json({ 
        error: "Server configuration missing.",
        details: "The Service Role Key is required to retrieve payment secrets. Please check your Vercel/Hosting Environment Variables."
      });
    }

    const supabase = createClient(sbUrl, sbKey);

    // 2. Fetch Payment Settings from Database (Row 1)
    const { data: settings, error: settingsError } = await supabase
        .from('app_settings')
        .select('paypal_client_id, paypal_secret_key, paypal_mode')
        .eq('id', 1)
        .single();

    if (settingsError || !settings) {
        console.error("[PayPal API] Database Error:", settingsError);
        throw new Error("Could not retrieve payment credentials from settings registry.");
    }

    // Trim whitespace to prevent URL encoding issues
    const clientId = (settings.paypal_client_id || '').trim();
    const secretKey = (settings.paypal_secret_key || '').trim();
    const mode = settings.paypal_mode || 'sandbox';

    if (!clientId || !secretKey) {
        throw new Error("PayPal Client ID or Secret Key is empty in the database. Please update App Settings.");
    }

    // 3. Authenticate with PayPal
    // We use basic auth encoding for the token request
    const auth = Buffer.from(`${clientId}:${secretKey}`).toString('base64');
    const baseUrl = mode === 'live' 
        ? 'https://api-m.paypal.com' 
        : 'https://api-m.sandbox.paypal.com';

    console.log(`[PayPal API] Requesting token for ${mode} mode...`);

    const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      // Using URLSearchParams ensures standard body encoding
      body: new URLSearchParams({ grant_type: 'client_credentials' }).toString()
    });

    if (!tokenRes.ok) {
        const errorText = await tokenRes.text();
        console.error("[PayPal API] PayPal Auth Rejected:", errorText);
        throw new Error(`PayPal credentials rejected. Ensure your Client ID and Secret match your selected mode (${mode}).`);
    }
    
    const tokenData = await tokenRes.json();

    // 4. Capture the Order
    console.log(`[PayPal API] Capturing PayPal order ${paypalOrderId}...`);
    
    const captureRes = await fetch(`${baseUrl}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    });

    const captureData = await captureRes.json();

    if (!captureRes.ok) {
        // Handle idempotency: if already captured, we can proceed to update DB
        const issue = captureData.details?.[0]?.issue;
        if (issue !== 'ORDER_ALREADY_CAPTURED') {
            console.error("[PayPal API] Capture Failure:", JSON.stringify(captureData));
            throw new Error(captureData.message || "Failed to capture payment at PayPal.");
        }
        console.log("[PayPal API] Order already captured at PayPal. Proceeding to sync.");
    }

    const captureId = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id || paypalOrderId;

    // 5. Update Database Order Status
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        payment_status: 'paid', 
        status: 'Processing',
        payment_intent_id: captureId, 
      })
      .eq('id', orderId);

    if (updateError) {
        console.error("[PayPal API] Registry Sync Error:", updateError);
        throw new Error("Payment was successful but we couldn't update your order in our database. Please contact support with ID: " + captureId);
    }

    return res.status(200).json({ success: true, transactionId: captureId });

  } catch (error) {
    console.error("[PayPal API] Execution Exception:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}
