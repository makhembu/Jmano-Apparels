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
  const [newZone, setNewZone] = useState<Partial<ShippingZone>>({
    name: '', baseRate: 0, perKgRate: 0, freeShippingThreshold: 0, estimatedDays: '3-5 days', countries: []
  });
  const [countriesInput, setCountriesInput] = useState('');

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
  const handleAddZone = async () => {
      if (!newZone.name || !countriesInput) return showToast('Name and Countries required', 'error');
      try {
          await api.createShippingZone({
              ...newZone,
              countries: countriesInput.split(',').map(s => s.trim()).filter(Boolean)
          });
          showToast('Zone created', 'success');
          setNewZone({ name: '', baseRate: 0, perKgRate: 0, freeShippingThreshold: 0, estimatedDays: '3-5 days', countries: [] });
          setCountriesInput('');
          refreshData();
      } catch(e) { showToast('Failed to create zone', 'error'); }
  };

  const handleDeleteZone = async (id: string) => {
      if(window.confirm('Delete zone?')) {
          await api.deleteShippingZone(id);
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
    <div className="max-w-6xl pb-20">
      <div className="flex justify-between items-center mb-6">
         <h1 className="text-2xl font-bold text-brand-dark">Shop Configuration</h1>
      </div>

      <div className="flex gap-4 mb-8 border-b">
         {['general', 'categories', 'shipping', 'discounts'].map((tab) => (
             <button 
                key={tab}
                onClick={() => setActiveTab(tab as Tab)}
                className={`pb-2 px-4 text-sm font-medium capitalize ${activeTab === tab ? 'border-b-2 border-brand-green text-brand-green' : 'text-gray-500 hover:text-gray-700'}`}
             >
                {tab}
             </button>
         ))}
      </div>
      
      {/* GENERAL TAB */}
      {activeTab === 'general' && (
          <form onSubmit={saveGeneral} className="bg-white shadow rounded-lg p-6 space-y-4 max-w-2xl">
             <h3 className="text-lg font-medium mb-4">Financials & Display</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Currency</label>
                    <input type="text" name="currency" value={generalForm.currency || 'GBP'} onChange={handleGeneralChange} className="mt-1 w-full border rounded p-2" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Tax Rate (Decimal)</label>
                    <input type="number" step="0.01" name="taxRate" value={generalForm.taxRate || 0} onChange={handleGeneralChange} className="mt-1 w-full border rounded p-2" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Global Free Ship Threshold</label>
                    <input type="number" step="0.01" name="freeShippingThreshold" value={generalForm.freeShippingThreshold || 0} onChange={handleGeneralChange} className="mt-1 w-full border rounded p-2" />
                 </div>
             </div>
             
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Featured Categories</label>
                <div className="bg-gray-50 border rounded p-3 grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                    {prodCats.length > 0 ? prodCats.map(cat => (
                        <label key={cat.key} className="flex items-center space-x-2 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={featuredCats.includes(cat.key)} 
                                onChange={() => toggleFeaturedCat(cat.key)}
                                className="rounded text-brand-green focus:ring-brand-green border-gray-300"
                            />
                            <span className="text-sm text-gray-700">{cat.label}</span>
                        </label>
                    )) : (
                        <div className="text-sm text-gray-500 col-span-2">No categories found. Add some in the Categories tab.</div>
                    )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Select the categories you want to appear on the home page.</p>
             </div>
             
             <div className="pt-4 border-t">
                 <div className="flex items-center mb-4">
                    <input type="checkbox" name="requireLoginForCheckout" checked={!!generalForm.requireLoginForCheckout} onChange={handleGeneralChange} className="h-4 w-4 text-brand-green focus:ring-brand-green border-gray-300 rounded" />
                    <div className="ml-2">
                        <label className="text-sm font-bold block text-gray-900">Require Account for Checkout</label>
                        <p className="text-xs text-gray-500">If enabled, users must log in before purchasing. If disabled, guest checkout is allowed.</p>
                    </div>
                 </div>

                 <div className="flex items-center mb-4">
                    <input type="checkbox" name="isAnnouncementEnabled" checked={!!generalForm.isAnnouncementEnabled} onChange={handleGeneralChange} className="h-4 w-4 text-brand-green focus:ring-brand-green border-gray-300 rounded" />
                    <label className="ml-2 text-sm font-bold">Enable Announcement Bar</label>
                 </div>
                 <input type="text" name="announcementText" value={generalForm.announcementText || ''} onChange={handleGeneralChange} className="w-full border rounded p-2 mb-4" placeholder="Announcement text..." />
                 
                 <div className="flex items-center">
                    <input type="checkbox" name="enableReviews" checked={!!generalForm.enableReviews} onChange={handleGeneralChange} className="h-4 w-4 text-brand-green focus:ring-brand-green border-gray-300 rounded" />
                    <label className="ml-2 text-sm font-bold">Enable Reviews & Testimonials</label>
                 </div>
                 <p className="text-xs text-gray-500 ml-6 mt-1">Show product reviews and customer testimonies on the storefront.</p>
             </div>

             <div className="pt-4">
                <Button type="submit" isLoading={saving}>Save General Settings</Button>
             </div>
          </form>
      )}

      {/* CATEGORIES TAB */}
      {activeTab === 'categories' && (
          <div className="space-y-6">
              <div className="bg-white shadow rounded-lg overflow-hidden">
                  <table className="min-w-full text-sm">
                      <thead className="bg-gray-50">
                          <tr>
                              <th className="px-4 py-3 text-left">Key</th>
                              <th className="px-4 py-3 text-left">Label</th>
                              <th className="px-4 py-3 text-left">Color</th>
                              <th className="px-4 py-3"></th>
                          </tr>
                      </thead>
                      <tbody className="divide-y">
                          {prodCats.map(c => (
                              <tr key={c.key}>
                                  <td className="px-4 py-3 font-mono">{c.key}</td>
                                  <td className="px-4 py-3">{c.label}</td>
                                  <td className="px-4 py-3 flex items-center gap-2">
                                      <span className="w-4 h-4 rounded-full border" style={{backgroundColor: c.color}}></span>
                                      {c.color}
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                      <button onClick={() => handleDeleteCat(c.key)} className="text-red-500 hover:underline">Delete</button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>

              <div className="bg-gray-50 p-4 rounded border grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                  <div>
                      <label className="text-xs text-gray-500 block">Key (e.g. HOODIES)</label>
                      <input type="text" value={newProdCat.key} onChange={e => setNewProdCat({...newProdCat, key: e.target.value.toUpperCase()})} className="w-full border rounded p-2 text-sm" />
                  </div>
                  <div>
                      <label className="text-xs text-gray-500 block">Label</label>
                      <input type="text" value={newProdCat.label} onChange={e => setNewProdCat({...newProdCat, label: e.target.value})} className="w-full border rounded p-2 text-sm" />
                  </div>
                  <div>
                      <label className="text-xs text-gray-500 block">Color</label>
                      <input type="color" value={newProdCat.color} onChange={e => setNewProdCat({...newProdCat, color: e.target.value})} className="w-full h-9 border rounded cursor-pointer" />
                  </div>
                  <div>
                      <label className="text-xs text-gray-500 block">Tailwind Class (bg-brand-hope)</label>
                      <input type="text" value={newProdCat.bgColorClass} onChange={e => setNewProdCat({...newProdCat, bgColorClass: e.target.value})} className="w-full border rounded p-2 text-sm" />
                  </div>
                  <Button onClick={handleAddCat} variant="secondary">Add Category</Button>
              </div>
          </div>
      )}

      {/* SHIPPING TAB */}
      {activeTab === 'shipping' && (
          <div className="space-y-6">
              <div className="bg-white shadow rounded-lg overflow-hidden">
                  <table className="min-w-full text-sm">
                      <thead className="bg-gray-50">
                          <tr>
                              <th className="px-4 py-3 text-left">Zone Name</th>
                              <th className="px-4 py-3 text-left">Base Rate</th>
                              <th className="px-4 py-3 text-left">Per Kg</th>
                              <th className="px-4 py-3 text-left">Free Threshold</th>
                              <th className="px-4 py-3 text-left">Countries</th>
                              <th className="px-4 py-3"></th>
                          </tr>
                      </thead>
                      <tbody className="divide-y">
                          {zones.map(z => (
                              <tr key={z.id}>
                                  <td className="px-4 py-3 font-medium">{z.name}</td>
                                  <td className="px-4 py-3">£{z.baseRate.toFixed(2)}</td>
                                  <td className="px-4 py-3">£{z.perKgRate?.toFixed(2) || '0.00'}</td>
                                  <td className="px-4 py-3">{z.freeShippingThreshold ? `£${z.freeShippingThreshold}` : '-'}</td>
                                  <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">{z.countries.join(', ')}</td>
                                  <td className="px-4 py-3 text-right">
                                      <button onClick={() => handleDeleteZone(z.id)} className="text-red-500 hover:underline">Delete</button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
              
              <div className="bg-gray-50 p-6 rounded border space-y-4">
                  <h4 className="font-bold text-gray-700">Add New Shipping Zone</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                          <label className="text-xs text-gray-500 block">Name</label>
                          <input type="text" value={newZone.name} onChange={e => setNewZone({...newZone, name: e.target.value})} className="w-full border rounded p-2 text-sm" placeholder="e.g. Europe" />
                      </div>
                      <div>
                          <label className="text-xs text-gray-500 block">Base Rate (£)</label>
                          <input type="number" step="0.01" value={newZone.baseRate} onChange={e => setNewZone({...newZone, baseRate: +e.target.value})} className="w-full border rounded p-2 text-sm" />
                      </div>
                      <div>
                          <label className="text-xs text-gray-500 block">Rate per Kg (£)</label>
                          <input type="number" step="0.01" value={newZone.perKgRate} onChange={e => setNewZone({...newZone, perKgRate: +e.target.value})} className="w-full border rounded p-2 text-sm" />
                      </div>
                       <div>
                          <label className="text-xs text-gray-500 block">Free Threshold (£)</label>
                          <input type="number" step="0.01" value={newZone.freeShippingThreshold} onChange={e => setNewZone({...newZone, freeShippingThreshold: +e.target.value})} className="w-full border rounded p-2 text-sm" />
                      </div>
                  </div>
                  <div>
                      <label className="text-xs text-gray-500 block">Countries (Comma separated)</label>
                      <textarea value={countriesInput} onChange={e => setCountriesInput(e.target.value)} className="w-full border rounded p-2 text-sm" rows={2} placeholder="France, Germany, Spain..." />
                  </div>
                  <div>
                      <Button onClick={handleAddZone} variant="secondary">Create Zone</Button>
                  </div>
              </div>
          </div>
      )}

      {/* DISCOUNTS TAB */}
      {activeTab === 'discounts' && (
          <div className="space-y-6">
               <div className="bg-white shadow rounded-lg overflow-hidden">
                  <table className="min-w-full text-sm">
                      <thead className="bg-gray-50">
                          <tr>
                              <th className="px-4 py-3 text-left">Code</th>
                              <th className="px-4 py-3 text-left">Value</th>
                              <th className="px-4 py-3 text-left">Min. Spend</th>
                              <th className="px-4 py-3 text-left">Expires</th>
                              <th className="px-4 py-3"></th>
                          </tr>
                      </thead>
                      <tbody className="divide-y">
                          {discounts.map(d => (
                              <tr key={d.id}>
                                  <td className="px-4 py-3 font-bold text-brand-dark">{d.code}</td>
                                  <td className="px-4 py-3">
                                      {d.discountType === 'percentage' ? `${d.discountValue}%` : `£${d.discountValue}`}
                                  </td>
                                  <td className="px-4 py-3">{d.minimumPurchase ? `£${d.minimumPurchase}` : '-'}</td>
                                  <td className="px-4 py-3 text-gray-500">
                                      {d.validUntil ? new Date(d.validUntil).toLocaleDateString() : 'Never'}
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                      <button onClick={() => handleDeleteDiscount(d.id)} className="text-red-500 hover:underline">Delete</button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>

               <div className="bg-gray-50 p-6 rounded border space-y-4">
                  <h4 className="font-bold text-gray-700">Add Discount Code</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                          <label className="text-xs text-gray-500 block">Code</label>
                          <input type="text" value={newDiscount.code} onChange={e => setNewDiscount({...newDiscount, code: e.target.value.toUpperCase()})} className="w-full border rounded p-2 text-sm" />
                      </div>
                      <div>
                          <label className="text-xs text-gray-500 block">Type</label>
                          <select 
                            value={newDiscount.discountType} 
                            onChange={e => setNewDiscount({...newDiscount, discountType: e.target.value as any})} 
                            className="w-full border rounded p-2 text-sm"
                          >
                             <option value="percentage">Percentage (%)</option>
                             <option value="fixed">Fixed Amount (£)</option>
                          </select>
                      </div>
                      <div>
                          <label className="text-xs text-gray-500 block">Value</label>
                          <input type="number" value={newDiscount.discountValue} onChange={e => setNewDiscount({...newDiscount, discountValue: +e.target.value})} className="w-full border rounded p-2 text-sm" />
                      </div>
                      <div>
                          <label className="text-xs text-gray-500 block">Min Purchase (£)</label>
                          <input type="number" value={newDiscount.minimumPurchase || 0} onChange={e => setNewDiscount({...newDiscount, minimumPurchase: +e.target.value})} className="w-full border rounded p-2 text-sm" />
                      </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                          <label className="text-xs text-gray-500 block">Valid Until</label>
                          <input type="date" value={newDiscount.validUntil} onChange={e => setNewDiscount({...newDiscount, validUntil: e.target.value})} className="w-full border rounded p-2 text-sm" />
                       </div>
                       <div>
                          <label className="text-xs text-gray-500 block">Description</label>
                          <input type="text" value={newDiscount.description} onChange={e => setNewDiscount({...newDiscount, description: e.target.value})} className="w-full border rounded p-2 text-sm" />
                       </div>
                  </div>
                  <div>
                      <Button onClick={handleAddDiscount} variant="secondary">Create Code</Button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};