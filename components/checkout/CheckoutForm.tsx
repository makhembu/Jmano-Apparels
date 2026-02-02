
import React from 'react';
import { Link } from 'react-router-dom';
import { User, ShippingAddress, UserAddress } from '../../types';

interface CheckoutFormProps {
  user: User | null;
  guestName: string;
  setGuestName: (val: string) => void;
  guestEmail: string;
  setGuestEmail: (val: string) => void;
  savedAddresses: UserAddress[];
  selectedAddressId: string;
  onAddressSelect: (id: string) => void;
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
  address, setAddress,
  saveThisAddress, setSaveThisAddress,
  orderNotes, setOrderNotes
}) => {
  return (
    <div className="space-y-10">
      {/* GUEST DETAILS */}
      {!user && (
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-brand-green/20 ring-4 ring-brand-light/20">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="bg-brand-green text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
            Guest Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
              <input 
                type="text" 
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="block w-full border border-gray-200 rounded-xl p-4 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                placeholder="e.g. John Doe"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
              <input 
                type="email" 
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="block w-full border border-gray-200 rounded-xl p-4 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                placeholder="john@example.com"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
            <span>Already have an account?</span>
            <Link to="/login" state={{ from: '/checkout' }} className="text-brand-green font-bold hover:underline">Sign In</Link>
          </div>
        </section>
      )}

      {/* SAVED ADDRESSES */}
      {user && savedAddresses.length > 0 && (
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Select Delivery Profile
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {savedAddresses.map(addr => (
              <button
                key={addr.id}
                onClick={() => onAddressSelect(addr.id)}
                className={`text-left p-4 rounded-xl border-2 transition-all group ${selectedAddressId === addr.id ? 'border-brand-green bg-brand-light/30' : 'border-gray-100 hover:border-brand-light'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-green">{addr.label}</span>
                  {selectedAddressId === addr.id && <span className="text-brand-green">✓</span>}
                </div>
                <p className="text-sm font-medium text-gray-900 truncate">{addr.address1}</p>
                <p className="text-xs text-gray-500">{addr.city}, {addr.postcode}</p>
              </button>
            ))}
            <button
              onClick={() => onAddressSelect('new')}
              className={`text-center p-4 rounded-xl border-2 border-dashed transition-all ${selectedAddressId === 'new' ? 'border-brand-green bg-brand-light/30' : 'border-gray-200 hover:border-brand-green/50 hover:bg-gray-50'}`}
            >
              <span className="text-sm font-bold text-gray-600">+ Use a new address</span>
            </button>
          </div>
        </section>
      )}

      {/* ADDRESS FORM */}
      <section className={`bg-white p-8 rounded-2xl shadow-sm border border-gray-100 transition-all ${user && selectedAddressId !== 'new' ? 'opacity-50 pointer-events-none' : ''}`}>
        <h2 className="text-lg font-bold text-gray-900 mb-6">
          {user ? "Delivery Address" : "2. Shipping Destination"}
        </h2>
        <div className="space-y-4">
          <input 
            type="text" placeholder="Address Line 1" 
            value={address.address1} onChange={e => setAddress({...address, address1: e.target.value})} 
            className="block w-full border border-gray-200 rounded-xl p-4 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all" 
          />
          <input 
            type="text" placeholder="Address Line 2 (Optional)" 
            value={address.address2 || ''} onChange={e => setAddress({...address, address2: e.target.value})} 
            className="block w-full border border-gray-200 rounded-xl p-4 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all" 
          />
          
          <div className="grid grid-cols-2 gap-4">
            <input 
              type="text" placeholder="City" 
              value={address.city} onChange={e => setAddress({...address, city: e.target.value})} 
              className="block w-full border border-gray-200 rounded-xl p-4 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all" 
            />
            <input 
              type="text" placeholder="Postcode" 
              value={address.postcode} onChange={e => setAddress({...address, postcode: e.target.value})} 
              className="block w-full border border-gray-200 rounded-xl p-4 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all" 
            />
          </div>
          
          <select 
            value={address.country} onChange={e => setAddress({...address, country: e.target.value})} 
            className="block w-full border border-gray-200 rounded-xl p-4 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
          >
            <option value="United Kingdom">United Kingdom</option>
            <option value="United States">United States</option>
            <option value="France">France</option>
            <option value="Germany">Germany</option>
            <option value="Australia">Australia</option>
            <option value="Other">Other</option>
          </select>

          <input 
            type="tel" placeholder="Phone Number" 
            value={address.phone || ''} onChange={e => setAddress({...address, phone: e.target.value})} 
            className="block w-full border border-gray-200 rounded-xl p-4 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all" 
          />

          {user && selectedAddressId === 'new' && (
            <label className="flex items-center gap-3 cursor-pointer group pt-2">
              <div className="relative">
                <input 
                  type="checkbox" 
                  checked={saveThisAddress} 
                  onChange={e => setSaveThisAddress(e.target.checked)} 
                  className="sr-only" 
                />
                <div className={`w-6 h-6 rounded border-2 transition-all flex items-center justify-center ${saveThisAddress ? 'bg-brand-green border-brand-green' : 'border-gray-200 group-hover:border-brand-green/50'}`}>
                  {saveThisAddress && <span className="text-white text-xs">✓</span>}
                </div>
              </div>
              <span className="text-sm text-gray-600 font-medium">Save this address to my profile</span>
            </label>
          )}
        </div>
      </section>

      {/* NOTES */}
      <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          Order Notes
        </h2>
        <textarea 
          placeholder="Special instructions for delivery (e.g. gate codes, preferred neighbor)..." 
          value={orderNotes}
          onChange={e => setOrderNotes(e.target.value)}
          rows={3}
          className="block w-full border border-gray-200 rounded-xl p-4 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
        />
      </section>
    </div>
  );
};
