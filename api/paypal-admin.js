
import { createClient } from '@supabase/supabase-js';
import { verifyAuth } from './_lib/auth.js';

const fetchWithTimeout = (url, options, timeout = 15000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]);
};

export default async function handler(req, res) {
  // CORS & Methods
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, webhookId, url: webhookUrl } = req.body;

  try {
    // SECURITY: Verify Request is from an Admin
    await verifyAuth(req, true);

    // 1. Setup Supabase Admin
    const sbUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!sbUrl || !sbKey) throw new Error("Server configuration error: Missing Supabase credentials.");

    const supabase = createClient(sbUrl, sbKey);

    // 2. Fetch PayPal Credentials securely from DB
    const { data: settings, error: dbError } = await supabase.from('app_settings').select('*').eq('id', 1).single();
    
    if (dbError || !settings?.paypal_client_id || !settings?.paypal_secret_key) {
      throw new Error("PayPal configuration missing in database.");
    }

    const isLive = settings.paypal_mode === 'live';
    const baseUrl = isLive ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
    const auth = Buffer.from(`${settings.paypal_client_id}:${settings.paypal_secret_key}`).toString('base64');

    // 3. Get PayPal Access Token
    const tokenRes = await fetchWithTimeout(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials'
    });
    
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) throw new Error(`PayPal Auth Failed: ${tokenData.error_description || 'Unknown error'}`);
    
    const accessToken = tokenData.access_token;
    const commonHeaders = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
    };

    // 4. Handle Actions
    let result;

    if (action === 'list') {
        const listRes = await fetch(`${baseUrl}/v1/notifications/webhooks`, { headers: commonHeaders });
        const listData = await listRes.json();
        result = listData.webhooks || [];
    } 
    else if (action === 'create') {
        if (!webhookUrl) throw new Error("Webhook URL is required");

        const payload = {
            url: webhookUrl,
            event_types: [
                { name: "PAYMENT.CAPTURE.COMPLETED" },
                { name: "PAYMENT.CAPTURE.DENIED" },
                { name: "PAYMENT.CAPTURE.REFUNDED" },
                { name: "CHECKOUT.ORDER.APPROVED" }
            ]
        };

        const createRes = await fetch(`${baseUrl}/v1/notifications/webhooks`, {
            method: 'POST',
            headers: commonHeaders,
            body: JSON.stringify(payload)
        });

        const createData = await createRes.json();
        if (!createRes.ok) {
            // Handle duplicate URL error gracefully
            if (createData.name === 'WEBHOOK_URL_ALREADY_EXISTS') {
                throw new Error("This URL is already registered as a webhook.");
            }
            throw new Error(createData.message || "Failed to create webhook");
        }

        // Save ID to DB
        await supabase.from('app_settings').update({ paypal_webhook_id: createData.id }).eq('id', 1);
        result = createData;
    }
    else if (action === 'delete') {
        if (!webhookId) throw new Error("Webhook ID required");
        
        const delRes = await fetch(`${baseUrl}/v1/notifications/webhooks/${webhookId}`, {
            method: 'DELETE',
            headers: commonHeaders
        });

        if (!delRes.ok && delRes.status !== 404) {
             const delData = await delRes.json();
             throw new Error(delData.message || "Failed to delete webhook");
        }

        // Clear from DB
        await supabase.from('app_settings').update({ paypal_webhook_id: null }).eq('id', 1);
        result = { success: true };
    }
    else if (action === 'simulate') {
        if (!webhookId) throw new Error("Webhook ID required");

        // Simulate a Payment Capture Completed event
        const mockPayload = {
            webhook_id: webhookId,
            event_type: "PAYMENT.CAPTURE.COMPLETED",
            resource_version: "2.0",
            resource: {
                id: "MOCK-CAPTURE-ID",
                status: "COMPLETED",
                amount: { value: "10.00", currency_code: "GBP" },
                custom_id: "TEST-ORDER-ID"
            }
        };

        const simRes = await fetch(`${baseUrl}/v1/notifications/simulate-event`, {
            method: 'POST',
            headers: commonHeaders,
            body: JSON.stringify(mockPayload)
        });
        
        const simData = await simRes.json();
        if (!simRes.ok) throw new Error(simData.message || "Simulation failed");
        
        result = simData;
    }
    else {
        throw new Error("Invalid action");
    }

    return res.status(200).json({ success: true, data: result });

  } catch (error) {
    console.error("[PayPal Admin API] Error:", error.message);
    const status = error.message.includes('Forbidden') ? 403 : 500;
    return res.status(status).json({ success: false, error: error.message });
  }
}
