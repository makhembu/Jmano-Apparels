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
    <div className="max-w-7xl mx-auto px-4 py-8">
       <div className="flex justify-between items-center mb-6">
         <h1 className="text-2xl font-bold font-serif">{id ? 'Edit Product' : 'Add New Product'}</h1>
         <div className="flex gap-3">
             <Button variant="outline" onClick={() => navigate('/admin/products')}>Cancel</Button>
             <Button onClick={handleSubmit} isLoading={loading}>Save Product</Button>
         </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Form */}
          <div className="lg:col-span-2 space-y-6">
             <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Basic Info */}
                <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Basic Information</h2>
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Product Title</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-brand-green focus:border-brand-green" placeholder="e.g. Hope Hoodie Gold" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Price (£)</label>
                                <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-brand-green focus:border-brand-green" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Sale Price (£)</label>
                                <input type="number" step="0.01" name="salePrice" value={formData.salePrice || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-brand-green focus:border-brand-green" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Category</label>
                            <select name="categoryKey" value={formData.categoryKey} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-brand-green focus:border-brand-green">
                                <option value="">Select Category...</option>
                                {categories.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea name="description" rows={4} value={formData.description} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-brand-green focus:border-brand-green" />
                        </div>
                    </div>
                </div>

                {/* Media */}
                <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Media</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Product Image URL</label>
                        <div className="mt-1 flex items-center space-x-4">
                            <input type="text" name="image" value={formData.image} onChange={handleChange} required className="flex-grow border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-brand-green focus:border-brand-green" placeholder="https://..." />
                            <div className="relative">
                                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                <Button type="button" variant="outline" isLoading={uploading}>{uploading ? 'Uploading...' : 'Upload'}</Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inventory & Variants */}
                <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Inventory & Variants</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">SKU</label>
                            <input type="text" name="sku" value={formData.sku || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-brand-green focus:border-brand-green" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                            <input type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-brand-green focus:border-brand-green" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Low Stock Warning</label>
                            <input type="number" name="lowStockThreshold" value={formData.lowStockThreshold || 5} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-brand-green focus:border-brand-green" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                            <input type="number" step="0.01" name="weight" value={formData.weight || 0} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-brand-green focus:border-brand-green" />
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                       <div>
                          <label className="block text-sm font-medium text-gray-700">Sizes (Comma separated, e.g. S, M, L)</label>
                          <input type="text" value={formData.sizes?.join(', ')} onChange={(e) => handleArrayChange(e, 'sizes')} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-brand-green focus:border-brand-green" />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-gray-700">Colors (Comma separated, e.g. Red, Blue)</label>
                          <input type="text" value={formData.colors?.join(', ')} onChange={(e) => handleArrayChange(e, 'colors')} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-brand-green focus:border-brand-green" />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-gray-700">Tags (Comma separated)</label>
                          <input type="text" value={formData.tags?.join(', ')} onChange={(e) => handleArrayChange(e, 'tags')} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-brand-green focus:border-brand-green" />
                       </div>
                    </div>
                </div>

                {/* Visibility */}
                <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Visibility & Status</h2>
                     <div className="space-y-3">
                        <label className="flex items-center">
                            <input type="checkbox" name="isPublished" checked={formData.isPublished ?? true} onChange={handleChange} className="h-4 w-4 text-brand-green border-gray-300 rounded focus:ring-brand-green" />
                            <span className="ml-2 text-sm text-gray-900">Published (Visible in shop)</span>
                        </label>
                        <label className="flex items-center">
                            <input type="checkbox" name="isOnSale" checked={formData.isOnSale} onChange={handleChange} className="h-4 w-4 text-brand-green border-gray-300 rounded focus:ring-brand-green" />
                            <span className="ml-2 text-sm text-gray-900">On Sale Badge</span>
                        </label>
                         <label className="flex items-center">
                            <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="h-4 w-4 text-brand-green border-gray-300 rounded focus:ring-brand-green" />
                            <span className="ml-2 text-sm text-gray-900">Featured (Show on home page)</span>
                        </label>
                     </div>
                </div>

                {/* SEO */}
                <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
                   <h2 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Search Engine Optimization</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Slug</label>
                            <input type="text" name="slug" value={formData.slug || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-brand-green focus:border-brand-green" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Meta Title</label>
                            <input type="text" name="seoTitle" value={formData.seoTitle || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-brand-green focus:border-brand-green" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Meta Description</label>
                            <textarea name="seoDescription" rows={2} value={formData.seoDescription || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-brand-green focus:border-brand-green" />
                        </div>
                    </div>
                </div>

             </form>
          </div>

          {/* Right Column: Preview */}
          <div className="lg:col-span-1">
             <div className="sticky top-24 space-y-6">
                <ProductPreview product={formData} categories={categories} />
                
                {/* Stats (if existing) */}
                {id && (
                  <div className="bg-white shadow rounded-lg p-4 border border-gray-200">
                    <h3 className="font-bold text-gray-500 text-xs uppercase mb-3">Performance</h3>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">{formData.totalSales || 0}</p>
                          <p className="text-xs text-gray-500">Total Sales</p>
                       </div>
                       <div className="text-center">
                          <p className="text-2xl font-bold text-yellow-500">{formData.averageRating?.toFixed(1) || '-'} ★</p>
                          <p className="text-xs text-gray-500">{formData.reviewCount || 0} Reviews</p>
                       </div>
                    </div>
                  </div>
                )}
             </div>
          </div>
       </div>
    </div>
  );
};