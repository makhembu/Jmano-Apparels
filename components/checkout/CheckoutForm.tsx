
import React from 'react';
import { Link } from 'react-router-dom';
import { User, ShippingAddress, UserAddress } from '../../types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Card, CardContent } from '../ui/Card';

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
                label="Email Address"
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

      {/* SAVED ADDRESSES */}
      {user && savedAddresses.length > 0 && (
        <Card>
          <CardContent>
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
          </CardContent>
        </Card>
      )}

      {/* ADDRESS FORM */}
      <Card className={`transition-all ${user && selectedAddressId !== 'new' ? 'opacity-50 pointer-events-none' : ''}`}>
        <CardContent>
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            {user ? "Delivery Address" : "2. Shipping Destination"}
          </h2>
          <div className="space-y-4">
            <Input 
              placeholder="Address Line 1" 
              value={address.address1} 
              onChange={e => setAddress({...address, address1: e.target.value})} 
            />
            <Input 
              placeholder="Address Line 2 (Optional)" 
              value={address.address2 || ''} 
              onChange={e => setAddress({...address, address2: e.target.value})} 
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input 
                placeholder="City" 
                value={address.city} 
                onChange={e => setAddress({...address, city: e.target.value})} 
              />
              <Input 
                placeholder="Postcode" 
                value={address.postcode} 
                onChange={e => setAddress({...address, postcode: e.target.value})} 
              />
            </div>
            
            <Select 
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
              type="tel" 
              placeholder="Phone Number" 
              value={address.phone || ''} 
              onChange={e => setAddress({...address, phone: e.target.value})} 
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
        </CardContent>
      </Card>

      {/* NOTES */}
      <Card>
        <CardContent>
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
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
