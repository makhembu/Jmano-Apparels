
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, ShippingAddress, UserAddress } from '../../types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { api } from '../../lib/db';
import { useToast } from '../../context/ToastContext';

interface CheckoutFormProps {
  user: User | null;
  guestName: string;
  setGuestName: (val: string) => void;
  guestEmail: string;
  setGuestEmail: (val: string) => void;
  savedAddresses: UserAddress[];
  selectedAddressId: string;
  onAddressSelect: (id: string) => void;
  refreshAddresses: () => Promise<void>;
  address: ShippingAddress;
  setAddress: (addr: ShippingAddress) => void;
  saveThisAddress: boolean;
  setSaveThisAddress: (val: boolean) => void;
  orderNotes: string;
  setOrderNotes: (val: string) => void;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({
  user,
  guestName, setGuestName,
  guestEmail, setGuestEmail,
  savedAddresses,
  selectedAddressId, onAddressSelect,
  refreshAddresses,
  address, setAddress,
  saveThisAddress, setSaveThisAddress,
  orderNotes, setOrderNotes
}) => {
  const { showToast } = useToast();
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Delete this delivery profile?")) return;
    
    setIsDeleting(id);
    try {
      await api.deleteUserAddress(id);
      showToast("Profile removed", "success");
      if (selectedAddressId === id) {
        onAddressSelect('new');
      }
      await refreshAddresses();
    } catch (e) {
      showToast("Failed to delete", "error");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAddress) return;

    try {
      await api.saveUserAddress(editingAddress.userId, editingAddress);
      showToast("Profile updated", "success");
      
      // If we're editing the currently selected address, sync the form
      if (selectedAddressId === editingAddress.id) {
        setAddress({
          address1: editingAddress.address1,
          address2: editingAddress.address2,
          city: editingAddress.city,
          postcode: editingAddress.postcode,
          country: editingAddress.country,
          phone: editingAddress.phone
        });
      }
      
      setEditingAddress(null);
      await refreshAddresses();
    } catch (e) {
      showToast("Failed to update profile", "error");
    }
  };

  return (
    <div className="space-y-10">
      {/* GUEST DETAILS */}
      {!user && (
        <Card className="border-brand-green/20 ring-4 ring-brand-light/20">
          <CardContent>
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="bg-brand-green text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
              Guest Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Full Name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g. John Doe"
              />
              <Input 
                label="Email"
                type="email" 
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="john@example.com"
              />
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
              <span>Already have an account?</span>
              <Link to="/login" state={{ from: '/checkout' }} className="text-brand-green font-bold hover:underline">Sign In</Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SAVED ADDRESSES SECTION (MATCHING SCREENSHOT) */}
      {user && savedAddresses.length > 0 && (
        <Card>
          <CardContent>
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-5 h-5 text-brand-green">
                 <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              Select Delivery Profile
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {savedAddresses.map(addr => {
                const isSelected = selectedAddressId === addr.id;
                return (
                  <div key={addr.id} className="relative group">
                    <button
                      type="button"
                      onClick={() => onAddressSelect(addr.id)}
                      className={`w-full text-left p-5 rounded-2xl border-2 transition-all relative ${
                        isSelected 
                        ? 'border-brand-green bg-white shadow-md' 
                        : 'border-slate-100 bg-white hover:border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-brand-green' : 'text-slate-400'}`}>
                           {addr.label || 'Saved Address'}
                        </span>
                        {isSelected && (
                           <div className="text-brand-green">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                           </div>
                        )}
                      </div>
                      <p className="text-sm font-bold text-slate-800 leading-snug">{addr.address1}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{addr.city}, {addr.country}, {addr.postcode}</p>
                    </button>
                    
                    {/* Management Actions Overlay */}
                    <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingAddress(addr); }}
                        className="p-1.5 bg-slate-50 text-slate-400 hover:text-brand-green rounded-lg border border-slate-200 shadow-sm"
                        title="Edit profile"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button 
                        onClick={(e) => handleDelete(e, addr.id)}
                        disabled={isDeleting === addr.id}
                        className="p-1.5 bg-slate-50 text-slate-400 hover:text-red-500 rounded-lg border border-slate-200 shadow-sm disabled:opacity-50"
                        title="Delete profile"
                      >
                        {isDeleting === addr.id ? (
                           <div className="w-3.5 h-3.5 animate-spin border-b border-current rounded-full" />
                        ) : (
                           <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => onAddressSelect('new')}
                className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed transition-all ${
                  selectedAddressId === 'new' 
                  ? 'border-brand-green bg-brand-light/30 text-brand-green shadow-sm' 
                  : 'border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="text-sm font-bold">+ Use a new address</span>
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* EDIT MODAL */}
      {editingAddress && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-dark/60 backdrop-blur-sm p-4 animate-fade-in">
           <Card className="w-full max-w-lg shadow-2xl">
              <CardContent>
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-serif font-bold text-brand-dark">Edit Delivery Profile</h3>
                    <button onClick={() => setEditingAddress(null)} className="text-slate-400 hover:text-slate-900 transition-colors">
                       <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                 </div>
                 <form onSubmit={handleEditSave} className="space-y-4">
                    <Input 
                        label="Label (e.g. Home, Church)"
                        value={editingAddress.label}
                        onChange={e => setEditingAddress({...editingAddress, label: e.target.value})}
                        required
                    />
                    <Input 
                        label="Address Line 1"
                        value={editingAddress.address1}
                        onChange={e => setEditingAddress({...editingAddress, address1: e.target.value})}
                        required
                    />
                    <Input 
                        label="Address Line 2 (Optional)"
                        value={editingAddress.address2 || ''}
                        onChange={e => setEditingAddress({...editingAddress, address2: e.target.value})}
                    />
                    <div className="grid grid-cols-2 gap-4">
                       <Input 
                          label="City"
                          value={editingAddress.city}
                          onChange={e => setEditingAddress({...editingAddress, city: e.target.value})}
                          required
                       />
                       <Input 
                          label="Postcode"
                          value={editingAddress.postcode}
                          onChange={e => setEditingAddress({...editingAddress, postcode: e.target.value})}
                          required
                       />
                    </div>
                    <Select 
                       label="Country"
                       value={editingAddress.country}
                       onChange={e => setEditingAddress({...editingAddress, country: e.target.value})}
                       options={[
                         { value: "United Kingdom", label: "United Kingdom" },
                         { value: "United States", label: "United States" },
                         { value: "France", label: "France" },
                         { value: "Germany", label: "Germany" },
                         { value: "Australia", label: "Australia" },
                         { value: "Other", label: "Other" }
                       ]}
                    />
                    <div className="flex gap-3 pt-6 border-t border-slate-100">
                       <Button type="button" variant="outline" fullWidth onClick={() => setEditingAddress(null)}>Cancel</Button>
                       <Button type="submit" fullWidth>Save Changes</Button>
                    </div>
                 </form>
              </CardContent>
           </Card>
        </div>
      )}

      {/* ADDRESS FORM (For new or current guest) */}
      <Card className={`transition-all ${user && selectedAddressId !== 'new' ? 'hidden' : 'animate-fade-in'}`}>
        <CardContent>
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            {user ? "Delivery Address" : "2. Shipping Destination"}
          </h2>
          <div className="space-y-4">
            <Input 
              label="Address Line 1"
              placeholder="123 Scripture Lane" 
              value={address.address1} 
              onChange={e => setAddress({...address, address1: e.target.value})} 
            />
            <Input 
              label="Address Line 2 (Optional)"
              placeholder="Apt, Suite, Building" 
              value={address.address2 || ''} 
              onChange={e => setAddress({...address, address2: e.target.value})} 
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="City"
                placeholder="London" 
                value={address.city} 
                onChange={e => setAddress({...address, city: e.target.value})} 
              />
              <Input 
                label="Postcode"
                placeholder="W1A 1AA" 
                value={address.postcode} 
                onChange={e => setAddress({...address, postcode: e.target.value})} 
              />
            </div>
            
            <Select 
              label="Country"
              value={address.country} 
              onChange={e => setAddress({...address, country: e.target.value})} 
              options={[
                { value: "United Kingdom", label: "United Kingdom" },
                { value: "United States", label: "United States" },
                { value: "France", label: "France" },
                { value: "Germany", label: "Germany" },
                { value: "Australia", label: "Australia" },
                { value: "Other", label: "Other" }
              ]}
            />

            <Input 
              label="Phone Number"
              type="tel" 
              placeholder="+44 ..." 
              value={address.phone || ''} 
              onChange={e => setAddress({...address, phone: e.target.value})} 
            />

            {user && selectedAddressId === 'new' && (
              <label className="flex items-center gap-3 cursor-pointer group pt-4 border-t border-slate-50">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={saveThisAddress} 
                    onChange={e => setSaveThisAddress(e.target.checked)} 
                    className="sr-only" 
                  />
                  <div className={`w-6 h-6 rounded border-2 transition-all flex items-center justify-center ${saveThisAddress ? 'bg-brand-green border-brand-green' : 'border-slate-200 group-hover:border-brand-green/50'}`}>
                    {saveThisAddress && <span className="text-white text-xs">✓</span>}
                  </div>
                </div>
                <span className="text-sm text-slate-600 font-bold uppercase tracking-wider">Save this address to my profile</span>
              </label>
            )}
          </div>
        </CardContent>
      </Card>

      {/* NOTES */}
      <Card>
        <CardContent>
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <div className="w-5 h-5 text-slate-400">
               <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </div>
            Order Notes
          </h2>
          <Textarea 
            placeholder="Special instructions for delivery (e.g. gate codes, preferred neighbor)..." 
            value={orderNotes}
            onChange={e => setOrderNotes(e.target.value)}
            rows={3}
          />
        </CardContent>
      </Card>
    </div>
  );
};
