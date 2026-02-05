
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
          shipping_preference: "NO_SHIPPING", // We collect shipping in our form
          user_action: "PAY_NOW"
        }
      });
    } catch (e: any) {
      console.error("PayPal Initiation Error:", e);
      const msg = e.message || "Failed to initialize payment.";
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
      const orderDetails = await actions.order.get();
      const dbOrderId = orderDetails.purchase_units[0].custom_id;
      const paypalOrderId = data.orderID;

      const response = await fetch('/api/paypal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: dbOrderId, paypalOrderId: paypalOrderId })
      });
      
      const verifyData = await response.json();

      if (!response.ok || !verifyData?.success) {
        throw new Error(verifyData?.message || "Payment verification failed.");
      }

      clearCart();
      showToast('Blessing received! Order confirmed.', 'success');
      
      if (user) {
        navigate(`/order/${dbOrderId}`);
      } else {
        navigate('/shop');
      }

    } catch (e: any) {
      console.error("PayPal Capture Exception:", e);
      showToast(e.message || "Capture failed.", 'error');
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
