


import React, { useState, useEffect } from 'react';
import { AppSettings } from '../../../types';
import { Button } from '../../ui/Button';
import { SettingsService } from '../../../lib/services/content';
import { api } from '../../../lib/db';
import { useToast } from '../../../context/ToastContext';
import { Switch } from '../../ui/Switch';
import { Input } from '../../ui/Input';

interface NotificationSectionProps {
  settings: AppSettings;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export const NotificationSection: React.FC<NotificationSectionProps> = ({ settings, onChange }) => {
  const { showToast } = useToast();
  
  // Local state for Resend Config inputs
  const [resendApiKey, setResendApiKey] = useState(settings.resendApiKey || '');
  const [resendFromEmail, setResendFromEmail] = useState(settings.resendFromEmail || '');
  
  // UI States
  const [checking, setChecking] = useState(false);
  const [healthStatus, setHealthStatus] = useState<'idle' | 'ok' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [showKey, setShowKey] = useState(false);

  // Modal State
  const [showTestModal, setShowTestModal] = useState(false);
  const [testEmailInput, setTestEmailInput] = useState('');

  useEffect(() => {
    if (settings.resendApiKey) setResendApiKey(settings.resendApiKey);
    if (settings.resendFromEmail) setResendFromEmail(settings.resendFromEmail);
  }, [settings.resendApiKey, settings.resendFromEmail]);

  const handleResendChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'resendApiKey') setResendApiKey(value);
    if (name === 'resendFromEmail') setResendFromEmail(value);
    
    // Propagate to parent
    onChange(e);
    setHealthStatus('idle');
  };

  const openHealthCheckModal = () => {
    setTestEmailInput(settings.contactEmail || '');
    setShowTestModal(true);
    setErrorMsg('');
    setHealthStatus('idle');
  };

  const executeHealthCheck = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent bubbling to parent form
    
    if (!testEmailInput) {
      showToast('Please enter a recipient email', 'error');
      return;
    }

    setChecking(true);
    setHealthStatus('idle');
    setErrorMsg('');

    try {
      // Pass the CURRENT local values (resendApiKey, resendFromEmail) to test BEFORE saving
      const result = await api.checkEmailHealth(testEmailInput, resendApiKey, resendFromEmail);
      
      if (result.success) {
        setHealthStatus('ok');
        showToast('Resend configuration verified! Test email sent.', 'success');
        setShowTestModal(false);
      } else {
        setHealthStatus('error');
        setErrorMsg(result.message || 'Configuration failed.');
        showToast('Health check failed.', 'error');
      }
    } catch (e: any) {
      setHealthStatus('error');
      setErrorMsg(e.message || 'An unexpected error occurred during the check.');
      showToast('Health check encountered an error.', 'error');
    } finally {
      setChecking(false);
    }
  };

  const masterSwitchEnabled = settings.enableEmailNotifications ?? false;

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
      {/* 1. Resend Config */}
      <div className="bg-white shadow rounded-lg p-6 border border-gray-200 space-y-6">
        <div className="border-b pb-4 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-brand-green">Email Infrastructure (Resend)</h3>
            <p className="text-sm text-gray-500 mt-1">Configure your transactional email provider.</p>
          </div>
          <div className="flex items-center gap-2">
            {healthStatus === 'ok' && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold flex items-center gap-1">
                Healthy
              </span>
            )}
            {healthStatus === 'error' && (
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-bold flex items-center gap-1">
                Error
              </span>
            )}
          </div>
        </div>

        <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4 animate-fade-in">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Resend API Key</label>
                  <div className="relative">
                    <input 
                        type={showKey ? "text" : "password"} 
                        name="resendApiKey" 
                        value={resendApiKey} 
                        onChange={handleResendChange} 
                        placeholder="re_12345678..." 
                        className="w-full border border-gray-300 rounded p-2 pr-10 text-sm font-mono" 
                    />
                    <button type="button" onClick={() => setShowKey(!showKey)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                        {showKey ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Get your key from <a href="https://resend.com/api-keys" target="_blank" rel="noreferrer" className="text-brand-green hover:underline">Resend Dashboard</a>.</p>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">From Email</label>
                  <input 
                    type="email" 
                    name="resendFromEmail" 
                    value={resendFromEmail} 
                    onChange={handleResendChange} 
                    placeholder="onboarding@resend.dev" 
                    className="w-full border border-gray-300 rounded p-2 text-sm" 
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Must be a verified domain in Resend. Use 'onboarding@resend.dev' for testing if you don't have a domain.</p>
                </div>
            </div>
        </div>

        <div className="pt-2 border-t border-gray-100">
          <Button 
            id="btn-test-config"
            type="button" 
            variant="secondary" 
            onClick={openHealthCheckModal} 
            className="w-full sm:w-auto text-xs font-bold uppercase tracking-wide"
          >
            Test Configuration
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

      {/* 2. WhatsApp Config */}
      <div className="bg-white shadow rounded-lg p-6 border border-gray-200 space-y-6">
        <div className="border-b pb-4">
          <h3 className="text-lg font-medium text-green-600 flex items-center gap-2">
             <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.894-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.017-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
             WhatsApp Business API
          </h3>
          <p className="text-sm text-gray-500 mt-1">Configure Meta credentials to send order updates to WhatsApp.</p>
        </div>

        <Switch 
            label="Enable WhatsApp Notifications"
            description="Send templated messages to customers and admins."
            checked={!!settings.enableWhatsappNotifications}
            onChange={(val) => handleSwitchChange('enableWhatsappNotifications', val)}
        />

        <div className={`space-y-4 pl-4 border-l-2 border-green-100 ${!settings.enableWhatsappNotifications ? 'opacity-50 pointer-events-none' : ''}`}>
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Access Token</label>
                <input 
                    type="password" 
                    name="whatsappAccessToken" 
                    value={settings.whatsappAccessToken || ''} 
                    onChange={onChange} 
                    className="w-full border border-gray-300 rounded p-2 text-sm font-mono"
                    placeholder="EAAYY..."
                />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <Input label="Phone Number ID" name="whatsappPhoneNumberId" value={settings.whatsappPhoneNumberId || ''} onChange={onChange} placeholder="1234567890" />
                 <Input label="Business Account ID" name="whatsappBusinessAccountId" value={settings.whatsappBusinessAccountId || ''} onChange={onChange} placeholder="10987654321" />
             </div>
             <div>
                 <Input label="Admin Phone Number" name="adminPhoneNumber" value={settings.adminPhoneNumber || ''} onChange={onChange} placeholder="447938065718" />
                 <p className="text-[10px] text-gray-400 mt-1">Number to receive admin alerts (Must include country code, e.g., 44...)</p>
             </div>
        </div>
      </div>

      {/* 3. Automated Rules */}
      <div className="bg-white shadow rounded-lg p-6 border border-gray-200 space-y-4">
        <div className="border-b pb-4">
          <h3 className="text-lg font-medium text-brand-green">Automated Rules</h3>
          <p className="text-sm text-gray-500 mt-1">Manage exactly when emails are triggered.</p>
        </div>

        <Switch 
          label="Master Switch" 
          description="Turn ALL automated emails on or off instantly." 
          checked={!!settings.enableEmailNotifications} 
          onChange={(val) => handleSwitchChange('enableEmailNotifications', val)} 
        />
        
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 pl-4 border-l-2 border-gray-100 transition-opacity ${!masterSwitchEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
          
          {/* Customer Emails */}
          <div className="space-y-4">
              <h4 className="text-xs font-black text-brand-dark uppercase tracking-widest mt-2 mb-4 border-b border-gray-100 pb-2">Customer Order Updates</h4>
              <Switch label="Welcome Email" description="New user sign up." checked={!!settings.enableEmailWelcome} onChange={(val) => handleSwitchChange('enableEmailWelcome', val)} />
              <Switch label="Order Confirmation" description="Purchase successful." checked={!!settings.enableEmailNewOrder} onChange={(val) => handleSwitchChange('enableEmailNewOrder', val)} />
              <Switch label="Processing Update" description="Status changed to 'Processing'." checked={!!settings.enableEmailOrderProcessing} onChange={(val) => handleSwitchChange('enableEmailOrderProcessing', val)} />
              <Switch label="Shipped Notification" description="Status changed to 'Shipped'." checked={!!settings.enableEmailOrderShipped} onChange={(val) => handleSwitchChange('enableEmailOrderShipped', val)} />
              <Switch label="Order Cancelled" description="Order cancelled." checked={!!settings.enableEmailOrderCancelled} onChange={(val) => handleSwitchChange('enableEmailOrderCancelled', val)} />
              <Switch label="Refund Issued" description="Refund processed." checked={!!settings.enableEmailOrderRefunded} onChange={(val) => handleSwitchChange('enableEmailOrderRefunded', val)} />
          </div>

          <div className="space-y-4">
              <h4 className="text-xs font-black text-brand-dark uppercase tracking-widest mt-2 mb-4 border-b border-gray-100 pb-2">Returns & Support</h4>
              <Switch label="Return Requested" description="Confirm receipt of return request." checked={!!settings.enableEmailReturnRequested} onChange={(val) => handleSwitchChange('enableEmailReturnRequested', val)} />
              <Switch label="Return Approved" description="Instructions sent to customer." checked={!!settings.enableEmailReturnApproved} onChange={(val) => handleSwitchChange('enableEmailReturnApproved', val)} />
              <Switch label="Return Rejected" description="Return denied notification." checked={!!settings.enableEmailReturnRejected} onChange={(val) => handleSwitchChange('enableEmailReturnRejected', val)} />
              <div className="h-px bg-gray-100 my-2"></div>
              <Switch label="Contact Auto-Reply" description="Confirm receipt of contact form." checked={!!settings.enableEmailContactAutoreply} onChange={(val) => handleSwitchChange('enableEmailContactAutoreply', val)} />
              <Switch label="Newsletter Welcome" description="Sent after subscription." checked={!!settings.enableEmailNewsletterWelcome} onChange={(val) => handleSwitchChange('enableEmailNewsletterWelcome', val)} />
          </div>

          {/* Admin Alerts */}
          <div className="md:col-span-2 space-y-4 mt-2">
              <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 bg-gray-50 p-2 rounded">Internal Admin Alerts</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Switch label="New Sale Alert" description="Notify admin of new orders." checked={!!settings.enableEmailAdminNewOrder} onChange={(val) => handleSwitchChange('enableEmailAdminNewOrder', val)} />
                  <Switch label="Contact Form Alert" description="New contact message received." checked={!!settings.enableEmailContactAdmin} onChange={(val) => handleSwitchChange('enableEmailContactAdmin', val)} />
                  <Switch label="Return Alert" description="New return request submitted." checked={!!settings.enableEmailAdminReturnAlert} onChange={(val) => handleSwitchChange('enableEmailAdminReturnAlert', val)} />
              </div>
          </div>
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
              <p className="text-sm text-slate-500 mt-1">Verify that your Resend settings are working correctly.</p>
            </div>
            {/* Replaced form with div to prevent nesting in parent form */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Recipient Email</label>
                <input
                  type="email"
                  required
                  value={testEmailInput}
                  onChange={(e) => setTestEmailInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        executeHealthCheck(e);
                    }
                  }}
                  className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-green/20 outline-none"
                  placeholder="you@example.com"
                />
              </div>
              <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700 leading-relaxed border border-blue-100">
                This will send a generic test email using the credentials entered above (unsaved changes included).
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowTestModal(false)} disabled={checking}>
                  Cancel
                </Button>
                {/* Changed to type='button' with onClick handler */}
                <Button type="button" onClick={executeHealthCheck} isLoading={checking}>
                  Send Test Email
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
