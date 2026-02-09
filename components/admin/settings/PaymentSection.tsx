import React, { useState, useEffect } from 'react';
import { AppSettings } from '../../../types';
import { Switch } from '../../ui/Switch';
import { PayPalWebhookManager } from './PayPalWebhookManager';

interface PaymentSectionProps {
  settings: AppSettings;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export const PaymentSection: React.FC<PaymentSectionProps> = ({ settings, onChange }) => {
  const isEnabled = settings.paymentGatewayEnabled;
  const hasClientId = !!settings.paypalClientId;
  const hasWebhookId = !!settings.paypalWebhookId;
  
  const [riskAccepted, setRiskAccepted] = useState(false);

  useEffect(() => {
    if (settings.paypalSecretKey) {
        setRiskAccepted(false); 
    }
  }, []);

  const handleSwitchChange = (val: boolean) => {
    onChange({
        target: { name: 'paymentGatewayEnabled', value: val, type: 'checkbox', checked: val }
    } as any);
  };

  const handleWebhookUpdate = (newId: string | null) => {
    // Manually trigger an update to the parent state so the UI reflects the new Webhook ID status
    // without requiring a full page reload.
    const syntheticEvent = {
        target: {
            name: 'paypalWebhookId',
            value: newId,
            type: 'text'
        }
    } as any;
    onChange(syntheticEvent);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
           <h3 className="text-lg font-bold text-slate-800 font-serif">PayPal Configuration</h3>
           <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
             isEnabled && hasClientId && hasWebhookId ? 'bg-green-100 text-green-800 border-green-200' : 'bg-amber-100 text-amber-800 border-amber-200'
           }`}>
             {isEnabled && hasClientId && hasWebhookId ? 'Fully Configured' : 'Needs Setup'}
           </div>
        </div>
        
        <div className="p-6 space-y-6">
          <Switch 
              label="Enable PayPal Checkout"
              description="Activate automated payments and real-time reconciliation."
              checked={!!settings.paymentGatewayEnabled}
              onChange={handleSwitchChange}
          />

          <div className={`space-y-6 transition-all duration-300 ${!settings.paymentGatewayEnabled ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Environment Mode</label>
                  <select name="paypalMode" value={settings.paypalMode || 'sandbox'} onChange={onChange} className="w-full border border-gray-300 rounded-xl p-3 bg-white text-sm">
                     <option value="sandbox">Sandbox (Testing)</option>
                     <option value="live">Live (Production)</option>
                  </select>
               </div>
               <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Public Client ID</label>
                  <input type="text" name="paypalClientId" value={settings.paypalClientId || ''} onChange={onChange} className="w-full border border-gray-300 rounded-xl p-3 text-sm font-mono" placeholder="Aeu39..." />
               </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
               <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Secret Key (Server-Side Only)</label>
               {!riskAccepted ? (
                  <button type="button" onClick={() => setRiskAccepted(true)} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-50">
                    Click to reveal/edit Secret Key
                  </button>
               ) : (
                  <input type="password" name="paypalSecretKey" value={settings.paypalSecretKey || ''} onChange={onChange} className="w-full border border-gray-300 rounded-xl p-3 text-sm font-mono" placeholder="Never shared with client..." />
               )}
            </div>

            {/* Advanced Webhook Manager */}
            {hasClientId && (settings.paypalSecretKey || riskAccepted) && (
                <div className="border-t border-gray-100 pt-6">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Webhook Management</label>
                    <PayPalWebhookManager 
                        currentWebhookId={settings.paypalWebhookId} 
                        onUpdate={handleWebhookUpdate}
                    />
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};