
import React, { useState, useEffect } from 'react';
import { Category } from '../../../types';
import { api } from '../../../lib/db';
import { Button } from '../../ui/Button';
import { useToast } from '../../../context/ToastContext';

export const CategoriesTab: React.FC = () => {
  const { showToast } = useToast();
  const [prodCats, setProdCats] = useState<Category[]>([]);
  const [newProdCat, setNewProdCat] = useState({ key: '', label: '', color: '#000000', bgColorClass: '' });

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    api.getCategories().then(setProdCats);
  };

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

  return (
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
  );
};
