import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { Button } from '../../components/ui/Button';
import { api } from '../../lib/db';
import { useToast } from '../../context/ToastContext';
import { Product } from '../../types';

const emptyProduct: Partial<Product> = {
  title: '', price: 0, salePrice: undefined, isOnSale: false, categoryKey: '',
  image: '', description: '', sizes: ['S', 'M', 'L'], colors: [], tags: [],
  isFeatured: false, isPublished: true, sku: '', slug: '', stockQuantity: 0, lowStockThreshold: 5, weight: 0
};

export const AdminProductEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, categories, refreshData } = useShop();
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState<Partial<Product>>(emptyProduct);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (id && products.length > 0) {
      const p = products.find(prod => prod.id === id);
      if (p) setFormData(p);
    }
  }, [id, products]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
       const checked = (e.target as HTMLInputElement).checked;
       setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
       setFormData(prev => ({ ...prev, [name]: parseFloat(value) }));
    } else {
       setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'sizes' | 'colors' | 'tags') => {
      const val = e.target.value.split(',').map(s => s.trim());
      setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    // Basic validation
    if (file.size > 5 * 1024 * 1024) {
      showToast('File is too large (max 5MB)', 'error');
      return;
    }
    
    setUploading(true);
    try {
      const publicUrl = await api.uploadImage(file);
      setFormData(prev => ({ ...prev, image: publicUrl }));
      showToast('Image uploaded successfully', 'success');
    } catch (error: any) {
      console.error(error);
      showToast(error.message || 'Failed to upload image', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await api.adminUpdateProduct(id, formData);
      } else {
        await api.adminCreateProduct(formData);
      }
      await refreshData();
      showToast('Product saved', 'success');
      navigate('/admin/products');
    } catch (err) {
      showToast('Error saving product', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
       <h1 className="text-2xl font-bold mb-6">{id ? 'Edit Product' : 'New Product'}</h1>
       
       {/* Read-Only Stats for Existing Products */}
       {id && (
         <div className="grid grid-cols-3 gap-4 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="text-center">
               <span className="block text-xs text-gray-500 uppercase font-bold">Total Sales</span>
               <span className="text-xl font-bold text-gray-900">{formData.totalSales || 0}</span>
            </div>
            <div className="text-center border-l border-r border-gray-200">
               <span className="block text-xs text-gray-500 uppercase font-bold">Avg Rating</span>
               <span className="text-xl font-bold text-yellow-500">{formData.averageRating?.toFixed(1) || '-'} ★</span>
            </div>
            <div className="text-center">
               <span className="block text-xs text-gray-500 uppercase font-bold">Reviews</span>
               <span className="text-xl font-bold text-gray-900">{formData.reviewCount || 0}</span>
            </div>
         </div>
       )}

       <form onSubmit={handleSubmit} className="bg-white p-6 shadow rounded space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Basic Info */}
             <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded p-2 bg-white text-gray-900" />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select name="categoryKey" value={formData.categoryKey} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded p-2 bg-white text-gray-900">
                   <option value="">Select...</option>
                   {categories.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
             </div>
             
             {/* Pricing */}
             <div>
                <label className="block text-sm font-medium text-gray-700">Price (£)</label>
                <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded p-2 bg-white text-gray-900" />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Sale Price (£)</label>
                <input type="number" step="0.01" name="salePrice" value={formData.salePrice || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded p-2 bg-white text-gray-900" />
             </div>
             <div className="flex flex-col space-y-2 pt-5">
                <div className="flex items-center">
                    <input type="checkbox" name="isOnSale" checked={formData.isOnSale} onChange={handleChange} className="h-4 w-4 text-brand-green bg-white border-gray-300 rounded focus:ring-brand-green" />
                    <label className="ml-2 text-sm text-gray-700">On Sale</label>
                </div>
                <div className="flex items-center">
                    <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="h-4 w-4 text-brand-green bg-white border-gray-300 rounded focus:ring-brand-green" />
                    <label className="ml-2 text-sm text-gray-700">Featured</label>
                </div>
                <div className="flex items-center">
                    <input type="checkbox" name="isPublished" checked={formData.isPublished ?? true} onChange={handleChange} className="h-4 w-4 text-brand-green bg-white border-gray-300 rounded focus:ring-brand-green" />
                    <label className="ml-2 text-sm text-gray-700">Published</label>
                </div>
             </div>

             {/* Inventory */}
             <div>
                <label className="block text-sm font-medium text-gray-700">SKU</label>
                <input type="text" name="sku" value={formData.sku || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded p-2 bg-white text-gray-900" />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                <input type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded p-2 bg-white text-gray-900" />
             </div>
             
             <div>
                <label className="block text-sm font-medium text-gray-700">Low Stock Threshold</label>
                <input type="number" name="lowStockThreshold" value={formData.lowStockThreshold || 5} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded p-2 bg-white text-gray-900" />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                <input type="number" step="0.01" name="weight" value={formData.weight || 0} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded p-2 bg-white text-gray-900" />
             </div>

             {/* Image Upload / URL */}
             <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Product Image</label>
                <div className="mt-1 flex items-center space-x-4">
                  {/* URL Input */}
                  <div className="flex-grow">
                     <input 
                       type="text" 
                       name="image" 
                       placeholder="https://..."
                       value={formData.image} 
                       onChange={handleChange} 
                       required 
                       className="block w-full border border-gray-300 rounded p-2 bg-white text-gray-900" 
                     />
                  </div>
                  {/* Upload Button */}
                  <div className="flex-shrink-0 relative">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <Button type="button" variant="outline" isLoading={uploading}>
                        {uploading ? 'Uploading...' : 'Upload File'}
                      </Button>
                  </div>
                </div>
                {formData.image && (
                   <div className="mt-2 h-32 w-32 rounded border overflow-hidden bg-gray-100">
                      <img src={formData.image} alt="Preview" className="h-full w-full object-cover" />
                   </div>
                )}
             </div>

             <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea name="description" rows={3} value={formData.description} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded p-2 bg-white text-gray-900" />
             </div>
             
             <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700">Sizes (comma separated)</label>
                  <input type="text" value={formData.sizes?.join(', ')} onChange={(e) => handleArrayChange(e, 'sizes')} className="mt-1 block w-full border border-gray-300 rounded p-2 bg-white text-gray-900" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700">Colors (comma separated)</label>
                  <input type="text" value={formData.colors?.join(', ')} onChange={(e) => handleArrayChange(e, 'colors')} className="mt-1 block w-full border border-gray-300 rounded p-2 bg-white text-gray-900" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700">Tags (comma separated)</label>
                  <input type="text" value={formData.tags?.join(', ')} onChange={(e) => handleArrayChange(e, 'tags')} className="mt-1 block w-full border border-gray-300 rounded p-2 bg-white text-gray-900" />
               </div>
             </div>

             {/* SEO */}
             <div>
                <label className="block text-sm font-medium text-gray-700">SEO Title</label>
                <input type="text" name="seoTitle" value={formData.seoTitle || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded p-2 bg-white text-gray-900" />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Slug</label>
                <input type="text" name="slug" value={formData.slug || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded p-2 bg-white text-gray-900" />
             </div>
             <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">SEO Description</label>
                <textarea name="seoDescription" rows={2} value={formData.seoDescription || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded p-2 bg-white text-gray-900" />
             </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t">
             <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>Cancel</Button>
             <Button type="submit" variant="primary" isLoading={loading}>Save Product</Button>
          </div>
       </form>
    </div>
  );
};