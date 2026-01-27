
import React from 'react';
import { AppSettings } from '../../../types';

interface SeoSectionProps {
  settings: AppSettings;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const SeoSection: React.FC<SeoSectionProps> = ({ settings, onChange }) => {
  return (
    <div className="space-y-8">
      
      {/* Global Meta */}
      <div className="bg-white shadow rounded-lg p-6 border border-gray-200 space-y-6">
        <div className="border-b border-gray-100 pb-4">
            <h3 className="text-lg font-medium text-brand-green">Global Metadata</h3>
            <p className="text-xs text-gray-500 mt-1">Defaults used when no specific page data exists.</p>
        </div>
        
        <div className="grid grid-cols-1 gap-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Default Meta Title</label>
            <input 
              type="text" 
              name="seoTitle" 
              value={settings.seoTitle || ''} 
              onChange={onChange} 
              className="w-full border border-gray-300 rounded-lg p-2.5 bg-white text-sm focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all shadow-sm"
              placeholder="Jambo Apparels | Faith Based Fashion"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Default Meta Description</label>
            <textarea 
              name="seoDescription" 
              value={settings.seoDescription || ''} 
              onChange={onChange} 
              rows={2} 
              className="w-full border border-gray-300 rounded-lg p-2.5 bg-white text-sm focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all shadow-sm"
              placeholder="Wear your scriptures in Humility and Boldness..."
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Default OG Image URL</label>
            <input 
              type="text" 
              name="defaultOgImage" 
              value={settings.defaultOgImage || ''} 
              onChange={onChange} 
              placeholder="https://..."
              className="w-full border border-gray-300 rounded-lg p-2.5 bg-white text-sm focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Page Specific */}
      <div className="bg-white shadow rounded-lg p-6 border border-gray-200 space-y-6">
        <div className="border-b border-gray-100 pb-4">
            <h3 className="text-lg font-medium text-brand-green">Page Defaults</h3>
            <p className="text-xs text-gray-500 mt-1">Set static SEO for main pages.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-3 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
              <h4 className="text-xs font-black text-brand-green uppercase tracking-widest mb-2 flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-brand-green"></span> Shop Page
              </h4>
              <input type="text" name="shopSeoTitle" value={settings.shopSeoTitle || ''} onChange={onChange} placeholder="Shop Page Title" className="w-full border border-gray-200 rounded-lg p-2 text-xs bg-white focus:border-brand-green outline-none" />
              <textarea name="shopSeoDescription" value={settings.shopSeoDescription || ''} onChange={onChange} rows={2} placeholder="Shop Page Description" className="w-full border border-gray-200 rounded-lg p-2 text-xs bg-white focus:border-brand-green outline-none resize-none" />
           </div>
           
           <div className="space-y-3 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
              <h4 className="text-xs font-black text-brand-green uppercase tracking-widest mb-2 flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-brand-green"></span> Journal / Blog
              </h4>
              <input type="text" name="blogSeoTitle" value={settings.blogSeoTitle || ''} onChange={onChange} placeholder="Blog Page Title" className="w-full border border-gray-200 rounded-lg p-2 text-xs bg-white focus:border-brand-green outline-none" />
              <textarea name="blogSeoDescription" value={settings.blogSeoDescription || ''} onChange={onChange} rows={2} placeholder="Blog Page Description" className="w-full border border-gray-200 rounded-lg p-2 text-xs bg-white focus:border-brand-green outline-none resize-none" />
           </div>
           
           <div className="space-y-3 p-4 bg-slate-50/50 rounded-xl border border-slate-100 md:col-span-2">
              <h4 className="text-xs font-black text-brand-green uppercase tracking-widest mb-2 flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-brand-green"></span> About Page
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" name="aboutSeoTitle" value={settings.aboutSeoTitle || ''} onChange={onChange} placeholder="About Page Title" className="w-full border border-gray-200 rounded-lg p-2 text-xs bg-white focus:border-brand-green outline-none" />
                  <textarea name="aboutSeoDescription" value={settings.aboutSeoDescription || ''} onChange={onChange} rows={1} placeholder="About Page Description" className="w-full border border-gray-200 rounded-lg p-2 text-xs bg-white focus:border-brand-green outline-none resize-none" />
              </div>
           </div>
        </div>
      </div>

      {/* Analytics & Scripts */}
      <div className="bg-white shadow rounded-lg p-6 border border-gray-200 space-y-6">
        <div className="border-b border-gray-100 pb-4">
            <h3 className="text-lg font-medium text-brand-green">Analytics & Scripts</h3>
            <p className="text-xs text-gray-500 mt-1">Inject 3rd party tracking codes.</p>
        </div>
        
        <div>
           <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Google Analytics ID</label>
           <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">G-</span>
                <input 
                    type="text" 
                    name="googleAnalyticsId" 
                    value={settings.googleAnalyticsId?.replace('G-', '') || ''} 
                    onChange={(e) => onChange({...e, target: {...e.target, name: 'googleAnalyticsId', value: 'G-' + e.target.value.replace('G-', '')}})} 
                    placeholder="XXXXXXXXXX"
                    className="w-full border border-gray-300 rounded-lg pl-8 p-2.5 bg-white text-sm font-mono focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all shadow-sm"
                />
           </div>
           <p className="text-[10px] text-gray-400 mt-1 italic">We handle the tag script automatically.</p>
        </div>

        <div>
           <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Custom Head Scripts</label>
           <textarea 
             name="customHeadScripts" 
             value={settings.customHeadScripts || ''} 
             onChange={onChange} 
             rows={6} 
             placeholder="<script>...</script>"
             className="w-full border border-gray-300 rounded-lg p-3 bg-slate-50 text-xs font-mono focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all shadow-inner text-slate-600"
           />
           <div className="mt-2 flex items-center gap-2 text-[10px] text-amber-600 bg-amber-50 p-2 rounded border border-amber-100">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                <span className="font-bold">Advanced:</span> Only paste scripts from trusted sources (e.g. Meta Pixel, Hotjar). Malformed HTML can break your site.
           </div>
        </div>
      </div>

    </div>
  );
};
