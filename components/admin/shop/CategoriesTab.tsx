import React, { useState, useEffect, useRef } from 'react';
import { Category } from '../../../types';
import { api } from '../../../lib/db';
import { Button } from '../../ui/Button';
import { useToast } from '../../../context/ToastContext';

export const CategoriesTab: React.FC = () => {
  const { showToast } = useToast();
  const [prodCats, setProdCats] = useState<Category[]>([]);
  const [catForm, setCatForm] = useState({ key: '', label: '', color: '#000000', bgColorClass: '' });
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    try {
      const data = await api.getCategories();
      setProdCats(data);
    } catch (error) {
      console.error("Failed to load categories", error);
    }
  };

  const handleSaveCat = async () => {
    if (!catForm.key || !catForm.label) return showToast('Key and Label required', 'error');
    
    setIsSaving(true);
    try {
        if (editingKey) {
            // Optimistic update for immediate feedback
            setProdCats(prev => prev.map(c => c.key === editingKey ? { ...c, ...catForm } : c));
            
            await api.updateCategory(editingKey, catForm);
            showToast('Category updated', 'success');
        } else {
            // Optimistic update
            const newCat = { ...catForm, key: catForm.key.toUpperCase() } as Category;
            setProdCats(prev => [...prev, newCat]);

            await api.createCategory(catForm);
            showToast('Category created', 'success');
        }
        
        cancelEdit();
        // Refresh background data to ensure sync
        setTimeout(refreshData, 500);
    } catch(e) { 
        showToast('Operation failed', 'error');
        // Revert on error if needed by refreshing
        refreshData(); 
    } finally {
        setIsSaving(false);
    }
  };

  const handleDeleteCat = async (key: string) => {
    if(window.confirm(`Delete ${key}?`)) {
        // Optimistic delete
        setProdCats(prev => prev.filter(c => c.key !== key));
        
        try {
            await api.deleteCategory(key);
            if (editingKey === key) {
                cancelEdit();
            }
        } catch (e) {
            showToast('Failed to delete', 'error');
            refreshData();
        }
    }
  };

  const startEdit = (cat: Category) => {
      setCatForm({
          key: cat.key,
          label: cat.label,
          color: cat.color,
          bgColorClass: cat.bgColorClass
      });
      setEditingKey(cat.key);
      // Smooth scroll to form
      setTimeout(() => {
          formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
  };

  const cancelEdit = () => {
      setCatForm({ key: '', label: '', color: '#000000', bgColorClass: '' });
      setEditingKey(null);
  };

  return (
    <div className="space-y-8 animate-fade-in">
        <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase tracking-wider text-xs">Key</th>
                            <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase tracking-wider text-xs">Label</th>
                            <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase tracking-wider text-xs">Color</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {prodCats.map(c => (
                            <tr key={c.key} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs font-bold text-slate-600">{c.key}</td>
                                <td className="px-6 py-4 font-medium text-gray-900">{c.label}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-lg border shadow-sm" style={{backgroundColor: c.color}}></span>
                                        <span className="text-xs text-gray-500 font-mono">{c.color}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-end gap-3">
                                        <button onClick={() => startEdit(c)} className="text-brand-green hover:text-brand-dark text-xs font-bold uppercase tracking-wider hover:underline">Edit</button>
                                        <button onClick={() => handleDeleteCat(c.key)} className="text-red-500 hover:text-red-700 text-xs font-bold uppercase tracking-wider hover:underline">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {prodCats.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500 text-sm">
                                    No categories found. Add one below.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        <div ref={formRef} className="bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <div>
                    <h4 className="font-bold text-lg text-gray-900">{editingKey ? 'Edit Category' : 'Add New Category'}</h4>
                    <p className="text-xs text-gray-500 mt-1">Define category appearance and keys.</p>
                </div>
                {editingKey && (
                    <button onClick={cancelEdit} className="text-xs text-red-500 font-bold hover:underline bg-red-50 px-3 py-1.5 rounded-lg">Cancel Editing</button>
                )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                    <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wide">Key (ID)</label>
                    <input 
                        type="text" 
                        value={catForm.key} 
                        onChange={e => setCatForm({...catForm, key: e.target.value.toUpperCase().replace(/\s+/g, '_')})} 
                        className={`w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-green/20 outline-none transition-all ${editingKey ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'}`} 
                        placeholder="HOODIES" 
                        disabled={!!editingKey}
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Unique identifier (e.g. HOPEHOODIES)</p>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wide">Display Label</label>
                    <input 
                        type="text" 
                        value={catForm.label} 
                        onChange={e => setCatForm({...catForm, label: e.target.value})} 
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-green/20 outline-none" 
                        placeholder="Hoodies" 
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wide">Theme Color</label>
                    <div className="flex items-center gap-2">
                        <input 
                            type="color" 
                            value={catForm.color} 
                            onChange={e => setCatForm({...catForm, color: e.target.value})} 
                            className="h-11 w-14 border border-gray-300 rounded cursor-pointer p-1 bg-white" 
                        />
                        <input 
                            type="text" 
                            value={catForm.color} 
                            onChange={e => setCatForm({...catForm, color: e.target.value})} 
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-green/20 outline-none" 
                        />
                    </div>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wide">Tailwind Class</label>
                    <input 
                        type="text" 
                        value={catForm.bgColorClass} 
                        onChange={e => setCatForm({...catForm, bgColorClass: e.target.value})} 
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-green/20 outline-none" 
                        placeholder="bg-brand-hope" 
                    />
                </div>
            </div>
            
            <div className="mt-8 flex justify-end pt-4 border-t border-gray-50">
                <Button onClick={handleSaveCat} isLoading={isSaving} variant="secondary" className="px-8 shadow-lg shadow-brand-green/20">
                    {editingKey ? 'Update Category' : 'Create Category'}
                </Button>
            </div>
        </div>
    </div>
  );
};