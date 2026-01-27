
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { api } from '../../lib/db';
import { Category, ShippingZone, DiscountCode } from '../../types';
import { useToast } from '../../context/ToastContext';

type Tab = 'general' | 'categories' | 'shipping' | 'discounts';

export const AdminShopSettings: React.FC = () => {
  const { settings, updateSettings } = useApp();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [saving, setSaving] = useState(false);

  // General Settings Form
  const [generalForm, setGeneralForm] = useState(settings);
  const [featuredCats, setFeaturedCats] = useState<string[]>([]);

  // Categories
  const [prodCats, setProdCats] = useState<Category[]>([]);
  const [newProdCat, setNewProdCat] = useState({ key: '', label: '', color: '#000000', bgColorClass: '' });

  // Shipping
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [zoneForm, setZoneForm] = useState<Partial<ShippingZone>>({
    name: '', baseRate: 0, perKgRate: 0, freeShippingThreshold: 0, estimatedDays: '3-5 days', countries: []
  });
  const [countriesInput, setCountriesInput] = useState('');
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);

  // Discounts
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [newDiscount, setNewDiscount] = useState<Partial<DiscountCode>>({
    code: '', discountType: 'percentage', discountValue: 0, description: '', 
    minimumPurchase: 0, maxUses: undefined, validUntil: ''
  });

  useEffect(() => {
    setGeneralForm(settings);
    if (settings.featuredCategories) setFeaturedCats(settings.featuredCategories);
  }, [settings]);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    api.getCategories().then(setProdCats);
    api.getShippingZones().then(setZones);
    api.getDiscountCodes().then(setDiscounts);
  };

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setGeneralForm(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
        setGeneralForm(prev => ({ ...prev, [name]: parseFloat(value) }));
    } else {
        setGeneralForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const toggleFeaturedCat = (key: string) => {
    setFeaturedCats(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const saveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
        ...generalForm,
        featuredCategories: featuredCats
    };
    try {
        await updateSettings(payload);
    } finally {
        setSaving(false);
    }
  };

  // --- Category Handlers ---
  const handleAddCat = async () => {
    if (!newProdCat.key || !newProdCat.label) return showToast('Key and Label required', 'error');
    try {
        await api.createCategory(newProdCat);
        showToast('Category created', 'success');
        setNewProdCat({ key: '', label: '', color: '#000000', bgColorClass: '' });
        refreshData();
    } catch(e) { showToast('Failed to create', 'error'); }
  };

  const handleDeleteCat = async (key: string) => {
    if(window.confirm(`Delete ${key}?`)) {
        await api.deleteCategory(key);
        refreshData();
    }
  };

  // --- Shipping Handlers ---
  const handleSaveZone = async () => {
      if (!zoneForm.name || !countriesInput) return showToast('Name and Countries required', 'error');
      
      const payload = {
          ...zoneForm,
          countries: countriesInput.split(',').map(s => s.trim()).filter(Boolean)
      };

      try {
          if (editingZoneId) {
              // Note: Ideally we'd have a specific update method in API, 
              // but we can simulate it by delete + create if no direct update exists, 
              // or better, implement updateZone in API.
              // For safety in this prompt context without seeing db.ts update logic for zones,
              // we will stick to delete then create if ID exists, assuming simple replacement.
              // A real app would define updateZone.
              
              // Let's assume createShippingZone handles upsert or we just add the updateZone method to db.ts if needed.
              // Actually, looking at previous context, db.ts only had createZone/deleteZone. 
              // We'll do a quick delete/create for prototype simplicity.
              await api.deleteShippingZone(editingZoneId);
              await api.createShippingZone(payload);
              showToast('Zone updated', 'success');
          } else {
              await api.createShippingZone(payload);
              showToast('Zone created', 'success');
          }
          
          resetZoneForm();
          refreshData();
      } catch(e) { showToast('Operation failed', 'error'); }
  };

  const startEditZone = (z: ShippingZone) => {
      setZoneForm(z);
      setCountriesInput(z.countries.join(', '));
      setEditingZoneId(z.id);
      // Scroll to form
      window.scrollTo({ top: 500, behavior: 'smooth' });
  };

  const resetZoneForm = () => {
      setZoneForm({ name: '', baseRate: 0, perKgRate: 0, freeShippingThreshold: 0, estimatedDays: '3-5 days', countries: [] });
      setCountriesInput('');
      setEditingZoneId(null);
  };

  const handleDeleteZone = async (id: string) => {
      if(window.confirm('Delete zone?')) {
          await api.deleteShippingZone(id);
          if (editingZoneId === id) resetZoneForm();
          refreshData();
      }
  };

  // --- Discount Handlers ---
  const handleAddDiscount = async () => {
      if (!newDiscount.code) return showToast('Code required', 'error');
      try {
          await api.createDiscountCode(newDiscount);
          showToast('Code created', 'success');
          setNewDiscount({ code: '', discountType: 'percentage', discountValue: 0, description: '', minimumPurchase: 0, validUntil: '' });
          refreshData();
      } catch(e) { showToast('Failed to create code', 'error'); }
  };

  const handleDeleteDiscount = async (id: string) => {
      if(window.confirm('Delete code?')) {
          await api.deleteDiscountCode(id);
          refreshData();
      }
  };

  return (
    <div className="max-w-6xl pb-20 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
         <h1 className="text-2xl font-bold font-serif text-brand-dark">Shop Configuration</h1>
      </div>

      <div className="flex gap-4 mb-8 border-b overflow-x-auto no-scrollbar">
         {['general', 'categories', 'shipping', 'discounts'].map((tab) => (
             <button 
                key={tab}
                onClick={() => setActiveTab(tab as Tab)}
                className={`pb-3 px-6 text-sm font-bold capitalize transition-colors whitespace-nowrap ${activeTab === tab ? 'border-b-2 border-brand-green text-brand-green' : 'text-gray-500 hover:text-gray-800'}`}
             >
                {tab}
             </button>
         ))}
      </div>
      
      {/* GENERAL TAB */}
      {activeTab === 'general' && (
          <form onSubmit={saveGeneral} className="bg-white shadow-lg shadow-slate-200/50 rounded-2xl p-8 space-y-6 max-w-3xl border border-slate-100">
             <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">Financials & Display</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Currency Code</label>
                    <input type="text" name="currency" value={generalForm.currency || 'GBP'} onChange={handleGeneralChange} className="w-full border border-gray-200 rounded-xl p-3 bg-slate-50 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-brand-green/20 outline-none" />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tax Rate (Decimal)</label>
                    <input type="number" step="0.01" name="taxRate" value={generalForm.taxRate || 0} onChange={handleGeneralChange} className="w-full border border-gray-200 rounded-xl p-3 bg-slate-50 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-brand-green/20 outline-none" />
                 </div>
                 <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Global Free Shipping Threshold</label>
                    <input type="number" step="0.01" name="freeShippingThreshold" value={generalForm.freeShippingThreshold || 0} onChange={handleGeneralChange} className="w-full border border-gray-200 rounded-xl p-3 bg-slate-50 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-brand-green/20 outline-none" />
                    <p className="text-[10px] text-gray-400 mt-1">Orders above this amount get free shipping automatically (unless overridden by zone rules).</p>
                 </div>
             </div>
             
             <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Featured Categories</label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-60 overflow-y-auto custom-scrollbar">
                    {prodCats.length > 0 ? prodCats.map(cat => (
                        <label key={cat.key} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-white rounded-lg transition-colors">
                            <input 
                                type="checkbox" 
                                checked={featuredCats.includes(cat.key)} 
                                onChange={() => toggleFeaturedCat(cat.key)}
                                className="rounded text-brand-green focus:ring-brand-green border-gray-300 w-4 h-4"
                            />
                            <span className="text-sm font-medium text-gray-700">{cat.label}</span>
                        </label>
                    )) : (
                        <div className="text-sm text-gray-500 col-span-3 text-center py-4">No categories found. Add some in the Categories tab.</div>
                    )}
                </div>
                <p className="text-[10px] text-gray-400 mt-2">Selected categories appear as quick filters on the Shop and Home pages.</p>
             </div>
             
             <div className="pt-6 border-t border-gray-100 space-y-4">
                 <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                        <label className="text-sm font-bold text-gray-900">Require Account for Checkout</label>
                        <p className="text-xs text-gray-500">If enabled, guest checkout is disabled.</p>
                    </div>
                    <input type="checkbox" name="requireLoginForCheckout" checked={!!generalForm.requireLoginForCheckout} onChange={handleGeneralChange} className="h-5 w-5 text-brand-green focus:ring-brand-green border-gray-300 rounded" />
                 </div>

                 <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                        <label className="text-sm font-bold text-gray-900">Enable Announcement Bar</label>
                        <p className="text-xs text-gray-500">Show a top banner for sales/news.</p>
                    </div>
                    <input type="checkbox" name="isAnnouncementEnabled" checked={!!generalForm.isAnnouncementEnabled} onChange={handleGeneralChange} className="h-5 w-5 text-brand-green focus:ring-brand-green border-gray-300 rounded" />
                 </div>
                 
                 {generalForm.isAnnouncementEnabled && (
                    <div className="animate-fade-in">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Announcement Text</label>
                        <input type="text" name="announcementText" value={generalForm.announcementText || ''} onChange={handleGeneralChange} className="w-full border border-gray-200 rounded-xl p-3 bg-white text-sm text-gray-900 focus:ring-2 focus:ring-brand-green/20 outline-none" placeholder="e.g. 20% Off Spring Collection!" />
                    </div>
                 )}
                 
                 <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                        <label className="text-sm font-bold text-gray-900">Enable Reviews</label>
                        <p className="text-xs text-gray-500">Allow customers to leave testimonies.</p>
                    </div>
                    <input type="checkbox" name="enableReviews" checked={!!generalForm.enableReviews} onChange={handleGeneralChange} className="h-5 w-5 text-brand-green focus:ring-brand-green border-gray-300 rounded" />
                 </div>
             </div>

             <div className="pt-4">
                <Button type="submit" isLoading={saving} className="shadow-lg shadow-brand-green/20">Save General Settings</Button>
             </div>
          </form>
      )}

      {/* CATEGORIES TAB */}
      {activeTab === 'categories' && (
          <div className="space-y-8">
              <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
                  <table className="min-w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                              <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase tracking-wider text-xs">Key</th>
                              <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase tracking-wider text-xs">Label</th>
                              <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase tracking-wider text-xs">Color</th>
                              <th className="px-6 py-4"></th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                          {prodCats.map(c => (
                              <tr key={c.key} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 font-mono text-xs font-bold text-slate-600">{c.key}</td>
                                  <td className="px-6 py-4 font-medium text-gray-900">{c.label}</td>
                                  <td className="px-6 py-4 flex items-center gap-3">
                                      <span className="w-6 h-6 rounded-lg border shadow-sm" style={{backgroundColor: c.color}}></span>
                                      <span className="text-xs text-gray-500 font-mono">{c.color}</span>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                      <button onClick={() => handleDeleteCat(c.key)} className="text-red-500 hover:text-red-700 text-xs font-bold uppercase tracking-wider">Delete</button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h4 className="font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Add New Category</h4>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                      <div>
                          <label className="text-xs font-bold text-gray-500 mb-1.5 block">Key (ID)</label>
                          <input type="text" value={newProdCat.key} onChange={e => setNewProdCat({...newProdCat, key: e.target.value.toUpperCase().replace(/\s+/g, '_')})} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm" placeholder="HOODIES" />
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500 mb-1.5 block">Display Label</label>
                          <input type="text" value={newProdCat.label} onChange={e => setNewProdCat({...newProdCat, label: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm" placeholder="Hoodies" />
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500 mb-1.5 block">Theme Color</label>
                          <div className="flex items-center gap-2">
                             <input type="color" value={newProdCat.color} onChange={e => setNewProdCat({...newProdCat, color: e.target.value})} className="h-10 w-12 border border-gray-300 rounded cursor-pointer p-1 bg-white" />
                             <input type="text" value={newProdCat.color} onChange={e => setNewProdCat({...newProdCat, color: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm" />
                          </div>
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500 mb-1.5 block">Style Class</label>
                          <input type="text" value={newProdCat.bgColorClass} onChange={e => setNewProdCat({...newProdCat, bgColorClass: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm" placeholder="bg-brand-hope" />
                      </div>
                      <Button onClick={handleAddCat} variant="secondary" className="h-10">Add</Button>
                  </div>
              </div>
          </div>
      )}

      {/* SHIPPING TAB */}
      {activeTab === 'shipping' && (
          <div className="space-y-8">
              <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
                  <table className="min-w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                              <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase tracking-wider text-xs">Zone Name</th>
                              <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase tracking-wider text-xs">Base Rate</th>
                              <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase tracking-wider text-xs">Per Kg</th>
                              <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase tracking-wider text-xs">Free Over</th>
                              <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase tracking-wider text-xs">Countries</th>
                              <th className="px-6 py-4"></th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                          {zones.map(z => (
                              <tr key={z.id} className="hover:bg-gray-50 group">
                                  <td className="px-6 py-4 font-bold text-gray-900">{z.name}</td>
                                  <td className="px-6 py-4 font-mono text-slate-600">£{z.baseRate.toFixed(2)}</td>
                                  <td className="px-6 py-4 font-mono text-slate-600">£{z.perKgRate?.toFixed(2) || '0.00'}</td>
                                  <td className="px-6 py-4 text-green-600 font-bold">{z.freeShippingThreshold ? `£${z.freeShippingThreshold}` : '-'}</td>
                                  <td className="px-6 py-4 text-xs text-gray-500 max-w-xs truncate" title={z.countries.join(', ')}>{z.countries.join(', ')}</td>
                                  <td className="px-6 py-4 text-right flex justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                                      <button onClick={() => startEditZone(z)} className="text-brand-green hover:text-brand-dark text-xs font-bold uppercase tracking-wider">Edit</button>
                                      <button onClick={() => handleDeleteZone(z.id)} className="text-red-500 hover:text-red-700 text-xs font-bold uppercase tracking-wider">Delete</button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
              
              <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-lg shadow-slate-200/50">
                  <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                      <h4 className="font-bold text-xl text-gray-900 font-serif">{editingZoneId ? 'Edit Shipping Zone' : 'Add New Shipping Zone'}</h4>
                      {editingZoneId && (
                          <button onClick={resetZoneForm} className="text-xs text-red-500 font-bold hover:underline">Cancel Editing</button>
                      )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="md:col-span-2">
                          <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wider">Zone Name</label>
                          <input type="text" value={zoneForm.name} onChange={e => setZoneForm({...zoneForm, name: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-green/20 outline-none" placeholder="e.g. Europe" />
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wider">Base Rate (£)</label>
                          <input type="number" step="0.01" value={zoneForm.baseRate} onChange={e => setZoneForm({...zoneForm, baseRate: +e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-green/20 outline-none" />
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wider">Rate per Kg (£)</label>
                          <input type="number" step="0.01" value={zoneForm.perKgRate} onChange={e => setZoneForm({...zoneForm, perKgRate: +e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-green/20 outline-none" />
                      </div>
                       <div>
                          <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wider">Free Threshold (£)</label>
                          <input type="number" step="0.01" value={zoneForm.freeShippingThreshold} onChange={e => setZoneForm({...zoneForm, freeShippingThreshold: +e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-green/20 outline-none" />
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wider">Est. Days</label>
                          <input type="text" value={zoneForm.estimatedDays || ''} onChange={e => setZoneForm({...zoneForm, estimatedDays: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-green/20 outline-none" placeholder="3-5 days" />
                      </div>
                      <div className="md:col-span-2">
                          <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wider">Countries (Comma separated)</label>
                          <textarea value={countriesInput} onChange={e => setCountriesInput(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-green/20 outline-none h-[50px] resize-none" placeholder="France, Germany, Spain..." />
                      </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                      <Button onClick={handleSaveZone} variant="secondary" className="px-8 shadow-lg shadow-brand-hope/20">
                          {editingZoneId ? 'Update Zone' : 'Create Zone'}
                      </Button>
                  </div>
              </div>
          </div>
      )}

      {/* DISCOUNTS TAB */}
      {activeTab === 'discounts' && (
          <div className="space-y-8">
               <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
                  <table className="min-w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                              <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase tracking-wider text-xs">Code</th>
                              <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase tracking-wider text-xs">Value</th>
                              <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase tracking-wider text-xs">Min. Spend</th>
                              <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase tracking-wider text-xs">Expires</th>
                              <th className="px-6 py-4"></th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                          {discounts.map(d => (
                              <tr key={d.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 font-black text-brand-dark tracking-wide">{d.code}</td>
                                  <td className="px-6 py-4 font-bold text-green-600 bg-green-50 rounded-lg inline-block my-2 mx-4">
                                      {d.discountType === 'percentage' ? `${d.discountValue}% OFF` : `£${d.discountValue} OFF`}
                                  </td>
                                  <td className="px-6 py-4">{d.minimumPurchase ? `£${d.minimumPurchase}` : '-'}</td>
                                  <td className="px-6 py-4 text-gray-500 text-xs">
                                      {d.validUntil ? new Date(d.validUntil).toLocaleDateString() : 'Never'}
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                      <button onClick={() => handleDeleteDiscount(d.id)} className="text-red-500 hover:text-red-700 text-xs font-bold uppercase tracking-wider">Delete</button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>

               <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-lg shadow-slate-200/50">
                  <h4 className="font-bold text-xl text-gray-900 font-serif mb-6 border-b border-gray-100 pb-2">Add Discount Code</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div>
                          <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wider">Code</label>
                          <input type="text" value={newDiscount.code} onChange={e => setNewDiscount({...newDiscount, code: e.target.value.toUpperCase()})} className="w-full border border-gray-300 rounded-lg p-3 text-sm font-black text-brand-dark uppercase tracking-wide focus:ring-2 focus:ring-brand-green/20 outline-none" placeholder="SAVE20" />
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wider">Type</label>
                          <select 
                            value={newDiscount.discountType} 
                            onChange={e => setNewDiscount({...newDiscount, discountType: e.target.value as any})} 
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-green/20 outline-none bg-white"
                          >
                             <option value="percentage">Percentage (%)</option>
                             <option value="fixed">Fixed Amount (£)</option>
                          </select>
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wider">Value</label>
                          <input type="number" value={newDiscount.discountValue} onChange={e => setNewDiscount({...newDiscount, discountValue: +e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-green/20 outline-none" />
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wider">Min Purchase (£)</label>
                          <input type="number" value={newDiscount.minimumPurchase || 0} onChange={e => setNewDiscount({...newDiscount, minimumPurchase: +e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-green/20 outline-none" />
                      </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                       <div>
                          <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wider">Valid Until</label>
                          <input type="date" value={newDiscount.validUntil} onChange={e => setNewDiscount({...newDiscount, validUntil: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-green/20 outline-none" />
                       </div>
                       <div>
                          <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wider">Description</label>
                          <input type="text" value={newDiscount.description} onChange={e => setNewDiscount({...newDiscount, description: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-green/20 outline-none" placeholder="e.g. Spring Sale" />
                       </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                      <Button onClick={handleAddDiscount} variant="secondary" className="px-8 shadow-lg shadow-brand-hope/20">Create Code</Button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};
