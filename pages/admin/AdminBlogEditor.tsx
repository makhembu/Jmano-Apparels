import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/db';
import { BlogPost, BlogCategory } from '../../types';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export const AdminBlogEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: '',
    slug: '',
    content: '',
    summary: '',
    author: user?.name || 'Admin',
    status: 'draft',
    featuredImage: '',
    thumbnail: '',
    readingTime: 5,
    categoryId: '',
    seoTitle: '',
    seoDescription: ''
  });
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch categories
    api.getBlogCategories().then(setCategories).catch(console.error);

    if (id) {
      api.getBlogPosts().then(posts => {
        const p = posts.find(post => post.id === id);
        if (p) setFormData(p);
      });
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
       setFormData({ ...formData, [name]: parseFloat(value) });
    } else {
       setFormData({ ...formData, [name]: value });
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    // Auto-generate slug if it's new
    if (!id && (!formData.slug || formData.slug === formData.title?.toLowerCase().replace(/ /g, '-'))) {
      setFormData(prev => ({
        ...prev,
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      }));
    } else {
      setFormData(prev => ({ ...prev, title }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await api.adminUpdateBlogPost(id, formData);
      } else {
        await api.adminCreateBlogPost(formData);
      }
      showToast('Post saved', 'success');
      navigate('/admin/blog');
    } catch (error) {
      showToast('Error saving post', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{id ? 'Edit Post' : 'New Post'}</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow rounded space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input 
            type="text" 
            name="title" 
            value={formData.title} 
            onChange={handleTitleChange} 
            required 
            className="mt-1 block w-full border border-gray-300 rounded p-2 bg-white text-gray-900" 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
             <label className="block text-sm font-medium text-gray-700">Slug (URL)</label>
             <input 
              type="text" 
              name="slug" 
              value={formData.slug} 
              onChange={handleChange} 
              required 
              className="mt-1 block w-full border border-gray-300 rounded p-2 bg-gray-50 text-gray-900" 
             />
           </div>
           <div>
             <label className="block text-sm font-medium text-gray-700">Category</label>
             <select name="categoryId" value={formData.categoryId || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded p-2 bg-white text-gray-900">
                <option value="">Select Category...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
             </select>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div>
             <label className="block text-sm font-medium text-gray-700">Author</label>
             <input type="text" name="author" value={formData.author} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded p-2 bg-white text-gray-900" />
           </div>
           <div>
             <label className="block text-sm font-medium text-gray-700">Status</label>
             <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded p-2 bg-white text-gray-900">
               <option value="draft">Draft</option>
               <option value="published">Published</option>
               <option value="archived">Archived</option>
             </select>
           </div>
           <div>
             <label className="block text-sm font-medium text-gray-700">Reading Time (mins)</label>
             <input type="number" name="readingTime" value={formData.readingTime || 5} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded p-2 bg-white text-gray-900" />
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
             <label className="block text-sm font-medium text-gray-700">Featured Image URL</label>
             <input type="text" name="featuredImage" value={formData.featuredImage || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded p-2 bg-white text-gray-900" />
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700">Thumbnail URL</label>
             <input type="text" name="thumbnail" value={formData.thumbnail || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded p-2 bg-white text-gray-900" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Summary (Excerpt)</label>
          <textarea name="summary" rows={3} value={formData.summary} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded p-2 bg-white text-gray-900" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Content (Markdown supported)</label>
          <textarea name="content" rows={15} value={formData.content} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded p-2 font-mono text-sm bg-white text-gray-900" />
        </div>
        
        <div className="bg-gray-50 p-4 rounded border">
           <h3 className="text-sm font-bold text-gray-700 mb-4">SEO Settings</h3>
           <div className="grid grid-cols-1 gap-4">
              <div>
                 <label className="block text-xs font-medium text-gray-500">SEO Title</label>
                 <input type="text" name="seoTitle" value={formData.seoTitle || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded p-2 bg-white text-gray-900 text-sm" />
              </div>
              <div>
                 <label className="block text-xs font-medium text-gray-500">SEO Description</label>
                 <textarea name="seoDescription" rows={2} value={formData.seoDescription || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded p-2 bg-white text-gray-900 text-sm" />
              </div>
           </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/blog')}>Cancel</Button>
          <Button type="submit" variant="primary" isLoading={loading}>Save Post</Button>
        </div>
      </form>
    </div>
  );
};