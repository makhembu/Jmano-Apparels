
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
      const result = await settingsService.checkEmailHealth(testEmailInput, resendApiKey, resendFromEmail);
      
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
