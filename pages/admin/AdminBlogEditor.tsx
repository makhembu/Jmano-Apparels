
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/db';
import { BlogPost, BlogCategory } from '../../types';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { BlogEditorForm } from '../../components/admin/blog/BlogEditorForm';
import { BlogEditorSidebar } from '../../components/admin/blog/BlogEditorSidebar';
import { BlogEditorPreview } from '../../components/admin/blog/BlogEditorPreview';

export const AdminBlogEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

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
    seoDescription: ''
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
    
    if (name === 'title') {
      const shouldUpdateSlug = !id || !formData.slug;
      setFormData(prev => ({
        ...prev,
        title: value,
        slug: shouldUpdateSlug ? generateSlug(value) : prev.slug,
        seoTitle: !prev.seoTitle ? value : prev.seoTitle 
      }));
    } else if (type === 'number') {
       setFormData({ ...formData, [name]: parseFloat(value) });
    } else {
       setFormData({ ...formData, [name]: value });
    }
  };

  const handleEditorChange = (content: string) => {
    const text = content.replace(/<[^>]*>?/gm, '');
    calculateReadingTime(text);
    setFormData(prev => ({ ...prev, content }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'featuredImage' | 'thumbnail') => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploading(true);
    try {
      const publicUrl = await api.uploadImage(file);
      setFormData(prev => ({ ...prev, [field]: publicUrl }));
      showToast('Image uploaded successfully', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to upload', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleImageClear = (field: 'featuredImage' | 'thumbnail') => {
      setFormData(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = {
      ...formData,
      seoTitle: formData.seoTitle || formData.title,
      seoDescription: formData.seoDescription || formData.summary
    };

    try {
      if (id) {
        await api.adminUpdateBlogPost(id, payload);
      } else {
        await api.adminCreateBlogPost(payload);
      }
      showToast('Post saved successfully', 'success');
      navigate('/admin/blog');
    } catch (error) {
      showToast('Error saving post', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-6">
         <h1 className="text-2xl font-bold font-serif">{id ? 'Edit Post' : 'New Post'}</h1>
         <div className="flex gap-2">
            <button 
              type="button" 
              onClick={() => setActiveTab('write')} 
              className={`px-4 py-2 rounded text-sm font-medium ${activeTab === 'write' ? 'bg-brand-green text-white' : 'bg-white text-gray-700 border'}`}
            >
              Write
            </button>
            <button 
              type="button" 
              onClick={() => setActiveTab('preview')} 
              className={`px-4 py-2 rounded text-sm font-medium ${activeTab === 'preview' ? 'bg-brand-green text-white' : 'bg-white text-gray-700 border'}`}
            >
              Preview
            </button>
         </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className={activeTab === 'write' ? 'block' : 'hidden'}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <BlogEditorForm 
                formData={formData} 
                onChange={handleChange} 
                onEditorChange={handleEditorChange} 
            />
            <BlogEditorSidebar 
                formData={formData} 
                categories={categories} 
                onChange={handleChange} 
                onImageChange={handleImageUpload}
                onImageClear={handleImageClear}
                onQuickCategoryAdd={loadCategories}
                loading={loading}
                uploading={uploading}
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
