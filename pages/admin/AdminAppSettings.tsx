
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

export const AdminAppSettings: React.FC = () => {
  const { settings, updateSettings } = useApp();
  const { showToast } = useToast();
  const [formData, setFormData] = useState(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      await updateSettings(formData);
      showToast('Settings updated successfully', 'success');
    } catch (e) {
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl pb-20">
      <div className="flex justify-between items-center mb-6">
         <h1 className="text-2xl font-bold text-brand-dark">App Configuration</h1>
         <Button type="submit" form="app-settings-form" isLoading={saving} variant="primary">Save Changes</Button>
      </div>
      
      <form id="app-settings-form" onSubmit={handleSubmit} className="space-y-6">
        <IdentitySection settings={formData} onChange={handleChange} />
        <BlogCategoriesSection />
        <ContactSection 
          settings={formData} 
          onChange={handleChange} 
          onHoursChange={(hours) => setFormData(prev => ({ ...prev, businessHours: hours }))} 
        />
        <SocialSection 
          settings={formData} 
          onSocialChange={(socials) => setFormData(prev => ({ ...prev, socialLinks: socials }))} 
        />
        <SystemSection 
          settings={formData} 
          onChange={handleChange} 
          onSmtpChange={(smtp) => setFormData(prev => ({ ...prev, smtpSettings: smtp }))} 
        />
        <PolicySection settings={formData} onChange={handleChange} />
      </form>
    </div>
  );
};
