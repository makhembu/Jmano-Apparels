import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext'; // To get settings
import { api } from '../lib/db';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { ShippingAddress, ShippingZone, DiscountCode } from '../types';
import { useToast } from '../context/ToastContext';

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

  const [address, setAddress] = useState<ShippingAddress>({
    address1: '', city: '', postcode: '', country: 'United Kingdom', phone: ''
  });

  useEffect(() => {
    api.getShippingZones().then(setZones);
  }, []);

  // Calculate Shipping based on DB logic (Zone Base + (Weight * PerKg))
  useEffect(() => {
    // 1. Calculate total weight of cart
    const totalWeight = cart.reduce((acc, item) => acc + ((item.weight || 0) * item.quantity), 0);

    // 2. Find Zone
    const zone = zones.find(z => z.countries.includes(address.country)) || zones.find(z => z.countries.includes('Other'));
    
    if (zone) {
       // 3. Check Free Shipping Threshold
       if (zone.freeShippingThreshold && cartTotal >= zone.freeShippingThreshold) {
          setShippingCost(0);
       } else {
          // 4. Calculate Cost: Base + (Weight * Rate)
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
        showToast('Code applied!', 'success');
     } else {
        showToast('Invalid or expired code', 'error');
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

  const handleOrder = async () => {
    if (!user) { navigate('/login'); return; }
    if (!address.address1 || !address.city || !address.postcode) {
        showToast('Please fill in all shipping details', 'error');
        return;
    }

    setIsProcessing(true);
    try {
       const orderItems = cart.map(c => ({
         productId: c.id, quantity: c.quantity, size: c.selectedSize, title: c.title, price: c.price
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
       navigate('/dashboard');
       showToast('Order confirmed!', 'success');
    } catch(e) {
       console.error(e);
       showToast('Checkout failed', 'error');
    } finally {
       setIsProcessing(false);
    }
  };

  if (cart.length === 0) return <EmptyState title="Cart Empty" description="Add items first" actionLink="/shop" actionLabel="Shop" />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
       <div>
          <h2 className="text-xl font-bold mb-4">Shipping Details</h2>
          <div className="space-y-4 bg-white p-6 rounded shadow border">
             <input type="text" placeholder="Address Line 1" value={address.address1} onChange={e => setAddress({...address, address1: e.target.value})} className="block w-full border rounded p-2 bg-white text-gray-900" />
             <input type="text" placeholder="Address Line 2 (Optional)" value={address.address2 || ''} onChange={e => setAddress({...address, address2: e.target.value})} className="block w-full border rounded p-2 bg-white text-gray-900" />
             
             <div className="grid grid-cols-2 gap-4">
                 <input type="text" placeholder="City" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} className="block w-full border rounded p-2 bg-white text-gray-900" />
                 <input type="text" placeholder="Postcode" value={address.postcode} onChange={e => setAddress({...address, postcode: e.target.value})} className="block w-full border rounded p-2 bg-white text-gray-900" />
             </div>
             
             <select value={address.country} onChange={e => setAddress({...address, country: e.target.value})} className="block w-full border rounded p-2 bg-white text-gray-900">
                <option value="United Kingdom">United Kingdom</option>
                <option value="United States">United States</option>
                <option value="France">France</option>
                <option value="Germany">Germany</option>
                <option value="Australia">Australia</option>
                <option value="Other">Other</option>
             </select>

             <input type="tel" placeholder="Phone Number" value={address.phone || ''} onChange={e => setAddress({...address, phone: e.target.value})} className="block w-full border rounded p-2 bg-white text-gray-900" />
          </div>

          <h2 className="text-xl font-bold mb-4 mt-8">Order Notes</h2>
          <div className="bg-white p-6 rounded shadow border">
             <textarea 
                placeholder="Any special instructions for delivery?" 
                value={orderNotes}
                onChange={e => setOrderNotes(e.target.value)}
                rows={3}
                className="block w-full border rounded p-2 bg-white text-gray-900"
             />
          </div>
       </div>

       <div>
          <div className="bg-white p-6 rounded shadow border">
             <h2 className="text-xl font-bold mb-4">Order Summary</h2>
             {cart.map(item => (
                <div key={`${item.id}-${item.selectedSize}`} className="flex justify-between py-2 text-sm border-b border-gray-100 last:border-0">
                   <div>
                       <span className="font-medium">{item.quantity}x {item.title}</span>
                       <div className="text-xs text-gray-500">Size: {item.selectedSize}</div>
                   </div>
                   <span>£{(item.price * item.quantity).toFixed(2)}</span>
                </div>
             ))}
             <div className="border-t my-4 pt-4 space-y-2">
                <div className="flex justify-between"><span>Subtotal</span><span>£{cartTotal.toFixed(2)}</span></div>
                <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shippingCost === 0 ? 'Free' : `£${shippingCost.toFixed(2)}`}</span>
                </div>
                {activeDiscount && <div className="flex justify-between text-green-600"><span>Discount ({activeDiscount.code})</span><span>-£{discountAmount.toFixed(2)}</span></div>}
                <div className="flex justify-between text-xs text-gray-500"><span>Includes Tax ({((settings.taxRate || 0.2)*100).toFixed(0)}%)</span><span>£{taxAmount.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t"><span>Total</span><span>£{finalTotal.toFixed(2)}</span></div>
             </div>

             <div className="flex gap-2 mb-6">
                <input type="text" placeholder="Discount Code" value={discountCode} onChange={e => setDiscountCode(e.target.value)} className="border rounded p-2 flex-1 bg-white text-gray-900" />
                <Button onClick={applyDiscount} variant="outline">Apply</Button>
             </div>

             <Button fullWidth onClick={handleOrder} isLoading={isProcessing}>Place Order</Button>
          </div>
       </div>
    </div>
  );
};