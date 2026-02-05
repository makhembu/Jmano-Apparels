
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
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
    const sbUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

    if (!sbUrl || !sbKey) {
      console.error("[PayPal API] SUPABASE_SERVICE_ROLE_KEY is missing.");
      return res.status(500).json({ 
        success: false,
        message: "Server configuration missing (Service Key)."
      });
    }

    const supabase = createClient(sbUrl, sbKey);

    // 1. Fetch Payment Secrets
    const { data: settings, error: settingsError } = await supabase
        .from('app_settings')
        .select('paypal_client_id, paypal_secret_key, paypal_mode, currency')
        .eq('id', 1)
        .single();

    if (settingsError || !settings) {
        throw new Error("Failed to retrieve payment secrets from DB.");
    }

    const clientId = (settings.paypal_client_id || '').trim();
    const secretKey = (settings.paypal_secret_key || '').trim();
    const mode = settings.paypal_mode || 'sandbox';
    const baseUrl = mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

    // 2. Get Access Token
    const auth = Buffer.from(`${clientId}:${secretKey}`).toString('base64');
    const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    if (!tokenRes.ok) {
        const errData = await tokenRes.json();
        console.error("[PayPal API] Auth Failed:", errData);
        throw new Error("PayPal authentication failed. Check Client ID and Secret in Admin Settings.");
    }
    
    const { access_token } = await tokenRes.json();

    // 3. Capture Payment
    const captureRes = await fetch(`${baseUrl}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({}) // Empty body to satisfy some parsers
    });

    const captureData = await captureRes.json();
    let isAlreadyCaptured = false;

    if (!captureRes.ok) {
        const issue = captureData.details?.[0]?.issue;
        
        // Handle race condition where PayPal captures but response fails/timeouts
        if (issue === 'ORDER_ALREADY_CAPTURED') {
            console.log("[PayPal API] Order already captured, syncing DB.");
            isAlreadyCaptured = true;
        } else {
            console.error("[PayPal API] Capture Error Detail:", JSON.stringify(captureData, null, 2));
            return res.status(422).json({ 
                success: false, 
                issue: issue,
                message: captureData.message || issue || "The requested action could not be performed by PayPal." 
            });
        }
    }

    // 4. Update DB
    // If already captured, we won't have the full representation, use the order ID as fallback
    const transactionId = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id || paypalOrderId;
    
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        payment_status: 'paid', 
        status: 'Processing',
        payment_intent_id: transactionId, 
      })
      .eq('id', orderId);

    if (updateError) {
        console.error("[PayPal API] DB Update Error:", updateError);
        throw new Error("Payment succeeded but Jambo database update failed. Transaction ID: " + transactionId);
    }

    return res.status(200).json({ 
        success: true, 
        transactionId, 
        alreadyCaptured: isAlreadyCaptured 
    });

  } catch (error) {
    console.error("[PayPal API] Server Exception:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}
