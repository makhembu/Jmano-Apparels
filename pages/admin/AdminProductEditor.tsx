
import React, { useState, useEffect, useMemo } from 'react';
// @ts-ignore
import { useParams, useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { Button } from '../../components/ui/Button';
import { api } from '../../lib/db';
import { useToast } from '../../context/ToastContext';
import { Product, Order } from '../../types';
import { ProductPreview } from '../../components/admin/products/ProductPreview';
import { SeoFieldGroup } from '../../components/admin/seo/SeoFieldGroup';
import { useCopilot } from '../../context/CopilotContext';
import { Switch } from '../../components/ui/Switch';
import { formatCurrency, formatDate } from '../../lib/utils';

interface ExtendedProduct extends Product {
    isFreeShipping?: boolean;
}

const emptyProduct: Partial<ExtendedProduct> = {
  title: '', price: 0, salePrice: undefined, isOnSale: false, categoryKey: '',
  images: [], description: '', sizes: ['S', 'M', 'L', 'XL'], colors: [], tags: [],
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
  
  // -- View State --
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>(id ? 'overview' : 'settings');
  
  // -- Data State --
  const [formData, setFormData] = useState<Partial<ExtendedProduct>>(emptyProduct);
  const [relatedOrders, setRelatedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  // -- Local Inputs --
  const [sizesInput, setSizesInput] = useState('');
  const [colorsInput, setColorsInput] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  // 1. Initialize Product Data
  useEffect(() => {
    if (id && products.length > 0) {
      const p = products.find(prod => prod.id === id);
      if (p) {
          setFormData(p);
          setSizesInput(p.sizes?.join(', ') || '');
          setColorsInput(p.colors?.join(', ') || '');
          setPageData(p as any);
      }
    } else if (!id) {
      setFormData(emptyProduct);
      setSizesInput(emptyProduct.sizes?.join(', ') || '');
      setPageData(undefined);
      setActiveTab('settings'); // Force settings for new products
    }
    return () => setPageData(undefined);
  }, [id, products, setPageData]);

  // 2. Fetch Sales Data (If viewing existing product)
  useEffect(() => {
    if (id && activeTab === 'overview') {
        fetchProductStats();
    }
  }, [id, activeTab]);

  const fetchProductStats = async () => {
      setStatsLoading(true);
      try {
          // Fetch orders to calculate product specific performance
          // In a real high-scale app, we'd use a specific RPC for this.
          // Here we filter the last 100 orders for immediate feedback.
          const allOrders = await api.getAllOrders(100);
          
          const filtered = allOrders.filter(o => 
              o.products.some(p => p.productId === id) && 
              o.status !== 'Cancelled' && 
              o.status !== 'Refunded'
          );
          setRelatedOrders(filtered);
      } catch (e) {
          console.error("Failed to load product stats");
      } finally {
          setStatsLoading(false);
      }
  };

  // -- Calculations --
  const productPerformance = useMemo(() => {
      let revenue = 0;
      let unitsSold = 0;
      let orderCount = relatedOrders.length;

      relatedOrders.forEach(order => {
          const lineItem = order.products.find(p => p.productId === id);
          if (lineItem) {
              revenue += (lineItem.price * lineItem.quantity);
              unitsSold += lineItem.quantity;
          }
      });

      // Use totalSales from product record if available (historical), otherwise calculated
      const totalUnits = Math.max(unitsSold, formData.totalSales || 0);

      return { revenue, unitsSold: totalUnits, orderCount };
  }, [relatedOrders, formData.totalSales, id]);


  // -- Form Handlers --

  const generateSlug = (text: string) => {
    return text.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
       const checked = (e.target as HTMLInputElement).checked;
       setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
       setFormData(prev => ({ ...prev, [name]: value === '' ? 0 : parseFloat(value) }));
    } else if (name === 'title' && !id && !formData.slug) {
       setFormData(prev => ({ ...prev, title: value, slug: generateSlug(value) }));
    } else {
       setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSwitchChange = (name: string, val: boolean) => {
      setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleArrayBlur = (field: 'sizes' | 'colors' | 'tags', value: string) => {
      const arr = value.split(',').map(s => s.trim()).filter(Boolean);
      setFormData(prev => ({ ...prev, [field]: arr }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    if (file.size > 5 * 1024 * 1024) {
      showToast('File too large (max 5MB)', 'error');
      return;
    }

    setUploading(true);
    try {
      const publicUrl = await api.uploadImage(file);
      setFormData(prev => ({ 
          ...prev, 
          images: [...(prev.images || []), publicUrl] 
      }));
      showToast('Image uploaded', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to upload image', 'error');
    } finally {
      setUploading(false);
    }
  };

  const addImageUrl = () => {
      if (!newImageUrl) return;
      setFormData(prev => ({ ...prev, images: [...(prev.images || []), newImageUrl] }));
      setNewImageUrl('');
  };

  const removeImage = (index: number) => {
      setFormData(prev => ({
          ...prev,
          images: prev.images?.filter((_, i) => i !== index)
      }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.categoryKey) {
      showToast('Title and Category are required', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const payload = { ...formData } as any;
      if (id) await api.adminUpdateProduct(id, payload);
      else await api.adminCreateProduct(payload);
      await refreshData();
      showToast('Product saved successfully', 'success');
      navigate('/admin/products');
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in relative pb-20">
      {/* Sticky Header */}
      <div className="sticky top-[-1rem] md:top-[-2rem] z-30 bg-gray-100/95 backdrop-blur-md border-b border-slate-200 -mx-4 md:-mx-8 px-4 md:px-8 py-4 mb-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
             {formData.images?.[0] && (
                <img src={formData.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover border border-slate-200 shadow-sm" />
             )}
             <div>
                <h1 className="text-xl md:text-2xl font-bold font-serif text-slate-900">{id ? formData.title : 'New Piece'}</h1>
                <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${formData.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                        {formData.isPublished ? 'Live' : 'Draft'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{id ? `ID: ${id.slice(0,8)}` : 'Unsaved'}</span>
                </div>
             </div>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            {id && (
                <a href={`/product/${formData.slug || id}`} target="_blank" rel="noreferrer">
                    <Button variant="outline" className="h-10 bg-white">View in Shop</Button>
                </a>
            )}
            <Button id="btn-save-settings" onClick={handleSubmit} isLoading={loading} className="h-10 shadow-lg shadow-brand-green/20 px-6">
              {id ? 'Save Changes' : 'Publish Product'}
            </Button>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        {id && (
            <div className="max-w-7xl mx-auto mt-6 flex gap-6 border-b border-slate-200 px-1">
                <button 
                    onClick={() => setActiveTab('overview')}
                    className={`pb-3 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'overview' ? 'border-b-2 border-brand-green text-brand-green' : 'text-slate-500 hover:text-slate-800'}`}
                >
                    Overview
                </button>
                <button 
                    onClick={() => setActiveTab('settings')}
                    className={`pb-3 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'settings' ? 'border-b-2 border-brand-green text-brand-green' : 'text-slate-500 hover:text-slate-800'}`}
                >
                    Edit Settings
                </button>
            </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-0">
        
        {/* ---------------- OVERVIEW TAB ---------------- */}
        {activeTab === 'overview' && (
            <div className="animate-fade-in space-y-8">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Revenue</p>
                        <p className="text-3xl font-serif font-bold text-brand-dark">{formatCurrency(productPerformance.revenue)}</p>
                        <p className="text-[10px] text-green-600 mt-1 font-bold">from {productPerformance.orderCount} orders</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Sold</p>
                        <p className="text-3xl font-serif font-bold text-slate-900">{productPerformance.unitsSold}</p>
                        <p className="text-[10px] text-slate-400 mt-1">Lifetime units</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Stock</p>
                        <p className={`text-3xl font-serif font-bold ${ (formData.stockQuantity || 0) <= (formData.lowStockThreshold || 5) ? 'text-red-500' : 'text-slate-900'}`}>
                            {formData.stockQuantity || 0}
                        </p>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div className={`h-full ${ (formData.stockQuantity || 0) <= (formData.lowStockThreshold || 5) ? 'bg-red-500' : 'bg-green-500'}`} style={{width: `${Math.min(100, ((formData.stockQuantity || 0) / 100) * 100)}%`}}></div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Performance</p>
                        <p className="text-3xl font-serif font-bold text-brand-hope">
                            {productPerformance.unitsSold > 0 ? 'Hot' : 'Quiet'}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">Based on recent activity</p>
                    </div>
                </div>

                {/* Recent Buyers Table */}
                <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-slate-900">Recent Customers</h3>
                        <span className="text-xs text-slate-500">Last 100 Global Orders Scanned</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Qty</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Size/Color</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Order Value</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {relatedOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500 italic">
                                            No recent sales found for this item.
                                        </td>
                                    </tr>
                                ) : (
                                    relatedOrders.map(order => {
                                        const lineItem = order.products.find(p => p.productId === id);
                                        return (
                                            <tr key={order.id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600">
                                                    {formatDate(order.createdAt)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-bold text-slate-900">{order.customerName || 'Guest'}</div>
                                                    <div className="text-xs text-slate-400">{order.customerEmail}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-bold">
                                                    {lineItem?.quantity}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                                                    {lineItem?.size} {lineItem?.selectedColor ? `/ ${lineItem.selectedColor}` : ''}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-brand-dark font-mono">
                                                    {formatCurrency(order.total)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <a href={`/#/admin/orders/${order.id}`} target="_blank" className="text-brand-green hover:underline text-xs font-bold" rel="noreferrer">
                                                        View Order
                                                    </a>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        {/* ---------------- SETTINGS TAB ---------------- */}
        {activeTab === 'settings' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-fade-in">
            {/* Main Form Column */}
            <div className="lg:col-span-2 space-y-8">
                <form id="product-form" onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* 1. Basic Info */}
                    <div className="bg-white shadow-xl shadow-slate-200/50 rounded-2xl p-6 md:p-8 border border-slate-200">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 border-b border-slate-50 pb-4">Essential Information</h2>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Product Name*</label>
                                    <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-brand-green/10 outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Category*</label>
                                    <select name="categoryKey" value={formData.categoryKey} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-brand-green/10 outline-none">
                                        <option value="">Select...</option>
                                        {categories.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">URL Slug</label>
                                <input 
                                    type="text" 
                                    name="slug" 
                                    value={formData.slug || ''} 
                                    onChange={handleChange} 
                                    className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 text-slate-700 text-sm font-mono focus:ring-2 focus:ring-brand-green/10 outline-none"
                                    placeholder="product-url-slug"
                                />
                                <p className="text-[10px] text-gray-400 mt-1">Leave empty to auto-generate from title. Controls the product URL.</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Description</label>
                                <textarea name="description" rows={5} value={formData.description} onChange={handleChange} className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50" placeholder="Describe the material, fit, and spiritual inspiration..." />
                            </div>
                        </div>
                    </div>

                    {/* 2. Visuals */}
                    <div className="bg-white shadow-xl shadow-slate-200/50 rounded-2xl p-6 md:p-8 border border-slate-200">
                        <div className="flex justify-between items-center border-b border-slate-50 pb-4 mb-6">
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Visual Gallery</h2>
                            <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded">Max 5MB per image</span>
                        </div>
                        
                        <div className="space-y-6">
                            {/* Image List */}
                            {formData.images && formData.images.length > 0 && (
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                                    {formData.images.map((img, idx) => (
                                        <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                                            <img src={img} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                            {idx === 0 && <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] font-bold text-center py-1">PRIMARY</div>}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Upload & Add URL */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center hover:bg-slate-50 transition-colors relative cursor-pointer text-center">
                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" disabled={uploading} />
                                    {uploading ? (
                                        <div className="animate-spin h-6 w-6 border-2 border-brand-green rounded-full border-t-transparent"></div>
                                    ) : (
                                        <>
                                            <svg className="w-6 h-6 text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                            <span className="text-xs font-bold text-brand-green uppercase tracking-wide">Upload File</span>
                                        </>
                                    )}
                                </div>
                                <div className="flex flex-col justify-center gap-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Or Add via URL</label>
                                    <div className="flex gap-2">
                                        <input type="text" value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} placeholder="https://..." className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-xs" />
                                        <button type="button" onClick={addImageUrl} className="bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg text-slate-600">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Pricing & Inventory */}
                    <div className="bg-white shadow-xl shadow-slate-200/50 rounded-2xl p-6 md:p-8 border border-slate-200">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 border-b border-slate-50 pb-4">Commerce Data</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            
                            {/* Price Block */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Regular Price (£)</label>
                                    <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 font-bold" />
                                </div>
                                <div className="p-4 bg-brand-light/10 rounded-xl border border-brand-green/10">
                                    <Switch 
                                        label="On Sale"
                                        checked={!!formData.isOnSale}
                                        onChange={(val) => handleSwitchChange('isOnSale', val)}
                                        className="mb-2 border-0 bg-transparent p-0 hover:shadow-none"
                                    />
                                    {formData.isOnSale && (
                                        <input type="number" step="0.01" name="salePrice" value={formData.salePrice || ''} onChange={handleChange} placeholder="Sale Price £" className="w-full border border-slate-200 rounded-lg p-2 bg-white text-sm mt-2" />
                                    )}
                                </div>
                            </div>

                            {/* Inventory Block */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">SKU (Opt)</label>
                                        <input type="text" name="sku" value={formData.sku || ''} onChange={handleChange} className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 text-xs font-mono" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Weight (kg)</label>
                                        <input type="number" step="0.01" name="weight" value={formData.weight} onChange={handleChange} className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Stock Level</label>
                                        <input type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleChange} className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 font-bold" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Low Alert</label>
                                        <input type="number" name="lowStockThreshold" value={formData.lowStockThreshold} onChange={handleChange} className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4. Variants */}
                    <div className="bg-white shadow-xl shadow-slate-200/50 rounded-2xl p-6 md:p-8 border border-slate-200">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 border-b border-slate-50 pb-4">Variants</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Sizes (Comma separated)</label>
                                <input 
                                    type="text" 
                                    value={sizesInput} 
                                    onChange={(e) => setSizesInput(e.target.value)} 
                                    onBlur={() => handleArrayBlur('sizes', sizesInput)}
                                    className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50" 
                                    placeholder="S, M, L, XL"
                                />
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {formData.sizes?.map(s => <span key={s} className="px-2 py-1 bg-gray-100 text-xs rounded border border-gray-200">{s}</span>)}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Colors (Comma separated)</label>
                                <input 
                                    type="text" 
                                    value={colorsInput} 
                                    onChange={(e) => setColorsInput(e.target.value)} 
                                    onBlur={() => handleArrayBlur('colors', colorsInput)}
                                    className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50" 
                                    placeholder="Red, Blue, Forest Green"
                                />
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {formData.colors?.map(c => <span key={c} className="px-2 py-1 bg-gray-100 text-xs rounded border border-gray-200">{c}</span>)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 5. SEO */}
                    <div className="bg-white shadow-xl shadow-slate-200/50 rounded-2xl p-6 md:p-8 border border-slate-200">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 border-b border-slate-50 pb-4">Search Engine Optimization</h2>
                    <SeoFieldGroup 
                        data={formData} onChange={handleChange} 
                        onKeywordsChange={(k) => setFormData(prev => ({...prev, keywords: k}))}
                        defaultTitle={formData.title} defaultDescription={formData.description?.substring(0, 160)}
                        previewImage={formData.images?.[0]}
                        permalink={`https://jamboapparels.com/product/${formData.slug || formData.id || 'new'}`}
                        contextData={{ title: formData.title || '', description: formData.description || '', type: 'product' }}
                    />
                    </div>
                    
                    {/* 6. Visibility Control */}
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-4">Publishing Status</h3>
                        <div className="space-y-3">
                            <Switch 
                                label="Visible in Shop"
                                description="Hidden products are only visible to admins."
                                checked={!!formData.isPublished}
                                onChange={(val) => handleSwitchChange('isPublished', val)}
                            />
                            <Switch 
                                label="Featured Item"
                                description="Pin this item to the homepage featured collection."
                                checked={!!formData.isFeatured}
                                onChange={(val) => handleSwitchChange('isFeatured', val)}
                            />
                        </div>
                    </div>

                </form>
            </div>

            {/* Sidebar Preview */}
            <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-[160px] space-y-8">
                    <ProductPreview product={formData} categories={categories} />
                    
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-800 text-xs leading-relaxed">
                        <strong className="block mb-1">Tip:</strong>
                        Ensure your product images are high-resolution (min 800x800) and your description includes keywords like "Christian Hoodie", "Faith Apparel" for better SEO ranking.
                    </div>
                </div>
            </div>
            </div>
        )}
      </div>
    </div>
  );
};
