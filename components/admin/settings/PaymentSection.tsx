import React from 'react';
import { AppSettings } from '../../../types';

interface PaymentSectionProps {
  settings: AppSettings;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export const PaymentSection: React.FC<PaymentSectionProps> = ({ settings, onChange }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6 border border-gray-200 space-y-6">
      <div className="border-b pb-4">
        <h3 className="text-lg font-medium text-brand-green">Payment Gateways</h3>
        <p className="text-sm text-gray-500 mt-1">Configure PayPal to accept real payments.</p>
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div>
          <label htmlFor="paymentGatewayEnabled" className="block text-sm font-bold text-gray-900">Enable PayPal Checkout</label>
          <p className="text-xs text-gray-500">If enabled, the PayPal button will appear on the checkout page.</p>
        </div>
        <div className="flex items-center h-6">
          <input 
            id="paymentGatewayEnabled"
            name="paymentGatewayEnabled"
            type="checkbox"
            checked={!!settings.paymentGatewayEnabled}
            onChange={onChange}
            className="h-4 w-4 rounded border-gray-300 text-brand-green focus:ring-brand-green"
          />
        </div>
      </div>

      <div className={`space-y-4 transition-opacity ${!settings.paymentGatewayEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-1">Environment Mode</label>
              <select 
                name="paypalMode" 
                value={settings.paypalMode || 'sandbox'} 
                onChange={onChange}
                className="w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 text-sm focus:ring-brand-green"
              >
                 <option value="sandbox">Sandbox (Testing)</option>
                 <option value="live">Live (Production)</option>
              </select>
           </div>
           <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-1">PayPal Client ID</label>
              <input 
                type="text" 
                name="paypalClientId" 
                value={settings.paypalClientId || ''} 
                onChange={onChange} 
                className="w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 text-sm font-mono focus:ring-brand-green"
                placeholder="Ae..."
              />
           </div>
        </div>
        
        {/* SECURE NOTE: Secret Key input removed */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
           <div className="flex">
              <div className="flex-shrink-0">
                 <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                 </svg>
              </div>
              <div className="ml-3">
                 <p className="text-sm text-blue-700">
                    <strong>Security Update:</strong> The PayPal Secret Key is no longer stored in the database. 
                    Please configure <code>PAYPAL_SECRET_KEY</code> in your Supabase Edge Function secrets via the CLI or Dashboard.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};