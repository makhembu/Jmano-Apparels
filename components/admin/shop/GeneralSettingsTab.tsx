import React, { useState, useEffect } from 'react';
import { AppSettings, Category } from '../../../types';
// FIX: Replaced deprecated useApp with useShop
import { useShop } from '../../../context/ShopContext';
import { Button } from '../../ui/Button';
import { api } from '../../../lib/db';
import { Switch } from '../../ui/Switch';

export const GeneralSettingsTab: React.FC = () => {
  const { settings, updateSettings } = useShop();
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

  const handleSwitchChange = (name: string, checked: boolean) => {
      setGeneralForm(prev => ({ ...prev, [name]: checked }));
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
            
            <Switch 
                label="Require Account for Checkout"
                description="If enabled, guest checkout will be disabled."
                checked={!!generalForm.requireLoginForCheckout}
                onChange={(val) => handleSwitchChange('requireLoginForCheckout', val)}
            />

            <Switch 
                label="Enable Announcement Bar"
                description="Show a top banner for sales, news, or scripture of the day."
                checked={!!generalForm.isAnnouncementEnabled}
                onChange={(val) => handleSwitchChange('isAnnouncementEnabled', val)}
            />
            
            {generalForm.isAnnouncementEnabled && (
            <div className="animate-fade-in pl-4 border-l-2 border-brand-green ml-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Announcement Text</label>
                <input type="text" name="announcementText" value={generalForm.announcementText || ''} onChange={handleGeneralChange} className="w-full border border-gray-200 rounded-xl p-3 bg-white text-sm text-gray-900 focus:ring-2 focus:ring-brand-green/20 outline-none" placeholder="e.g. 20% Off Spring Collection!" />
            </div>
            )}
            
            <Switch 
                label="Enable Reviews"
                description="Allow customers to leave testimonies on products."
                checked={!!generalForm.enableReviews}
                onChange={(val) => handleSwitchChange('enableReviews', val)}
            />
        </div>

        <div className="pt-6 border-t border-gray-100 space-y-4">
            <h4 className="text-sm font-bold text-gray-700 mb-2">Homepage Sections</h4>
            <Switch 
                label="Featured Products"
                description="Show the 'Featured Collections' section on the homepage."
                checked={generalForm.enableFeaturedProducts ?? true}
                onChange={(val) => handleSwitchChange('enableFeaturedProducts', val)}
            />
            <Switch 
                label="Commitment / Core Values"
                description="Show the 'Our Commitment' section."
                checked={generalForm.enableCommitmentSection ?? true}
                onChange={(val) => handleSwitchChange('enableCommitmentSection', val)}
            />
            <Switch 
                label="Shop by Category"
                description="Show the 'Shop by Category' links."
                checked={generalForm.enableCategoriesSection ?? true}
                onChange={(val) => handleSwitchChange('enableCategoriesSection', val)}
            />
            <Switch 
                label="Community Reviews"
                description="Show the 'From Our Community' section."
                checked={generalForm.enableCommunitySection ?? true}
                onChange={(val) => handleSwitchChange('enableCommunitySection', val)}
            />
            <Switch 
                label="Latest Journal"
                description="Show the 'Latest from our Journal' section."
                checked={generalForm.enableJournalSection ?? true}
                onChange={(val) => handleSwitchChange('enableJournalSection', val)}
            />
            <Switch 
                label="Social Media Follow"
                description="Show the 'Follow Our Journey' section."
                checked={generalForm.enableSocialSection ?? true}
                onChange={(val) => handleSwitchChange('enableSocialSection', val)}
            />
        </div>

        <div className="pt-4">
        <Button type="submit" isLoading={saving} className="shadow-lg shadow-brand-green/20">Save General Settings</Button>
        </div>
    </form>
  );
};