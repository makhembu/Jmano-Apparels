
import React from 'react';
import { BlogPost, BlogCategory } from '../../../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DOMPurify from 'dompurify';
import { OptimizedImage } from '../../ui/OptimizedImage';
import { VideoEmbed } from '../../ui/VideoEmbed';

interface BlogEditorPreviewProps {
  formData: Partial<BlogPost>;
  categories: BlogCategory[];
}

export const BlogEditorPreview: React.FC<BlogEditorPreviewProps> = ({ formData, categories }) => {
  const category = categories.find(c => c.id === formData.categoryId);
  const date = formData.createdAt ? new Date(formData.createdAt).toLocaleDateString() : new Date().toLocaleDateString();

  const isHtml = (content: string) => {
    return /<[a-z][\s\S]*>/i.test(content) && !content.trim().startsWith('#');
  };

  const renderContent = () => {
     const content = formData.content || '';
     if (isHtml(content)) {
         const cleanHtml = DOMPurify.sanitize(content, {
           ADD_TAGS: ['iframe'],
           ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'loading'],
         });
         return <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
     } else {
         return <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>;
     }
  };

  return (
    <div className="bg-gray-100 p-4 md:p-8 rounded-xl border border-slate-200 min-h-[600px] overflow-y-auto custom-scrollbar">
      <div className="max-w-3xl mx-auto bg-white shadow-2xl rounded-xl overflow-hidden min-h-[500px]">
         {/* Hero Image */}
         <div className="relative h-64 w-full bg-gray-200">
            {formData.featuredImage ? (
                <OptimizedImage 
                    src={formData.featuredImage} 
                    alt="Cover" 
                    className="w-full h-full object-cover"
                    width={800}
                    height={400}
                />
            ) : (
                <div className="flex items-center justify-center h-full text-slate-400 bg-slate-50">
                    <span className="flex flex-col items-center gap-2">
                        <svg className="w-8 h-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        No Featured Image
                    </span>
                </div>
            )}
         </div>

         {/* Hero Video */}
         {formData.heroVideo && (
           <div className="w-full">
             <VideoEmbed url={formData.heroVideo} title="Hero video" />
           </div>
         )}

         <div className="p-8 md:p-12">
            {/* Header */}
            <div className="text-center space-y-4 mb-8 border-b border-slate-100 pb-8">
                <div className="flex justify-center items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-green bg-brand-light/30 px-3 py-1 rounded-full">
                        {category?.name || 'Uncategorized'}
                    </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-dark leading-tight">
                    {formData.title || 'Untitled Post'}
                </h1>
                <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-brand-dark text-white flex items-center justify-center font-bold text-xs">
                            {(formData.author || 'A')[0]}
                        </div>
                        <span className="font-medium text-slate-900">{formData.author || 'Admin'}</span>
                    </div>
                    <span className="hidden sm:inline">•</span>
                    <span>{date}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{formData.readingTime || 0} min read</span>
                </div>
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed font-light
              prose-headings:font-serif prose-headings:font-bold prose-headings:text-brand-dark
              prose-blockquote:border-l-4 prose-blockquote:border-brand-hope prose-blockquote:bg-gray-50/50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:font-serif prose-blockquote:italic prose-blockquote:text-slate-800
              prose-a:text-brand-green prose-a:font-bold prose-a:no-underline hover:prose-a:underline
              prose-img:rounded-xl prose-img:shadow-lg
              prose-strong:font-black prose-strong:text-brand-green">
                {renderContent()}
            </div>
         </div>
      </div>
    </div>
  );
};
