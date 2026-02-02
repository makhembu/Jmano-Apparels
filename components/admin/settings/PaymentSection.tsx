
import React, { useState, useEffect } from 'react';
import { AppSettings } from '../../../types';
import { Switch } from '../../ui/Switch';

interface PaymentSectionProps {
  settings: AppSettings;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export const PaymentSection: React.FC<PaymentSectionProps> = ({ settings, onChange }) => {
  const isEnabled = settings.paymentGatewayEnabled;
  const hasClientId = !!settings.paypalClientId;
  const isLive = settings.paypalMode === 'live';
  
  // Local state to manage the secret key editing (masked vs unmasked)
  const [riskAccepted, setRiskAccepted] = useState(false);

  // Determine System Status
  let status = 'inactive';
  if (isEnabled) {
    status = hasClientId ? 'active' : 'incomplete';
  }

  useEffect(() => {
    // If a secret key exists, hide the input initially (require risk acceptance to edit)
    // Note: This relies on the fact that if a secret key exists in the DB, it might be populated here
    // IF the parent component fetches it. However, if the parent fetches via public RPC, it won't be here.
    // Assuming the Admin fetch uses direct table access (select *), it will be present.
    if (settings.paypalSecretKey) {
        setRiskAccepted(false); 
    }
  }, []);

  const StatusBadge = () => {
    switch (status) {
      case 'active':
        return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-green-200 flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Operational</span>;
      case 'incomplete':
        return <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-amber-200">Needs Configuration</span>;
      default:
        return <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-slate-200">Disabled</span>;
    }
  };

  const handleSwitchChange = (val: boolean) => {
    // Create synthetic event
    const syntheticEvent = {
        target: {
            name: 'paymentGatewayEnabled',
            value: val,
            type: 'checkbox',
            checked: val
        }
    } as any;
    onChange(syntheticEvent);
  };

  return (
    <div className="space-y-8">
      {/* 1. Gateway Status Dashboard */}
      <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
           <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-slate-800 font-serif">PayPal Gateway Status</h3>
              <StatusBadge />
           </div>
           <div className="text-xs text-slate-400 font-mono">v2.1 (Hybrid Storage)</div>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center">
              <span className="text-xs text-slate-400 font-black uppercase tracking-widest mb-2">Environment</span>
              {isLive ? (
                 <span className="text-brand-dark font-bold flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span> Live Production</span>
              ) : (
                 <span className="text-amber-600 font-bold flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Sandbox Test</span>
              )}
           </div>
           
           <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center">
              <span className="text-xs text-slate-400 font-black uppercase tracking-widest mb-2">Currency</span>
              <span className="text-slate-800 font-bold font-mono">{settings.currency || 'GBP'} (Global)</span>
           </div>

           <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center">
              <span className="text-xs text-slate-400 font-black uppercase tracking-widest mb-2">Backend Connection</span>
              <span className="text-brand-green font-bold flex items-center gap-2">
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 Healthy
              </span>
           </div>
        </div>
      </div>

      {/* 2. Configuration Form */}
      <div className="bg-white shadow rounded-lg p-6 border border-gray-200 space-y-6">
        
        <Switch 
            label="Enable PayPal Checkout"
            description="Show the 'Pay with PayPal' button on the checkout page."
            checked={!!settings.paymentGatewayEnabled}
            onChange={handleSwitchChange}
        />

        <div className={`space-y-6 transition-all duration-300 ${!settings.paymentGatewayEnabled ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Environment Mode</label>
                <select 
                  name="paypalMode" 
                  value={settings.paypalMode || 'sandbox'} 
                  onChange={onChange}
                  className="w-full border border-gray-300 rounded-xl p-3 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-green/20 outline-none font-medium"
                >
                   <option value="sandbox">Sandbox (Testing & Development)</option>
                   <option value="live">Live (Real Payments)</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-2">
                   Switching modes requires different Client IDs. Ensure you update the ID below when switching.
                </p>
             </div>
             <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Public Client ID</label>
                <input 
                  type="text" 
                  name="paypalClientId" 
                  value={settings.paypalClientId || ''} 
                  onChange={onChange} 
                  className="w-full border border-gray-300 rounded-xl p-3 bg-white text-gray-900 text-sm font-mono focus:ring-2 focus:ring-brand-green/20 outline-none"
                  placeholder="e.g. Aeu39..."
                />
             </div>
          </div>

          {/* SECRET KEY SECTION WITH RISK ALERT */}
          <div className="border-t border-gray-100 pt-6">
             <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Secret Key Storage</label>
             
             {!riskAccepted ? (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm leading-5 font-medium text-amber-800">Sensitive Data Warning</h3>
                            <div className="mt-2 text-xs leading-5 text-amber-700">
                                <p>
                                    Entering the Secret Key here stores it in your database. While convenient, it allows other Admins to view it.
                                    For maximum security, configure <code>PAYPAL_SECRET_KEY</code> in your hosting Environment Variables instead.
                                </p>
                            </div>
                            <div className="mt-4">
                                <button 
                                    type="button"
                                    onClick={() => setRiskAccepted(true)}
                                    className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1.5 rounded border border-amber-300 hover:bg-amber-200 transition-colors"
                                >
                                    I understand, enable database storage
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
             ) : (
                <div className="animate-fade-in bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <label className="block text-xs font-bold text-slate-700 mb-2">PayPal Secret Key</label>
                    <input 
                        type="password" 
                        name="paypalSecretKey" 
                        value={settings.paypalSecretKey || ''} 
                        onChange={onChange} 
                        className="w-full border border-gray-300 rounded-xl p-3 bg-white text-gray-900 text-sm font-mono focus:ring-2 focus:ring-brand-green/20 outline-none"
                        placeholder="sk_..."
                    />
                    <p className="text-[10px] text-green-600 mt-2 font-medium flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Value will be stored in database upon save.
                    </p>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
