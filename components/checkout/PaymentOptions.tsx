
import React, { useMemo, useState } from 'react';
import { Button } from '../ui/Button';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useToast } from '../../context/ToastContext';

interface PaymentOptionsProps {
  discountCode: string;
  setDiscountCode: (val: string) => void;
  applyDiscount: () => void;
  paypalConfig: { clientId: string; mode: string; enabled: boolean } | null;
  currency: string;
  isProcessing: boolean;
  onPayPalCreateOrder: (data: any, actions: any) => Promise<string>;
  onPayPalApprove: (data: any, actions: any) => Promise<void>;
  onManualOrder: () => void;
}

export const PaymentOptions: React.FC<PaymentOptionsProps> = ({
  discountCode, setDiscountCode, applyDiscount,
  paypalConfig, currency, isProcessing,
  onPayPalCreateOrder, onPayPalApprove, onManualOrder
}) => {
  const { showToast } = useToast();
  const [paypalError, setPaypalError] = useState(false);
  
  const initialOptions = useMemo(() => ({
    clientId: paypalConfig?.clientId || "test",
    currency: currency,
    intent: "capture",
    components: "buttons",
  }), [paypalConfig?.clientId, currency]);

  const handlePayPalError = (err: any) => {
    console.error("PayPal Button Error:", err);
    setPaypalError(true);
    showToast("PayPal services unavailable.", "error");
  };

  // STRICT Logic: Only show manual if PayPal is explicitly DISABLED or config is missing.
  // Even if there is an error, we do NOT fall back to manual if enabled (per user request).
  const isPayPalEnabled = paypalConfig?.enabled && !!paypalConfig?.clientId;

  return (
    <div className="mt-8 space-y-4">
      {/* Discount Code */}
      <div className="flex gap-2 w-full">
        <input 
          type="text" 
          placeholder="Discount Code" 
          value={discountCode} 
          onChange={e => setDiscountCode(e.target.value.toUpperCase())} 
          className="flex-1 min-w-0 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20" 
        />
        <Button onClick={applyDiscount} variant="outline" className="px-4 sm:px-6 shrink-0">
          Apply
        </Button>
      </div>

      {/* Payment Interface */}
      {isPayPalEnabled ? (
        <div className="pt-4 animate-fade-in relative z-0 min-h-[150px]">
          {paypalError ? (
             <div className="p-6 bg-red-50 border border-red-100 rounded-xl text-center">
                <svg className="w-10 h-10 text-red-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <p className="text-red-800 font-bold text-sm">Payment Gateway Unavailable</p>
                <p className="text-red-600 text-xs mt-1 mb-3">Please try refreshing the page.</p>
                <button onClick={() => window.location.reload()} className="text-xs font-bold bg-white border border-red-200 text-red-700 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors">
                   Reload Page
                </button>
             </div>
          ) : (
             <PayPalScriptProvider options={initialOptions}>
                <PayPalButtons 
                  style={{ layout: "vertical", shape: "rect", height: 48 }}
                  createOrder={onPayPalCreateOrder}
                  onApprove={onPayPalApprove}
                  disabled={isProcessing}
                  onError={handlePayPalError}
                />
             </PayPalScriptProvider>
          )}
        </div>
      ) : (
        <Button 
          fullWidth 
          onClick={onManualOrder} 
          isLoading={isProcessing}
          className="py-4 text-lg font-bold shadow-xl shadow-brand-green/20 rounded-2xl"
        >
          Confirm Order (Manual)
        </Button>
      )}

      <p className="text-[10px] text-gray-400 text-center mt-6 uppercase tracking-widest font-bold">
        Secure Payment Powered by {isPayPalEnabled ? 'PayPal' : 'Jambo Secure'}
      </p>
    </div>
  );
};
