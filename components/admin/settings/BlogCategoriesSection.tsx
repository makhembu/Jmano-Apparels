
import React, { useState, useEffect } from 'react';
import { BlogCategory } from '../../../types';
import { api } from '../../../lib/db';
import { Button } from '../../ui/Button';
import { useToast } from '../../../context/ToastContext';

export const BlogCategoriesSection: React.FC = () => {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [newCat, setNewCat] = useState({ name: '', slug: '', description: '' });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadCats();
  }, []);

  const loadCats = () => api.getBlogCategories().then(setCategories);

  const handleAdd = async () => {
    if (!newCat.name) {
      showToast('Name is required', 'error');
      return;
    }
    const slug = newCat.slug || newCat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    setLoading(true);
    try {
      await api.createBlogCategory({ ...newCat, slug });
      showToast('Blog Category created', 'success');
      setNewCat({ name: '', slug: '', description: '' });
      loadCats();
    } catch (e) {
      showToast('Failed to create category', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(!window.confirm(`Delete blog category?`)) return;
    try {
      await api.deleteBlogCategory(id);
      showToast('Category deleted', 'success');
      loadCats();
    } catch(e) {
      showToast('Failed to delete', 'error');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 border border-gray-200 space-y-4">
      <h3 className="text-lg font-medium border-b pb-2 text-brand-green">Blog Categories</h3>
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Slug</th>
                <th className="px-4 py-2 text-left">Description</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {categories.map(cat => (
                <tr key={cat.id}>
                  <td className="px-4 py-2">{cat.name}</td>
                  <td className="px-4 py-2 text-gray-500">{cat.slug}</td>
                  <td className="px-4 py-2 text-gray-500 truncate max-w-xs">{cat.description}</td>
                  <td className="px-4 py-2 text-right">
                    <button type="button" onClick={() => handleDelete(cat.id)} className="text-red-500 hover:text-red-700 text-xs">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-50 p-4 rounded border grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-500">Name</label>
            <input type="text" value={newCat.name} onChange={e => setNewCat({...newCat, name: e.target.value})} className="w-full border rounded p-1 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500">Slug (Optional)</label>
            <input type="text" value={newCat.slug} onChange={e => setNewCat({...newCat, slug: e.target.value})} className="w-full border rounded p-1 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500">Description</label>
            <input type="text" value={newCat.description} onChange={e => setNewCat({...newCat, description: e.target.value})} className="w-full border rounded p-1 text-sm" />
          </div>
          <Button type="button" onClick={handleAdd} disabled={loading} variant="secondary" className="h-8">Add</Button>
        </div>
      </div>
    </div>
  );
};
