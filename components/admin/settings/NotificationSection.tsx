
import React, { useState, useEffect } from 'react';
import { AppSettings } from '../../../types';
import { Button } from '../../ui/Button';
import { SettingsService } from '../../../lib/services/content';
import { useToast } from '../../../context/ToastContext';
import { Switch } from '../../ui/Switch';

interface NotificationSectionProps {
  settings: AppSettings;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const settingsService = new SettingsService();

export const NotificationSection: React.FC<NotificationSectionProps> = ({ settings, onChange }) => {
  const { showToast } = useToast();
  
  // Local state for the complex configuration object
  const [smtpConfig, setSmtpConfig] = useState<Record<string, any>>(settings.smtpSettings || { mode: 'env' });
  const [provider, setProvider] = useState<'smtp' | 'resend'>(settings.emailProvider || 'smtp');
  
  // UI States
  const [riskAccepted, setRiskAccepted] = useState(false);
  const [checking, setChecking] = useState(false);
  const [healthStatus, setHealthStatus] = useState<'idle' | 'ok' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (settings.emailProvider) setProvider(settings.emailProvider);
    if (settings.smtpSettings) {
        setSmtpConfig(settings.smtpSettings);
        // Auto-check risk box if they are already using custom mode
        if (settings.smtpSettings.mode === 'custom') {
            setRiskAccepted(true);
        }
    }
  }, [settings]);

  // Helper to push changes up to parent
  const updateParent = (newConfig: Record<string, any>, newProvider?: string) => {
    const syntheticEvent = {
        target: {
            name: 'smtpSettings',
            value: newConfig
        }
    };
    
    setSmtpConfig(newConfig);
    
    if (newProvider) {
        onChange({ target: { name: 'emailProvider', value: newProvider } } as any);
    }
    
    onChange(syntheticEvent as any);
  };

  const handleModeChange = (mode: 'env' | 'custom') => {
    const newConfig = { ...smtpConfig, mode };
    updateParent(newConfig);
    // Reset risk acceptance if switching back to secure mode
    if (mode === 'env') {
        setRiskAccepted(false);
    }
  };

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as 'smtp' | 'resend';
    setProvider(val);
    updateParent(smtpConfig, val);
  };

  const handleConfigInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newConfig = { ...smtpConfig, [name]: value };
    updateParent(newConfig);
  };

  const checkHealth = async () => {
    setChecking(true);
    setHealthStatus('idle');
    setErrorMsg('');
    try {
      const target = settings.contactEmail || 'test@example.com';
      const result = await settingsService.checkEmailHealth(target);
      
      if (result.success) {
        setHealthStatus('ok');
        showToast('System is healthy! Test email sent.', 'success');
      } else {
        setHealthStatus('error');
        setErrorMsg(result.message || 'Configuration failed.');
        showToast('Health check failed.', 'error');
      }
    } catch (e: any) {
      setHealthStatus('error');
      setErrorMsg(e.message);
    } finally {
      setChecking(false);
    }
  };

  const masterSwitchEnabled = settings.enableEmailNotifications ?? false;
  const isCustomMode = smtpConfig.mode === 'custom';

  const handleSwitchChange = (name: keyof AppSettings, checked: boolean) => {
      onChange({
          target: {
              name,
              value: checked,
              type: 'checkbox',
              checked
          }
      } as any);
  };

  return (
    <div className="space-y-6">
      {/* 1. Configuration Panel */}
      <div className="bg-white shadow rounded-lg p-6 border border-gray-200 space-y-6">
         <div className="border-b pb-4 flex justify-between items-center">
            <div>
               <h3 className="text-lg font-medium text-brand-green">Email Infrastructure</h3>
               <p className="text-sm text-gray-500 mt-1">Configure how your shop sends emails.</p>
            </div>
            <div className="flex items-center gap-2">
                {healthStatus === 'ok' && <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold">Healthy</span>}
                {healthStatus === 'error' && <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-bold">Error</span>}
            </div>
         </div>

         {/* Configuration Source Selector */}
         <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Configuration Source</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                    type="button"
                    onClick={() => handleModeChange('env')}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${!isCustomMode ? 'border-brand-green bg-white shadow-sm' : 'border-slate-200 bg-slate-100 opacity-70 hover:opacity-100'}`}
                >
                    <svg className="w-6 h-6 text-slate-700 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    <span className="text-sm font-bold text-slate-900">Environment Variables</span>
                    <span className="text-[10px] text-green-600 font-medium mt-1">Recommended (Secure)</span>
                </button>

                <button
                    type="button"
                    onClick={() => handleModeChange('custom')}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${isCustomMode ? 'border-brand-green bg-white shadow-sm' : 'border-slate-200 bg-slate-100 opacity-70 hover:opacity-100'}`}
                >
                    <svg className="w-6 h-6 text-slate-700 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                    <span className="text-sm font-bold text-slate-900">App Settings</span>
                    <span className="text-[10px] text-amber-600 font-medium mt-1">Database Storage (Custom)</span>
                </button>
            </div>
         </div>

         {/* Mode: Custom Settings */}
         {isCustomMode && (
             <div className="animate-fade-in space-y-6">
                
                {/* Risk Warning */}
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm leading-5 font-medium text-amber-800">Security Risk Warning</h3>
                            <div className="mt-2 text-xs leading-5 text-amber-700">
                                <p>
                                    Storing SMTP credentials in the database (App Settings) makes them visible to any Admin user with access to this dashboard. 
                                    For maximum security, we recommend using Environment Variables in your server hosting platform.
                                </p>
                            </div>
                            <div className="mt-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={riskAccepted} 
                                        onChange={e => setRiskAccepted(e.target.checked)}
                                        className="rounded border-amber-400 text-amber-600 focus:ring-amber-500"
                                    />
                                    <span className="text-xs font-bold text-amber-900">I understand the risk and wish to proceed with database storage.</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Settings Form - Disabled until risk accepted */}
                <div className={`space-y-4 transition-opacity ${!riskAccepted ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Service Provider</label>
                        <select 
                            value={provider} 
                            onChange={handleProviderChange}
                            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-brand-green/20 outline-none"
                        >
                            <option value="smtp">Custom SMTP (Gmail, Outlook, etc.)</option>
                            <option value="resend">Resend.com</option>
                        </select>
                    </div>

                    {provider === 'resend' ? (
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">API Key</label>
                            <input 
                                type="password" 
                                name="apiKey" 
                                value={smtpConfig.apiKey || ''} 
                                onChange={handleConfigInput}
                                placeholder="re_12345678..."
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm font-mono"
                            />
                            <div className="mt-4">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">From Address</label>
                                <input 
                                    type="email" 
                                    name="from" 
                                    value={smtpConfig.from || ''} 
                                    onChange={handleConfigInput}
                                    placeholder="onboarding@resend.dev"
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Host</label>
                                    <input type="text" name="host" value={smtpConfig.host || ''} onChange={handleConfigInput} placeholder="smtp.example.com" className="w-full border border-gray-300 rounded p-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Port</label>
                                    <input type="number" name="port" value={smtpConfig.port || ''} onChange={handleConfigInput} placeholder="587" className="w-full border border-gray-300 rounded p-2 text-sm" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Username</label>
                                    <input type="text" name="user" value={smtpConfig.user || ''} onChange={handleConfigInput} className="w-full border border-gray-300 rounded p-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Password</label>
                                    <input type="password" name="pass" value={smtpConfig.pass || ''} onChange={handleConfigInput} className="w-full border border-gray-300 rounded p-2 text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Sender Email</label>
                                <input type="email" name="from" value={smtpConfig.from || ''} onChange={handleConfigInput} placeholder="noreply@jamboapparels.com" className="w-full border border-gray-300 rounded p-2 text-sm" />
                            </div>
                        </div>
                    )}
                </div>
             </div>
         )}

         {/* Health Check Button (Visible in both modes) */}
         <div className="pt-2 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={checkHealth} isLoading={checking} className="w-full sm:w-auto text-xs">
                {isCustomMode ? 'Test Saved Configuration' : 'Test Environment Connection'}
            </Button>
            {errorMsg && <p className="text-red-500 text-xs mt-2 font-bold">{errorMsg}</p>}
         </div>
      </div>

      {/* 2. Notification Rules */}
      <div className="bg-white shadow rounded-lg p-6 border border-gray-200 space-y-4">
        <div className="border-b pb-4">
          <h3 className="text-lg font-medium text-brand-green">Automated Rules</h3>
          <p className="text-sm text-gray-500 mt-1">Manage when emails are sent.</p>
        </div>

        <Switch 
          label="Master Switch"
          description="Turn all automated customer emails on or off."
          checked={!!settings.enableEmailNotifications}
          onChange={(val) => handleSwitchChange('enableEmailNotifications', val)}
        />
        
        <div className={`space-y-3 pl-4 border-l-2 border-gray-100 transition-opacity ${!masterSwitchEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-4 mb-2">Customer Emails</h4>
          <Switch 
            label="Welcome Email"
            description="Send to new users upon successful sign-up."
            checked={!!settings.enableEmailWelcome}
            onChange={(val) => handleSwitchChange('enableEmailWelcome', val)}
          />
          <Switch 
            label="New Order Confirmation"
            description="Send to customers after they complete a purchase."
            checked={!!settings.enableEmailNewOrder}
            onChange={(val) => handleSwitchChange('enableEmailNewOrder', val)}
          />
          <Switch 
            label="Order Shipped Notification"
            description="Send when an order's status is updated to 'Shipped'."
            checked={!!settings.enableEmailOrderShipped}
            onChange={(val) => handleSwitchChange('enableEmailOrderShipped', val)}
          />
          
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-6 mb-2">Admin Alerts</h4>
          <Switch 
            label="New Sale Alert"
            description="Notify admin via email when a new order is placed."
            checked={!!settings.enableEmailAdminNewOrder}
            onChange={(val) => handleSwitchChange('enableEmailAdminNewOrder', val)}
          />
          <Switch 
            label="Contact Form Alert"
            description="Notify admin when a new contact form message is received."
            checked={!!settings.enableEmailContactAdmin}
            onChange={(val) => handleSwitchChange('enableEmailContactAdmin', val)}
          />
        </div>
      </div>

      {/* 3. Marketing */}
      <div className="bg-white shadow rounded-lg p-6 border border-gray-200 space-y-4">
        <div className="border-b pb-4">
          <h3 className="text-lg font-medium text-brand-green">Marketing Features</h3>
        </div>
        <Switch 
          label="Show Newsletter Signup in Footer"
          description="Display the email subscription form in the website footer."
          checked={!!settings.enableNewsletterSignup}
          onChange={(val) => handleSwitchChange('enableNewsletterSignup', val)}
        />
      </div>
    </div>
  );
};
