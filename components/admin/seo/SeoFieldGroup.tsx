
import React, { useState } from 'react';
import { SeoConfig } from '../../../types';
import { GoogleGenAI } from "@google/genai";
import { Button } from '../../ui/Button';
import { useToast } from '../../../context/ToastContext';

interface SeoFieldGroupProps {
  data: SeoConfig;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onKeywordsChange: (keywords: string[]) => void;
  // Context for AI generation and preview
  contextData?: {
    title: string;
    description: string;
    type: 'product' | 'blog' | 'page';
  };
  defaultTitle?: string;
  defaultDescription?: string;
  previewImage?: string;
  permalink?: string;
}

export const SeoFieldGroup: React.FC<SeoFieldGroupProps> = ({ 
  data, 
  onChange, 
  onKeywordsChange,
  contextData,
  defaultTitle = 'Page Title',
  defaultDescription = 'Page description...',
  previewImage,
  permalink = 'https://jamboapparels.com/...'
}) => {
  const { showToast } = useToast();
  const [activePreview, setActivePreview] = useState<'google' | 'social'>('google');
  const [generating, setGenerating] = useState<'title' | 'desc' | null>(null);
  
  const handleKeywordsInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const arr = val.split(',').map(s => s.trim()).filter(Boolean);
    onKeywordsChange(arr);
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
  };

  // AI Generation Logic
  const handleGenerate = async (field: 'title' | 'desc') => {
    if (!contextData?.title) {
        showToast("Please enter a main title first.", 'info');
        return;
    }
    
    setGenerating(field);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const modelName = 'gemini-3-flash-preview'; // Fast model for simple text
        
        let prompt = "";
        if (field === 'title') {
            prompt = `Generate a single, catchy, SEO-friendly meta title (max 60 characters) for a ${contextData.type} titled "${contextData.title}". Don't use quotes.`;
        } else {
            prompt = `Generate a compelling meta description (max 155 characters) for a ${contextData.type} titled "${contextData.title}". Content summary: "${contextData.description || contextData.title}". Include a call to action. Don't use quotes.`;
        }

        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
        });

        const text = response.text?.trim();
        
        if (text) {
            // Create synthetic event to update parent state
            const name = field === 'title' ? 'seoTitle' : 'seoDescription';
            const event = {
                target: { name, value: text }
            } as React.ChangeEvent<HTMLInputElement>;
            onChange(event);
            showToast('SEO content generated!', 'success');
        }
    } catch (e) {
        console.error(e);
        showToast('AI Generation failed. Please try again.', 'error');
    } finally {
        setGenerating(null);
    }
  };

  // Preview Data
  const displayTitle = data.seoTitle || defaultTitle;
  const displayDesc = data.seoDescription || defaultDescription;
  const displayUrl = data.canonicalUrl || permalink;

  return (
    <div className="space-y-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="border-b border-slate-100 pb-4 mb-4 flex justify-between items-center">
        <div>
            <h3 className="text-lg font-bold text-brand-dark font-serif">Search Engine Optimization</h3>
            <p className="text-xs text-slate-500 mt-1">Enhance visibility on Google and social media.</p>
        </div>
        <div className="bg-brand-light/30 text-brand-dark px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border border-brand-green/10">
            AI Powered
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Form Fields */}
        <div className="space-y-6">
            <div className="relative">
              <div className="flex justify-between items-end mb-1">
                 <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Meta Title</label>
                 <button 
                    type="button" 
                    onClick={() => handleGenerate('title')}
                    disabled={!!generating}
                    className="text-[10px] font-bold text-brand-green hover:underline flex items-center gap-1 disabled:opacity-50"
                 >
                    {generating === 'title' ? (
                        <span className="animate-pulse">Thinking...</span>
                    ) : (
                        <>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            Generate
                        </>
                    )}
                 </button>
              </div>
              <input 
                type="text" 
                name="seoTitle" 
                value={data.seoTitle || ''} 
                onChange={onChange} 
                placeholder={defaultTitle} 
                className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green bg-white shadow-sm transition-all"
              />
              <div className="flex justify-between mt-1.5">
                 <p className="text-[10px] text-slate-400">Recommended: 50-60 characters.</p>
                 <span className={`text-[10px] font-bold ${displayTitle.length > 60 ? 'text-red-500' : 'text-green-600'}`}>
                    {displayTitle.length}/60
                 </span>
              </div>
            </div>

            <div className="relative">
                <div className="flex justify-between items-end mb-1">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Meta Description</label>
                    <button 
                        type="button" 
                        onClick={() => handleGenerate('desc')}
                        disabled={!!generating}
                        className="text-[10px] font-bold text-brand-green hover:underline flex items-center gap-1 disabled:opacity-50"
                    >
                        {generating === 'desc' ? (
                            <span className="animate-pulse">Thinking...</span>
                        ) : (
                            <>
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                Generate
                            </>
                        )}
                    </button>
                </div>
                <textarea 
                  name="seoDescription" 
                  value={data.seoDescription || ''} 
                  onChange={onChange} 
                  rows={4} 
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green bg-white shadow-sm transition-all resize-none"
                  placeholder={defaultDescription}
                />
                <div className="flex justify-between mt-1.5">
                   <p className="text-[10px] text-slate-400">Recommended: 150-160 characters.</p>
                   <span className={`text-[10px] font-bold ${displayDesc.length > 160 ? 'text-red-500' : 'text-green-600'}`}>
                      {displayDesc.length}/160
                   </span>
                </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2">Advanced Crawling</h4>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Canonical URL</label>
                        <input 
                            type="text" 
                            name="canonicalUrl" 
                            value={data.canonicalUrl || ''} 
                            onChange={onChange} 
                            placeholder={permalink} 
                            className="w-full border border-slate-200 rounded-lg p-2.5 text-xs bg-white focus:border-brand-green outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Meta Keywords</label>
                        <input 
                            type="text" 
                            defaultValue={data.keywords?.join(', ') || ''} 
                            onChange={handleKeywordsInput}
                            className="w-full border border-slate-200 rounded-lg p-2.5 text-xs bg-white focus:border-brand-green outline-none"
                            placeholder="fashion, faith, hoodie..."
                        />
                    </div>

                    <div className="flex gap-6 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input 
                                type="checkbox" 
                                name="isNoIndex" 
                                checked={!!data.isNoIndex} 
                                onChange={handleCheckbox}
                                className="rounded text-brand-green focus:ring-brand-green border-slate-300"
                            />
                            <span className="text-xs font-bold text-slate-600 group-hover:text-brand-dark">No Index</span>
                        </label>
                        
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input 
                                type="checkbox" 
                                name="isNoFollow" 
                                checked={!!data.isNoFollow} 
                                onChange={handleCheckbox}
                                className="rounded text-brand-green focus:ring-brand-green border-slate-300"
                            />
                            <span className="text-xs font-bold text-slate-600 group-hover:text-brand-dark">No Follow</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>

        {/* Live Preview */}
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-50 p-1 rounded-lg border border-gray-100">
               <span className="ml-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Preview Mode</span>
               <div className="flex gap-1">
                  <button 
                    type="button" 
                    onClick={() => setActivePreview('google')} 
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${activePreview === 'google' ? 'bg-white shadow text-brand-dark ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    Google
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setActivePreview('social')} 
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${activePreview === 'social' ? 'bg-white shadow text-brand-dark ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    Social
                  </button>
               </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-6 bg-slate-50/50 min-h-[240px] flex items-center justify-center relative overflow-hidden">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                {activePreview === 'google' ? (
                    <div className="bg-white p-4 rounded-xl shadow-sm w-full max-w-sm font-sans text-left border border-slate-100 relative z-10">
                        <div className="flex items-center gap-2.5 mb-1.5">
                            <div className="w-7 h-7 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden p-1">
                               <img src="https://i.imgur.com/pkaScEv.png" className="w-full h-full object-contain opacity-90" alt="" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-medium text-[#202124] leading-tight">Jambo Apparels</span>
                                <span className="text-[9px] text-[#5f6368] leading-tight truncate max-w-[220px]">{displayUrl}</span>
                            </div>
                            <div className="ml-auto">
                                <span className="text-gray-400 text-[10px]">⋮</span>
                            </div>
                        </div>
                        <h3 className="text-[#1a0dab] text-lg leading-snug hover:underline cursor-pointer truncate font-normal mb-1">
                            {displayTitle}
                        </h3>
                        <p className="text-sm text-[#4d5156] leading-relaxed line-clamp-2">
                            {displayDesc}
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden w-full max-w-sm shadow-sm relative z-10">
                        <div className="aspect-[1.91/1] bg-slate-100 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                            {previewImage ? (
                                <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center text-slate-300">
                                    <svg className="w-10 h-10 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    <span className="text-[9px] font-black uppercase tracking-widest opacity-50">Image Preview</span>
                                </div>
                            )}
                        </div>
                        <div className="p-3 bg-[#F0F2F5] border-t border-gray-200 text-left">
                            <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5 font-medium">JAMBOAPPARELS.COM</p>
                            <h3 className="text-sm font-bold text-gray-900 truncate mb-1">
                                {displayTitle}
                            </h3>
                            <p className="text-xs text-gray-600 line-clamp-1">
                                {displayDesc}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
