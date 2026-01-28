
import React, { useState, useEffect, useRef } from 'react';
import { DiscountCode } from '../../../types';
import { api } from '../../../lib/db';
import { Button } from '../../ui/Button';
import { useToast } from '../../../context/ToastContext';

export const DiscountsTab: React.FC = () => {
  const { showToast } = useToast();
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [newDiscount, setNewDiscount] = useState<Partial<DiscountCode>>({
    code: '', discountType: 'percentage', discountValue: 0, description: '', 
    minimumPurchase: 0, maxUses: undefined, validUntil: ''
  });
  const [editingDiscountId, setEditingDiscountId] = useState<string | null>(null);
  
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    api.getDiscountCodes().then(setDiscounts);
  };

  const handleSaveDiscount = async () => {
      if (!newDiscount.code) return showToast('Code required', 'error');
      
      try {
          if (editingDiscountId) {
              await api.updateDiscountCode(editingDiscountId, newDiscount);
              showToast('Code updated', 'success');
          } else {
              await api.createDiscountCode(newDiscount);
              showToast('Code created', 'success');
          }
          resetDiscountForm();
          refreshData();
      } catch(e) { showToast('Operation failed', 'error'); }
  };

  const startEditDiscount = (d: DiscountCode) => {
      setNewDiscount({
          code: d.code,
          discountType: d.discountType,
          discountValue: d.discountValue,
          description: d.description,
          minimumPurchase: d.minimumPurchase,
          validUntil: d.validUntil ? new Date(d.validUntil).toISOString().slice(0, 10) : '',
          maxUses: d.maxUses
      });
      setEditingDiscountId(d.id);
      
      // Scroll to form
      setTimeout(() => {
          formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
  };

  const resetDiscountForm = () => {
      setNewDiscount({ code: '', discountType: 'percentage', discountValue: 0, description: '', minimumPurchase: 0, validUntil: '' });
      setEditingDiscountId(null);
  };

  const handleDeleteDiscount = async (id: string) => {
      if(window.confirm('Delete code?')) {
          await api.deleteDiscountCode(id);
          if (editingDiscountId === id) resetDiscountForm();
          refreshData();
      }
  };

  return (
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
                        <tr key={d.id} className="hover:bg-gray-50 group">
                            <td className="px-6 py-4 font-black text-brand-dark tracking-wide">{d.code}</td>
                            <td className="px-6 py-4">
                                <span className="font-bold text-green-600 bg-green-50 rounded-lg px-2 py-1">
                                {d.discountType === 'percentage' ? `${d.discountValue}% OFF` : `£${d.discountValue} OFF`}
                                </span>
                            </td>
                            <td className="px-6 py-4">{d.minimumPurchase ? `£${d.minimumPurchase}` : '-'}</td>
                            <td className="px-6 py-4 text-gray-500 text-xs">
                                {d.validUntil ? new Date(d.validUntil).toLocaleDateString() : 'Never'}
                            </td>
                            <td className="px-6 py-4 text-right flex justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => startEditDiscount(d)} className="text-brand-green hover:text-brand-dark text-xs font-bold uppercase tracking-wider">Edit</button>
                                <button onClick={() => handleDeleteDiscount(d.id)} className="text-red-500 hover:text-red-700 text-xs font-bold uppercase tracking-wider">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        <div ref={formRef} className="bg-white p-8 rounded-xl border border-gray-200 shadow-lg shadow-slate-200/50">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <h4 className="font-bold text-xl text-gray-900 font-serif">{editingDiscountId ? 'Edit Discount Code' : 'Add Discount Code'}</h4>
                {editingDiscountId && (
                    <button onClick={resetDiscountForm} className="text-xs text-red-500 font-bold hover:underline">Cancel Editing</button>
                )}
            </div>
            
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
                <Button onClick={handleSaveDiscount} variant="secondary" className="px-8 shadow-lg shadow-brand-hope/20">
                    {editingDiscountId ? 'Update Code' : 'Create Code'}
                </Button>
            </div>
        </div>
    </div>
  );
};
