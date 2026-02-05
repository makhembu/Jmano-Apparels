
import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/db';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

interface PaymentConfig {
  clientId: string;
  mode: string;
  enabled: boolean;
}

interface UsePaymentProps {
  user: any;
  clearCart: () => void;
  settings: any;
}

export const usePayment = ({ user, clearCart, settings }: UsePaymentProps) => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paypalConfig, setPaypalConfig] = useState<PaymentConfig | null>(null);

  useEffect(() => {
    api.getPublicPaymentSettings().then((config) => {
      if (config && config.paypalClientId) {
        setPaypalConfig({
          clientId: config.paypalClientId.trim(),
          mode: config.paypalMode,
          enabled: config.paymentGatewayEnabled
        });
      }
    });
  }, []);

  const handlePayPalCreateOrder = useCallback(async (
    data: any, 
    actions: any, 
    preparePayload: () => Promise<any> | any,
    total: number
  ) => {
    try {
      const payload = await preparePayload();
      if (!payload) throw new Error("Validation failed. Please check your address.");

      // Create internal order first
      const dbOrder = await api.createOrder({ 
        ...payload, 
        paymentStatus: 'pending' 
      });

      // Strict amount string for PayPal (2 decimals)
      const amountValue = total.toFixed(2);

      return actions.order.create({
        intent: "CAPTURE",
        purchase_units: [{
          description: `Jambo Apparels Order #${dbOrder.orderNumber}`,
          custom_id: dbOrder.id,
          amount: {
            currency_code: settings.currency || 'GBP',
            value: amountValue
          }
        }],
        application_context: {
          shipping_preference: "NO_SHIPPING",
          user_action: "PAY_NOW"
        }
      });
    } catch (e: any) {
      console.error("PayPal Initiation Error:", e);
      const msg = e.message || "Failed to initialize payment.";
      // Don't show toast for some internal PayPal errors that the SDK handles
      if (!msg.includes('detected')) {
          showToast(msg, 'error');
      }
      throw e;
    }
  }, [settings.currency, showToast]);

  const handlePayPalApprove = useCallback(async (
    data: any, 
    actions: any
  ) => {
    setIsProcessing(true);
    try {
      const paypalOrderId = data.orderID;
      
      // First, attempt to verify and capture via our backend
      // We pass both IDs to ensure we match correctly
      const response = await fetch('/api/paypal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            // We'll get the custom_id (our order ID) from the PayPal order details first
            // but for simplicity and safety, we rely on the backend finding it via payment_intent_id 
            // or the passed orderId. Since we don't have dbOrderId here without another fetch, 
            // we use the paypalOrderId to fetch it.
            paypalOrderId: paypalOrderId 
        })
      });

      // Improvement: Actually we need the DB Order ID. Let's get it from PayPal SDK first.
      const paypalOrderDetails = await actions.order.get();
      const dbOrderId = paypalOrderDetails.purchase_units[0].custom_id;

      const verifyResponse = await fetch('/api/paypal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: dbOrderId, paypalOrderId: paypalOrderId })
      });
      
      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok || !verifyData?.success) {
        // Handle specific recoverable errors
        if (verifyData?.issue === 'INSTRUMENT_DECLINED') {
            // Fix: Changed 'warning' to 'info' to align with ToastType definition ('success' | 'error' | 'info')
            showToast("The payment method was declined. Please try another card in the PayPal window.", "info");
            return actions.restart(); // This opens the PayPal window again for a different method
        }
        
        throw new Error(verifyData?.message || "Payment verification failed. If you were charged, contact support with Order ID: " + paypalOrderId);
      }

      clearCart();
      showToast('Blessing received! Your order is confirmed.', 'success');
      
      if (user) {
        navigate(`/order/${dbOrderId}`);
      } else {
        // For guests, we take them to a success page or shop with a notice
        navigate('/shop', { state: { orderSuccess: true, orderNumber: paypalOrderId } });
      }

    } catch (e: any) {
      console.error("PayPal Capture Exception:", e);
      showToast(e.message || "Something went wrong during payment processing.", 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [user, clearCart, navigate, showToast]);

  const handleManualOrder = useCallback(async (
    preparePayload: () => Promise<any> | any
  ) => {
    setIsProcessing(true);
    try {
      const payload = await preparePayload();
      if (!payload) return;

      await api.createOrder({ ...payload, paymentStatus: 'pending' });
      
      clearCart();
      showToast('Order received! Check your email for next steps.', 'success');
      
      if (user) {
        navigate('/dashboard');
      } else {
        navigate('/shop');
      }
    } catch (e: any) {
      console.error(e);
      showToast(e.message || 'Connection issue. Try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [user, clearCart, navigate, showToast]);

  return {
    isProcessing,
    paypalConfig,
    handlePayPalCreateOrder,
    handlePayPalApprove,
    handleManualOrder
  };
};
