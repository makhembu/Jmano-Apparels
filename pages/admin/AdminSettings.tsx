
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { IdentitySection } from '../../components/admin/settings/IdentitySection';
import { ContactSection } from '../../components/admin/settings/ContactSection';
import { SocialSection } from '../../components/admin/settings/SocialSection';
import { SystemSection } from '../../components/admin/settings/SystemSection';
import { PolicySection } from '../../components/admin/settings/PolicySection';
import { useToast } from '../../context/ToastContext';
import { NotificationSection } from '../../components/admin/settings/NotificationSection';
import { EmailTemplatesSection } from '../../components/admin/settings/EmailTemplatesSection';
import { PaymentSection } from '../../components/admin/settings/PaymentSection';
import { SeoSection } from '../../components/admin/settings/SeoSection';
import { SettingsService } from '../../lib/services/content';
import { SystemLogViewer } from '../../components/admin/system/SystemLogViewer';

type SettingsTab = 'brand' | 'seo' | 'payments' | 'emails' | 'contact' | 'content' | 'system';

const settingsService = new SettingsService();

export const AdminAppSettings: React.FC = () => {
  const { settings: globalSettings, updateSettings } = useApp();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [formData, setFormData] = useState(globalSettings);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const currentTab = (searchParams.get('tab') as SettingsTab) || 'brand';

  useEffect(() => {
    // SECURITY: The global settings context only has public data.
    // We must fetch the full admin settings (with secrets) securely when mounting this admin page.
    const fetchAdminSettings = async () => {
        setLoading(true);
        try {
            const adminSettings = await settingsService.getAdminSettings();
            if (adminSettings) {
                setFormData(adminSettings);
            } else {
                setFormData(globalSettings); // Fallback if admin fetch fails (should not happen if logged in)
            }
        } catch (e) {
            console.error("Failed to load admin settings", e);
            showToast("Failed to load secure settings", "error");
        } finally {
            setLoading(false);
        }
    };
    fetchAdminSettings();
  }, []); // Run once on mount

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleTabChange = (id: SettingsTab) => {
    setSearchParams({ tab: id });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Merge locals back into main object
    const payload: any = { 
        ...formData
    };

    try {
      await updateSettings(payload);
      showToast('Settings updated successfully', 'success');
    } catch (e) {
      console.error(e);
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const TabButton = ({ id, label }: { id: SettingsTab; label: string }) => (
    <button
      id={`tab-${id}`}
      data-copilot-id={`tab-${id}`}
      type="button"
      onClick={() => handleTabChange(id)}
      className={`py-4 px-6 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
        currentTab === id 
          ? 'border-brand-green text-brand-green' 
          : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="max-w-6xl pb-20 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
         <h1 className="text-2xl font-bold font-serif text-brand-dark">App Configuration</h1>
         <Button id="btn-save-settings" data-copilot-id="btn-save-settings" type="submit" form="app-settings-form" isLoading={saving} disabled={loading} variant="primary">Save Configuration</Button>
      </div>
      
      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto no-scrollbar">
        <TabButton id="brand" label="Brand" />
        <TabButton id="seo" label="Global SEO" />
        <TabButton id="payments" label="Payments" />
        <TabButton id="emails" label="Notifications" />
        <TabButton id="contact" label="Contact & Social" />
        <TabButton id="content" label="Content & Legal" />
        <TabButton id="system" label="System" />
      </div>
      
      {loading ? (
          <div className="py-20 text-center text-slate-500">Loading secure configuration...</div>
      ) : (
          <form id="app-settings-form" onSubmit={handleSubmit} className="space-y-6">
            {currentTab === 'brand' && <IdentitySection settings={formData} onChange={handleChange} />}
            {currentTab === 'seo' && <SeoSection settings={formData} onChange={handleChange} />}
            {currentTab === 'payments' && <PaymentSection settings={formData} onChange={handleChange} />}
            {currentTab === 'emails' && (
              <div className="space-y-8 animate-fade-in">
                 <NotificationSection settings={formData} onChange={handleChange} />
                 <div className="border-t border-gray-100 pt-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 px-1">Message Templates</h3>
                    <EmailTemplatesSection />
                 </div>
              </div>
            )}
            {currentTab === 'contact' && (
              <div className="space-y-6 animate-fade-in">
                <ContactSection settings={formData} onChange={handleChange} onHoursChange={(hours) => setFormData(prev => ({ ...prev, businessHours: hours }))} />
                <SocialSection settings={formData} onSocialChange={(socials) => setFormData(prev => ({ ...prev, socialLinks: socials }))} />
              </div>
            )}
            {currentTab === 'content' && <PolicySection settings={formData} onChange={handleChange} />}
            {currentTab === 'system' && (
                <div className="space-y-12 animate-fade-in">
                    <SystemSection settings={formData} onChange={handleChange} />
                    
                    <div className="border-t border-gray-200 pt-8">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Live System Monitor</h3>
                        <SystemLogViewer />
                    </div>
                </div>
            )}
          </form>
      )}
    </div>
  );
};
