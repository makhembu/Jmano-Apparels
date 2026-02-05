
import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/db';
import { supabase } from '../lib/supabaseClient';
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

  // Load Payment Settings on Mount
  useEffect(() => {
    api.getPublicPaymentSettings().then((config) => {
      if (config && config.paypalClientId) {
        setPaypalConfig({
          clientId: config.paypalClientId.trim(), // Trim whitespace to prevent URL errors
          mode: config.paypalMode,
          enabled: config.paymentGatewayEnabled
        });
      }
    });
  }, []);

  // --- PayPal Handlers ---

  const handlePayPalCreateOrder = useCallback(async (
    data: any, 
    actions: any, 
    preparePayload: () => Promise<any> | any,
    total: number
  ) => {
    try {
      // 1. Prepare Data (Validate & Build Payload)
      const payload = await preparePayload();
      if (!payload) throw new Error("Invalid order data");

      // 2. Create DB Order (Pending Payment)
      // We perform this first to reserve stock and get a persistent ID
      const dbOrder = await api.createOrder({ 
        ...payload, 
        paymentStatus: 'pending' 
      });

      // 3. Create PayPal Order
      return actions.order.create({
        intent: "CAPTURE",
        purchase_units: [{
          description: `Order #${dbOrder.orderNumber}`,
          custom_id: dbOrder.id, // Link DB Order ID
          amount: {
            currency_code: settings.currency || 'GBP',
            value: total.toFixed(2)
          }
        }]
      });
    } catch (e: any) {
      console.error("PayPal Create Error:", e);
      // We do NOT show toast here for user cancellation, but for errors we do
      if (!e.message?.includes('detected')) { // Filter out some PayPal internal noise if necessary
          showToast(e.message || "Failed to initialize payment.", 'error');
      }
      throw e;
    }
  }, [settings.currency, showToast]);

  const handlePayPalApprove = useCallback(async (
    data: any, 
    actions: any
  ) => {
    try {
      setIsProcessing(true);
      
      // 1. Get Order Details to retrieve custom_id (DB Order ID)
      const orderDetails = await actions.order.get();
      const dbOrderId = orderDetails.purchase_units[0].custom_id;
      const paypalOrderId = data.orderID;

      // 2. Server-Side Capture via Vercel API
      const response = await fetch('/api/paypal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: dbOrderId, paypalOrderId: paypalOrderId })
      });
      
      const verifyData = await response.json();

      if (!response.ok || !verifyData?.success) {
        console.error("Payment capture failed:", verifyData);
        throw new Error(verifyData?.message || "Payment verification failed.");
      }

      // 3. Cleanup & Redirect
      clearCart();
      showToast('Payment successful! Order confirmed.', 'success');
      
      if (user) {
        navigate(`/order/${dbOrderId}`);
      } else {
        navigate('/shop');
      }

    } catch (e: any) {
      console.error("PayPal Approve Error:", e);
      showToast(`Payment Error: ${e.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [user, clearCart, navigate, showToast]);

  // --- Manual Handler ---

  const handleManualOrder = useCallback(async (
    preparePayload: () => Promise<any> | any
  ) => {
    setIsProcessing(true);
    try {
      const payload = await preparePayload();
      if (!payload) return; // Validation failed inside preparePayload usually

      await api.createOrder({ ...payload, paymentStatus: 'pending' });
      
      clearCart();
      showToast('Order received! Please check email for instructions.', 'success');
      
      if (user) {
        navigate('/dashboard', { state: { orderConfirmed: true } });
      } else {
        navigate('/shop');
      }
    } catch (e: any) {
      console.error(e);
      showToast('Something went wrong. Please check your connection.', 'error');
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
