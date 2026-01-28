
import React, { useState, useEffect } from 'react';
import { AppSettings, Category } from '../../../types';
import { useApp } from '../../../context/AppContext';
import { Button } from '../../ui/Button';
import { api } from '../../../lib/db';

export const GeneralSettingsTab: React.FC = () => {
  const { settings, updateSettings } = useApp();
  const [generalForm, setGeneralForm] = useState(settings);
  const [featuredCats, setFeaturedCats] = useState<string[]>([]);
  const [prodCats, setProdCats] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setGeneralForm(settings);
    if (settings.featuredCategories) setFeaturedCats(settings.featuredCategories);
    api.getCategories().then(setProdCats);
  }, [settings]);

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

  return (
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
  );
};
