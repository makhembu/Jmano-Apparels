import React from 'react';
import { BlogPost, BlogCategory } from '../../../types';
import DOMPurify from 'dompurify';

interface BlogEditorPreviewProps {
  formData: Partial<BlogPost>;
  categories: BlogCategory[];
}

export const BlogEditorPreview: React.FC<BlogEditorPreviewProps> = ({ formData, categories }) => {
  // Sanitize the HTML content to prevent XSS attacks
  const cleanContent = DOMPurify.sanitize(formData.content || '<p>Start writing to see content here...</p>');

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl overflow-hidden min-h-screen">
      <div className="border-b p-4 flex justify-between items-center bg-gray-50">
         <span className="font-serif font-bold text-brand-dark">Jambo Apparels Blog</span>
         <span className="text-xs text-gray-400 uppercase tracking-widest">Preview Mode</span>
      </div>

      {formData.featuredImage && (
        <div className="w-full h-64 md:h-96 overflow-hidden">
          <img src={formData.featuredImage} alt="Hero" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="p-8 md:p-12">
         <div className="flex items-center gap-2 mb-6">
            <span className="bg-brand-light text-brand-dark px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
               {categories.find(c => c.id === formData.categoryId)?.name || 'Uncategorized'}
            </span>
            <span className="text-gray-400 text-sm">• {formData.readingTime} min read</span>
         </div>

         <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6 leading-tight">
            {formData.title || 'Untitled Post'}
         </h1>

         <div className="flex items-center gap-3 mb-8 border-b pb-8">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
               {formData.author?.[0] || 'A'}
            </div>
            <div>
               <p className="text-sm font-bold text-gray-900">{formData.author}</p>
               <p className="text-xs text-gray-500">{new Date().toLocaleDateString()}</p>
            </div>
         </div>

         <article className="prose prose-lg max-w-none text-gray-700 font-light leading-relaxed prose-headings:font-serif prose-headings:text-brand-dark prose-a:text-brand-green">
            <div dangerouslySetInnerHTML={{ __html: cleanContent }} />
         </article>
      </div>
    </div>
  );
};