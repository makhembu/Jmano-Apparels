
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Fix: Explicitly return 200 OK for OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const { orderId, paypalOrderId } = await req.json();
    if (!orderId || !paypalOrderId) throw new Error("Missing parameters");

    const sbUrl = Deno.env.get('SUPABASE_URL');
    const sbKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!sbUrl || !sbKey) throw new Error("Database connection missing.");
    const supabaseClient = createClient(sbUrl, sbKey);

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
    if (!tokenRes.ok) throw new Error("Failed to authenticate with PayPal.");

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
        if (captureData.details?.[0]?.issue === 'ORDER_ALREADY_CAPTURED') {
            console.log("Order already captured.");
        } else {
            throw new Error(`Payment capture failed: ${captureData.message || captureData.name}`);
        }
    }

    const status = captureData.status;
    const captureId = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id || paypalOrderId;

    if (status !== 'COMPLETED' && status !== 'APPROVED') {
       throw new Error(`Payment status is ${status} (expected COMPLETED/APPROVED)`);
    }

    const { error: updateError } = await supabaseClient
      .from('orders')
      .update({ 
        payment_status: 'paid', 
        status: 'Processing',
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
