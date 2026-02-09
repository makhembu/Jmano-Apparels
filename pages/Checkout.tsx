
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { api } from '../lib/db';
import { EmptyState } from '../components/ui/EmptyState';
import { ShippingAddress, ShippingZone, DiscountCode, UserAddress } from '../types';
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
        showToast('Blessing applied!', 'success');
     } else {
        showToast('Invalid code.', 'error');
        setActiveDiscount(null);
     }
  };

  const discountAmount = activeDiscount 
    ? (activeDiscount.discountType === 'percentage' ? cartTotal * (activeDiscount.discountValue / 100) : activeDiscount.discountValue)
    : 0;
  
  const taxRate = settings.taxRate || 0.20;
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
        const firstError = result.error.errors[0];
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