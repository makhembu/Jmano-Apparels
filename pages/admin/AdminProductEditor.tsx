import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { Button } from '../../components/ui/Button';
import { api } from '../../lib/db';
import { useToast } from '../../context/ToastContext';
import { Product } from '../../types';
import { ProductPreview } from '../../components/admin/products/ProductPreview';

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
      showToast('Product saved successfully', 'success');
      navigate('/admin/products');
    } catch (err) {
      showToast('Error saving product', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
       <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold font-serif text-gray-900">{id ? 'Edit Product' : 'New Product'}</h1>
          <div className="flex gap-3">
             <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>Cancel</Button>
             <Button type="submit" form="product-form" variant="primary" isLoading={loading}>Save Product</Button>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Editor Form */}
          <div className="lg:col-span-2 space-y-6">
             <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Basic Info Card */}
                <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
                   <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Basic Information</h3>
                   <div className="grid grid-cols-1 gap-6">
                      <div>
                         <label className="block text-sm font-medium text-gray-700">Product Title</label>
                         <input type="text" name="title" value={formData.title} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-brand-green focus:border-brand-green" placeholder="e.g. Hope Hoodie Gold" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Category</label>
                            <select name="categoryKey" value={formData.categoryKey} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-brand-green focus:border-brand-green">
                               <option value="">Select Category...</option>
                               {categories.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                            </select>
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Price (£)</label>
                            <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-brand-green focus:border-brand-green" />
                         </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Sale Price (£) <span className="text-xs text-gray-400 font-normal">(Optional)</span></label>
                            <input type="number" step="0.01" name="salePrice" value={formData.salePrice || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-brand-green focus:border-brand-green" />
                         </div>
                         <div className="flex items-end pb-3">
                            <label className="flex items-center cursor-pointer select-none">
                                <input type="checkbox" name="isOnSale" checked={formData.isOnSale} onChange={handleChange} className="h-4 w-4 text-brand-green bg-white border-gray-300 rounded focus:ring-brand-green" />
                                <span className="ml-2 text-sm text-gray-700">Mark as On Sale</span>
                            </label>
                         </div>
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-gray-700">Description</label>
                         <textarea name="description" rows={4} value={formData.description} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-brand-green focus:border-brand-green" placeholder="Describe your product..." />
                      </div>
                   </div>
                </div>

                {/* Media Card */}
                <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
                   <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Media</h3>
                   <div>
                      <label className="block text-sm font-medium text-gray-700">Product Image URL</label>
                      <div className="mt-1 flex items-center space-x-4">
                        <div className="flex-grow">
                           <input 
                             type="text" 
                             name="image" 
                             placeholder="https://..."
                             value={formData.image} 
                             onChange={handleChange} 
                             required 
                             className="block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-brand-green focus:border-brand-green" 
                           />
                        </div>
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
                      <p className="text-xs text-gray-500 mt-1">Recommended: 800x800px or square aspect ratio. JPG or PNG.</p>
                   </div>
                </div>

                {/* Inventory & Variants Card */}
                <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
                   <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Inventory & Variants</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                         <label className="block text-sm font-medium text-gray-700">SKU</label>
                         <input type="text" name="sku" value={formData.sku || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-brand-green focus:border-brand-green" />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                         <input type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-brand-green focus:border-brand-green" />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                         <input type="number" step="0.01" name="weight" value={formData.weight || 0} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-brand-green focus:border-brand-green" />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-gray-700">Low Stock Threshold</label>
                         <input type="number" name="lowStockThreshold" value={formData.lowStockThreshold || 5} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-brand-green focus:border-brand-green" />
                      </div>
                   </div>
                   
                   <div className="mt-6 space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Sizes (Comma separated)</label>
                        <input type="text" value={formData.sizes?.join(', ')} onChange={(e) => handleArrayChange(e, 'sizes')} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-brand-green focus:border-brand-green" placeholder="XS, S, M, L, XL" />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Colors (Comma separated)</label>
                        <input type="text" value={formData.colors?.join(', ')} onChange={(e) => handleArrayChange(e, 'colors')} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-brand-green focus:border-brand-green" placeholder="Red, Blue, Forest Green" />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Tags (Comma separated)</label>
                        <input type="text" value={formData.tags?.join(', ')} onChange={(e) => handleArrayChange(e, 'tags')} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-brand-green focus:border-brand-green" placeholder="Summer, Bestseller, New Arrival" />
                     </div>
                   </div>
                </div>

                {/* Visibility & SEO Card */}
                <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
                   <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Visibility & SEO</h3>
                   <div className="flex space-x-6 mb-6">
                      <label className="flex items-center cursor-pointer select-none">
                          <input type="checkbox" name="isPublished" checked={formData.isPublished ?? true} onChange={handleChange} className="h-4 w-4 text-brand-green bg-white border-gray-300 rounded focus:ring-brand-green" />
                          <span className="ml-2 text-sm text-gray-700 font-medium">Published</span>
                      </label>
                      <label className="flex items-center cursor-pointer select-none">
                          <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="h-4 w-4 text-brand-green bg-white border-gray-300 rounded focus:ring-brand-green" />
                          <span className="ml-2 text-sm text-gray-700 font-medium">Featured Product</span>
                      </label>
                   </div>

                   <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700">SEO Title</label>
                            <input type="text" name="seoTitle" value={formData.seoTitle || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-brand-green focus:border-brand-green" placeholder={formData.title} />
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Slug URL</label>
                            <input type="text" name="slug" value={formData.slug || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-brand-green focus:border-brand-green" placeholder="product-slug" />
                         </div>
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-gray-700">SEO Description</label>
                         <textarea name="seoDescription" rows={2} value={formData.seoDescription || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-brand-green focus:border-brand-green" placeholder="Meta description for search engines" />
                      </div>
                   </div>
                </div>

             </form>
          </div>

          {/* Right Column: Live Preview */}
          <div className="lg:col-span-1">
             <ProductPreview product={formData} categories={categories} />
          </div>
       </div>
    </div>
  );
};