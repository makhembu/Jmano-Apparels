
import React, { useState, useEffect, useRef } from 'react';
import { ShippingZone, ShippingOption } from '../../../types';
import { api } from '../../../lib/db';
import { Button } from '../../ui/Button';
import { useToast } from '../../../context/ToastContext';

export const ShippingTab: React.FC = () => {
  const { showToast } = useToast();
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [zoneForm, setZoneForm] = useState<Partial<ShippingZone>>({
    name: '', baseRate: 0, freeShippingThreshold: 0, countries: [], options: []
  });
  const [countriesInput, setCountriesInput] = useState('');
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  
  // New State for adding options to a zone
  const [newOption, setNewOption] = useState<Partial<ShippingOption>>({ name: 'Standard', rate: 0, description: '3-5 Days' });
  
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    api.getShippingZones().then(setZones);
  };

  const handleSaveZone = async () => {
      if (!zoneForm.name || !countriesInput) return showToast('Name and Countries required', 'error');
      
      const payload = {
          ...zoneForm,
          countries: countriesInput.split(',').map(s => s.trim()).filter(Boolean)
      };

      try {
          if (editingZoneId) {
              await api.updateShippingZone(editingZoneId, payload);
              showToast('Zone updated', 'success');
          } else {
              await api.createShippingZone(payload);
              showToast('Zone created', 'success');
          }
          
          resetZoneForm();
          refreshData();
      } catch(e) { showToast('Operation failed', 'error'); }
  };

  const handleAddOption = async (zoneId: string) => {
      if (!newOption.name) return;
      try {
          await api.addShippingOption(zoneId, newOption);
          showToast('Option added', 'success');
          setNewOption({ name: 'Standard', rate: 0, description: '3-5 Days' });
          refreshData();
      } catch(e) { showToast('Failed to add option', 'error'); }
  };

  const handleDeleteOption = async (optionId: string) => {
      if (!window.confirm('Remove this shipping method?')) return;
      try {
          await api.deleteShippingOption(optionId);
          showToast('Option removed', 'success');
          refreshData();
      } catch(e) { showToast('Failed to delete option', 'error'); }
  };

  const startEditZone = (z: ShippingZone) => {
      setZoneForm({
          name: z.name,
          baseRate: z.baseRate,
          freeShippingThreshold: z.freeShippingThreshold || 0,
          isActive: z.isActive
      });
      setCountriesInput(z.countries.join(', '));
      setEditingZoneId(z.id);
      
      // Scroll to form
      setTimeout(() => {
          formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
  };

  const resetZoneForm = () => {
      setZoneForm({ name: '', baseRate: 0, freeShippingThreshold: 0, countries: [] });
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

  return (
    <div className="space-y-12">
        <div className="space-y-6">
            {zones.map(z => (
                <div key={z.id} className="bg-white shadow rounded-xl border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <div>
                            <h4 className="font-bold text-gray-900">{z.name}</h4>
                            <p className="text-xs text-gray-500 max-w-md truncate">{z.countries.join(', ')}</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => startEditZone(z)} className="text-brand-green hover:text-brand-dark text-xs font-bold uppercase tracking-wider">Edit Zone</button>
                            <button onClick={() => handleDeleteZone(z.id)} className="text-red-500 hover:text-red-700 text-xs font-bold uppercase tracking-wider">Delete</button>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="mb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Shipping Methods</div>
                        
                        {/* Options List */}
                        <div className="space-y-2 mb-6">
                            {z.options.length > 0 ? z.options.map(opt => (
                                <div key={opt.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <div>
                                        <span className="font-bold text-sm text-slate-800">{opt.name}</span>
                                        <span className="text-xs text-slate-500 ml-2">{opt.description}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-mono font-bold text-slate-900">£{opt.rate.toFixed(2)}</span>
                                        <button onClick={() => handleDeleteOption(opt.id)} className="text-red-400 hover:text-red-600 font-bold text-lg leading-none">×</button>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-slate-400 italic">No specific methods configured. Base rate (£{z.baseRate}) will apply.</p>
                            )}
                        </div>

                        {/* Add Option Form */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <div className="sm:col-span-1">
                                <label className="text-[10px] font-bold text-blue-800 mb-1 block">Method Name</label>
                                <input type="text" value={newOption.name} onChange={e => setNewOption({...newOption, name: e.target.value})} className="w-full border border-blue-200 rounded p-1.5 text-xs" placeholder="e.g. Express" />
                            </div>
                            <div className="sm:col-span-1">
                                <label className="text-[10px] font-bold text-blue-800 mb-1 block">Description</label>
                                <input type="text" value={newOption.description} onChange={e => setNewOption({...newOption, description: e.target.value})} className="w-full border border-blue-200 rounded p-1.5 text-xs" placeholder="e.g. 1-2 Days" />
                            </div>
                            <div className="sm:col-span-1">
                                <label className="text-[10px] font-bold text-blue-800 mb-1 block">Cost (£)</label>
                                <input type="number" step="0.01" value={newOption.rate} onChange={e => setNewOption({...newOption, rate: +e.target.value})} className="w-full border border-blue-200 rounded p-1.5 text-xs" />
                            </div>
                            <button onClick={() => handleAddOption(z.id)} className="bg-blue-600 text-white text-xs font-bold py-1.5 px-3 rounded shadow-sm hover:bg-blue-700 h-[34px]">
                                Add Method
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
        
        <div ref={formRef} className="bg-white p-8 rounded-xl border border-gray-200 shadow-lg shadow-slate-200/50">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <h4 className="font-bold text-xl text-gray-900 font-serif">{editingZoneId ? 'Edit Shipping Zone' : 'Add New Shipping Zone'}</h4>
                {editingZoneId && (
                    <button onClick={resetZoneForm} className="text-xs text-red-500 font-bold hover:underline">Cancel Editing</button>
                )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wider">Zone Name</label>
                    <input type="text" value={zoneForm.name} onChange={e => setZoneForm({...zoneForm, name: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-green/20 outline-none" placeholder="e.g. Europe" />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wider">Countries (Comma separated)</label>
                    <textarea value={countriesInput} onChange={e => setCountriesInput(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-green/20 outline-none h-[46px] resize-none" placeholder="France, Germany, Spain..." />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wider">Base Rate Fallback (£)</label>
                    <input type="number" step="0.01" value={zoneForm.baseRate} onChange={e => setZoneForm({...zoneForm, baseRate: +e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-green/20 outline-none" />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wider">Free Shipping Over (£)</label>
                    <input type="number" step="0.01" value={zoneForm.freeShippingThreshold} onChange={e => setZoneForm({...zoneForm, freeShippingThreshold: +e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-green/20 outline-none" />
                </div>
            </div>
            <div className="mt-6 flex justify-end">
                <Button onClick={handleSaveZone} variant="secondary" className="px-8 shadow-lg shadow-brand-hope/20">
                    {editingZoneId ? 'Update Zone' : 'Create Zone'}
                </Button>
            </div>
        </div>
    </div>
  );
};
