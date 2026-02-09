
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
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const event = req.body;
  const eventId = event.id;

  if (!eventId) {
     return res.status(400).json({ error: "Missing event ID" });
  }

  console.log(`[PayPal Webhook] Received Event: ${event.event_type} (${eventId})`);

  try {
    // 1. Fetch PayPal Credentials securely from DB to verify the event
    const { data: settings, error: dbError } = await supabase.from('app_settings').select('*').eq('id', 1).single();
    
    if (dbError || !settings?.paypal_client_id || !settings?.paypal_secret_key) {
      throw new Error("PayPal configuration missing in database.");
    }

    const isLive = settings.paypal_mode === 'live';
    const baseUrl = isLive ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
    const auth = Buffer.from(`${settings.paypal_client_id}:${settings.paypal_secret_key}`).toString('base64');

    // 2. Get Access Token
    const tokenRes = await fetchWithTimeout(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials'
    });
    
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) throw new Error(`PayPal Auth Failed: ${tokenData.error_description || 'Unknown error'}`);
    const accessToken = tokenData.access_token;

    // 3. VERIFY EVENT WITH PAYPAL
    // This is the critical security step. We ask PayPal "Is this event real?"
    // This prevents spoofed webhooks.
    const verifyRes = await fetchWithTimeout(`${baseUrl}/v1/notifications/webhooks-events/${eventId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
    });

    if (!verifyRes.ok) {
        console.warn(`[PayPal Webhook] Verification Failed for ${eventId}. Likely spoofed.`);
        return res.status(400).json({ error: "Event verification failed" });
    }

    const verifiedEvent = await verifyRes.json();
    
    // Use the verified event data for logic, ignoring the payload body if needed, 
    // though usually they match if verification passes.
    const resource = verifiedEvent.resource;
    const eventType = verifiedEvent.event_type;

    // 4. Resolve internal order
    const paypalCaptureId = resource?.id;
    const internalOrderId = resource?.custom_id;

    let orderQuery = supabase.from('orders').select('id, status, payment_status');
    if (internalOrderId) {
      orderQuery = orderQuery.eq('id', internalOrderId);
    } else if (paypalCaptureId) {
      orderQuery = orderQuery.eq('payment_intent_id', paypalCaptureId);
    } else {
      return res.status(200).json({ status: 'ignored', message: 'No order identifier found' });
    }

    const { data: order } = await orderQuery.single();
    if (!order) {
        return res.status(200).json({ status: 'ignored', message: 'No matching order found' });
    }

    // 5. Handle Events
    const updates = {};
    switch (eventType) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        updates.payment_status = 'paid';
        if (order.status === 'Pending Payment') updates.status = 'Processing';
        break;
      
      case 'PAYMENT.CAPTURE.REFUNDED':
        updates.payment_status = 'refunded';
        updates.status = 'Refunded';
        break;
      
      case 'PAYMENT.CAPTURE.DENIED':
        updates.payment_status = 'failed';
        updates.status = 'Cancelled';
        break;
      
      case 'CHECKOUT.ORDER.APPROVED':
        // Optional: Could pre-fill data or notify admin
        break;

      default:
        return res.status(200).json({ status: 'ignored', message: 'Unhandled event type' });
    }

    if (Object.keys(updates).length > 0) {
      await supabase.from('orders').update(updates).eq('id', order.id);
      console.log(`[PayPal Webhook] Updated order ${order.id} based on verified event.`);
    }

    return res.status(200).json({ status: 'success' });

  } catch (error) {
    console.error("[PayPal Webhook] Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
