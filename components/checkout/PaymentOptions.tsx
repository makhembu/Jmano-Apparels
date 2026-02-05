
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
  onValidate: () => boolean;
}

export const PaymentOptions: React.FC<PaymentOptionsProps> = ({
  discountCode, setDiscountCode, applyDiscount,
  paypalConfig, currency, isProcessing,
  onPayPalCreateOrder, onPayPalApprove, onManualOrder, onValidate
}) => {
  const { showToast } = useToast();
  const [paypalError, setPaypalError] = useState(false);
  
  const initialOptions = useMemo(() => ({
    "client-id": paypalConfig?.clientId || "test",
    currency: currency,
    intent: "capture",
    "data-sdk-integration-source": "button-factory"
  }), [paypalConfig?.clientId, currency]);

  const handlePayPalError = (err: any) => {
    const errStr = err?.toString() || '';
    if (errStr.includes("Invalid order data")) return;
    
    console.error("PayPal SDK Error:", err);
    setPaypalError(true);
    showToast("Payment Gateway Error. Please refresh.", "error");
  };

  const isPayPalEnabled = paypalConfig?.enabled && !!paypalConfig?.clientId;

  return (
    <div className="mt-8 space-y-4">
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

      {isPayPalEnabled ? (
        <div className="pt-4 animate-fade-in relative z-0 min-h-[150px]">
          {paypalError ? (
             <div className="p-6 bg-red-50 border border-red-100 rounded-xl text-center">
                <p className="text-red-800 font-bold text-sm">Payment Gateway Error</p>
                <button onClick={() => window.location.reload()} className="text-xs font-bold text-red-600 mt-2 underline">
                   Refresh Page
                </button>
             </div>
          ) : (
             <PayPalScriptProvider options={initialOptions}>
                <PayPalButtons 
                  key={`${currency}-${paypalConfig?.clientId}`}
                  style={{ layout: "vertical", shape: "rect", height: 48 }}
                  onClick={(data, actions) => {
                    if (!onValidate()) return actions.reject();
                    return actions.resolve();
                  }}
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
        Secure Transaction via {isPayPalEnabled ? 'PayPal' : 'Jambo Secure'}
      </p>
    </div>
  );
};
