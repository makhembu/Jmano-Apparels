
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

// Simple ISO Country Mapper for PayPal (2-char codes)
const getCountryCode = (countryName: string): string => {
    const map: Record<string, string> = {
        'United Kingdom': 'GB',
        'United States': 'US',
        'France': 'FR',
        'Germany': 'DE',
        'Australia': 'AU',
        'Canada': 'CA',
        'Other': 'GB' // Fallback
    };
    return map[countryName] || 'GB';
};

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

      // Create internal order first (stores pending state in our DB)
      const dbOrder = await api.createOrder({ 
        ...payload, 
        paymentStatus: 'pending' 
      });

      const amountValue = total.toFixed(2);
      const addr = payload.shippingAddress;
      
      // Parse names for PayPal structure
      const fullName = payload.customerName || user?.name || 'Valued Customer';
      const nameParts = fullName.trim().split(' ');
      const givenName = nameParts[0];
      const surname = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Customer';

      return actions.order.create({
        intent: "CAPTURE",
        purchase_units: [{
          description: `Jambo Apparels Order #${dbOrder.orderNumber}`,
          custom_id: dbOrder.id,
          amount: {
            currency_code: settings.currency || 'GBP',
            value: amountValue,
            breakdown: {
                item_total: {
                    currency_code: settings.currency || 'GBP',
                    value: (payload.subtotal - (payload.discountAmount || 0)).toFixed(2)
                },
                shipping: {
                    currency_code: settings.currency || 'GBP',
                    value: (payload.shippingCost || 0).toFixed(2)
                }
            }
          },
          shipping: {
              name: { full_name: fullName },
              address: {
                  address_line_1: addr.address1,
                  address_line_2: addr.address2 || '',
                  admin_area_2: addr.city,
                  postal_code: addr.postcode,
                  country_code: getCountryCode(addr.country)
              }
          }
        }],
        payer: {
            name: {
                given_name: givenName,
                surname: surname
            },
            email_address: payload.customerEmail || user?.email,
            address: {
                address_line_1: addr.address1,
                address_line_2: addr.address2 || '',
                admin_area_2: addr.city,
                postal_code: addr.postcode,
                country_code: getCountryCode(addr.country)
            }
        },
        application_context: {
          shipping_preference: "SET_PROVIDED_ADDRESS",
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
  }, [settings.currency, showToast, user]);

  const handlePayPalApprove = useCallback(async (
    data: any, 
    actions: any
  ) => {
    setIsProcessing(true);
    try {
      const paypalOrderId = data.orderID;
      
      // Get the custom_id (our internal order ID) from the PayPal order
      const paypalOrderDetails = await actions.order.get();
      const dbOrderId = paypalOrderDetails.purchase_units[0].custom_id;

      const verifyResponse = await fetch('/api/paypal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: dbOrderId, paypalOrderId: paypalOrderId })
      });
      
      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok || !verifyData?.success) {
        if (verifyData?.issue === 'INSTRUMENT_DECLINED') {
            showToast("The payment method was declined. Please try another card in the PayPal window.", "info");
            return actions.restart();
        }
        throw new Error(verifyData?.message || "Payment verification failed. Please contact support.");
      }

      clearCart();
      showToast('Blessing received! Your order is confirmed.', 'success');
      
      if (user) {
        navigate(`/order/${dbOrderId}`);
      } else {
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
