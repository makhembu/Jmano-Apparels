import React from 'react';
import { SafeReactQuill } from './SafeReactQuill';
import { BlogPost } from '../../../types';

interface BlogEditorFormProps {
  formData: Partial<BlogPost>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onEditorChange: (content: string) => void;
}

export const BlogEditorForm: React.FC<BlogEditorFormProps> = ({ formData, onChange, onEditorChange }) => {
  return (
    <div className="lg:col-span-2 space-y-6">
       <div className="bg-white p-6 shadow rounded-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Post Title</label>
            <input 
              type="text" 
              name="title" 
              value={formData.title} 
              onChange={onChange} 
              required 
              className="mt-1 block w-full border border-gray-300 rounded-md p-3 text-lg font-bold text-gray-900 placeholder-gray-400 focus:ring-brand-green focus:border-brand-green" 
              placeholder="Enter a captivating title..."
            />
          </div>
          
          <div className="h-[500px] mb-12 flex flex-col">
             <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
             <SafeReactQuill 
                value={formData.content || ''}
                onChange={onEditorChange}
                className="flex-grow bg-white"
             />
          </div>
       </div>

       {/* SEO Settings */}
       <div className="bg-white p-6 shadow rounded-lg space-y-4 mt-8">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Search Engine Optimization (SEO)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-medium text-gray-500">SEO Title (Title Tag)</label>
                <input type="text" name="seoTitle" value={formData.seoTitle || ''} onChange={onChange} className="mt-1 block w-full border border-gray-300 rounded p-2 text-sm" placeholder={formData.title} />
                <p className="text-xs text-gray-400 mt-1">Leave blank to use post title.</p>
             </div>
             <div>
                <label className="block text-xs font-medium text-gray-500">Slug (URL)</label>
                <input type="text" name="slug" value={formData.slug} onChange={onChange} required className="mt-1 block w-full border border-gray-300 rounded p-2 text-sm bg-gray-50" />
             </div>
          </div>
          
          <div>
             <label className="block text-xs font-medium text-gray-500">Meta Description</label>
             <textarea name="seoDescription" rows={2} value={formData.seoDescription || ''} onChange={onChange} className="mt-1 block w-full border border-gray-300 rounded p-2 text-sm" placeholder={formData.summary || "Description shown in search results..."} />
          </div>

          <div className="bg-gray-50 p-4 rounded border border-gray-200 mt-2">
             <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Google Search Preview</p>
             <div className="font-sans">
                <div className="text-sm text-[#202124] flex items-center gap-1">
                   <span className="bg-gray-200 rounded-full w-4 h-4 inline-block"></span>
                   <span>jamboapparels.com</span>
                   <span className="text-gray-400">›</span>
                   <span>blog</span>
                   <span className="text-gray-400">›</span>
                   <span>{formData.slug}</span>
                </div>
                <h3 className="text-xl text-[#1a0dab] hover:underline cursor-pointer truncate font-normal">
                   {formData.seoTitle || formData.title || 'Post Title'}
                </h3>
                <p className="text-sm text-[#4d5156] line-clamp-2">
                   {new Date().toLocaleDateString()} — {formData.seoDescription || formData.summary || 'Post description will appear here...'}
                </p>
             </div>
          </div>
       </div>
    </div>
  );
};