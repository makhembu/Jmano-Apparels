import React, { useState } from 'react';
import { BlogPost, BlogCategory } from '../../../types';
import { Button } from '../../ui/Button';
import { api } from '../../../lib/db';
import { useToast } from '../../../context/ToastContext';
import { MediaPicker } from '../../ui/MediaPicker';
import { getVideoEmbedUrl } from '../../../lib/video-utils';

interface BlogEditorSidebarProps {
  formData: Partial<BlogPost>;
  categories: BlogCategory[];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>, field: 'featuredImage' | 'thumbnail') => void;
  onImageClear: (field: 'featuredImage' | 'thumbnail') => void;
  onQuickCategoryAdd: () => void; // Trigger refresh in parent
  onVideoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loading: boolean;
  uploading: boolean;
  id?: string;
}

type ImageInputType = 'url' | 'upload';

export const BlogEditorSidebar: React.FC<BlogEditorSidebarProps> = ({ 
  formData, categories, onChange, onImageChange, onImageClear, onQuickCategoryAdd, onVideoUpload, loading, uploading, id 
}) => {
  const { showToast } = useToast();
  const [featImageType, setFeatImageType] = useState<ImageInputType>('url');
  const [thumbImageType, setThumbImageType] = useState<ImageInputType>('url');
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  const handleQuickAddCategory = async () => {
    if(!newCatName) return;
    try {
      const slug = newCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await api.createBlogCategory({ name: newCatName, slug });
      showToast('Category added', 'success');
      setNewCatName('');
      setIsAddingCat(false);
      onQuickCategoryAdd();
    } catch(e) {
      showToast('Failed to add category', 'error');
    }
  };

  const formatDateTimeForInput = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const timezoneOffset = date.getTimezoneOffset() * 60000;
      const localDate = new Date(date.getTime() - timezoneOffset);
      return localDate.toISOString().slice(0, 16);
    } catch (e) {
      return '';
    }
  };

  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const dateValue = value ? new Date(value).toISOString() : undefined;
    onChange({ target: { name, value: dateValue } } as any);
  };

  const clearSchedule = () => {
    onChange({ target: { name: 'scheduledFor', value: undefined } } as any);
  };

  const renderImageInput = (label: string, field: 'featuredImage' | 'thumbnail', typeState: ImageInputType, setTypeState: (t: ImageInputType) => void) => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
        <div className="flex bg-slate-100 p-1 rounded-lg">
           <button 
             type="button" 
             onClick={() => setTypeState('url')} 
             className={`text-[9px] px-2 py-0.5 font-bold rounded-md transition-all ${typeState === 'url' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
           >
             URL
           </button>
           <button 
             type="button" 
             onClick={() => setTypeState('upload')} 
             className={`text-[9px] px-2 py-0.5 font-bold rounded-md transition-all ${typeState === 'upload' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
           >
             UPLOAD
           </button>
        </div>
      </div>
      
      {typeState === 'url' ? (
        <input 
          type="text" 
          name={field} 
          value={formData[field] || ''} 
          onChange={onChange} 
          placeholder="https://images.unsplash.com/..."
          className="block w-full border border-slate-200 rounded-xl p-3 bg-slate-50 text-slate-900 text-xs focus:ring-2 focus:ring-brand-green/10 outline-none" 
        />
      ) : (
        <div className="relative">
           <div className={`w-full border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-colors ${uploading ? 'border-brand-green bg-brand-light/20' : 'border-slate-200 hover:border-brand-green/50 hover:bg-slate-50'}`}>
              {uploading ? (
                 <div className="text-center py-2">
                    <div className="animate-spin h-5 w-5 border-b-2 border-brand-green mx-auto mb-2 rounded-full"></div>
                    <span className="text-[10px] font-black text-brand-green uppercase tracking-widest">Processing...</span>
                 </div>
              ) : (
                 <>
                    <svg className="w-6 h-6 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Choose Asset</span>
                 </>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => onImageChange(e, field)}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
           </div>
        </div>
      )}
      
      {formData[field] && (
        <div className="mt-2 relative group aspect-[16/9] rounded-xl overflow-hidden border border-slate-100 shadow-sm">
           <img src={formData[field]} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                type="button" 
                onClick={() => onImageClear(field)}
                className="bg-red-500 text-white p-2 rounded-full hover:scale-110 active:scale-95 transition-all shadow-lg"
                title="Remove image"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
           </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
       <div className="bg-white p-8 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200 space-y-6">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-4">Publishing</h3>
          <div>
             <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Visibility</label>
             <select name="status" value={formData.status} onChange={onChange} className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 text-slate-900 text-sm focus:ring-2 focus:ring-brand-green/10 outline-none">
                <option value="draft">Draft (Internal)</option>
                <option value="published">Published (Public)</option>
                <option value="archived">Archived</option>
             </select>
          </div>
          
          <div>
             <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Schedule Publication</label>
             <input 
                type="datetime-local" 
                name="scheduledFor" 
                value={formatDateTimeForInput(formData.scheduledFor)} 
                onChange={handleDateTimeChange} 
                className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 text-slate-900 text-sm focus:ring-2 focus:ring-brand-green/10 outline-none" 
             />
             {formData.scheduledFor && (
                <button 
                    type="button" 
                    onClick={clearSchedule} 
                    className="text-xs text-red-500 hover:underline mt-2"
                >
                    Clear Schedule
                </button>
             )}
          </div>
          
          <div>
             <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Author Attribute</label>
             <input type="text" name="author" value={formData.author} onChange={onChange} className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 text-slate-900 text-sm focus:ring-2 focus:ring-brand-green/10 outline-none" />
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Metrics</label>
             <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-slate-600">Reading Time</span>
                <span className="text-lg font-serif font-bold text-slate-900">{formData.readingTime || 0} <span className="text-[10px] text-slate-400 uppercase font-sans">min</span></span>
             </div>
          </div>
       </div>

       <div className="bg-white p-8 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200 space-y-6">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-4">Classification</h3>
          <div>
             <select name="categoryId" value={formData.categoryId || ''} onChange={onChange} className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 text-slate-900 text-sm focus:ring-2 focus:ring-brand-green/10 outline-none">
                <option value="">Select Category...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
             </select>
          </div>
          
          {isAddingCat ? (
             <div className="flex gap-2 items-center animate-fade-in bg-brand-light/30 p-2 rounded-xl">
                <input 
                  type="text" 
                  autoFocus
                  value={newCatName} 
                  onChange={(e) => setNewCatName(e.target.value)} 
                  placeholder="New Category..."
                  className="bg-white border-slate-200 border rounded-lg px-3 py-2 text-xs flex-1 outline-none"
                />
                <button type="button" onClick={handleQuickAddCategory} className="text-brand-green p-1 hover:scale-110 transition-transform">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                </button>
                <button type="button" onClick={() => setIsAddingCat(false)} className="text-slate-300 p-1">
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
             </div>
          ) : (
             <button 
               type="button" 
               onClick={() => setIsAddingCat(true)} 
               className="text-[10px] font-black text-brand-green hover:underline uppercase tracking-widest flex items-center gap-2"
             >
                <span className="bg-brand-green text-white rounded-md w-4 h-4 flex items-center justify-center">+</span>
                Quick Add Category
             </button>
          )}
       </div>

       <div className="bg-white p-8 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200 space-y-8">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-4">Media Assets</h3>
          {renderImageInput('Featured Image (Hero)', 'featuredImage', featImageType, setFeatImageType)}
          {renderImageInput('Thumbnail (Grid)', 'thumbnail', thumbImageType, setThumbImageType)}

          {/* Hero Video */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Hero Video</label>
            <input
              type="text"
              name="heroVideo"
              value={formData.heroVideo || ''}
              onChange={onChange}
              placeholder="YouTube, Vimeo URL, or paste embed code..."
              className="block w-full border border-slate-200 rounded-xl p-3 bg-slate-50 text-slate-900 text-xs focus:ring-2 focus:ring-brand-green/10 outline-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowMediaPicker(true)}
                className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl p-3 text-[10px] font-bold text-slate-500 hover:border-brand-green/50 hover:text-brand-green hover:bg-slate-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                Browse Media
              </button>
              <div className="relative flex-1">
                <div className={`w-full border-2 border-dashed rounded-xl p-3 flex items-center justify-center transition-colors ${uploading ? 'border-brand-green bg-brand-light/20' : 'border-slate-200 hover:border-brand-green/50 hover:bg-slate-50'}`}>
                  {uploading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-brand-green border-t-transparent rounded-full"></div>
                      <span className="text-[10px] font-black text-brand-green uppercase tracking-widest">Uploading...</span>
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Upload New</span>
                  )}
                  <input
                    type="file"
                    accept="video/*"
                    onChange={onVideoUpload}
                    disabled={uploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
            {formData.heroVideo && (
              <>
                <div className="relative group aspect-video rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-slate-900">
                  {/\.(mp4|webm|ogg|mov|avi)$/i.test(formData.heroVideo) ? (
                    <video src={formData.heroVideo} className="w-full h-full object-cover" preload="metadata" muted controls />
                  ) : (
                    <iframe
                      src={getVideoEmbedUrl(formData.heroVideo) || formData.heroVideo}
                      title="Hero video preview"
                      className="w-full h-full absolute inset-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      frameBorder="0"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => onChange({ target: { name: 'heroVideo', value: '' } } as any)}
                    className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                    title="Remove video"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">Leave empty to hide hero video.</p>
              </>
            )}
          </div>

          {showMediaPicker && (
            <MediaPicker
              onSelect={(url) => onChange({ target: { name: 'heroVideo', value: url } } as any)}
              onClose={() => setShowMediaPicker(false)}
            />
          )}
       </div>

       <div className="bg-white p-8 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200 space-y-4">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-4">Excerpt</h3>
          <textarea 
            name="summary" 
            rows={4} 
            value={formData.summary} 
            onChange={onChange} 
            className="w-full border border-slate-200 rounded-xl p-4 bg-slate-50 text-slate-900 text-xs focus:ring-2 focus:ring-brand-green/10 outline-none leading-relaxed" 
            placeholder="A brief summary for the blog grid..."
          />
       </div>
    </div>
  );
};