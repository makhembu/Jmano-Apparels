
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
  const [showPassword, setShowPassword] = useState(false);

  // Modal State
  const [showTestModal, setShowTestModal] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  useEffect(() => {
    if (settings.emailProvider) setProvider(settings.emailProvider);
    if (settings.smtpSettings) {
      setSmtpConfig(settings.smtpSettings);
      if (settings.smtpSettings.mode === 'custom') {
        setRiskAccepted(true);
      }
    }
  }, [settings]);

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
    if (mode === 'env') {
      setRiskAccepted(false);
      setHealthStatus('idle');
      setErrorMsg('');
    }
  };

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as 'smtp' | 'resend';
    setProvider(val);
    updateParent(smtpConfig, val);
    setHealthStatus('idle');
  };

  const handleConfigInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newConfig = { ...smtpConfig, [name]: value };
    updateParent(newConfig);
    setHealthStatus('idle');
  };

  const openHealthCheckModal = () => {
    setTestEmail(settings.contactEmail || '');
    setShowTestModal(true);
    setErrorMsg('');
    setHealthStatus('idle');
  };

  const executeHealthCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail) {
      showToast('Please enter a recipient email', 'error');
      return;
    }

    console.log("[NotificationSection] Health check initiated...");
    setChecking(true);
    setHealthStatus('idle');
    setErrorMsg('');

    try {
      // Determine effective mode
      const isCustom = smtpConfig.mode === 'custom';
      
      const configPayload = {
        mode: isCustom ? 'custom' : 'env',
        provider: provider,
        // Only include custom fields if in custom mode to avoid pollution
        ...(isCustom ? {
            ...smtpConfig,
            port: smtpConfig.port ? parseInt(String(smtpConfig.port), 10) : 465
        } : {})
      };

      console.log("[NotificationSection] Sending test payload:", JSON.stringify(configPayload, null, 2));
      const result = await settingsService.checkEmailHealth(testEmail, configPayload);
      
      if (result.success) {
        setHealthStatus('ok');
        showToast(result.message || 'System is healthy! Test email sent.', 'success');
        setShowTestModal(false);
      } else {
        setHealthStatus('error');
        setErrorMsg(result.message || 'Configuration failed.');
        showToast('Health check failed.', 'error');
      }
    } catch (e: any) {
      console.error("[NotificationSection] Fatal check error:", e);
      setHealthStatus('error');
      setErrorMsg(e.message || 'An unexpected error occurred during the check.');
      showToast('Health check encountered an error.', 'error');
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
    <div className="space-y-6 relative">
      <div className="bg-white shadow rounded-lg p-6 border border-gray-200 space-y-6">
        <div className="border-b pb-4 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-brand-green">Email Infrastructure</h3>
            <p className="text-sm text-gray-500 mt-1">Configure how your shop sends emails.</p>
          </div>
          <div className="flex items-center gap-2">
            {healthStatus === 'ok' && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Healthy
              </span>
            )}
            {healthStatus === 'error' && (
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-bold flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Error
              </span>
            )}
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Configuration Source</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleModeChange('env')}
              className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                !isCustomMode 
                  ? 'border-brand-green bg-white shadow-sm' 
                  : 'border-slate-200 bg-slate-100 opacity-70 hover:opacity-100'
              }`}
            >
              <svg className="w-6 h-6 text-slate-700 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-sm font-bold text-slate-900">Environment Variables</span>
              <span className="text-[10px] text-green-600 font-medium mt-1">Recommended (Secure)</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeChange('custom')}
              className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                isCustomMode 
                  ? 'border-brand-green bg-white shadow-sm' 
                  : 'border-slate-200 bg-slate-100 opacity-70 hover:opacity-100'
              }`}
            >
              <svg className="w-6 h-6 text-slate-700 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
              <span className="text-sm font-bold text-slate-900">App Settings</span>
              <span className="text-[10px] text-amber-600 font-medium mt-1">Database Storage (Custom)</span>
            </button>
          </div>
        </div>

        {isCustomMode && (
          <div className="space-y-6">
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-amber-800">Security Risk Warning</h3>
                  <div className="mt-2 text-xs text-amber-700">
                    <p>Storing SMTP credentials in the database makes them visible to any Admin user. Environment Variables are recommended.</p>
                  </div>
                  <div className="mt-4">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={riskAccepted} 
                        onChange={e => setRiskAccepted(e.target.checked)}
                        className="mt-0.5 rounded border-amber-400 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-xs font-bold text-amber-900">I understand the risk and wish to proceed.</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className={`space-y-4 transition-opacity ${!riskAccepted ? 'opacity-50 pointer-events-none' : ''}`}>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Service Provider</label>
                <select value={provider} onChange={handleProviderChange} disabled={!riskAccepted} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-brand-green/20 outline-none">
                  <option value="smtp">Custom SMTP</option>
                  <option value="resend">Resend.com</option>
                </select>
              </div>

              {provider === 'resend' ? (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">API Key</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} name="apiKey" value={smtpConfig.apiKey || ''} onChange={handleConfigInput} placeholder="re_..." disabled={!riskAccepted} className="w-full border border-gray-300 rounded-lg p-2 pr-10 text-sm font-mono" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                        {showPassword ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">From Address</label>
                    <input type="email" name="from" value={smtpConfig.from || ''} onChange={handleConfigInput} placeholder="onboarding@resend.dev" disabled={!riskAccepted} className="w-full border border-gray-300 rounded-lg p-2 text-sm" />
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Host</label>
                      <input type="text" name="host" value={smtpConfig.host || ''} onChange={handleConfigInput} placeholder="smtp.example.com" disabled={!riskAccepted} className="w-full border border-gray-300 rounded p-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Port</label>
                      <input type="number" name="port" value={smtpConfig.port || ''} onChange={handleConfigInput} placeholder="587" disabled={!riskAccepted} className="w-full border border-gray-300 rounded p-2 text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Username</label>
                      <input type="text" name="user" value={smtpConfig.user || ''} onChange={handleConfigInput} disabled={!riskAccepted} className="w-full border border-gray-300 rounded p-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Password</label>
                      <div className="relative">
                        <input type={showPassword ? "text" : "password"} name="pass" value={smtpConfig.pass || ''} onChange={handleConfigInput} disabled={!riskAccepted} className="w-full border border-gray-300 rounded p-2 pr-10 text-sm" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                          {showPassword ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Sender Email</label>
                    <input type="email" name="from" value={smtpConfig.from || ''} onChange={handleConfigInput} placeholder="noreply@jamboapparels.com" disabled={!riskAccepted} className="w-full border border-gray-300 rounded p-2 text-sm" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-gray-100">
          <Button 
            id="btn-test-config"
            type="button" 
            variant="secondary" 
            onClick={openHealthCheckModal} 
            className="w-full sm:w-auto text-xs font-bold uppercase tracking-wide"
          >
            {isCustomMode ? 'Test Configuration' : 'Test Environment Connection'}
          </Button>
          {errorMsg && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
              <p className="text-red-700 text-xs font-medium flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {errorMsg}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 border border-gray-200 space-y-4">
        <div className="border-b pb-4">
          <h3 className="text-lg font-medium text-brand-green">Automated Rules</h3>
          <p className="text-sm text-gray-500 mt-1">Manage when emails are sent.</p>
        </div>

        <Switch label="Master Switch" description="Turn all automated customer emails on or off." checked={!!settings.enableEmailNotifications} onChange={(val) => handleSwitchChange('enableEmailNotifications', val)} />
        
        <div className={`space-y-3 pl-4 border-l-2 border-gray-100 transition-opacity ${!masterSwitchEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-4 mb-2">Customer Emails</h4>
          <Switch label="Welcome Email" description="Send to new users upon successful sign-up." checked={!!settings.enableEmailWelcome} onChange={(val) => handleSwitchChange('enableEmailWelcome', val)} />
          <Switch label="New Order Confirmation" description="Send to customers after they complete a purchase." checked={!!settings.enableEmailNewOrder} onChange={(val) => handleSwitchChange('enableEmailNewOrder', val)} />
          <Switch label="Order Shipped Notification" description="Send when an order's status is updated to 'Shipped'." checked={!!settings.enableEmailOrderShipped} onChange={(val) => handleSwitchChange('enableEmailOrderShipped', val)} />
          
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-6 mb-2">Admin Alerts</h4>
          <Switch label="New Sale Alert" description="Notify admin via email when a new order is placed." checked={!!settings.enableEmailAdminNewOrder} onChange={(val) => handleSwitchChange('enableEmailAdminNewOrder', val)} />
          <Switch label="Contact Form Alert" description="Notify admin when a new contact form message is received." checked={!!settings.enableEmailContactAdmin} onChange={(val) => handleSwitchChange('enableEmailContactAdmin', val)} />
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 border border-gray-200 space-y-4">
        <div className="border-b pb-4">
          <h3 className="text-lg font-medium text-brand-green">Marketing Features</h3>
        </div>
        <Switch label="Show Newsletter Signup in Footer" description="Display the email subscription form in the website footer." checked={!!settings.enableNewsletterSignup} onChange={(val) => handleSwitchChange('enableNewsletterSignup', val)} />
      </div>

      {/* Health Check Modal */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-brand-dark">Test Email Configuration</h3>
              <p className="text-sm text-slate-500 mt-1">Verify that your email settings are working correctly.</p>
            </div>
            <form onSubmit={executeHealthCheck} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Recipient Email</label>
                <input
                  type="email"
                  required
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-green/20 outline-none"
                  placeholder="you@example.com"
                />
              </div>
              <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700 leading-relaxed border border-blue-100">
                This will attempt to send a generic test email using the credentials provided above. 
                {isCustomMode ? " It will use the custom values you've entered." : " It will use the server-side Environment Variables."}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowTestModal(false)} disabled={checking}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={checking}>
                  Send Test Email
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
