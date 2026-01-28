
import React, { useState, useEffect, useRef } from 'react';
import { ShippingZone } from '../../../types';
import { api } from '../../../lib/db';
import { Button } from '../../ui/Button';
import { useToast } from '../../../context/ToastContext';

export const ShippingTab: React.FC = () => {
  const { showToast } = useToast();
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [zoneForm, setZoneForm] = useState<Partial<ShippingZone>>({
    name: '', baseRate: 0, perKgRate: 0, freeShippingThreshold: 0, estimatedDays: '3-5 days', countries: []
  });
  const [countriesInput, setCountriesInput] = useState('');
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  
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

  const startEditZone = (z: ShippingZone) => {
      setZoneForm({
          name: z.name,
          baseRate: z.baseRate,
          perKgRate: z.perKgRate || 0,
          freeShippingThreshold: z.freeShippingThreshold || 0,
          estimatedDays: z.estimatedDays || '',
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

  return (
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
        
        <div ref={formRef} className="bg-white p-8 rounded-xl border border-gray-200 shadow-lg shadow-slate-200/50">
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
  );
};
