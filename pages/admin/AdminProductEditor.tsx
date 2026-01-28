
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { Button } from '../../components/ui/Button';
import { api } from '../../lib/db';
import { useToast } from '../../context/ToastContext';
import { Product } from '../../types';
import { ProductPreview } from '../../components/admin/products/ProductPreview';
import { SeoFieldGroup } from '../../components/admin/seo/SeoFieldGroup';
import { useCopilot } from '../../contexts/CopilotContext';

interface ExtendedProduct extends Product {
    isFreeShipping?: boolean;
}

const emptyProduct: Partial<ExtendedProduct> = {
  title: '', price: 0, salePrice: undefined, isOnSale: false, categoryKey: '',
  images: [], description: '', sizes: ['S', 'M', 'L'], colors: [], tags: [],
  isFeatured: false, isPublished: true, sku: '', slug: '', stockQuantity: 0, lowStockThreshold: 5, weight: 0,
  isFreeShipping: false,
  seoTitle: '', seoDescription: '', canonicalUrl: '', isNoIndex: false, isNoFollow: false, keywords: []
};

export const AdminProductEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, categories, refreshData } = useShop();
  const { showToast } = useToast();
  const { setPageData } = useCopilot();
  
  const [formData, setFormData] = useState<Partial<ExtendedProduct>>(emptyProduct);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Quick Add Category State
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryLabel, setNewCategoryLabel] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);

  useEffect(() => {
    if (id && products.length > 0) {
      const p = products.find(prod => prod.id === id);
      if (p) {
          setFormData(p);
          setPageData(p as any);
      }
    } else if (!id) {
      setFormData(emptyProduct);
      setPageData(undefined);
    }
    return () => setPageData(undefined);
  }, [id, products, setPageData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
       const checked = (e.target as HTMLInputElement).checked;
       setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
       setFormData(prev => ({ ...prev, [name]: value === '' ? 0 : parseFloat(value) }));
    } else {
        if (name === 'image') setFormData(prev => ({ ...prev, images: [value] }));
        else setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'sizes' | 'colors' | 'tags') => {
      const val = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
      setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.categoryKey || !formData.images || formData.images.length === 0) {
      showToast('Please fill in required fields', 'error');
      return;
    }
    setLoading(true);
    try {
      const payload = { ...formData } as any;
      if (id) await api.adminUpdateProduct(id, payload);
      else await api.adminCreateProduct(payload);
      await refreshData();
      showToast('Product record synchronized', 'success');
      navigate('/admin/products');
    } catch (err: any) {
      showToast(`Sync Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in relative">
      <div className="sticky top-[-1rem] md:top-[-2rem] z-30 bg-gray-100/95 backdrop-blur-md border-b border-slate-200 -mx-4 md:-mx-8 px-4 md:px-8 py-6 mb-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-serif text-slate-900">{id ? 'Edit Piece' : 'New Piece'}</h1>
            <p className="text-slate-500 text-xs md:text-sm mt-1">Ethically threading scriptures for the modern believer.</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none h-11 bg-white" onClick={() => navigate('/admin/products')}>Discard</Button>
            <Button id="btn-save-settings" onClick={handleSubmit} isLoading={loading} className="flex-1 sm:flex-none h-11 shadow-lg shadow-brand-green/20 px-8">
              {id ? 'Update' : 'Publish'}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
             <form id="product-form" onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-white shadow-xl shadow-slate-200/50 rounded-2xl p-6 md:p-8 border border-slate-200">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6 border-b border-slate-50 pb-4">Essential Details</h2>
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Product Title*</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl p-4 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-brand-green/10 outline-none transition-all" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Base Price (£)*</label>
                                <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl p-4 bg-slate-50" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Stock Level*</label>
                                <input type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl p-4 bg-slate-50" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Description</label>
                            <textarea name="description" rows={6} value={formData.description} onChange={handleChange} className="w-full border border-slate-200 rounded-xl p-4 bg-slate-50" />
                        </div>
                    </div>
                </div>
                <div className="bg-white shadow-xl shadow-slate-200/50 rounded-2xl p-6 md:p-8 border border-slate-200">
                   <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6 border-b border-slate-50 pb-4">SEO Optimization</h2>
                   <SeoFieldGroup 
                      data={formData} onChange={handleChange} 
                      onKeywordsChange={(k) => setFormData(prev => ({...prev, keywords: k}))}
                      defaultTitle={formData.title} defaultDescription={formData.description?.substring(0, 160)}
                      previewImage={formData.images?.[0]}
                      permalink={`https://jamboapparels.com/#/product/${formData.id || 'new'}`}
                      contextData={{ title: formData.title || '', description: formData.description || '', type: 'product' }}
                   />
                </div>
             </form>
          </div>
          <div className="lg:col-span-1">
             <div className="lg:sticky lg:top-[160px] space-y-8">
                <ProductPreview product={formData} categories={categories} />
             </div>
          </div>
       </div>
      </div>
    </div>
  );
};
