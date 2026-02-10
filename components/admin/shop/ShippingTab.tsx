import React, { useState, useEffect, useRef } from 'react';
import { ShippingZone, ShippingOption } from '../../../types';
import { api } from '../../../lib/db';
import { Button } from '../../ui/Button';
import { useToast } from '../../../context/ToastContext';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';

export const ShippingTab: React.FC = () => {
  const { showToast } = useToast();
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Zone Form State
  const [zoneForm, setZoneForm] = useState<Partial<ShippingZone>>({
    name: '', countries: [], freeShippingThreshold: 0, isActive: true
  });
  const [countriesInput, setCountriesInput] = useState('');
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [isSavingZone, setIsSavingZone] = useState(false);

  // Option Form State (managed per zone)
  const [newOptionForms, setNewOptionForms] = useState<Record<string, Partial<ShippingOption>>>({});

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setLoading(true);
    try {
      const data = await api.getShippingZones();
      setZones(data);
    } catch (e) {
      showToast("Failed to load shipping data", "error");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveZone = async () => {
      if (!zoneForm.name || !countriesInput) return showToast('Zone Name and Countries are required.', 'error');
      
      const payload = {
          ...zoneForm,
          countries: countriesInput.split(',').map(s => s.trim()).filter(Boolean)
      };
      
      setIsSavingZone(true);
      try {
          if (editingZoneId) {
              await api.updateShippingZone(editingZoneId, payload);
              showToast('Shipping zone updated.', 'success');
          } else {
              await api.createShippingZone(payload);
              showToast('New shipping zone created.', 'success');
          }
          resetZoneForm();
          await refreshData();
      } catch(e: any) { 
          showToast(e.message || 'Operation failed.', 'error'); 
      } finally {
          setIsSavingZone(false);
      }
  };

  const handleAddOption = async (zoneId: string) => {
      const optionPayload = newOptionForms[zoneId];
      if (!optionPayload || !optionPayload.name || optionPayload.rate === undefined) {
          return showToast('Method Name and Cost are required.', 'error');
      }

      try {
          await api.addShippingOption(zoneId, optionPayload);
          showToast('Shipping method added.', 'success');
          setNewOptionForms(prev => ({ ...prev, [zoneId]: {} }));
          await refreshData();
      } catch(e: any) { 
          showToast(e.message || 'Failed to add method.', 'error'); 
      }
  };
  
  const handleDeleteOption = async (optionId: string) => {
      if (!window.confirm('Remove this shipping method?')) return;
      try {
          await api.deleteShippingOption(optionId);
          showToast('Method removed.', 'success');
          await refreshData();
      } catch(e: any) { showToast(e.message || 'Failed to delete method.', 'error'); }
  };

  const startEditZone = (z: ShippingZone) => {
      setZoneForm({
          name: z.name,
          freeShippingThreshold: z.freeShippingThreshold || 0,
          isActive: z.isActive
      });
      setCountriesInput(z.countries.join(', '));
      setEditingZoneId(z.id);
      
      setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  };

  const resetZoneForm = () => {
      setZoneForm({ name: '', freeShippingThreshold: 0, countries: [], isActive: true });
      setCountriesInput('');
      setEditingZoneId(null);
  };
  
  const handleDeleteZone = async (id: string) => {
      if(window.confirm('Delete this entire zone and all its methods?')) {
          await api.deleteShippingZone(id);
          if (editingZoneId === id) resetZoneForm();
          await refreshData();
      }
  };

  const handleOptionFormChange = (zoneId: string, field: keyof ShippingOption, value: any) => {
      setNewOptionForms(prev => ({
          ...prev,
          [zoneId]: {
              ...(prev[zoneId] || {}),
              [field]: value
          }
      }));
  };

  if (loading) {
      return <div className="p-10 text-center text-slate-500">Loading shipping configurations...</div>
  }

  return (
    <div className="space-y-12 animate-fade-in">
        {/* ZONES LIST */}
        <div className="space-y-6">
            {zones.map(zone => (
                <div key={zone.id} className="bg-white shadow-lg shadow-slate-200/50 rounded-2xl border border-slate-100 overflow-hidden">
                    <div className="bg-slate-50/70 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                        <div>
                            <h4 className="font-bold text-lg text-slate-800 font-serif">{zone.name}</h4>
                            <p className="text-xs text-slate-500 max-w-md truncate">{zone.countries.join(', ')}</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => startEditZone(zone)} className="text-brand-green text-xs font-bold uppercase tracking-wider hover:underline">Edit</button>
                            <button onClick={() => handleDeleteZone(zone.id)} className="text-red-500 text-xs font-bold uppercase tracking-wider hover:underline">Delete</button>
                        </div>
                    </div>
                    
                    <div className="p-6 space-y-4">
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Shipping Methods</h5>
                        {zone.options.length > 0 ? (
                            <div className="space-y-2">
                                {zone.options.map(opt => (
                                <div key={opt.id} className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-200">
                                    <div>
                                        <p className="font-bold text-sm text-slate-800">{opt.name}</p>
                                        <p className="text-xs text-slate-500">{opt.description}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-mono font-bold text-brand-dark">£{opt.rate.toFixed(2)}</span>
                                        <button onClick={() => handleDeleteOption(opt.id)} className="text-red-400 hover:text-red-600 text-lg font-bold leading-none">×</button>
                                    </div>
                                </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400 italic text-center py-4 border border-dashed rounded-lg">No shipping methods configured for this zone.</p>
                        )}
                        
                        {/* Add Option Form */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 items-end gap-3 bg-brand-light/20 p-4 rounded-xl border border-brand-green/10 mt-6">
                            <div className="sm:col-span-1">
                                <Input label="Method Name" value={newOptionForms[zone.id]?.name || ''} onChange={e => handleOptionFormChange(zone.id, 'name', e.target.value)} placeholder="e.g. Express" />
                            </div>
                            <div className="sm:col-span-1">
                                <Input label="Description" value={newOptionForms[zone.id]?.description || ''} onChange={e => handleOptionFormChange(zone.id, 'description', e.target.value)} placeholder="e.g. 1-2 Days" />
                            </div>
                            <div>
                                <Input label="Cost (£)" type="number" step="0.01" value={newOptionForms[zone.id]?.rate || ''} onChange={e => handleOptionFormChange(zone.id, 'rate', parseFloat(e.target.value))} />
                            </div>
                            <Button onClick={() => handleAddOption(zone.id)} variant="primary" className="h-12 text-xs shadow-lg shadow-brand-green/20">Add Method</Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
        
        {/* ZONE FORM */}
        <div ref={formRef} className="bg-white p-8 rounded-xl border border-slate-200 shadow-xl shadow-slate-200/50">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <h4 className="font-bold text-xl text-slate-800 font-serif">{editingZoneId ? 'Edit Shipping Zone' : 'Create New Shipping Zone'}</h4>
                {editingZoneId && <Button variant="outline" onClick={resetZoneForm} className="h-8 py-0">Cancel Edit</Button>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Zone Name" value={zoneForm.name || ''} onChange={e => setZoneForm({...zoneForm, name: e.target.value})} placeholder="e.g. Europe" />
                <div className="md:col-span-2">
                    <Textarea label="Countries (comma-separated)" value={countriesInput} onChange={e => setCountriesInput(e.target.value)} placeholder="France, Germany, Spain..." rows={2} />
                </div>
                <Input label="Free Shipping Threshold (£)" type="number" step="0.01" value={zoneForm.freeShippingThreshold || ''} onChange={e => setZoneForm({...zoneForm, freeShippingThreshold: parseFloat(e.target.value)})} />
            </div>

            <div className="mt-8 flex justify-end">
                <Button onClick={handleSaveZone} isLoading={isSavingZone} variant="secondary" className="px-8 shadow-lg shadow-brand-hope/20">
                    {editingZoneId ? 'Update Zone' : 'Save New Zone'}
                </Button>
            </div>
        </div>
    </div>
  );
};
