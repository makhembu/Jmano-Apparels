
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { orderId, paypalOrderId } = await req.json();
    if (!orderId || !paypalOrderId) throw new Error("Missing params");

    // 1. Initial Environment Check
    const sbUrl = Deno.env.get('SUPABASE_URL');
    const sbKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!sbUrl || !sbKey) throw new Error("Database connection missing.");

    const supabaseClient = createClient(sbUrl, sbKey);

    // 2. Fetch Payment Credentials from DB
    const { data: settings, error: settingsError } = await supabaseClient
        .from('app_settings')
        .select('paypal_client_id, paypal_secret_key, paypal_mode')
        .single();

    if (settingsError || !settings) throw new Error("Failed to fetch payment settings.");

    const clientId = settings.paypal_client_id;
    const secretKey = settings.paypal_secret_key;
    const mode = settings.paypal_mode || 'sandbox';

    if (!clientId || !secretKey) {
        throw new Error("Payment provider credentials missing in database.");
    }

    // 3. Authenticate with PayPal (Get Access Token)
    const auth = btoa(`${clientId}:${secretKey}`);
    const baseUrl = mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

    const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
        console.error("PayPal Auth Failed:", tokenData);
        throw new Error("Failed to authenticate with payment provider.");
    }

    // 4. CAPTURE the Order (Server-Side)
    // This finalizes the transaction and moves funds.
    const captureRes = await fetch(`${baseUrl}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation' // Get full response
      }
    });

    const captureData = await captureRes.json();
    
    // Handle cases where order was already captured (idempotency) or failed
    if (!captureRes.ok) {
        // If it says "ORDER_ALREADY_CAPTURED", we can proceed as success
        if (captureData.details?.[0]?.issue === 'ORDER_ALREADY_CAPTURED') {
            console.log("Order already captured, proceeding to update DB.");
        } else {
            console.error("PayPal Capture Failed:", captureData);
            throw new Error(`Payment capture failed: ${captureData.message || captureData.name}`);
        }
    }

    // 5. Extract Transaction Status and ID
    const status = captureData.status;
    // Transaction ID usually in purchase_units[0].payments.captures[0].id
    const captureId = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id || paypalOrderId;

    if (status !== 'COMPLETED') {
       throw new Error(`Payment status is ${status} (expected COMPLETED)`);
    }

    // 6. Update Order in Database
    const { error: updateError } = await supabaseClient
      .from('orders')
      .update({ 
        payment_status: 'paid', 
        status: 'Processing', // Move from 'Pending Payment' to 'Processing'
        payment_intent_id: captureId, 
      })
      .eq('id', orderId);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true, transactionId: captureId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Verify Function Error:", error);
    return new Response(JSON.stringify({ success: false, message: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
