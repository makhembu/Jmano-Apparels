
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const event = req.body;
  console.log(`[PayPal Webhook] Received: ${event.event_type}`);

  try {
    // 1. Resolve internal order
    // PayPal events typically have the resource.custom_id (our order ID) or resource.id (PayPal capture ID)
    const paypalCaptureId = event.resource?.id;
    const internalOrderId = event.resource?.custom_id;

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

    // 2. Handle Events
    const updates = {};
    switch (event.event_type) {
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
      console.log(`[PayPal Webhook] Updated order ${order.id}`);
    }

    return res.status(200).json({ status: 'success' });

  } catch (error) {
    console.error("[PayPal Webhook] Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
