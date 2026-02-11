
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { api } from '../lib/db';
import { EmptyState } from '../components/ui/EmptyState';
import { ShippingAddress, ShippingZone, DiscountCode, UserAddress, ShippingOption } from '../types';
import { useToast } from '../context/ToastContext';
import { usePayment } from '../hooks/usePayment';
import { CheckoutForm } from '../components/checkout/CheckoutForm';
import { OrderSummary } from '../components/checkout/OrderSummary';
import { PaymentOptions } from '../components/checkout/PaymentOptions';
import { checkoutSchema } from '../lib/schemas';

export const Checkout: React.FC = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { settings } = useShop();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [shippingCost, setShippingCost] = useState(0);
  const [discountCode, setDiscountCode] = useState('');
  const [activeDiscount, setActiveDiscount] = useState<DiscountCode | null>(null);
  const [orderNotes, setOrderNotes] = useState('');

  // Shipping Selection State
  const [availableMethods, setAvailableMethods] = useState<ShippingOption[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');

  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');
  const [saveThisAddress, setSaveThisAddress] = useState(true);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [address, setAddress] = useState<ShippingAddress>({
    address1: '', city: '', postcode: '', country: 'United Kingdom', phone: ''
  });

  const { 
    isProcessing, 
    paypalConfig, 
    handlePayPalCreateOrder, 
    handlePayPalApprove, 
    handleManualOrder 
  } = usePayment({ user, clearCart, settings });

  const fetchUserAddresses = useCallback(async () => {
    if (!user) return;
    try {
      const addresses = await api.getUserAddresses(user.id);
      setSavedAddresses(addresses);
      if (selectedAddressId === 'new' && addresses.length > 0) {
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
      }
    } catch (e) {
      console.error("Failed to fetch addresses", e);
    }
  }, [user, selectedAddressId]);

  useEffect(() => {
    if (settings.requireLoginForCheckout && !user) {
        navigate('/login', { state: { from: '/checkout' } });
        return;
    }
    api.getShippingZones().then(setZones);
    if (user) fetchUserAddresses();
  }, [user, settings, navigate, fetchUserAddresses]);

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

  // Logic to update shipping options when country changes
  useEffect(() => {
    const zone = zones.find(z => z.countries.includes(address.country)) || zones.find(z => z.countries.includes('Other'));
    
    if (zone) {
       // Check if free shipping threshold is met
       const isFree = zone.freeShippingThreshold && cartTotal >= zone.freeShippingThreshold;
       
       if (isFree) {
           // If free shipping, clear cost and methods (or create a virtual free method)
           setShippingCost(0);
           setAvailableMethods([]);
           setSelectedMethodId('free');
       } else if (zone.options && zone.options.length > 0) {
           // If options exist, let user select
           setAvailableMethods(zone.options);
           // Default to first option if none selected or invalid
           if (!selectedMethodId || selectedMethodId === 'free' || !zone.options.find(o => o.id === selectedMethodId)) {
               setSelectedMethodId(zone.options[0].id);
               setShippingCost(zone.options[0].rate);
           } else {
               // Ensure cost matches selected method (re-validation)
               const method = zone.options.find(o => o.id === selectedMethodId);
               if (method) setShippingCost(method.rate);
           }
       } else {
           // Fallback to base rate
           setAvailableMethods([]);
           setShippingCost(zone.baseRate);
           setSelectedMethodId('standard');
       }
    } else {
       // No zone matches (unlikely given 'Other' fallback)
       setShippingCost(0);
       setAvailableMethods([]);
    }
  }, [address.country, cartTotal, zones, selectedMethodId]);

  const handleMethodChange = (methodId: string) => {
      setSelectedMethodId(methodId);
      const method = availableMethods.find(m => m.id === methodId);
      if (method) setShippingCost(method.rate);
  };

  const applyDiscount = async () => {
     if(!discountCode) return;
     const valid = await api.validateDiscountCode(discountCode, cartTotal);
     if(valid) {
        setActiveDiscount(valid);
        showToast('Blessing applied!', 'success');
     } else {
        showToast('Invalid code.', 'error');
        setActiveDiscount(null);
     }
  };

  const discountAmount = activeDiscount 
    ? (activeDiscount.discountType === 'percentage' ? cartTotal * (activeDiscount.discountValue / 100) : activeDiscount.discountValue)
    : 0;
  
  // Tax Logic with Safety Normalization
  let taxRate = settings.taxRate || 0.20;
  // If user entered 20 instead of 0.20, normalize it
  if (taxRate >= 1) {
    taxRate = taxRate / 100;
  }
  
  const taxableTotal = Math.max(0, cartTotal - discountAmount);
  const taxAmount = (taxableTotal / (1 + taxRate)) * taxRate;
  const finalTotal = Math.max(0, cartTotal + shippingCost - discountAmount);

  const validateOrder = (): boolean => {
    // Construct data object for Zod validation
    const validationData = {
        guest: !user ? { name: guestName, email: guestEmail } : undefined,
        address: address,
        user: user ? { id: user.id } : undefined
    };

    const result = checkoutSchema.safeParse(validationData);

    if (!result.success) {
        // FIX: Zod validation errors are in the 'issues' property, not 'errors'.
        const firstError = result.error.issues[0];
        showToast(firstError.message, 'error');
        return false;
    }
    return true;
  };

  const prepareOrderPayload = () => {
    if (!validateOrder()) return null;
    if (user && selectedAddressId === 'new' && saveThisAddress) {
        api.saveUserAddress(user.id, { ...address, label: 'Saved Address' }).catch(console.error);
    }
    
    // Find method name
    let selectedMethodName = 'Standard';
    if (selectedMethodId === 'free') selectedMethodName = 'Free Shipping';
    else {
        const method = availableMethods.find(m => m.id === selectedMethodId);
        if (method) selectedMethodName = method.name;
    }

    return {
      userId: user?.id || null, 
      customerName: user ? user.name : guestName,
      customerEmail: user ? user.email : guestEmail,
      products: cart.map(c => ({
        productId: c.id, quantity: c.quantity, size: c.selectedSize, 
        title: c.title, price: c.price, selectedColor: c.selectedColor, image: c.images[0]
      })),
      total: finalTotal,
      subtotal: cartTotal,
      shippingCost: shippingCost,
      shippingMethod: selectedMethodName,
      taxAmount: taxAmount,
      discountAmount: discountAmount,
      discountCode: activeDiscount?.code,
      shippingAddress: address,
      notes: orderNotes
    };
  };

  if (cart.length === 0) return <EmptyState title="Your cart is waiting" description="Start your journey." actionLink="/shop" actionLabel="Go to Shop" />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-12 items-start">
        <div className="w-full lg:w-3/5 space-y-10">
          <h1 className="text-3xl font-serif font-bold text-brand-dark">Finalize Your Order</h1>
          <CheckoutForm 
            user={user} guestName={guestName} setGuestName={setGuestName} guestEmail={guestEmail} setGuestEmail={setGuestEmail}
            savedAddresses={savedAddresses} selectedAddressId={selectedAddressId} onAddressSelect={handleAddressSelect}
            refreshAddresses={fetchUserAddresses} address={address} setAddress={setAddress}
            saveThisAddress={saveThisAddress} setSaveThisAddress={setSaveThisAddress}
            orderNotes={orderNotes} setOrderNotes={setOrderNotes}
          />
        </div>
        <div className="w-full lg:w-2/5 lg:sticky lg:top-24 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 relative">
            {isProcessing && <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center rounded-2xl"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div></div>}
            
            <OrderSummary 
              cart={cart} cartTotal={cartTotal} shippingCost={shippingCost} discountAmount={discountAmount} 
              taxAmount={taxAmount} taxRate={taxRate} finalTotal={finalTotal} activeDiscount={activeDiscount} 
              address={address} orderNotes={orderNotes}
            />

            {/* Shipping Method Selection inside OrderSummary container for flow */}
            {availableMethods.length > 0 && selectedMethodId !== 'free' && (
                <div className="mt-6 border-t border-gray-100 pt-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-3">Shipping Method</h3>
                    <div className="space-y-2">
                        {availableMethods.map(method => (
                            <label key={method.id} className={`flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-all ${selectedMethodId === method.id ? 'border-brand-green bg-brand-light/10 ring-1 ring-brand-green' : 'border-gray-200 hover:border-gray-300'}`}>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="radio" 
                                        name="shippingMethod" 
                                        checked={selectedMethodId === method.id} 
                                        onChange={() => handleMethodChange(method.id)}
                                        className="text-brand-green focus:ring-brand-green"
                                    />
                                    <div>
                                        <span className="block text-sm font-bold text-slate-800">{method.name}</span>
                                        {method.description && <span className="block text-xs text-slate-500">{method.description}</span>}
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-slate-900">£{method.rate.toFixed(2)}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            <PaymentOptions 
              discountCode={discountCode} setDiscountCode={setDiscountCode} applyDiscount={applyDiscount}
              paypalConfig={paypalConfig} currency={settings.currency || 'GBP'} isProcessing={isProcessing}
              onPayPalCreateOrder={(data, actions) => handlePayPalCreateOrder(data, actions, prepareOrderPayload, finalTotal)}
              onPayPalApprove={handlePayPalApprove} onManualOrder={() => handleManualOrder(prepareOrderPayload)} onValidate={validateOrder}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
