
import React, { useState } from 'react';
import { AppSettings } from '../../../types';
import { generateSitemap, generateRobotsTxt } from '../../../lib/seo/sitemap';
import { useToast } from '../../../context/ToastContext';
import { Button } from '../../ui/Button';

interface SeoSectionProps {
  settings: AppSettings;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const SeoSection: React.FC<SeoSectionProps> = ({ settings, onChange }) => {
  const { showToast } = useToast();
  const [generating, setGenerating] = useState(false);

  const downloadFile = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadSitemap = async () => {
    setGenerating(true);
    try {
      const xml = await generateSitemap();
      downloadFile('sitemap.xml', xml, 'text/xml');
      showToast('Sitemap generated and downloaded', 'success');
    } catch (e) {
      console.error(e);
      showToast('Failed to generate sitemap', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadRobots = () => {
    const txt = generateRobotsTxt();
    downloadFile('robots.txt', txt, 'text/plain');
    showToast('robots.txt downloaded', 'success');
  };

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

      {/* Sitemap & Crawlers */}
      <div className="bg-white shadow rounded-lg p-6 border border-gray-200 space-y-6">
        <div className="border-b border-gray-100 pb-4">
            <h3 className="text-lg font-medium text-brand-green">Sitemap & Crawlers</h3>
            <p className="text-xs text-gray-500 mt-1">Configure automated discovery for Google Search Console.</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-6 items-start">
           <div className="flex-1 space-y-3">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                 <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded uppercase">Auto-Generated</span>
                 Sitemap Endpoint
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                 Your sitemap is automatically generated at <code>/sitemap.xml</code> via Vercel Serverless Functions. It fetches live product and blog data directly from your database.
              </p>
              <div className="flex gap-2">
                 <a 
                   href="/sitemap.xml" 
                   target="_blank" 
                   className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-xs font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green"
                 >
                   View Live Sitemap
                 </a>
                 <Button 
                   type="button" 
                   variant="outline"
                   onClick={handleDownloadSitemap} 
                   isLoading={generating}
                   className="text-xs"
                 >
                   Download Manual Backup
                 </Button>
              </div>
              <p className="text-[10px] text-blue-600 bg-blue-50 p-2 rounded border border-blue-100 mt-2">
                 <strong>System Status:</strong> Using Vercel Serverless API (`api/sitemap.js`) for generation. No Supabase configuration required.
              </p>
           </div>
           
           <div className="w-px bg-slate-200 self-stretch hidden md:block"></div>
           
           <div className="flex-1">
              <h4 className="font-bold text-slate-800 text-sm mb-2">Robots.txt</h4>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                 Instructions for search engine crawlers. Blocks admin areas and checkout pages while allowing full access to your shop and blog.
              </p>
              <Button 
                type="button" 
                variant="outline"
                onClick={handleDownloadRobots}
                className="text-xs"
              >
                Download Robots.txt
              </Button>
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
