import React, { useState } from 'react';
import { AppSettings } from '../../../types';
import { api } from '../../../lib/db';
import { useToast } from '../../../context/ToastContext';
import { Button } from '../../ui/Button';

interface IdentitySectionProps {
  settings: AppSettings;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const IdentitySection: React.FC<IdentitySectionProps> = ({ settings, onChange }) => {
  const { showToast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      showToast('File too large (max 5MB)', 'error');
      return;
    }

    setUploading(true);
    try {
      const publicUrl = await api.uploadImage(file);
      // Manually trigger an onChange event compatible structure or call a specialized prop
      // Since IdentitySection follows the pattern of name-value, we construct a mock event
      const mockEvent = {
        target: {
          name: 'heroBannerImage',
          value: publicUrl
        }
      } as React.ChangeEvent<HTMLInputElement>;
      
      onChange(mockEvent);
      showToast('Hero banner updated', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to upload hero image', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6 border border-gray-200 space-y-4">
        <h3 className="text-lg font-medium border-b pb-2 text-brand-green">Identity & Branding</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Primary Slogan</label>
            <input type="text" name="slogan" value={settings.slogan} onChange={onChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900 focus:ring-brand-green" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Secondary Slogan</label>
            <input type="text" name="secondarySlogan" value={settings.secondarySlogan} onChange={onChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900 focus:ring-brand-green" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Mission Statement</label>
          <textarea name="mission" value={settings.mission} onChange={onChange} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900 focus:ring-brand-green" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Vision</label>
          <textarea name="vision" value={settings.vision} onChange={onChange} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900 focus:ring-brand-green" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Core Values</label>
          <input type="text" name="coreValues" value={settings.coreValues} onChange={onChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900 focus:ring-brand-green" />
        </div>
        
        <div className="pt-4 border-t border-slate-100">
          <label className="block text-sm font-bold text-slate-800 mb-2">Hero Banner Asset</label>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
             <div className="flex-1 w-full space-y-2">
                <input 
                  type="text" 
                  name="heroBannerImage" 
                  value={settings.heroBannerImage || ''} 
                  onChange={onChange} 
                  placeholder="https://images.unsplash.com/..."
                  className="block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-brand-green" 
                />
                <div className="relative group w-full sm:w-48 aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                   {settings.heroBannerImage ? (
                      <img src={settings.heroBannerImage} alt="Hero Preview" className="w-full h-full object-cover" />
                   ) : (
                      <div className="flex items-center justify-center h-full text-slate-300">
                         <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                   )}
                </div>
             </div>
             <div className="relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleHeroUpload} 
                  disabled={uploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                />
                <Button type="button" variant="outline" isLoading={uploading} className="whitespace-nowrap rounded-xl">
                  {uploading ? 'Processing...' : 'Upload Hero Image'}
                </Button>
             </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Hero Text Overlay</label>
            <input type="text" name="heroBannerText" value={settings.heroBannerText || ''} onChange={onChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-brand-green" />
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 border border-gray-200 space-y-4">
        <div className="flex items-center gap-2 border-b pb-2">
           <h3 className="text-lg font-medium text-brand-green">Global SEO (Search Optimization)</h3>
           <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Public</span>
        </div>
        <p className="text-xs text-gray-500 mb-4">These settings control how your homepage appears in Google search results and when shared on social media like WhatsApp, Facebook, and iMessage.</p>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">SEO Meta Title</label>
          <input 
            type="text" 
            name="seoTitle" 
            value={settings.seoTitle || ''} 
            onChange={onChange} 
            placeholder="e.g. Jambo Apparels | Faith-Inspired Clothing & Christian Hoodies"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900 focus:ring-brand-green" 
          />
          <p className="text-[10px] text-gray-400 mt-1 italic">Optimal length: 50-60 characters.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">SEO Meta Description</label>
          <textarea 
            name="seoDescription" 
            value={settings.seoDescription || ''} 
            onChange={onChange} 
            rows={2} 
            placeholder="A compelling summary of your brand for search engines..."
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900 focus:ring-brand-green" 
          />
          <p className="text-[10px] text-gray-400 mt-1 italic">Optimal length: 150-160 characters.</p>
        </div>
      </div>
    </div>
  );
};