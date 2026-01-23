import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { api } from '../lib/db';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { ShippingAddress, ShippingZone, DiscountCode, UserAddress } from '../types';
import { useToast } from '../context/ToastContext';

export const Checkout: React.FC = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { settings } = useApp();
  // Fix: Added 'const' to declare navigate
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [shippingCost, setShippingCost] = useState(0);
  const [discountCode, setDiscountCode] = useState('');
  const [activeDiscount, setActiveDiscount] = useState<DiscountCode | null>(null);
  const [orderNotes, setOrderNotes] = useState('');

  // Address Selection State
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');
  const [saveThisAddress, setSaveThisAddress] = useState(true);

  const [address, setAddress] = useState<ShippingAddress>({
    address1: '', city: '', postcode: '', country: 'United Kingdom', phone: ''
  });

  useEffect(() => {
    api.getShippingZones().then(setZones);
    if (user) {
      api.getUserAddresses(user.id).then(addresses => {
        setSavedAddresses(addresses);
        const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
          setAddress({
            address1: defaultAddr.address1,
            address2: defaultAddr.address2,
            city: defaultAddr.city,
            postcode: defaultAddr.postcode,
            country: defaultAddr.country,
            phone: defaultAddr.phone
          });
        }
      });
    }
  }, [user]);

  const handleAddressSelect = (id: string) => {
    setSelectedAddressId(id);
    if (id === 'new') {
      setAddress({ address1: '', city: '', postcode: '', country: 'United Kingdom', phone: '' });
    } else {
      const saved = savedAddresses.find(a => a.id === id);
      if (saved) {
        setAddress({
          address1: saved.address1,
          address2: saved.address2,
          city: saved.city,
          postcode: saved.postcode,
          country: saved.country,
          phone: saved.phone
        });
      }
    }
  };

  // Calculate Shipping based on Zone Base + (Weight * PerKg)
  useEffect(() => {
    const totalWeight = cart.reduce((acc, item) => acc + ((item.weight || 0) * item.quantity), 0);
    const zone = zones.find(z => z.countries.includes(address.country)) || zones.find(z => z.countries.includes('Other'));
    
    if (zone) {
       if (zone.freeShippingThreshold && cartTotal >= zone.freeShippingThreshold) {
          setShippingCost(0);
       } else {
          const weightCost = (zone.perKgRate || 0) * totalWeight;
          setShippingCost(zone.baseRate + weightCost);
       }
    }
  }, [address.country, cartTotal, zones, cart]);

  const applyDiscount = async () => {
     if(!discountCode) return;
     const valid = await api.validateDiscountCode(discountCode, cartTotal);
     if(valid) {
        setActiveDiscount(valid);
        showToast('Blessing applied! Your discount is active.', 'success');
     } else {
        showToast('This code doesn’t seem to match our records.', 'error');
        setActiveDiscount(null);
     }
  };

  const discountAmount = activeDiscount 
    ? (activeDiscount.discountType === 'percentage' ? cartTotal * (activeDiscount.discountValue / 100) : activeDiscount.discountValue)
    : 0;
  
  // Robust Tax Rate handling: Normalizes e.g. 20.00 to 0.20
  const rawTaxRate = settings.taxRate ?? 0.20;
  const taxRate = rawTaxRate > 1 ? rawTaxRate / 100 : rawTaxRate;
  
  const taxableTotal = Math.max(0, cartTotal - discountAmount);
  const taxAmount = (taxableTotal / (1 + taxRate)) * taxRate;
  const finalTotal = Math.max(0, cartTotal + shippingCost - discountAmount);

  const handleOrder = async () => {
    // Fix: navigate is now correctly declared and usable
    if (!user) { navigate('/login'); return; }
    if (!address.address1 || !address.city || !address.postcode) {
        showToast('Please provide your full delivery details', 'error');
        return;
    }

    setIsProcessing(true);
    try {
       if (selectedAddressId === 'new' && saveThisAddress) {
          await api.saveUserAddress(user.id, { ...address, label: 'Saved Address' });
       }

       // Updated: included image in order items for history snapshots
       const orderItems = cart.map(c => ({
         productId: c.id, 
         quantity: c.quantity, 
         size: c.selectedSize, 
         title: c.title, 
         price: c.price, 
         selectedColor: c.selectedColor,
         image: c.images[0]
       }));
       
       await api.createOrder({
         userId: user.id,
         products: orderItems,
         total: finalTotal,
         subtotal: cartTotal,
         shippingCost: shippingCost,
         taxAmount: taxAmount,
         discountAmount: discountAmount,
         discountCode: activeDiscount?.code,
         shippingAddress: address,
         notes: orderNotes
       });
       
       clearCart();
       // Fix: navigate is now correctly declared and usable
       navigate('/dashboard', { state: { orderConfirmed: true } });
       showToast('Order confirmed! We’re threading your scriptures now.', 'success');
    } catch(e) {
       console.error(e);
       showToast('Something went wrong. Please check your connection.', 'error');
    } finally {
       setIsProcessing(false);
    }
  };

  if (cart.length === 0) return <EmptyState title="Your cart is waiting" description="Start your journey by adding scripture-inspired apparel." actionLink="/shop" actionLabel="Go to Shop" />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col lg:flex-row gap-12 items-start">
        
        {/* Left Side: Delivery & Notes */}
        <div className="w-full lg:w-3/5 space-y-10 animate-fade-in">
          <div>
            <h1 className="text-3xl font-serif font-bold text-brand-dark mb-2">Finalize Your Order</h1>
            <p className="text-gray-500 font-light">Ethically threaded and ready to be delivered to your door.</p>
          </div>

          {/* Saved Addresses Selector */}
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
                      onClick={() => handleAddressSelect(addr.id)}
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
                    onClick={() => handleAddressSelect('new')}
                    className={`text-center p-4 rounded-xl border-2 border-dashed transition-all ${selectedAddressId === 'new' ? 'border-brand-green bg-brand-light/30' : 'border-gray-200 hover:border-brand-green/50 hover:bg-gray-50'}`}
                  >
                    <span className="text-sm font-bold text-gray-600">+ Use a new address</span>
                  </button>
               </div>
            </section>
          )}

          {/* New Address Form */}
          <section className={`bg-white p-8 rounded-2xl shadow-sm border border-gray-100 transition-all ${selectedAddressId !== 'new' ? 'opacity-50 pointer-events-none' : ''}`}>
            <h2 className="text-lg font-bold text-gray-900 mb-6">Delivery Address</h2>
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

        {/* Right Side: Order Summary (Sticky) */}
        <div className="w-full lg:w-2/5 lg:sticky lg:top-24 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 ring-1 ring-gray-100">
            <h2 className="text-2xl font-serif font-bold text-brand-dark mb-6">Order Summary</h2>
            
            <div className="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar mb-6">
              <ul className="divide-y divide-gray-100">
                {cart.map(item => (
                  <li key={`${item.id}-${item.selectedSize}`} className="py-4 flex gap-4">
                    <div className="h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden border border-gray-50">
                       <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-grow flex flex-col justify-center">
                      <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{item.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Size: {item.selectedSize} {item.selectedColor ? `| ${item.selectedColor}` : ''}</p>
                      <div className="flex justify-between items-end mt-2">
                        <span className="text-xs font-medium text-gray-400">Qty: {item.quantity}</span>
                        <span className="text-sm font-bold text-brand-dark">£{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4 pt-6 border-t border-gray-100">
              <div className="flex justify-between text-gray-600 font-light">
                <span>Subtotal</span>
                <span>£{cartTotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-gray-600 font-light items-center">
                <span className="flex items-center gap-1.5">
                   Shipping
                   {shippingCost === 0 && <span className="bg-green-50 text-green-700 text-[10px] font-bold px-1.5 rounded-full">FREE</span>}
                </span>
                <span>{shippingCost === 0 ? '£0.00' : `£${shippingCost.toFixed(2)}`}</span>
              </div>

              {activeDiscount && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Discount ({activeDiscount.code})</span>
                  <span>-£{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-xs text-gray-400 font-light">
                <span>Estimated Tax ({(taxRate * 100).toFixed(0)}%)</span>
                <span>£{taxAmount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-xl font-bold text-brand-dark pt-4 border-t border-gray-100 mt-4">
                <span>Total</span>
                <span>£{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-8 space-y-4">
               <div className="flex gap-2">
                  <input 
                    type="text" placeholder="Discount Code" 
                    value={discountCode} onChange={e => setDiscountCode(e.target.value.toUpperCase())} 
                    className="flex-grow border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20" 
                  />
                  <Button onClick={applyDiscount} variant="outline" className="px-6">Apply</Button>
               </div>

               <Button 
                fullWidth 
                onClick={handleOrder} 
                isLoading={isProcessing}
                className="py-4 text-lg font-bold shadow-xl shadow-brand-green/20 rounded-2xl"
               >
                 Confirm Order
               </Button>
            </div>

            <p className="text-[10px] text-gray-400 text-center mt-6 uppercase tracking-widest font-bold">
               Secure Payment Powered by Stripe
            </p>
          </div>

          {/* Mission Callout */}
          <div className="bg-brand-light p-6 rounded-2xl text-center">
             <p className="text-brand-dark text-xs font-bold uppercase tracking-tighter mb-2">Supporting the Mission</p>
             <p className="text-gray-600 text-xs font-light leading-relaxed">
               Every thread in your order helps us transport the gospel news heartily as to the Lord. 
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};