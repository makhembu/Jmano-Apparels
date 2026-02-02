
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
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { supabase } from '../lib/supabaseClient';

export const Checkout: React.FC = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { settings } = useApp();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [shippingCost, setShippingCost] = useState(0);
  const [discountCode, setDiscountCode] = useState('');
  const [activeDiscount, setActiveDiscount] = useState<DiscountCode | null>(null);
  const [orderNotes, setOrderNotes] = useState('');

  // Payment Config
  const [paypalConfig, setPaypalConfig] = useState<{ clientId: string; mode: string; enabled: boolean } | null>(null);

  // Address Selection State
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');
  const [saveThisAddress, setSaveThisAddress] = useState(true);

  // Guest Checkout State
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  const [address, setAddress] = useState<ShippingAddress>({
    address1: '', city: '', postcode: '', country: 'United Kingdom', phone: ''
  });

  useEffect(() => {
    // Safety check: if login is required but user is not logged in, bounce them
    if (settings.requireLoginForCheckout && !user) {
        navigate('/login', { state: { from: '/checkout' } });
        return;
    }

    // Load PayPal Settings Securely
    api.getPublicPaymentSettings().then((config) => {
      if (config) {
        setPaypalConfig({
          clientId: config.paypalClientId,
          mode: config.paypalMode,
          enabled: config.paymentGatewayEnabled
        });
      }
    });

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
  }, [user, settings, navigate]);

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
  
  const rawTaxRate = settings.taxRate ?? 0.20;
  const taxRate = rawTaxRate > 1 ? rawTaxRate / 100 : rawTaxRate;
  
  const taxableTotal = Math.max(0, cartTotal - discountAmount);
  const taxAmount = (taxableTotal / (1 + taxRate)) * taxRate;
  const finalTotal = Math.max(0, cartTotal + shippingCost - discountAmount);

  // Validation Logic
  const validateOrder = (): boolean => {
    if (!user) {
        if (!guestName || !guestEmail) {
            showToast('Please provide your name and email.', 'error');
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
            showToast('Please enter a valid email address.', 'error');
            return false;
        }
    }
    if (!address.address1 || !address.city || !address.postcode) {
        showToast('Please provide your full delivery details', 'error');
        return false;
    }
    return true;
  };

  const prepareOrderPayload = () => {
    // Save address only if logged in and new
    if (user && selectedAddressId === 'new' && saveThisAddress) {
        api.saveUserAddress(user.id, { ...address, label: 'Saved Address' }).catch(console.error);
    }

    const orderItems = cart.map(c => ({
      productId: c.id, 
      quantity: c.quantity, 
      size: c.selectedSize, 
      title: c.title, 
      price: c.price, 
      selectedColor: c.selectedColor,
      image: c.images[0]
    }));

    return {
      userId: user?.id || null, 
      customerName: user ? user.name : guestName,
      customerEmail: user ? user.email : guestEmail,
      products: orderItems,
      total: finalTotal,
      subtotal: cartTotal,
      shippingCost: shippingCost,
      taxAmount: taxAmount,
      discountAmount: discountAmount,
      discountCode: activeDiscount?.code,
      shippingAddress: address,
      notes: orderNotes
    };
  };

  const handleManualOrder = async () => {
    if (!validateOrder()) return;
    setIsProcessing(true);
    try {
       const payload = prepareOrderPayload();
       // Manual orders are 'Pending Payment' by default unless gateway confirms
       await api.createOrder({ ...payload, paymentStatus: 'pending' }); 
       clearCart();
       if (user) {
           navigate('/dashboard', { state: { orderConfirmed: true } });
       } else {
           navigate('/shop');
       }
       showToast('Order received! Please check email for payment instructions.', 'success');
    } catch(e) {
       console.error(e);
       showToast('Something went wrong. Please check your connection.', 'error');
    } finally {
       setIsProcessing(false);
    }
  };

  // --- PayPal Handlers ---

  const createPayPalOrder = async (data: any, actions: any) => {
    if (!validateOrder()) throw new Error("Invalid form data");
    
    try {
        // 1. Create Order in DB as "Pending Payment" to reserve stock and get ID
        const payload = prepareOrderPayload();
        // Set explicit pending status for PayPal flow
        const dbOrder = await api.createOrder({ 
            ...payload, 
            paymentStatus: 'pending' 
        });

        // 2. Create PayPal Order with the correct total
        return actions.order.create({
            purchase_units: [{
                description: `Order #${dbOrder.orderNumber}`,
                custom_id: dbOrder.id, // Link DB Order ID
                amount: {
                    currency_code: settings.currency || 'GBP',
                    value: finalTotal.toFixed(2)
                }
            }]
        });
    } catch (e: any) {
        showToast("Failed to initialize payment. Please try again.", 'error');
        throw e;
    }
  };

  const onPayPalApprove = async (data: any, actions: any) => {
    try {
        setIsProcessing(true);
        // 1. Retrieve the DB Order ID we sent as custom_id
        const orderDetails = await actions.order.get();
        const dbOrderId = orderDetails.purchase_units[0].custom_id;
        const paypalOrderId = data.orderID;

        // 2. Call Supabase Edge Function to verify and update DB
        // We use invoke directly to keep sensitive logic off the client
        const { data: verifyData, error } = await supabase.functions.invoke('verify-paypal-payment', {
            body: { orderId: dbOrderId, paypalOrderId: paypalOrderId }
        });

        if (error || !verifyData?.success) {
            console.error("Payment verification failed:", error || verifyData);
            throw new Error(verifyData?.message || "Payment verification failed. Please contact support.");
        }

        // 3. Success!
        clearCart();
        showToast('Payment successful! Order confirmed.', 'success');
        
        // Wait a brief moment for the DB to propagate update before redirecting
        await new Promise(resolve => setTimeout(resolve, 500));

        if (user) {
            navigate(`/order/${dbOrderId}`);
        } else {
            navigate('/shop'); // Or a generic success page
        }

    } catch (e: any) {
        console.error("PayPal Error:", e);
        showToast(`Payment Error: ${e.message}`, 'error');
        setIsProcessing(false);
        // Note: The order remains in 'Pending' state in DB. Admin can review.
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

          {/* GUEST DETAILS SECTION */}
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

          {/* Saved Addresses Selector (Only for logged in users) */}
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
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 ring-1 ring-gray-100 relative">
            
            {/* Loading Overlay */}
            {isProcessing && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-2xl">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
                    <p className="mt-4 text-brand-dark font-bold animate-pulse">Processing Payment...</p>
                </div>
            )}

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

            {/* LIVE PREVIEW BLOCK */}
            {(address.address1 || address.city || orderNotes) && (
               <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200 mb-6 animate-fade-in transition-all">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Shipping To
                  </h3>
                  
                  {address.address1 ? (
                    <div className="text-sm text-slate-700 font-medium leading-snug">
                       <p>{address.address1}</p>
                       {address.address2 && <p>{address.address2}</p>}
                       <p>{[address.city, address.postcode].filter(Boolean).join(', ')}</p>
                       <p className="text-xs text-slate-500 uppercase tracking-wide mt-1 font-bold">{address.country}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Enter address details...</p>
                  )}

                  {orderNotes && (
                    <div className="mt-3 pt-3 border-t border-slate-200/60">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Instruction</p>
                       <p className="text-xs text-slate-600 italic leading-relaxed">"{orderNotes}"</p>
                    </div>
                  )}
               </div>
            )}

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
               <div className="flex gap-2 w-full">
                  <input 
                    type="text" placeholder="Discount Code" 
                    value={discountCode} onChange={e => setDiscountCode(e.target.value.toUpperCase())} 
                    className="flex-1 min-w-0 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20" 
                  />
                  <Button onClick={applyDiscount} variant="outline" className="px-4 sm:px-6 shrink-0">Apply</Button>
               </div>

               {/* PAYMENT BUTTONS */}
               {paypalConfig && paypalConfig.enabled && paypalConfig.clientId ? (
                 <div className="pt-4 animate-fade-in relative z-0">
                    <PayPalScriptProvider options={{ "clientId": paypalConfig.clientId, currency: settings.currency || "GBP" }}>
                       <PayPalButtons 
                          {...({
                            style: { layout: "vertical", shape: "rect", borderRadius: 12 },
                            createOrder: createPayPalOrder,
                            onApprove: onPayPalApprove,
                            disabled: isProcessing
                          } as any)}
                       />
                    </PayPalScriptProvider>
                 </div>
               ) : (
                 <Button 
                  fullWidth 
                  onClick={handleManualOrder} 
                  isLoading={isProcessing}
                  className="py-4 text-lg font-bold shadow-xl shadow-brand-green/20 rounded-2xl"
                 >
                   Confirm Order (Manual)
                 </Button>
               )}
            </div>

            <p className="text-[10px] text-gray-400 text-center mt-6 uppercase tracking-widest font-bold">
               Secure Payment Powered by {paypalConfig?.enabled ? 'PayPal' : 'Jambo Secure'}
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
