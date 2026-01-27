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
        <p className="text-sm text-gray-500 mt-1">Configure PayPal to accept real payments. Credentials are stored securely.</p>
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
        <div>
           <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-1">PayPal Secret Key</label>
           <input 
             type="password" 
             name="paypalSecretKey" 
             value={settings.paypalSecretKey || ''} 
             onChange={onChange} 
             className="w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 text-sm font-mono focus:ring-brand-green"
             placeholder="Enter secret key (hidden for security)"
           />
           <p className="text-xs text-gray-400 mt-1">This key is used by the server to verify payments. It is never exposed to the frontend.</p>
        </div>
      </div>
    </div>
  );
};
