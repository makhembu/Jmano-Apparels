import React, { useState, useEffect } from 'react';
import { UserAddress } from '../../types';
import { api } from '../../lib/db';
import { Button } from '../ui/Button';
import { useToast } from '../../context/ToastContext';

interface AddressManagerProps {
  userId: string;
}

export const AddressManager: React.FC<AddressManagerProps> = ({ userId }) => {
  const { showToast } = useToast();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAddr, setCurrentAddr] = useState<Partial<UserAddress>>({
    label: 'Home', address1: '', city: '', postcode: '', country: 'United Kingdom', isDefault: false
  });

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const data = await api.getUserAddresses(userId);
      setAddresses(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [userId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.saveUserAddress(userId, currentAddr);
      showToast('Address book updated', 'success');
      setIsEditing(false);
      fetchAddresses();
    } catch (e) {
      showToast('Failed to save address', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this address?')) return;
    try {
      await api.deleteUserAddress(id);
      showToast('Address removed', 'info');
      fetchAddresses();
    } catch (e) {
      showToast('Error removing address', 'error');
    }
  };

  const startEdit = (addr?: UserAddress) => {
    if (addr) setCurrentAddr(addr);
    else setCurrentAddr({ label: 'Home', address1: '', city: '', postcode: '', country: 'United Kingdom', isDefault: addresses.length === 0 });
    setIsEditing(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-gray-900">Delivery Profiles</h3>
        {!isEditing && (
          <button onClick={() => startEdit()} className="text-brand-green text-sm font-bold uppercase tracking-wider hover:underline">+ Add New</button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="bg-brand-light/30 p-6 rounded-2xl border border-brand-light animate-fade-in space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Profile Name (e.g. Work)</label>
                <input type="text" required value={currentAddr.label} onChange={e => setCurrentAddr({...currentAddr, label: e.target.value})} className="w-full border rounded-lg p-2 text-sm" />
             </div>
             <div className="col-span-2 sm:col-span-1 flex items-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                   <input type="checkbox" checked={currentAddr.isDefault} onChange={e => setCurrentAddr({...currentAddr, isDefault: e.target.checked})} className="rounded text-brand-green" />
                   <span className="text-xs font-bold text-gray-600">Set as Default</span>
                </label>
             </div>
          </div>
          <input type="text" placeholder="Address line 1" required value={currentAddr.address1} onChange={e => setCurrentAddr({...currentAddr, address1: e.target.value})} className="w-full border rounded-lg p-2 text-sm" />
          <input type="text" placeholder="Address line 2" value={currentAddr.address2 || ''} onChange={e => setCurrentAddr({...currentAddr, address2: e.target.value})} className="w-full border rounded-lg p-2 text-sm" />
          <div className="grid grid-cols-2 gap-4">
             <input type="text" placeholder="City" required value={currentAddr.city} onChange={e => setCurrentAddr({...currentAddr, city: e.target.value})} className="w-full border rounded-lg p-2 text-sm" />
             <input type="text" placeholder="Postcode" required value={currentAddr.postcode} onChange={e => setCurrentAddr({...currentAddr, postcode: e.target.value})} className="w-full border rounded-lg p-2 text-sm" />
          </div>
          <div className="flex gap-2 pt-2">
             <Button type="submit" variant="primary" className="h-9 py-0">Save Address</Button>
             <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="h-9 py-0">Cancel</Button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map(addr => (
            <div key={addr.id} className="border border-gray-100 rounded-2xl p-5 bg-white shadow-sm hover:shadow-md transition-all relative group">
              <div className="flex justify-between items-start mb-2">
                <span className="bg-brand-light text-brand-green text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">{addr.label}</span>
                {addr.isDefault && <span className="text-brand-green font-bold text-xs flex items-center gap-1">✓ Primary</span>}
              </div>
              <p className="text-sm font-medium text-gray-800">{addr.address1}</p>
              <p className="text-xs text-gray-500">{addr.city}, {addr.postcode}</p>
              
              <div className="mt-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(addr)} className="text-[10px] font-bold text-gray-400 hover:text-brand-green uppercase">Edit</button>
                {!addr.isDefault && (
                  <button onClick={() => handleDelete(addr.id)} className="text-[10px] font-bold text-gray-400 hover:text-red-500 uppercase">Delete</button>
                )}
              </div>
            </div>
          ))}
          {addresses.length === 0 && !loading && (
            <div className="col-span-full py-10 border-2 border-dashed border-gray-100 rounded-2xl text-center">
               <p className="text-gray-400 text-sm italic">No saved delivery profiles.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};