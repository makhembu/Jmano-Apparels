
import React, { useState } from 'react';
import { AppSettings } from '../../../types';
import { api } from '../../../lib/db';
import { useToast } from '../../../context/ToastContext';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';

interface IdentitySectionProps {
  settings: AppSettings;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onImageSave?: (fieldName: string, url: string) => Promise<void>;
}

export const IdentitySection: React.FC<IdentitySectionProps> = ({ settings, onChange, onImageSave }) => {
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
        target: { name: fieldName, value: publicUrl }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(mockEvent);

      if (onImageSave) {
        await onImageSave(fieldName, publicUrl);
        showToast('Image saved', 'success');
      } else {
        showToast('Image uploaded — click Save to apply', 'success');
      }
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
           <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">App Logo</label>
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
                 <Input 
                   type="text" 
                   name="logoImage" 
                   value={settings.logoImage || ''} 
                   onChange={onChange} 
                   placeholder="https://..."
                   fullWidth
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
                 <Button type="button" variant="outline" isLoading={uploading} className="whitespace-nowrap h-12 text-xs">
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
          <Input 
            label="Primary Slogan" 
            name="slogan" 
            value={settings.slogan} 
            onChange={onChange} 
          />
          <Input 
            label="Secondary Slogan" 
            name="secondarySlogan" 
            value={settings.secondarySlogan} 
            onChange={onChange} 
          />
        </div>
        <Textarea 
          label="Mission Statement" 
          name="mission" 
          value={settings.mission} 
          onChange={onChange} 
          rows={3} 
        />
        <Textarea 
          label="Vision" 
          name="vision" 
          value={settings.vision} 
          onChange={onChange} 
          rows={3} 
        />
        <Input 
          label="Core Values List" 
          name="coreValues" 
          value={settings.coreValues} 
          onChange={onChange} 
          placeholder="Honesty, Excellence, Boldness {H.E.B.}"
        />
        
        <div className="pt-4 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Hero Banner Asset</label>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
             <div className="flex-1 w-full space-y-2">
                <Input 
                  type="text" 
                  name="heroBannerImage" 
                  value={settings.heroBannerImage || ''} 
                  onChange={onChange} 
                  placeholder="https://images.unsplash.com/..."
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
                <Button type="button" variant="outline" isLoading={uploading} className="whitespace-nowrap h-12 rounded-xl">
                  {uploading ? 'Processing...' : 'Upload Hero Image'}
                </Button>
             </div>
          </div>
          <div className="mt-4">
            <Input 
              label="Hero Text Overlay" 
              name="heroBannerText" 
              value={settings.heroBannerText || ''} 
              onChange={onChange} 
            />
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 border border-gray-200 space-y-4">
        <h3 className="text-lg font-medium border-b pb-2 text-brand-green">About Page Content</h3>
        <p className="text-sm text-gray-500 mb-4">Customize titles and descriptions on the About Us page.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Input label="Hero Tag" name="aboutHeroTag" value={settings.aboutHeroTag || ''} onChange={onChange} placeholder="Our Divine Purpose" />
             <Input label="Hero Title" name="aboutHeroTitle" value={settings.aboutHeroTitle || ''} onChange={onChange} placeholder="The Jambo Legacy" />
             
             <Input label="Founder Section Tag" name="aboutFounderTag" value={settings.aboutFounderTag || ''} onChange={onChange} placeholder="Message from the Heart" />
             <Input label="Mission Section Title" name="aboutMissionTitle" value={settings.aboutMissionTitle || ''} onChange={onChange} placeholder="The Mission" />
             
             <div className="md:col-span-2">
                <Textarea label="Mission Subtitle" name="aboutMissionBody" value={settings.aboutMissionBody || ''} onChange={onChange} rows={2} placeholder="To equip the saints..." />
             </div>
             
             <Input label="Vision Section Title" name="aboutVisionTitle" value={settings.aboutVisionTitle || ''} onChange={onChange} placeholder="The Vision" />
             <div className="md:col-span-2">
                <Textarea label="Vision Subtitle" name="aboutVisionBody" value={settings.aboutVisionBody || ''} onChange={onChange} rows={2} placeholder="A world where the Gospel..." />
             </div>
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-4">
             <h4 className="text-sm font-bold text-gray-700">Core Values Section</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Section Tag" name="aboutValuesTag" value={settings.aboutValuesTag || ''} onChange={onChange} placeholder="The Foundation" />
                <Input label="Section Title" name="aboutValuesTitle" value={settings.aboutValuesTitle || ''} onChange={onChange} placeholder="Core Values (H.E.B.)" />
                <div className="md:col-span-2">
                   <Textarea label="Section Intro" name="aboutValuesIntro" value={settings.aboutValuesIntro || ''} onChange={onChange} rows={2} />
                </div>
             </div>
             
             <div className="grid grid-cols-1 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div>
                       <Input label="Value 1 Title" name="aboutValue1Title" value={settings.aboutValue1Title || ''} onChange={onChange} placeholder="Honesty" />
                       <Textarea label="Value 1 Description" name="aboutValue1Body" value={settings.aboutValue1Body || ''} onChange={onChange} rows={4} className="mt-2" />
                   </div>
                   <div>
                       <Input label="Value 2 Title" name="aboutValue2Title" value={settings.aboutValue2Title || ''} onChange={onChange} placeholder="Excellence" />
                       <Textarea label="Value 2 Description" name="aboutValue2Body" value={settings.aboutValue2Body || ''} onChange={onChange} rows={4} className="mt-2" />
                   </div>
                   <div>
                       <Input label="Value 3 Title" name="aboutValue3Title" value={settings.aboutValue3Title || ''} onChange={onChange} placeholder="Boldness" />
                       <Textarea label="Value 3 Description" name="aboutValue3Body" value={settings.aboutValue3Body || ''} onChange={onChange} rows={4} className="mt-2" />
                   </div>
                </div>
             </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 border border-gray-200 space-y-4">
        <h3 className="text-lg font-medium border-b pb-2 text-brand-green">Founder Profile</h3>
        <p className="text-sm text-gray-500 mb-4">Manage the content displayed in the "A Word from Our Founder" section on the About Us page.</p>
        
        <div className="grid grid-cols-1 gap-4">
          <Input 
            label="Founder Name" 
            name="founderName" 
            value={settings.founderName || ''} 
            onChange={onChange} 
            placeholder="e.g. Linah Makembu"
          />
          
          <Textarea 
            label="Founder Bio" 
            name="founderBio" 
            value={settings.founderBio || ''} 
            onChange={onChange} 
            rows={6} 
            placeholder="Enter the founder's biography..."
          />

          <div>
            <Textarea 
              label="Founder Quote" 
              name="founderQuote" 
              value={settings.founderQuote || ''} 
              onChange={onChange} 
              rows={2} 
              placeholder="Guided by honesty..."
              className="italic"
            />
            <p className="text-xs text-gray-500 mt-1">Displayed as a highlighted quote under the bio.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Founder Image</label>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
               <div className="flex-1 w-full space-y-2">
                  <Input 
                    type="text" 
                    name="founderImage" 
                    value={settings.founderImage || ''} 
                    onChange={onChange} 
                    placeholder="https://..."
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
                   <Button type="button" variant="outline" isLoading={uploading} className="whitespace-nowrap h-12 rounded-xl">
                     {uploading ? 'Processing...' : 'Upload Image'}
                   </Button>
                </div>
             </div>
             <p className="text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded inline-block mt-2 font-medium">4:5 ratio recommended (e.g. 800×1000px)</p>
           </div>
        </div>
      </div>

    </div>
  );
};
