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

const getCountryCode = (countryName: string): string => {
    const map: Record<string, string> = {
        'United Kingdom': 'GB',
        'United States': 'US',
        'France': 'FR',
        'Germany': 'DE',
        'Australia': 'AU',
        'Canada': 'CA',
        'Other': 'GB'
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
    total: number,
    existingOrder?: any
  ) => {
    try {
      let orderIdToUse: string;
      let orderNumberToUse: string;
      let orderPayload: any;

      if (existingOrder) {
          orderIdToUse = existingOrder.id;
          orderNumberToUse = existingOrder.orderNumber;
          orderPayload = existingOrder;
      } else {
          const payload = await preparePayload();
          if (!payload) throw new Error("Validation failed. Please check your address.");
          
          // Create internal order first
          const dbOrder = await api.createOrder({ 
            ...payload, 
            paymentStatus: 'pending' 
          });
          
          orderIdToUse = dbOrder.id;
          orderNumberToUse = dbOrder.orderNumber;
          orderPayload = payload;
          
          // CRITICAL: Clear cart immediately to prevent duplicates if payment is interrupted
          clearCart();
      }

      const addr = orderPayload.shippingAddress;
      const fullName = orderPayload.customerName || user?.name || 'Valued Customer';
      const nameParts = fullName.trim().split(' ');
      const givenName = nameParts[0];
      const surname = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Customer';

      return actions.order.create({
        intent: "CAPTURE",
        purchase_units: [{
          description: `Jambo Apparels Order #${orderNumberToUse}`,
          custom_id: orderIdToUse,
          amount: {
            currency_code: settings.currency || 'GBP',
            value: total.toFixed(2),
            breakdown: {
                item_total: {
                    currency_code: settings.currency || 'GBP',
                    value: (orderPayload.subtotal - (orderPayload.discountAmount || 0)).toFixed(2)
                },
                shipping: {
                    currency_code: settings.currency || 'GBP',
                    value: (orderPayload.shippingCost || 0).toFixed(2)
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
            name: { given_name: givenName, surname: surname },
            email_address: orderPayload.customerEmail || user?.email,
            address: {
                address_line_1: addr.address1,
                address_line_2: addr.address2 || '',
                admin_area_2: addr.city,
                postal_code: addr.postcode,
                country_code: getCountryCode(addr.country)
            }
        }
      });
    } catch (e: any) {
      console.error("PayPal Initiation Error:", e);
      showToast(e.message || "Failed to initialize payment.", 'error');
      throw e;
    }
  }, [settings.currency, showToast, user, clearCart]);

  const handlePayPalApprove = useCallback(async (data: any, actions: any) => {
    setIsProcessing(true);
    try {
      const paypalOrderId = data.orderID;
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
            showToast("The payment method was declined. Please try another card.", "info");
            return actions.restart();
        }
        throw new Error(verifyData?.message || "Payment verification failed.");
      }

      showToast('Blessing received! Your order is confirmed.', 'success');
      navigate(user ? `/order/${dbOrderId}` : '/shop', { state: { orderSuccess: true } });
    } catch (e: any) {
      console.error("PayPal Capture Exception:", e);
      showToast(e.message || "Payment processing error.", 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [user, navigate, showToast]);

  const handleManualOrder = useCallback(async (preparePayload: () => any) => {
    setIsProcessing(true);
    try {
      const payload = await preparePayload();
      if (!payload) return;

      await api.createOrder({ ...payload, paymentStatus: 'pending' });
      clearCart();
      showToast('Order received! Check your email.', 'success');
      navigate(user ? '/dashboard' : '/shop');
    } catch (e: any) {
      showToast(e.message || 'Connection issue.', 'error');
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