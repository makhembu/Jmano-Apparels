import { createClient } from '@supabase/supabase-js';

// Timeout wrapper for fetch requests
const fetchWithTimeout = (url, options, timeout = 10000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]);
};

// Validate UUID format
const isValidUUID = (str) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

// Sanitize error messages for logging (remove sensitive data)
const sanitizeForLog = (obj) => {
  if (!obj) return obj;
  const sanitized = JSON.parse(JSON.stringify(obj));
  
  // Remove sensitive fields
  const sensitiveFields = ['access_token', 'client_id', 'secret', 'authorization'];
  const removeRecursive = (o) => {
    Object.keys(o).forEach(key => {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        o[key] = '[REDACTED]';
      } else if (typeof o[key] === 'object' && o[key] !== null) {
        removeRecursive(o[key]);
      }
    });
  };
  removeRecursive(sanitized);
  return sanitized;
};

export default async function handler(req, res) {
  // CORS Headers
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Method validation
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderId, paypalOrderId } = req.body;

  // Input validation
  if (!orderId || !paypalOrderId) {
    return res.status(400).json({ error: 'Missing orderId or paypalOrderId' });
  }

  // Validate orderId format (assuming UUID)
  if (!isValidUUID(orderId)) {
    return res.status(400).json({ error: 'Invalid orderId format' });
  }

  // Validate paypalOrderId format (alphanumeric, typically ~17 chars)
  if (typeof paypalOrderId !== 'string' || !/^[A-Z0-9]{10,20}$/i.test(paypalOrderId)) {
    return res.status(400).json({ error: 'Invalid paypalOrderId format' });
  }

  let supabase;

  try {
    const sbUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

    if (!sbUrl || !sbKey) {
      console.error("[PayPal API] Supabase configuration missing");
      return res.status(500).json({
        success: false,
        message: "Server configuration error. Please contact support."
      });
    }

    supabase = createClient(sbUrl, sbKey);

    // ===== 1. VERIFY ORDER EXISTS AND MATCHES =====
    const { data: existingOrder, error: orderFetchError } = await supabase
      .from('orders')
      .select('id, paypal_order_id, payment_status, total_amount, currency')
      .eq('id', orderId)
      .single();

    if (orderFetchError || !existingOrder) {
      console.error("[PayPal API] Order not found:", orderId);
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Check if already paid (idempotency)
    if (existingOrder.payment_status === 'paid') {
      console.log("[PayPal API] Order already marked as paid:", orderId);
      return res.status(200).json({
        success: true,
        message: 'Payment already processed',
        alreadyPaid: true
      });
    }

    // Verify PayPal order ID matches
    if (existingOrder.paypal_order_id !== paypalOrderId) {
      console.error("[PayPal API] PayPal Order ID mismatch:", {
        expected: existingOrder.paypal_order_id,
        received: paypalOrderId
      });
      return res.status(400).json({
        success: false,
        message: "PayPal order ID does not match this order"
      });
    }

    // ===== 2. FETCH PAYMENT CREDENTIALS =====
    const { data: settings, error: settingsError } = await supabase
      .from('app_settings')
      .select('paypal_client_id, paypal_secret_key, paypal_mode, currency')
      .eq('id', 1)
      .single();

    if (settingsError || !settings) {
      console.error("[PayPal API] Failed to retrieve payment settings");
      throw new Error("Payment configuration unavailable");
    }

    const clientId = (settings.paypal_client_id || '').trim();
    const secretKey = (settings.paypal_secret_key || '').trim();
    const mode = settings.paypal_mode || 'sandbox';

    if (!clientId || !secretKey) {
      console.error("[PayPal API] PayPal credentials not configured");
      return res.status(500).json({
        success: false,
        message: "Payment system not configured. Please contact administrator."
      });
    }

    const baseUrl = mode === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';

    // ===== 3. GET ACCESS TOKEN =====
    const auth = Buffer.from(`${clientId}:${secretKey}`).toString('base64');

    const tokenRes = await fetchWithTimeout(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    if (!tokenRes.ok) {
      const errData = await tokenRes.json();
      console.error("[PayPal API] Authentication failed:", sanitizeForLog(errData));
      throw new Error("PayPal authentication failed. Please check payment configuration.");
    }

    const { access_token } = await tokenRes.json();

    // ===== 4. CAPTURE PAYMENT =====
    const captureRes = await fetchWithTimeout(
      `${baseUrl}/v2/checkout/orders/${paypalOrderId}/capture`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({})
      },
      15000 // Longer timeout for capture
    );

    const captureData = await captureRes.json();
    let isAlreadyCaptured = false;
    let transactionId = null;
    let capturedAmount = null;
    let capturedCurrency = null;

    if (!captureRes.ok) {
      const issue = captureData.details?.[0]?.issue;

      // Handle race condition where order already captured
      if (issue === 'ORDER_ALREADY_CAPTURED') {
        console.log("[PayPal API] Order already captured, retrieving details:", paypalOrderId);
        isAlreadyCaptured = true;

        // Fetch order details to get transaction ID
        try {
          const detailsRes = await fetchWithTimeout(
            `${baseUrl}/v2/checkout/orders/${paypalOrderId}`,
            {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (detailsRes.ok) {
            const detailsData = await detailsRes.json();
            transactionId = detailsData.purchase_units?.[0]?.payments?.captures?.[0]?.id;
            capturedAmount = detailsData.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value;
            capturedCurrency = detailsData.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.currency_code;
          }
        } catch (detailsError) {
          console.error("[PayPal API] Failed to fetch order details:", detailsError.message);
        }

        // Use paypalOrderId as fallback if we can't get transaction ID
        transactionId = transactionId || paypalOrderId;
      } else {
        console.error("[PayPal API] Capture failed:", sanitizeForLog(captureData));
        return res.status(422).json({
          success: false,
          issue: issue,
          message: captureData.message || issue || "Payment capture failed"
        });
      }
    } else {
      // Successful capture
      const capture = captureData.purchase_units?.[0]?.payments?.captures?.[0];
      transactionId = capture?.id;
      capturedAmount = capture?.amount?.value;
      capturedCurrency = capture?.amount?.currency_code;

      if (!transactionId) {
        console.error("[PayPal API] No transaction ID in capture response");
        throw new Error("Invalid PayPal capture response");
      }
    }

    // ===== 5. VALIDATE AMOUNT (if available) =====
    if (capturedAmount && existingOrder.total_amount) {
      const expectedAmount = parseFloat(existingOrder.total_amount);
      const actualAmount = parseFloat(capturedAmount);

      // Allow 0.01 difference for rounding
      if (Math.abs(expectedAmount - actualAmount) > 0.01) {
        console.error("[PayPal API] Amount mismatch:", {
          expected: expectedAmount,
          captured: actualAmount,
          orderId: orderId
        });

        // Log this as a critical issue but don't fail (money was captured)
        // Consider implementing a manual review workflow here
        console.error("[PayPal API] CRITICAL: Payment amount mismatch requires manual review");
      }
    }

    // ===== 6. UPDATE DATABASE =====
    const updateData = {
      payment_status: 'paid',
      status: 'Processing',
      payment_intent_id: transactionId,
      updated_at: new Date().toISOString()
    };

    // Store full PayPal response for audit trail (optional)
    if (captureData.id) {
      updateData.payment_metadata = {
        paypal_capture_id: transactionId,
        paypal_order_id: paypalOrderId,
        captured_at: new Date().toISOString(),
        amount: capturedAmount,
        currency: capturedCurrency,
        status: captureData.status
      };
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .eq('payment_status', existingOrder.payment_status); // Optimistic locking

    if (updateError) {
      console.error("[PayPal API] Database update failed:", updateError);

      // This is critical - money captured but DB not updated
      console.error("[PayPal API] CRITICAL: Payment captured but DB update has failed", {
        orderId,
        transactionId,
        error: updateError.message
      });

      // Return success=false with transaction ID so it can be reconciled
      return res.status(500).json({
        success: false,
        message: "Payment processed but order update failed. Transaction ID: " + transactionId,
        transactionId: transactionId,
        requiresManualReconciliation: true
      });
    }

    // ===== 7. SUCCESS RESPONSE =====
    console.log("[PayPal API] Payment captured successfully:", {
      orderId,
      transactionId,
      amount: capturedAmount
    });

    return res.status(200).json({
      success: true,
      transactionId,
      alreadyCaptured: isAlreadyCaptured,
      amount: capturedAmount,
      currency: capturedCurrency
    });

  } catch (error) {
    console.error("[PayPal API] Unexpected error:", {
      message: error.message,
      orderId,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });

    // Don't expose internal error details to client
    return res.status(500).json({
      success: false,
      message: error.message.includes('timeout')
        ? "Payment processing timeout. Please check your order status."
        : "An unexpected error occurred. Please contact support."
    });
  }
}