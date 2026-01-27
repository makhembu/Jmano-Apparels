import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { IdentitySection } from '../../components/admin/settings/IdentitySection';
import { BlogCategoriesSection } from '../../components/admin/settings/BlogCategoriesSection';
import { ContactSection } from '../../components/admin/settings/ContactSection';
import { SocialSection } from '../../components/admin/settings/SocialSection';
import { SystemSection } from '../../components/admin/settings/SystemSection';
import { PolicySection } from '../../components/admin/settings/PolicySection';
import { useToast } from '../../context/ToastContext';
import { NotificationSection } from '../../components/admin/settings/NotificationSection';
import { EmailTemplatesSection } from '../../components/admin/settings/EmailTemplatesSection';
import { PaymentSection } from '../../components/admin/settings/PaymentSection';

type SettingsTab = 'brand' | 'payments' | 'emails' | 'contact' | 'content' | 'system';

export const AdminAppSettings: React.FC = () => {
  const { settings, updateSettings } = useApp();
  const { showToast } = useToast();
  const [formData, setFormData] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>('brand');

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Map frontend camelCase to DB snake_case for custom payment fields if not handled by mapper
      const payload: any = { ...formData };
      
      // Explicitly map PayPal fields if the updateSettings doesn't handle them automatically 
      // (Depends on if updateSettings uses the raw DB column names. 
      //  Assuming Mappers.toAppSettings handled READ, we need to ensure WRITE maps back or AppSettings matches DB columns)
      // For this implementation, we assume `updateSettings` in `ShopContext` handles the mapping or we rely on explicit keys.
      // Ideally the Service handles the mapping back to snake_case.
      // Given the `SettingsService.update` implementation, we need to ensure we pass the correct keys.
      // Let's modify the SettingsService update method implicitly or just rely on it accepting the full object.
      // The current `SettingsService.update` maps specific fields manually. We need to update that file too or pass these as special overrides.
      
      // We will rely on `SettingsService` being updated to handle `paypal_*` fields.
      
      await updateSettings(payload);
      showToast('Settings updated successfully', 'success');
    } catch (e) {
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const TabButton = ({ id, label }: { id: SettingsTab; label: string }) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`py-4 px-6 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
        activeTab === id 
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
         <Button type="submit" form="app-settings-form" isLoading={saving} variant="primary">Save Configuration</Button>
      </div>
      
      {/* Tabs Header */}
      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto no-scrollbar">
        <TabButton id="brand" label="Brand & SEO" />
        <TabButton id="payments" label="Payments" />
        <TabButton id="emails" label="Notifications" />
        <TabButton id="contact" label="Contact & Social" />
        <TabButton id="content" label="Content & Legal" />
        <TabButton id="system" label="System" />
      </div>
      
      <form id="app-settings-form" onSubmit={handleSubmit} className="space-y-6">
        
        {/* TAB: Brand & SEO */}
        {activeTab === 'brand' && (
          <div className="animate-fade-in">
            <IdentitySection settings={formData} onChange={handleChange} />
          </div>
        )}

        {/* TAB: Payments */}
        {activeTab === 'payments' && (
          <div className="animate-fade-in">
            <PaymentSection settings={formData} onChange={handleChange} />
          </div>
        )}
        
        {/* TAB: Notifications */}
        {activeTab === 'emails' && (
          <div className="space-y-8 animate-fade-in">
             <NotificationSection settings={formData} onChange={handleChange} />
             <div className="border-t border-gray-100 pt-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4 px-1">Message Templates</h3>
                <EmailTemplatesSection />
             </div>
          </div>
        )}

        {/* TAB: Contact & Social */}
        {activeTab === 'contact' && (
          <div className="space-y-6 animate-fade-in">
            <ContactSection 
              settings={formData} 
              onChange={handleChange} 
              onHoursChange={(hours) => setFormData(prev => ({ ...prev, businessHours: hours }))} 
            />
            <SocialSection 
              settings={formData} 
              onSocialChange={(socials) => setFormData(prev => ({ ...prev, socialLinks: socials }))} 
            />
          </div>
        )}

        {/* TAB: Content & Legal */}
        {activeTab === 'content' && (
          <div className="space-y-8 animate-fade-in">
            <BlogCategoriesSection />
            <div className="border-t border-gray-100 pt-8">
               <PolicySection settings={formData} onChange={handleChange} />
            </div>
          </div>
        )}

        {/* TAB: System */}
        {activeTab === 'system' && (
          <div className="animate-fade-in">
            <SystemSection 
              settings={formData} 
              onChange={handleChange} 
              onSmtpChange={(smtp) => setFormData(prev => ({ ...prev, smtpSettings: smtp }))} 
            />
          </div>
        )}

      </form>
    </div>
  );
};
