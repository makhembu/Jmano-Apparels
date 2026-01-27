
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

    // 1. Initial Environment Check (Supabase connection must exist)
    const sbUrl = Deno.env.get('SUPABASE_URL');
    const sbKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!sbUrl || !sbKey) {
        throw new Error("Server configuration error: Database connection missing.");
    }

    const supabaseClient = createClient(sbUrl, sbKey);

    // 2. Fetch Payment Credentials (DB Priority -> Env Fallback)
    const { data: settings, error: settingsError } = await supabaseClient
        .from('app_settings')
        .select('paypal_client_id, paypal_secret_key, paypal_mode')
        .single();

    if (settingsError) throw new Error("Failed to fetch settings.");

    const clientId = settings?.paypal_client_id || Deno.env.get('PAYPAL_CLIENT_ID');
    const secretKey = settings?.paypal_secret_key || Deno.env.get('PAYPAL_SECRET_KEY');
    const mode = settings?.paypal_mode || Deno.env.get('PAYPAL_MODE') || 'sandbox';

    if (!clientId || !secretKey) {
        console.error("Payment credentials missing in both DB and ENV");
        throw new Error("Server configuration error: Payment provider credentials missing.");
    }

    // 3. Authenticate with PayPal
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
        console.error("PayPal Token Error:", tokenData);
        throw new Error("Failed to authenticate with payment provider");
    }

    // 4. Verify Order
    const orderRes = await fetch(`${baseUrl}/v2/checkout/orders/${paypalOrderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    const orderData = await orderRes.json();
    if (orderData.status !== 'COMPLETED' && orderData.status !== 'APPROVED') {
       throw new Error(`PayPal order status is ${orderData.status}`);
    }

    // 5. Update Order in DB
    const { error: updateError } = await supabaseClient
      .from('orders')
      .update({ 
        payment_status: 'paid', 
        status: 'Processing',
        payment_intent_id: paypalOrderId, 
      })
      .eq('id', orderId);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ success: false, message: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
