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
  // FIX: The 'Product' type has an 'images' array. Initialize as an empty array.
  images: [], description: '', sizes: ['S', 'M', 'L'], colors: [], tags: [],
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

  // Quick Add Category State
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryLabel, setNewCategoryLabel] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);

  useEffect(() => {
    if (id && products.length > 0) {
      const p = products.find(prod => prod.id === id);
      if (p) setFormData(p);
    } else if (!id) {
      setFormData(emptyProduct);
    }
  }, [id, products]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
       const checked = (e.target as HTMLInputElement).checked;
       setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
       setFormData(prev => ({ ...prev, [name]: value === '' ? 0 : parseFloat(value) }));
    } else {
        // FIX: Add special handling for the image URL input which should update the `images` array.
        if (name === 'image') {
            setFormData(prev => ({ ...prev, images: [value] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    }
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'sizes' | 'colors' | 'tags') => {
      const val = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
      setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    // 5MB Limit for standard uploads
    if (file.size > 5 * 1024 * 1024) {
      showToast('File is too large (max 5MB)', 'error');
      return;
    }
    
    setUploading(true);
    try {
      const publicUrl = await api.uploadImage(file);
      // FIX: The 'Product' type requires an 'images' array. Set the uploaded URL as the first item.
      setFormData(prev => ({ ...prev, images: [publicUrl] }));
      showToast('Image uploaded successfully', 'success');
    } catch (error: any) {
      console.error(error);
      // The error message from StorageService will guide the user on bucket setup
      showToast(error.message || 'Failed to upload image', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleQuickAddCategory = async () => {
    if (!newCategoryLabel.trim()) return;
    
    const key = newCategoryLabel.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    
    if (key.length < 2) {
        showToast('Invalid category name', 'error');
        return;
    }

    setCreatingCategory(true);
    try {
        await api.createCategory({
            key,
            label: newCategoryLabel,
            color: '#2E7D32', 
            bgColorClass: 'bg-brand-green'
        });
        await refreshData();
        setFormData(prev => ({ ...prev, categoryKey: key }));
        setIsAddingCategory(false);
        setNewCategoryLabel('');
        showToast('Category created', 'success');
    } catch (e: any) {
        showToast('Failed to create category. Key might already exist.', 'error');
    } finally {
        setCreatingCategory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // FIX: Validate the 'images' array instead of the non-existent 'image' property.
    if (!formData.title || !formData.categoryKey || !formData.images || formData.images.length === 0) {
      showToast('Please fill in required fields (Title, Category, Image)', 'error');
      return;
    }

    setLoading(true);
    try {
      if (id) {
        await api.adminUpdateProduct(id, formData);
        showToast('Product updated successfully', 'success');
      } else {
        await api.adminCreateProduct(formData);
        showToast('Product created successfully', 'success');
      }
      await refreshData();
      navigate('/admin/products');
    } catch (err: any) {
      showToast(`Error saving product: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
         <div>
            <h1 className="text-3xl font-bold font-serif text-slate-900">{id ? 'Edit Product' : 'New Collection Piece'}</h1>
            <p className="text-slate-500 text-sm mt-1">Ethically threading scriptures for the modern believer.</p>
         </div>
         <div className="flex gap-3">
             <Button variant="outline" onClick={() => navigate('/admin/products')}>Discard</Button>
             <Button onClick={handleSubmit} isLoading={loading} className="shadow-lg shadow-brand-green/20">
               {id ? 'Update Product' : 'Publish Product'}
             </Button>
         </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Form */}
          <div className="lg:col-span-2 space-y-8">
             <form id="product-form" onSubmit={handleSubmit} className="space-y-8">
                
                {/* Basic Info */}
                <div className="bg-white shadow-xl shadow-slate-200/50 rounded-2xl p-8 border border-slate-200">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6 border-b border-slate-50 pb-4">Essential Details</h2>
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Product Title*</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl p-4 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-brand-green/10 outline-none transition-all" placeholder="e.g. Hope Hoodie Gold Edition" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Base Price (£)*</label>
                                <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl p-4 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-brand-green/10 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Sale Price (Optional)</label>
                                <input type="number" step="0.01" name="salePrice" value={formData.salePrice || ''} onChange={handleChange} className="w-full border border-slate-200 rounded-xl p-4 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-brand-green/10 outline-none" />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">Category*</label>
                                {!isAddingCategory && (
                                    <button 
                                        type="button" 
                                        onClick={() => setIsAddingCategory(true)} 
                                        className="text-[10px] text-brand-green hover:underline font-black uppercase tracking-wider"
                                    >
                                        + New Category
                                    </button>
                                )}
                            </div>
                            
                            {isAddingCategory ? (
                                <div className="flex gap-2 animate-fade-in">
                                    <input 
                                        type="text" 
                                        value={newCategoryLabel}
                                        onChange={(e) => setNewCategoryLabel(e.target.value)}
                                        placeholder="Category Label"
                                        className="flex-grow border border-slate-200 rounded-xl p-4 text-sm bg-brand-light/30 focus:ring-2 focus:ring-brand-green/10 outline-none"
                                    />
                                    <Button type="button" onClick={handleQuickAddCategory} isLoading={creatingCategory} className="px-5" variant="primary">Add</Button>
                                    <Button type="button" variant="outline" onClick={() => setIsAddingCategory(false)} className="px-5">✕</Button>
                                </div>
                            ) : (
                                <select 
                                    name="categoryKey" 
                                    value={formData.categoryKey} 
                                    onChange={handleChange} 
                                    className="w-full border border-slate-200 rounded-xl p-4 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-brand-green/10 outline-none"
                                >
                                    <option value="">Select Category...</option>
                                    {categories.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                                </select>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Product Story & Description*</label>
                            <textarea name="description" rows={6} value={formData.description} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl p-4 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-brand-green/10 outline-none" placeholder="Describe the scripture inspiration and material quality..." />
                        </div>
                    </div>
                </div>

                {/* Media */}
                <div className="bg-white shadow-xl shadow-slate-200/50 rounded-2xl p-8 border border-slate-200">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6 border-b border-slate-50 pb-4">Product Visuals</h2>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Display Image URL*</label>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <input type="text" name="image" value={formData.images?.[0] || ''} onChange={handleChange} required className="flex-grow border border-slate-200 rounded-xl p-4 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-brand-green/10 outline-none" placeholder="https://images.unsplash.com/..." />
                            <div className="relative">
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  onChange={handleImageUpload} 
                                  disabled={uploading} 
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                />
                                <Button type="button" variant="outline" isLoading={uploading} className="h-full px-8 whitespace-nowrap">
                                  {uploading ? 'Processing...' : 'Upload Asset'}
                                </Button>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-3 italic">Preferred aspect ratio: 1:1 square. Max size 5MB.</p>
                    </div>
                </div>

                {/* Inventory & Variants */}
                <div className="bg-white shadow-xl shadow-slate-200/50 rounded-2xl p-8 border border-slate-200">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6 border-b border-slate-50 pb-4">Inventory & Variants</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">SKU Identifier</label>
                            <input type="text" name="sku" value={formData.sku || ''} onChange={handleChange} className="w-full border border-slate-200 rounded-xl p-4 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-brand-green/10 outline-none" placeholder="JAM-HOPE-001" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Current Stock level*</label>
                            <input type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl p-4 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-brand-green/10 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Low Stock Threshold</label>
                            <input type="number" name="lowStockThreshold" value={formData.lowStockThreshold || 5} onChange={handleChange} className="w-full border border-slate-200 rounded-xl p-4 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-brand-green/10 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Weight (kg)</label>
                            <input type="number" step="0.01" name="weight" value={formData.weight || 0} onChange={handleChange} className="w-full border border-slate-200 rounded-xl p-4 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-brand-green/10 outline-none" />
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                       <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Available Sizes (Comma separated)</label>
                          <input type="text" value={formData.sizes?.join(', ')} onChange={(e) => handleArrayChange(e, 'sizes')} className="w-full border border-slate-200 rounded-xl p-4 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-brand-green/10 outline-none" placeholder="XS, S, M, L, XL, XXL" />
                       </div>
                       <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Available Colors (Comma separated)</label>
                          <input type="text" value={formData.colors?.join(', ')} onChange={(e) => handleArrayChange(e, 'colors')} className="w-full border border-slate-200 rounded-xl p-4 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-brand-green/10 outline-none" placeholder="Gold, Midnight Black, Heather Gray" />
                       </div>
                       <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Search Tags (Internal & Search)</label>
                          <input type="text" value={formData.tags?.join(', ')} onChange={(e) => handleArrayChange(e, 'tags')} className="w-full border border-slate-200 rounded-xl p-4 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-brand-green/10 outline-none" placeholder="Hope, New Arrival, Unisex, Scripture" />
                       </div>
                    </div>
                </div>

                {/* Visibility */}
                <div className="bg-white shadow-xl shadow-slate-200/50 rounded-2xl p-8 border border-slate-200">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6 border-b border-slate-50 pb-4">Store Placement</h2>
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" name="isPublished" checked={formData.isPublished ?? true} onChange={handleChange} className="h-5 w-5 text-brand-green border-slate-300 rounded-lg focus:ring-brand-green" />
                            <span className="text-sm font-bold text-slate-700 group-hover:text-brand-green transition-colors">Visible in Store</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" name="isOnSale" checked={formData.isOnSale} onChange={handleChange} className="h-5 w-5 text-brand-green border-slate-300 rounded-lg focus:ring-brand-green" />
                            <span className="text-sm font-bold text-slate-700 group-hover:text-red-500 transition-colors">On Sale Badge</span>
                        </label>
                         <label className="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="h-5 w-5 text-brand-green border-slate-300 rounded-lg focus:ring-brand-green" />
                            <span className="text-sm font-bold text-slate-700 group-hover:text-amber-500 transition-colors">Home Page Feature</span>
                        </label>
                     </div>
                </div>

                {/* SEO */}
                <div className="bg-white shadow-xl shadow-slate-200/50 rounded-2xl p-8 border border-slate-200">
                   <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6 border-b border-slate-50 pb-4">Digital Presence (SEO)</h2>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Custom URL Slug</label>
                            <input type="text" name="slug" value={formData.slug || ''} onChange={handleChange} className="w-full border border-slate-200 rounded-xl p-4 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-brand-green/10 outline-none" placeholder="e.g. hope-hoodie-gold" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Search Title Tag</label>
                            <input type="text" name="seoTitle" value={formData.seoTitle || ''} onChange={handleChange} className="w-full border border-slate-200 rounded-xl p-4 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-brand-green/10 outline-none" placeholder="Defaults to Product Title" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Meta Description</label>
                            <textarea name="seoDescription" rows={3} value={formData.seoDescription || ''} onChange={handleChange} className="w-full border border-slate-200 rounded-xl p-4 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-brand-green/10 outline-none" placeholder="A brief summary for search engines..." />
                        </div>
                    </div>
                </div>

             </form>
          </div>

          {/* Right Column: Preview */}
          <div className="lg:col-span-1">
             <div className="sticky top-24 space-y-8">
                <ProductPreview product={formData} categories={categories} />
                
                {id && (
                  <div className="bg-white shadow-xl shadow-slate-200/50 rounded-2xl p-6 border border-slate-200">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Performance Stats</h3>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
                          <p className="text-3xl font-serif font-bold text-slate-900">{formData.totalSales || 0}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Sales</p>
                       </div>
                       <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
                          <p className="text-3xl font-serif font-bold text-amber-500">{formData.averageRating?.toFixed(1) || '-'}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{formData.reviewCount || 0} Reviews</p>
                       </div>
                    </div>
                  </div>
                )}

                <div className="bg-brand-dark p-6 rounded-2xl text-white shadow-lg">
                   <p className="text-xs font-bold uppercase tracking-widest mb-2 text-brand-hope">Editor Note</p>
                   <p className="text-sm font-light leading-relaxed opacity-80">
                     Remember to use high-quality, professional photography. The beauty of the apparel reflects the excellence of the Word.
                   </p>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};
