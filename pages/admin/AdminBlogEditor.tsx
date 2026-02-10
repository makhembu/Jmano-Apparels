import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/db';
import { BlogPost, BlogCategory } from '../../types';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { BlogEditorSidebar } from '../../components/admin/blog/BlogEditorSidebar';
import { BlogEditorPreview } from '../../components/admin/blog/BlogEditorPreview';
import { MarkdownEditor } from '../../components/admin/blog/MarkdownEditor';
import { RichTextEditor } from '../../components/admin/blog/RichTextEditor';
import { SeoFieldGroup } from '../../components/admin/seo/SeoFieldGroup';
import { useShop } from '../../context/ShopContext';

export const AdminBlogEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  const { products } = useShop();
  const submitActionRef = useRef<'publish' | 'schedule'>('publish');
  
  // Environment Detection
  const isProd = window.location.hostname.includes('jamboapparels.com');
  const [editorMode, setEditorMode] = useState<'markdown' | 'rich'>(isProd ? 'rich' : 'markdown');

  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingField, setUploadingField] = useState<'featuredImage' | 'thumbnail' | null>(null);

  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: '',
    slug: '',
    content: '',
    summary: '',
    author: user?.name || 'Admin',
    status: 'draft',
    featuredImage: '',
    thumbnail: '',
    readingTime: 0,
    categoryId: '',
    seoTitle: '',
    seoDescription: '',
    keywords: [],
    canonicalUrl: '',
    isNoIndex: false,
    isNoFollow: false,
    scheduledFor: undefined
  });

  useEffect(() => {
    loadCategories();
    if (id) {
      api.getBlogPosts().then(posts => {
        const p = posts.find(post => post.id === id);
        if (p) setFormData(p);
      });
    }
  }, [id]);

  const loadCategories = () => {
    api.getBlogCategories().then(setCategories).catch(console.error);
  };

  const calculateReadingTime = (text: string) => {
    const wpm = 200;
    const words = text.trim().split(/\s+/).length;
    const time = Math.ceil(words / wpm);
    setFormData(prev => ({ ...prev, readingTime: time }));
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => {
        const newForm = { ...prev };
        
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            (newForm as any)[name] = checked;
        } else if (name === 'title' && !id && !prev.slug) {
            newForm.title = value;
            newForm.slug = generateSlug(value);
            if (!prev.seoTitle) {
                newForm.seoTitle = value;
            }
        } else {
            (newForm as any)[name] = value;
        }

        // Scheduling logic
        if (name === 'scheduledFor') {
            if (value && new Date(value as string) > new Date()) {
                newForm.status = 'draft';
            }
        }
        
        if (name === 'status' && value === 'published') {
             // If they manually publish, clear any future schedule
             if (newForm.scheduledFor && new Date(newForm.scheduledFor) > new Date()) {
                newForm.scheduledFor = undefined;
             }
        }

        return newForm;
    });
  };

  const handleEditorChange = (content: string) => {
    // We expect 'content' to be either Markdown or HTML depending on the editor.
    // For reading time, we strip tags to get pure text.
    const text = content.replace(/<[^>]*>?/gm, '');
    calculateReadingTime(text);
    setFormData(prev => ({ ...prev, content }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'featuredImage' | 'thumbnail') => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    if (file.size > 5 * 1024 * 1024) {
      showToast('File too large (max 5MB)', 'error');
      return;
    }

    setUploadingField(field);
    try {
      const publicUrl = await api.uploadImage(file);
      setFormData(prev => ({ ...prev, [field]: publicUrl }));
      showToast(`${field === 'featuredImage' ? 'Featured' : 'Thumbnail'} image ready`, 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to upload image', 'error');
    } finally {
      setUploadingField(null);
    }
  };

  const handleImageClear = (field: 'featuredImage' | 'thumbnail') => {
      setFormData(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const action = submitActionRef.current;
    
    const payload = {
      ...formData,
      seoTitle: formData.seoTitle || formData.title,
      seoDescription: formData.seoDescription || formData.summary
    };

    const isFutureDate = payload.scheduledFor && new Date(payload.scheduledFor) > new Date();

    if (action === 'schedule') {
      if (!isFutureDate) {
        showToast('Please select a future date to schedule.', 'error');
        setLoading(false);
        return;
      }
      payload.status = 'draft';
    } else { // 'publish'
      payload.status = 'published';
      payload.scheduledFor = undefined; // Clear schedule on manual publish
    }

    try {
      if (id) {
        await api.adminUpdateBlogPost(id, payload);
      } else {
        await api.adminCreateBlogPost(payload);
      }
      showToast(action === 'schedule' ? 'Post scheduled successfully!' : 'Journal entry published!', 'success');
      navigate('/admin/blog');
    } catch (error: any) {
      showToast(error.message || 'Error saving post', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isScheduled = formData.scheduledFor && new Date(formData.scheduledFor) > new Date();

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
         <div>
            <h1 className="text-3xl font-bold font-serif text-slate-900">{id ? 'Refine Testimony' : 'New Journal Entry'}</h1>
            <p className="text-slate-500 text-sm mt-1">Threading stories of faith into the digital sphere.</p>
         </div>
         <div className="flex flex-wrap gap-3">
             {/* Editor Toggle */}
             {isProd && (
                 <div className="flex bg-slate-100 p-1 rounded-xl mr-4">
                    <button 
                        onClick={() => setEditorMode('rich')} 
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${editorMode === 'rich' ? 'bg-white shadow-sm text-brand-green' : 'text-slate-400'}`}
                    >
                        Rich Text
                    </button>
                    <button 
                        onClick={() => setEditorMode('markdown')} 
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${editorMode === 'markdown' ? 'bg-white shadow-sm text-brand-dark' : 'text-slate-400'}`}
                    >
                        Markdown
                    </button>
                 </div>
             )}

            <button 
              type="button" 
              onClick={() => setActiveTab('write')} 
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'write' ? 'bg-white text-brand-green shadow-md ring-1 ring-slate-100' : 'bg-transparent text-slate-400 hover:text-slate-600'}`}
            >
              Compose
            </button>
            <button 
              type="button" 
              onClick={() => setActiveTab('preview')} 
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'preview' ? 'bg-white text-brand-green shadow-md ring-1 ring-slate-100' : 'bg-transparent text-slate-400 hover:text-slate-600'}`}
            >
              Preview
            </button>
            <div className="w-px h-10 bg-slate-200 mx-2 hidden sm:block"></div>
            <Button
              type="submit"
              form="blog-form"
              onClick={() => submitActionRef.current = 'schedule'}
              isLoading={loading}
              disabled={!isScheduled || loading}
              variant="outline"
              className="px-6"
            >
              Schedule
            </Button>
            <Button
              data-copilot-id="btn-publish-post"
              type="submit"
              form="blog-form"
              onClick={() => submitActionRef.current = 'publish'}
              isLoading={loading}
              disabled={loading}
              className="px-8 shadow-lg shadow-brand-green/20"
            >
              {id ? 'Update Post' : 'Publish'}
            </Button>
         </div>
      </div>

      <form id="blog-form" onSubmit={handleSubmit} className="space-y-6">
        <div className={activeTab === 'write' ? 'block' : 'hidden'}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main Editor */}
            <div className="lg:col-span-2 space-y-6">
               <div className="bg-white p-6 shadow rounded-lg space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Post Title</label>
                    <input 
                      type="text" 
                      name="title" 
                      value={formData.title} 
                      onChange={handleChange} 
                      required 
                      className="mt-1 block w-full border border-gray-300 rounded-md p-3 text-lg font-bold text-gray-900 placeholder-gray-400 focus:ring-brand-green focus:border-brand-green" 
                      placeholder="Enter a captivating title..."
                    />
                  </div>
                  
                  <div className="mb-12 flex flex-col">
                     <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                     {editorMode === 'rich' ? (
                        <RichTextEditor
                           value={formData.content || ''}
                           onChange={handleEditorChange}
                           placeholder="Type '/' to start writing..."
                        />
                     ) : (
                        <MarkdownEditor
                            value={formData.content || ''}
                            onChange={handleEditorChange}
                            placeholder="Write in Markdown. Use #hashtags and @[product:ID] to embed."
                            products={products}
                        />
                     )}
                  </div>
               </div>

               {/* Advanced SEO Group */}
               <div className="bg-white p-6 shadow rounded-lg">
                  <SeoFieldGroup 
                     data={formData} 
                     onChange={handleChange}
                     onKeywordsChange={(k) => setFormData(prev => ({...prev, keywords: k }))}
                     defaultTitle={formData.title}
                     defaultDescription={formData.summary}
                     previewImage={formData.featuredImage || formData.thumbnail}
                     permalink={`https://jamboapparels.com/blog/${formData.slug || 'new-post'}`}
                  />
               </div>
            </div>

            <BlogEditorSidebar 
                formData={formData} 
                categories={categories} 
                onChange={handleChange} 
                onImageChange={handleImageUpload}
                onImageClear={handleImageClear}
                onQuickCategoryAdd={loadCategories}
                loading={loading}
                uploading={uploadingField !== null}
                id={id}
            />
          </div>
        </div>

        <div className={activeTab === 'preview' ? 'block' : 'hidden'}>
           <BlogEditorPreview formData={formData} categories={categories} />
        </div>
      </form>
    </div>
  );
};