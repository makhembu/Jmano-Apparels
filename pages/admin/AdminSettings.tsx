
import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { api } from '../../lib/db';
import { Category, BlogCategory } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings } = useApp();
  const { showToast } = useToast();
  const [formData, setFormData] = useState(settings);
  const [saving, setSaving] = useState(false);

  // Categories State
  const [prodCats, setProdCats] = useState<Category[]>([]);
  const [blogCats, setBlogCats] = useState<BlogCategory[]>([]);
  
  // New Category Forms
  const [newProdCat, setNewProdCat] = useState({ key: '', label: '', color: '#000000', bgColorClass: '' });
  const [newBlogCat, setNewBlogCat] = useState({ name: '', slug: '', description: '' });
  const [catSaving, setCatSaving] = useState(false);

  // Local state for JSON fields to make them editable as individual inputs
  const [socials, setSocials] = useState({ facebook: '', instagram: '', twitter: '', tiktok: '', linkedin: '' });
  const [hours, setHours] = useState<Record<string, string>>({
    monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '', sunday: ''
  });
  const [smtpJson, setSmtpJson] = useState('');
  const [featuredCats, setFeaturedCats] = useState('');

  useEffect(() => {
    setFormData(settings);
    if (settings.socialLinks) {
      setSocials({
         facebook: settings.socialLinks.facebook || '',
         instagram: settings.socialLinks.instagram || '',
         twitter: settings.socialLinks.twitter || '',
         tiktok: settings.socialLinks.tiktok || '',
         linkedin: settings.socialLinks.linkedin || ''
      });
    }
    if (settings.businessHours) {
      setHours({
        monday: settings.businessHours.monday || '',
        tuesday: settings.businessHours.tuesday || '',
        wednesday: settings.businessHours.wednesday || '',
        thursday: settings.businessHours.thursday || '',
        friday: settings.businessHours.friday || '',
        saturday: settings.businessHours.saturday || '',
        sunday: settings.businessHours.sunday || '',
      });
    }
    if (settings.smtpSettings) {
        setSmtpJson(JSON.stringify(settings.smtpSettings, null, 2));
    }
    if (settings.featuredCategories) {
        setFeaturedCats(settings.featuredCategories.join(', '));
    }
  }, [settings]);

  const fetchCategories = useCallback(async () => {
    const [prodCatsData, blogCatsData] = await Promise.all([
        api.getCategories(),
        api.getBlogCategories()
    ]);
    setProdCats(prodCatsData);
    setBlogCats(blogCatsData);
  }, []);

  // Load Categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     setSocials(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHours(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Merge locals back into main object
    let parsedSmtp = undefined;
    try {
        if(smtpJson) parsedSmtp = JSON.parse(smtpJson);
    } catch(e) {
        alert("Invalid SMTP JSON");
        setSaving(false);
        return;
    }

    const payload = {
       ...formData,
       socialLinks: socials,
       businessHours: hours,
       smtpSettings: parsedSmtp,
       featuredCategories: featuredCats.split(',').map(s => s.trim()).filter(Boolean)
    };

    await updateSettings(payload);
    setSaving(false);
  };

  // --- Category Handlers ---

  const handleAddProductCat = async () => {
    if (!newProdCat.key || !newProdCat.label) {
      showToast('Key and Label are required', 'error');
      return;
    }
    setCatSaving(true);
    try {
      await api.createCategory(newProdCat);
      showToast('Category created', 'success');
      setNewProdCat({ key: '', label: '', color: '#000000', bgColorClass: '' });
      await fetchCategories();
    } catch (e) {
      showToast('Failed to create category', 'error');
    } finally {
      setCatSaving(false);
    }
  };

  const handleDeleteProductCat = async (key: string) => {
    if(!window.confirm(`Delete category ${key}?`)) return;
    try {
      await api.deleteCategory(key);
      showToast('Category deleted', 'success');
      await fetchCategories();
    } catch(e) {
      showToast('Failed to delete', 'error');
    }
  };

  const handleAddBlogCat = async () => {
    if (!newBlogCat.name) {
      showToast('Name is required', 'error');
      return;
    }
    const slug = newBlogCat.slug || newBlogCat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    setCatSaving(true);
    try {
      await api.createBlogCategory({ ...newBlogCat, slug });
      showToast('Blog Category created', 'success');
      setNewBlogCat({ name: '', slug: '', description: '' });
      await fetchCategories();
    } catch (e) {
      showToast('Failed to create category', 'error');
    } finally {
      setCatSaving(false);
    }
  };

  const handleDeleteBlogCat = async (id: string) => {
    if(!window.confirm(`Delete blog category?`)) return;
    try {
      await api.deleteBlogCategory(id);
      showToast('Category deleted', 'success');
      await fetchCategories();
    } catch(e) {
      showToast('Failed to delete', 'error');
    }
  };

  return (
    <div className="max-w-4xl pb-20">
      <div className="flex justify-between items-center mb-6">
         <h1 className="text-2xl font-bold text-brand-dark">App Settings</h1>
         <Button type="submit" form="settings-form" isLoading={saving} variant="primary">Save Changes</Button>
      </div>
      
      <form id="settings-form" onSubmit={handleSubmit} className="space-y-6">
        
        {/* General Identity */}
        <div className="bg-white shadow rounded-lg p-6 border border-gray-200 space-y-4">
            <h3 className="text-lg font-medium border-b pb-2 text-brand-green">Identity & Branding</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Primary Slogan</label>
                <input type="text" name="slogan" value={formData.slogan} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Secondary Slogan</label>
                <input type="text" name="secondarySlogan" value={formData.secondarySlogan} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900" />
              </div>
            </div>
            <div>
            <label className="block text-sm font-medium text-gray-700">Mission Statement</label>
            <textarea name="mission" value={formData.mission} onChange={handleChange} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900" />
            </div>
            <div>
            <label className="block text-sm font-medium text-gray-700">Vision</label>
            <textarea name="vision" value={formData.vision} onChange={handleChange} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900" />
            </div>
            <div>
            <label className="block text-sm font-medium text-gray-700">Core Values</label>
            <input type="text" name="coreValues" value={formData.coreValues} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900" />
            </div>
        </div>
        
        {/* Category Management */}
        <div className="bg-white shadow rounded-lg p-6 border border-gray-200 space-y-8">
            <h3 className="text-lg font-medium border-b pb-2 text-brand-green">Manage Categories</h3>
            
            {/* Product Categories */}
            <div>
               <h4 className="text-md font-bold text-gray-700 mb-4">Product Categories</h4>
               <div className="space-y-4">
                  {/* List */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                       <thead className="bg-gray-50">
                          <tr>
                             <th className="px-4 py-2 text-left">Key</th>
                             <th className="px-4 py-2 text-left">Label</th>
                             <th className="px-4 py-2 text-left">Color</th>
                             <th className="px-4 py-2 text-left">Class</th>
                             <th className="px-4 py-2"></th>
                          </tr>
                       </thead>
                       <tbody className="divide-y">
                          {prodCats.map(cat => (
                             <tr key={cat.key}>
                                <td className="px-4 py-2">{cat.key}</td>
                                <td className="px-4 py-2">{cat.label}</td>
                                <td className="px-4 py-2 flex items-center gap-2">
                                  <div className="w-4 h-4 rounded-full" style={{backgroundColor: cat.color}}></div>
                                  {cat.color}
                                </td>
                                <td className="px-4 py-2 font-mono text-xs">{cat.bgColorClass}</td>
                                <td className="px-4 py-2 text-right">
                                   <button type="button" onClick={() => handleDeleteProductCat(cat.key)} className="text-red-500 hover:text-red-700 text-xs">Delete</button>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                  </div>
                  {/* Add Form */}
                  <div className="bg-gray-50 p-4 rounded border grid grid-cols-1 sm:grid-cols-5 gap-2 items-end">
                     <div>
                        <label className="block text-xs font-medium text-gray-500">Key (e.g. HOODIES)</label>
                        <input type="text" value={newProdCat.key} onChange={e => setNewProdCat({...newProdCat, key: e.target.value.toUpperCase()})} className="w-full border rounded p-1 text-sm" />
                     </div>
                     <div>
                        <label className="block text-xs font-medium text-gray-500">Label</label>
                        <input type="text" value={newProdCat.label} onChange={e => setNewProdCat({...newProdCat, label: e.target.value})} className="w-full border rounded p-1 text-sm" />
                     </div>
                     <div>
                        <label className="block text-xs font-medium text-gray-500">Hex Color</label>
                        <input type="color" value={newProdCat.color} onChange={e => setNewProdCat({...newProdCat, color: e.target.value})} className="w-full h-8 border rounded cursor-pointer" />
                     </div>
                     <div>
                        <label className="block text-xs font-medium text-gray-500">Tailwind Class</label>
                        <input type="text" placeholder="bg-brand-hope" value={newProdCat.bgColorClass} onChange={e => setNewProdCat({...newProdCat, bgColorClass: e.target.value})} className="w-full border rounded p-1 text-sm" />
                     </div>
                     <Button type="button" onClick={handleAddProductCat} disabled={catSaving} variant="secondary" className="h-8">Add</Button>
                  </div>
               </div>
            </div>

            <div className="border-t pt-6">
               <h4 className="text-md font-bold text-gray-700 mb-4">Blog Categories</h4>
               <div className="space-y-4">
                  {/* List */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                       <thead className="bg-gray-50">
                          <tr>
                             <th className="px-4 py-2 text-left">Name</th>
                             <th className="px-4 py-2 text-left">Slug</th>
                             <th className="px-4 py-2 text-left">Description</th>
                             <th className="px-4 py-2"></th>
                          </tr>
                       </thead>
                       <tbody className="divide-y">
                          {blogCats.map(cat => (
                             <tr key={cat.id}>
                                <td className="px-4 py-2">{cat.name}</td>
                                <td className="px-4 py-2 text-gray-500">{cat.slug}</td>
                                <td className="px-4 py-2 text-gray-500 truncate max-w-xs">{cat.description}</td>
                                <td className="px-4 py-2 text-right">
                                   <button type="button" onClick={() => handleDeleteBlogCat(cat.id)} className="text-red-500 hover:text-red-700 text-xs">Delete</button>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                  </div>
                  {/* Add Form */}
                  <div className="bg-gray-50 p-4 rounded border grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
                     <div>
                        <label className="block text-xs font-medium text-gray-500">Name</label>
                        <input type="text" value={newBlogCat.name} onChange={e => setNewBlogCat({...newBlogCat, name: e.target.value})} className="w-full border rounded p-1 text-sm" />
                     </div>
                     <div>
                        <label className="block text-xs font-medium text-gray-500">Slug (Optional)</label>
                        <input type="text" value={newBlogCat.slug} onChange={e => setNewBlogCat({...newBlogCat, slug: e.target.value})} className="w-full border rounded p-1 text-sm" />
                     </div>
                     <div>
                        <label className="block text-xs font-medium text-gray-500">Description</label>
                        <input type="text" value={newBlogCat.description} onChange={e => setNewBlogCat({...newBlogCat, description: e.target.value})} className="w-full border rounded p-1 text-sm" />
                     </div>
                     <Button type="button" onClick={handleAddBlogCat} disabled={catSaving} variant="secondary" className="h-8">Add</Button>
                  </div>
               </div>
            </div>
        </div>

        {/* Commerce */}
        <div className="bg-white shadow rounded-lg p-6 border border-gray-200 space-y-4">
           <h3 className="text-lg font-medium border-b pb-2 text-brand-green">Commerce Settings</h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                 <label className="block text-sm font-medium text-gray-700">Currency</label>
                 <input type="text" name="currency" value={formData.currency || 'GBP'} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900" />
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700">Tax Rate (Decimal)</label>
                 <input type="number" step="0.01" name="taxRate" value={formData.taxRate || 0} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900" />
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700">Free Shipping Threshold</label>
                 <input type="number" step="0.01" name="freeShippingThreshold" value={formData.freeShippingThreshold || 0} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900" />
              </div>
           </div>
           <div>
              <label className="block text-sm font-medium text-gray-700">Featured Categories (Keys, comma separated)</label>
              <input 
                type="text" 
                value={featuredCats} 
                onChange={(e) => setFeaturedCats(e.target.value)} 
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900" 
                placeholder="HOPEHOODIES, TESTAMENTSHIRTS"
              />
              <p className="text-xs text-gray-500 mt-1">Controls which category buttons appear on the home page.</p>
           </div>
        </div>

        {/* Contact Info & Hours */}
        <div className="bg-white shadow rounded-lg p-6 border border-gray-200 space-y-4">
            <h3 className="text-lg font-medium border-b pb-2 text-brand-green">Contact & Hours</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                   <input type="email" name="contactEmail" value={formData.contactEmail || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900" />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700">Phone</label>
                   <input type="text" name="contactPhone" value={formData.contactPhone || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input type="text" name="contactAddress" value={formData.contactAddress || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900" />
            </div>

            <div className="pt-2">
              <h4 className="text-sm font-bold text-gray-700 mb-2">Business Hours (e.g. "09:00-18:00")</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                  <div key={day}>
                    <label className="block text-xs uppercase font-medium text-gray-500">{day}</label>
                    <input 
                      type="text" 
                      name={day} 
                      value={hours[day]} 
                      onChange={handleHoursChange}
                      placeholder="Closed"
                      className="mt-1 block w-full border border-gray-300 rounded-md p-1.5 text-sm bg-white text-gray-900"
                    />
                  </div>
                ))}
              </div>
            </div>
        </div>

        {/* Social Links */}
        <div className="bg-white shadow rounded-lg p-6 border border-gray-200 space-y-4">
            <h3 className="text-lg font-medium border-b pb-2 text-brand-green">Social Media</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {['facebook', 'instagram', 'twitter', 'tiktok', 'linkedin'].map(platform => (
                 <div key={platform}>
                    <label className="block text-sm font-medium text-gray-700 capitalize">{platform} URL</label>
                    <input type="text" name={platform} value={(socials as any)[platform]} onChange={handleSocialChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900" />
                 </div>
               ))}
            </div>
        </div>

        {/* System & Maintenance */}
        <div className="bg-white shadow rounded-lg p-6 border border-gray-200 space-y-4">
           <h3 className="text-lg font-medium border-b pb-2 text-brand-green">System Status</h3>
           <div className="flex items-center">
              <input 
                type="checkbox" 
                id="maintenanceMode"
                name="maintenanceMode" 
                checked={!!formData.maintenanceMode} 
                onChange={handleChange} 
                className="h-4 w-4 text-brand-green border-gray-300 rounded focus:ring-brand-green" 
              />
              <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-900 font-bold">Enable Maintenance Mode</label>
           </div>
           {formData.maintenanceMode && (
              <div>
                  <label className="block text-sm font-medium text-gray-700">Maintenance Message</label>
                  <textarea name="maintenanceMessage" value={formData.maintenanceMessage || ''} onChange={handleChange} rows={2} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900" />
              </div>
           )}
           <div className="pt-2">
              <label className="block text-sm font-medium text-gray-700">SMTP Settings (JSON)</label>
              <textarea 
                value={smtpJson} 
                onChange={e => setSmtpJson(e.target.value)} 
                rows={4} 
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-50 text-gray-800 font-mono text-xs" 
                placeholder='{"host": "smtp.example.com", "port": 587}'
              />
           </div>
        </div>
        
        {/* Policies */}
        <div className="bg-white shadow rounded-lg p-6 border border-gray-200 space-y-4">
           <h3 className="text-lg font-medium border-b pb-2 text-brand-green">Legal & Policies</h3>
           <div className="space-y-4">
              <div>
                 <label className="block text-sm font-medium text-gray-700">Shipping Policy</label>
                 <textarea name="shippingPolicy" value={formData.shippingPolicy || ''} onChange={handleChange} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900" />
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700">Return Policy</label>
                 <textarea name="returnPolicy" value={formData.returnPolicy || ''} onChange={handleChange} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900" />
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700">Privacy Policy</label>
                 <textarea name="privacyPolicy" value={formData.privacyPolicy || ''} onChange={handleChange} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900" />
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700">Terms & Conditions</label>
                 <textarea name="termsConditions" value={formData.termsConditions || ''} onChange={handleChange} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900" />
              </div>
           </div>
        </div>

      </form>
    </div>
  );
};
