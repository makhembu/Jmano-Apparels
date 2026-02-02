
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { api } from '../lib/db';
import { EmptyState } from '../components/ui/EmptyState';
import { ShippingAddress, ShippingZone, DiscountCode, UserAddress } from '../types';
import { useToast } from '../context/ToastContext';
import { usePayment } from '../hooks/usePayment';
import { CheckoutForm } from '../components/checkout/CheckoutForm';
import { OrderSummary } from '../components/checkout/OrderSummary';
import { PaymentOptions } from '../components/checkout/PaymentOptions';

export const Checkout: React.FC = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { settings } = useApp();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  // -- Data State --
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [shippingCost, setShippingCost] = useState(0);
  const [discountCode, setDiscountCode] = useState('');
  const [activeDiscount, setActiveDiscount] = useState<DiscountCode | null>(null);
  const [orderNotes, setOrderNotes] = useState('');

  // -- Address State --
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');
  const [saveThisAddress, setSaveThisAddress] = useState(true);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [address, setAddress] = useState<ShippingAddress>({
    address1: '', city: '', postcode: '', country: 'United Kingdom', phone: ''
  });

  // -- Payment Hook Integration --
  const { 
    isProcessing, 
    paypalConfig, 
    handlePayPalCreateOrder, 
    handlePayPalApprove, 
    handleManualOrder 
  } = usePayment({ user, clearCart, settings });

  // -- Initialization --
  useEffect(() => {
    if (settings.requireLoginForCheckout && !user) {
        navigate('/login', { state: { from: '/checkout' } });
        return;
    }
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

  // -- Calculations --
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

  // -- Validation & Payload Construction --
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
    if (!validateOrder()) return null;

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

  if (cart.length === 0) return <EmptyState title="Your cart is waiting" description="Start your journey by adding scripture-inspired apparel." actionLink="/shop" actionLabel="Go to Shop" />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col lg:flex-row gap-12 items-start">
        
        {/* Left Side: Form */}
        <div className="w-full lg:w-3/5 space-y-10 animate-fade-in">
          <div>
            <h1 className="text-3xl font-serif font-bold text-brand-dark mb-2">Finalize Your Order</h1>
            <p className="text-gray-500 font-light">Ethically threaded and ready to be delivered to your door.</p>
          </div>

          <CheckoutForm 
            user={user}
            guestName={guestName} setGuestName={setGuestName}
            guestEmail={guestEmail} setGuestEmail={setGuestEmail}
            savedAddresses={savedAddresses}
            selectedAddressId={selectedAddressId} onAddressSelect={handleAddressSelect}
            address={address} setAddress={setAddress}
            saveThisAddress={saveThisAddress} setSaveThisAddress={setSaveThisAddress}
            orderNotes={orderNotes} setOrderNotes={setOrderNotes}
          />
        </div>

        {/* Right Side: Summary & Payment */}
        <div className="w-full lg:w-2/5 lg:sticky lg:top-24 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 ring-1 ring-gray-100 relative">
            
            {isProcessing && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-2xl">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
                    <p className="mt-4 text-brand-dark font-bold animate-pulse">Processing...</p>
                </div>
            )}

            <OrderSummary 
              cart={cart}
              cartTotal={cartTotal}
              shippingCost={shippingCost}
              discountAmount={discountAmount}
              taxAmount={taxAmount}
              taxRate={taxRate}
              finalTotal={finalTotal}
              activeDiscount={activeDiscount}
              address={address}
              orderNotes={orderNotes}
            />

            <PaymentOptions 
              discountCode={discountCode}
              setDiscountCode={setDiscountCode}
              applyDiscount={applyDiscount}
              paypalConfig={paypalConfig}
              currency={settings.currency || 'GBP'}
              isProcessing={isProcessing}
              onPayPalCreateOrder={(data, actions) => handlePayPalCreateOrder(data, actions, prepareOrderPayload, finalTotal)}
              onPayPalApprove={handlePayPalApprove}
              onManualOrder={() => handleManualOrder(prepareOrderPayload)}
              onValidate={validateOrder}
            />
          </div>

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
