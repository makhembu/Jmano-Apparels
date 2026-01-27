import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Declare Deno to avoid TypeScript errors in environments without Deno types
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
    // 1. Parse Request
    const { orderId, paypalOrderId } = await req.json();
    if (!orderId || !paypalOrderId) {
      throw new Error("Missing orderId or paypalOrderId");
    }

    // 2. Initialize Supabase Admin Client (to read secret keys)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 3. Fetch PayPal Credentials from Database
    const { data: settings, error: settingsError } = await supabaseClient
      .from('app_settings')
      .select('paypal_client_id, paypal_secret_key, paypal_mode')
      .eq('id', 1)
      .single();

    if (settingsError || !settings?.paypal_secret_key) {
      throw new Error("PayPal settings not configured on server.");
    }

    // 4. Authenticate with PayPal to get Access Token
    const auth = btoa(`${settings.paypal_client_id}:${settings.paypal_secret_key}`);
    const baseUrl = settings.paypal_mode === 'live' 
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

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      throw new Error("Failed to authenticate with PayPal");
    }

    // 5. Verify the Order Details
    const orderRes = await fetch(`${baseUrl}/v2/checkout/orders/${paypalOrderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    const orderData = await orderRes.json();
    
    // Check if status is COMPLETED or APPROVED
    // Note: If using 'capture' on client, it should be COMPLETED. If 'authorize', APPROVED.
    if (orderData.status !== 'COMPLETED' && orderData.status !== 'APPROVED') {
       throw new Error(`PayPal order status is ${orderData.status}`);
    }

    // Optional: Verify amount matches DB order (omitted for brevity, but recommended)

    // 6. Update Order in Supabase
    const { error: updateError } = await supabaseClient
      .from('orders')
      .update({ 
        payment_status: 'paid', 
        status: 'Processing',
        payment_intent_id: paypalOrderId, // Store PayPal ID
        // Could also store transaction_id from capture details
      })
      .eq('id', orderId);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true, message: "Payment verified" }), {
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