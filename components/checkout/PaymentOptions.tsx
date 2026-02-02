import React, { useMemo, useState, useEffect } from 'react';
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
  const [isSandboxed, setIsSandboxed] = useState(false);
  
  // Detect if we're in a sandboxed environment
  useEffect(() => {
    try {
      // Check if we can access window properties PayPal needs
      const canAccessWindow = window.location.ancestorOrigins !== undefined || 
                             window.parent !== window ||
                             window.self !== window.top;
      
      // Check for suspicious domain patterns
      const suspiciousDomain = window.location.hostname.includes('scf.usercontent.goog') ||
                              window.location.hostname.includes('cloudflare') ||
                              window.location.hostname.length > 100;
      
      if (canAccessWindow || suspiciousDomain) {
        setIsSandboxed(true);
        console.warn('PayPal disabled: Running in sandboxed or restricted environment');
      }
    } catch (error) {
      // If we can't even check, it's likely sandboxed
      setIsSandboxed(true);
    }
  }, []);
  
  const initialOptions = useMemo(() => ({
    clientId: paypalConfig?.clientId || "test",
    currency: currency,
    intent: "capture",
    components: "buttons",
  }), [paypalConfig?.clientId, currency]);

  const handlePayPalError = (err: any) => {
    console.error("PayPal Button Error:", err);
    setPaypalError(true);
    showToast("PayPal services unavailable. Please use manual payment.", "error");
  };

  // Determine if PayPal should be shown
  const shouldShowPayPal = paypalConfig?.enabled && 
                          paypalConfig?.clientId && 
                          !paypalError && 
                          !isSandboxed;

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

      {/* Payment Buttons */}
      {shouldShowPayPal ? (
        <div className="pt-4 animate-fade-in relative z-0 min-h-[150px]">
          <PayPalScriptProvider options={initialOptions}>
            <PayPalButtons 
              style={{ layout: "vertical", shape: "rect", borderRadius: 12, height: 48 }}
              createOrder={onPayPalCreateOrder}
              onApprove={onPayPalApprove}
              disabled={isProcessing}
              onError={handlePayPalError}
            />
          </PayPalScriptProvider>
          
          <div className="mt-4 text-center">
            <span className="text-xs text-slate-400 bg-white px-2 relative z-10">Or pay manually</span>
            <div className="h-px bg-slate-100 -mt-2"></div>
          </div>
          
          <button 
            onClick={onManualOrder}
            disabled={isProcessing}
            className="w-full mt-4 text-xs font-bold text-slate-500 hover:text-brand-dark hover:underline py-2"
          >
            I prefer to pay via Bank Transfer / Manual
          </button>
        </div>
      ) : (
        <Button 
          fullWidth 
          onClick={onManualOrder} 
          isLoading={isProcessing}
          className="py-4 text-lg font-bold shadow-xl shadow-brand-green/20 rounded-2xl"
        >
          {isSandboxed 
            ? 'Confirm Order (Manual Payment)' 
            : paypalError 
              ? 'Confirm Order (Manual Payment)' 
              : 'Confirm Order (Manual)'}
        </Button>
      )}

      <p className="text-[10px] text-gray-400 text-center mt-6 uppercase tracking-widest font-bold">
        Secure Payment Powered by {shouldShowPayPal ? 'PayPal' : 'Jambo Secure'}
      </p>
    </div>
  );
};