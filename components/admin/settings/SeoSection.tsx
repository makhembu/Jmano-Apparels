
import React, { useState } from 'react';
import { AppSettings } from '../../../types';
import { generateSitemap, generateRobotsTxt } from '../../../lib/seo/sitemap';
import { useToast } from '../../../context/ToastContext';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import { SitelinksManager } from './SitelinksManager';

interface SeoSectionProps {
  settings: AppSettings;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSitelinksUpdate: (pages: any[]) => void;
}

export const SeoSection: React.FC<SeoSectionProps> = ({ settings, onChange, onSitelinksUpdate }) => {
  const { showToast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [activePreview, setActivePreview] = useState<'google' | 'social'>('google');

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
  
  const displayTitle = settings.seoTitle || "Jambo Apparels | Christian Streetwear";
  const displayDesc = settings.seoDescription || "Wear your faith boldly with our scripture-inspired apparel.";
  const displayUrl = "https://jamboapparels.com";

  return (
    <div className="space-y-8">
      
      {/* Global Meta */}
      <div className="bg-white shadow rounded-lg p-6 border border-gray-200 space-y-6">
        <div className="border-b border-gray-100 pb-4">
            <h3 className="text-lg font-medium text-brand-green">Global Metadata & Previews</h3>
            <p className="text-xs text-gray-500 mt-1">Defaults used for the homepage and when no specific page data exists.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div>
              <Input 
                label="Default Meta Title" 
                name="seoTitle" 
                value={settings.seoTitle || ''} 
                onChange={onChange} 
                placeholder="Jambo Apparels | Faith Based Fashion"
                maxLength={60}
              />
              <div className="flex justify-between mt-1.5">
                 <p className="text-[10px] text-slate-400">Recommended: 50-60 characters.</p>
                 <span className={`text-[10px] font-bold ${(settings.seoTitle?.length || 0) > 60 ? 'text-red-500' : 'text-green-600'}`}>
                    {settings.seoTitle?.length || 0}/60
                 </span>
              </div>
            </div>
            <div>
              <Textarea 
                label="Default Meta Description" 
                name="seoDescription" 
                value={settings.seoDescription || ''} 
                onChange={onChange} 
                rows={3} 
                placeholder="Wear your scriptures in Humility and Boldness..."
                maxLength={160}
              />
              <div className="flex justify-between mt-1.5">
                 <p className="text-[10px] text-slate-400">Recommended: 150-160 characters.</p>
                 <span className={`text-[10px] font-bold ${(settings.seoDescription?.length || 0) > 160 ? 'text-red-500' : 'text-green-600'}`}>
                    {settings.seoDescription?.length || 0}/160
                 </span>
              </div>
            </div>
            <Input 
              label="Default Social Share Image URL" 
              name="defaultOgImage" 
              value={settings.defaultOgImage || ''} 
              onChange={onChange} 
              placeholder="https://..."
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-50 p-1 rounded-lg border border-gray-100">
               <span className="ml-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Preview</span>
               <div className="flex gap-1">
                  <button type="button" onClick={() => setActivePreview('google')} className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${activePreview === 'google' ? 'bg-white shadow text-brand-dark ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'}`}>Google</button>
                  <button type="button" onClick={() => setActivePreview('social')} className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${activePreview === 'social' ? 'bg-white shadow text-brand-dark ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'}`}>Social</button>
               </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-6 bg-slate-50/50 min-h-[240px] flex items-center justify-center relative overflow-hidden">
                {activePreview === 'google' ? (
                    <div className="bg-white p-4 rounded-xl shadow-sm w-full max-w-sm font-sans text-left border border-slate-100 relative z-10">
                        <h3 className="text-[#1a0dab] text-lg leading-snug hover:underline cursor-pointer truncate font-normal mb-1">{displayTitle}</h3>
                        <span className="text-[11px] text-[#006621] leading-tight truncate block">{displayUrl}</span>
                        <p className="text-sm text-[#4d5156] leading-relaxed line-clamp-2 mt-2">{displayDesc}</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden w-full max-w-sm shadow-sm relative z-10">
                        <div className="aspect-[1.91/1] bg-slate-100 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                           <img src={settings.defaultOgImage} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="p-3 bg-[#F0F2F5] border-t border-gray-200 text-left">
                            <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5 font-medium">{displayUrl.replace('https://','')}</p>
                            <h3 className="text-sm font-bold text-gray-900 truncate mb-1">{displayTitle}</h3>
                            <p className="text-xs text-gray-600 line-clamp-1">{displayDesc}</p>
                        </div>
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>
      
      <SitelinksManager settings={settings} onUpdate={onSitelinksUpdate} />

      {/* Page Specific */}
      <div className="bg-white shadow rounded-lg p-6 border border-gray-200 space-y-6">
        <div className="border-b border-gray-100 pb-4">
            <h3 className="text-lg font-medium text-brand-green">Page Defaults</h3>
            <p className="text-xs text-gray-500 mt-1">Set static SEO for main pages.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-3 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
              <h4 className="text-xs font-black text-brand-green uppercase tracking-widest mb-2 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-green"></span> Shop Page</h4>
              <Input placeholder="Shop Page Title" name="shopSeoTitle" value={settings.shopSeoTitle || ''} onChange={onChange} />
              <Textarea placeholder="Shop Page Description" name="shopSeoDescription" value={settings.shopSeoDescription || ''} onChange={onChange} rows={2} className="resize-none" />
           </div>
           
           <div className="space-y-3 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
              <h4 className="text-xs font-black text-brand-green uppercase tracking-widest mb-2 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-green"></span> Journal / Blog</h4>
              <Input placeholder="Blog Page Title" name="blogSeoTitle" value={settings.blogSeoTitle || ''} onChange={onChange} />
              <Textarea placeholder="Blog Page Description" name="blogSeoDescription" value={settings.blogSeoDescription || ''} onChange={onChange} rows={2} className="resize-none" />
           </div>
           
           <div className="space-y-3 p-4 bg-slate-50/50 rounded-xl border border-slate-100 md:col-span-2">
              <h4 className="text-xs font-black text-brand-green uppercase tracking-widest mb-2 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-green"></span> About Page</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input placeholder="About Page Title" name="aboutSeoTitle" value={settings.aboutSeoTitle || ''} onChange={onChange} />
                  <Textarea placeholder="About Page Description" name="aboutSeoDescription" value={settings.aboutSeoDescription || ''} onChange={onChange} rows={1} className="resize-none" />
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
           <Input label="Google Analytics Measurement ID" name="googleAnalyticsId" value={settings.googleAnalyticsId || ''} onChange={onChange} placeholder="G-XXXXXXXXXX" />
        </div>

        <div>
           <Textarea label="Custom Head Scripts" name="customHeadScripts" value={settings.customHeadScripts || ''} onChange={onChange} rows={6} placeholder="<script>...</script>" className="font-mono text-xs text-slate-600" />
           <div className="mt-2 flex items-center gap-2 text-[10px] text-amber-600 bg-amber-50 p-2 rounded border border-amber-100">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                <span className="font-bold">Advanced:</span> Only paste scripts from trusted sources (e.g. Meta Pixel, Hotjar).
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
              <h4 className="font-bold text-slate-800 text-sm">Sitemap</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Your sitemap is automatically generated at `/sitemap.xml`.</p>
              <div className="flex gap-2">
                 <a href="/sitemap.xml" target="_blank" className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-xs font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50">View Live Sitemap</a>
                 <Button type="button" variant="outline" onClick={handleDownloadSitemap} isLoading={generating} className="text-xs">Download Backup</Button>
              </div>
           </div>
           <div className="w-px bg-slate-200 self-stretch hidden md:block"></div>
           <div className="flex-1">
              <h4 className="font-bold text-slate-800 text-sm mb-2">Robots.txt</h4>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">Instructions for search engine crawlers.</p>
              <Button type="button" variant="outline" onClick={handleDownloadRobots} className="text-xs">Download Robots.txt</Button>
           </div>
        </div>
      </div>

    </div>
  );
};
