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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'heroBannerImage' | 'founderImage' | 'logoImage') => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      showToast('File too large (max 5MB)', 'error');
      return;
    }

    setUploading(true);
    try {
      const publicUrl = await api.uploadImage(file);
      const mockEvent = {
        target: {
          name: fieldName,
          value: publicUrl
        }
      } as React.ChangeEvent<HTMLInputElement>;
      
      onChange(mockEvent);
      showToast('Image updated', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to upload image', 'error');
    } finally {
      setUploading(false);
    }
  };

  const defaultTitle = "Jambo Apparels | Faith-Based Apparel";
  const defaultDesc = "Wear your scriptures in Humility and Boldness. Explore our curated collections of faith-inspired clothing.";

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6 border border-gray-200 space-y-4">
        <h3 className="text-lg font-medium border-b pb-2 text-brand-green">Identity & Branding</h3>
        
        {/* LOGO SECTION */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
           <label className="block text-sm font-bold text-slate-800 mb-2">App Logo</label>
           <div className="flex flex-col sm:flex-row gap-4 items-center">
              {/* Expanded container for wide logos */}
              <div className="flex-shrink-0 min-w-[120px] max-w-[200px] h-20 bg-white rounded-lg border border-slate-200 flex items-center justify-center p-2 overflow-hidden">
                 {settings.logoImage ? (
                    <img src={settings.logoImage} alt="App Logo" className="h-full w-full object-contain" />
                 ) : (
                    <span className="text-xs text-slate-300">No Logo</span>
                 )}
              </div>
              <div className="flex-1 w-full">
                 <input 
                   type="text" 
                   name="logoImage" 
                   value={settings.logoImage || ''} 
                   onChange={onChange} 
                   placeholder="https://..."
                   className="block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 text-sm focus:ring-brand-green" 
                 />
              </div>
              <div className="relative">
                 <input 
                   type="file" 
                   accept="image/*" 
                   onChange={(e) => handleImageUpload(e, 'logoImage')} 
                   disabled={uploading}
                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                 />
                 <Button type="button" variant="outline" isLoading={uploading} className="whitespace-nowrap h-10 text-xs">
                   Upload
                 </Button>
              </div>
           </div>
           <p className="text-[10px] text-slate-400 mt-2 italic">
              <strong>Recommendation:</strong> Use a transparent PNG or SVG. 
              Ideal height: <strong>150px</strong> (e.g. 600x150px) for best resolution on Retina screens.
           </p>
        </div>

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
                  onChange={(e) => handleImageUpload(e, 'heroBannerImage')} 
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
        <h3 className="text-lg font-medium border-b pb-2 text-brand-green">Founder Profile</h3>
        <p className="text-sm text-gray-500 mb-4">Manage the content displayed in the "A Word from Our Founder" section on the About Us page.</p>
        
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Founder Name</label>
            <input 
              type="text" 
              name="founderName" 
              value={settings.founderName || ''} 
              onChange={onChange} 
              placeholder="e.g. Linah Makembu"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900 focus:ring-brand-green" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Founder Bio</label>
            <textarea 
              name="founderBio" 
              value={settings.founderBio || ''} 
              onChange={onChange} 
              rows={6} 
              placeholder="Enter the founder's biography..."
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900 focus:ring-brand-green" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Founder Quote</label>
            <textarea 
              name="founderQuote" 
              value={settings.founderQuote || ''} 
              onChange={onChange} 
              rows={2} 
              placeholder="Guided by honesty..."
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900 focus:ring-brand-green italic" 
            />
            <p className="text-xs text-gray-500 mt-1">Displayed as a highlighted quote under the bio.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Founder Image</label>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
               <div className="flex-1 w-full space-y-2">
                  <input 
                    type="text" 
                    name="founderImage" 
                    value={settings.founderImage || ''} 
                    onChange={onChange} 
                    placeholder="https://..."
                    className="block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-brand-green" 
                  />
                  <div className="relative group w-32 aspect-[4/5] rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                     {settings.founderImage ? (
                        <img src={settings.founderImage} alt="Founder Preview" className="w-full h-full object-cover" />
                     ) : (
                        <div className="flex items-center justify-center h-full text-slate-300">
                           <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        </div>
                     )}
                  </div>
               </div>
               <div className="relative">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleImageUpload(e, 'founderImage')} 
                    disabled={uploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  />
                  <Button type="button" variant="outline" isLoading={uploading} className="whitespace-nowrap rounded-xl">
                    {uploading ? 'Processing...' : 'Upload Image'}
                  </Button>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 border border-gray-200 space-y-6">
        <div className="flex items-center gap-2 border-b pb-2">
           <h3 className="text-lg font-medium text-brand-green">Global SEO (Search Optimization)</h3>
           <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Public</span>
        </div>
        <p className="text-xs text-gray-500 mb-2">These settings control how your homepage appears in Google search results and when shared on social media like WhatsApp, Facebook, and iMessage.</p>
        
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">SEO Meta Title</label>
            <input 
              type="text" 
              name="seoTitle" 
              value={settings.seoTitle || ''} 
              onChange={onChange} 
              placeholder={defaultTitle}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900 focus:ring-brand-green" 
            />
            <p className="text-[10px] text-gray-400 mt-1 italic">The headline shown in browser tabs and search results. Optimal length: 50-60 characters.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">SEO Meta Description</label>
            <textarea 
              name="seoDescription" 
              value={settings.seoDescription || ''} 
              onChange={onChange} 
              rows={2} 
              placeholder={defaultDesc}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900 focus:ring-brand-green" 
            />
            <p className="text-[10px] text-gray-400 mt-1 italic">The text snippet under the link. Optimal length: 150-160 characters.</p>
          </div>
        </div>

        {/* Previews Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6 pt-6 border-t border-gray-100">
            
            {/* Google Preview */}
            <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                  Google Search Result
                </h4>
                <div className="bg-white p-4 rounded-xl border border-gray-200 font-sans shadow-sm">
                    <div className="flex items-center gap-3 text-sm text-[#202124] mb-1">
                        <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center p-1 border border-gray-200">
                            {settings.logoImage ? (
                                <img src={settings.logoImage} alt="" className="w-full h-full object-contain" />
                            ) : (
                                <img src="https://i.imgur.com/pkaScEv.png" alt="" className="w-full h-full object-contain opacity-80" />
                            )}
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className="text-xs font-bold text-[#202124] leading-tight">Jambo Apparels</span>
                            <span className="text-[10px] leading-tight text-[#5f6368]">https://jamboapparels.com</span>
                        </div>
                    </div>
                    <h3 className="text-xl text-[#1a0dab] hover:underline cursor-pointer truncate font-normal leading-snug mb-1">
                       {settings.seoTitle || defaultTitle}
                    </h3>
                    <p className="text-sm text-[#4d5156] line-clamp-2 leading-relaxed">
                       {settings.seoDescription || defaultDesc}
                    </p>
                </div>
            </div>

            {/* Social Preview */}
            <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
                  Social Share Card
                </h4>
                <div className="bg-white rounded-lg border border-gray-300 overflow-hidden max-w-sm shadow-sm">
                    <div className="aspect-[1.91/1] bg-gray-100 w-full relative overflow-hidden flex items-center justify-center">
                        {settings.heroBannerImage ? (
                            <img src={settings.heroBannerImage} alt="Social Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center text-gray-400">
                                <svg className="w-8 h-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <span className="text-[10px] uppercase font-bold tracking-widest">Image Preview</span>
                            </div>
                        )}
                    </div>
                    <div className="p-3 bg-[#F0F2F5] border-t border-gray-200">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">JAMBOAPPARELS.COM</p>
                        <h3 className="text-sm font-bold text-gray-900 truncate mb-1">
                            {settings.seoTitle || defaultTitle}
                        </h3>
                        <p className="text-xs text-gray-600 line-clamp-1">
                            {settings.seoDescription || defaultDesc}
                        </p>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};