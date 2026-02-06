import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/db';
import { User, Product, ShippingAddress } from '../../types';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
// FIX: Replaced deprecated useApp with useOrders
import { useOrders } from '../../context/OrderContext';
import { useShop } from '../../context/ShopContext';

interface OrderItemDraft {
  productId: string;
  title: string;
  price: number;
  size: string;
  selectedColor: string;
  quantity: number;
  // Added image property to draft
  image: string;
}

export const AdminOrderNew: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { refreshOrders } = useOrders();
  const { refreshData } = useShop();
  
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Form State
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [items, setItems] = useState<OrderItemDraft[]>([]);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    address1: '', city: '', postcode: '', country: 'United Kingdom', phone: ''
  });
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  // Quick Customer State
  const [isNewUser, setIsNewUser] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '' });
  const [creatingUser, setCreatingUser] = useState(false);

  // Item Addition State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    Promise.all([
      api.getAllUsers(),
      api.getProducts()
    ]).then(([fetchedUsers, fetchedProducts]) => {
      setUsers(fetchedUsers);
      setProducts(fetchedProducts);
    }).finally(() => setLoading(false));
  }, []);

  const handleQuickCreateUser = async () => {
    if (!newUserForm.name || !newUserForm.email) {
      showToast('Name and Email required', 'error');
      return;
    }
    setCreatingUser(true);
    try {
      const newUser = await api.createUserProfile({
        name: newUserForm.name,
        email: newUserForm.email,
        role: 'user'
      });
      setUsers(prev => [newUser, ...prev]);
      setSelectedUserId(newUser.id);
      setIsNewUser(false);
      showToast('Customer created', 'success');
    } catch (e: any) {
      showToast('Failed to create customer', 'error');
    } finally {
      setCreatingUser(false);
    }
  };

  const addItem = () => {
    if (!selectedProduct) return;
    if (!selectedSize) { showToast('Select a size', 'error'); return; }
    
    // Updated: included product image in draft item
    setItems(prev => [...prev, {
      productId: selectedProduct.id,
      title: selectedProduct.title,
      price: selectedProduct.price,
      size: selectedSize,
      selectedColor: selectedColor,
      quantity,
      image: selectedProduct.images[0]
    }]);
    
    // Reset selection
    setSelectedSize('');
    setSelectedColor('');
    setQuantity(1);
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedUserId) { showToast('Select a customer', 'error'); return; }
    if (items.length === 0) { showToast('Add items to order', 'error'); return; }
    if (!shippingAddress.address1 || !shippingAddress.postcode) { showToast('Shipping address incomplete', 'error'); return; }

    setProcessing(true);
    try {
      // Calculate basic total for client-side valid (real calculation happens on server RPC)
      // We pass the items array compatible with RPC expectation
      await api.createOrder({
        userId: selectedUserId,
        products: items,
        total: 0, // Ignored by RPC usually, or recalculated
        shippingAddress: shippingAddress,
        notes: notes
      });
      
      // SYNC: Force global states to update
      await refreshOrders();
      await refreshData();
      
      showToast('Order created successfully', 'success');
      navigate('/admin/orders');
    } catch (e: any) {
      showToast('Failed to create order. Check stock or logs.', 'error');
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-serif">Create New Order</h1>
        <Button variant="outline" onClick={() => navigate('/admin/orders')}>Cancel</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 1. Customer Selection */}
          <div id="section-customer-info" className="bg-white shadow rounded-lg p-6 border border-gray-200">
            <h2 className="text-lg font-bold mb-4 flex justify-between items-center">
              Customer
              {!isNewUser && (
                <button 
                  onClick={() => setIsNewUser(true)} 
                  className="text-sm text-brand-green hover:underline font-medium"
                >
                  + New Customer
                </button>
              )}
            </h2>

            {isNewUser ? (
              <div className="bg-green-50 p-4 rounded border border-green-100 animate-fade-in">
                <h3 className="text-sm font-bold text-brand-dark mb-3">Quick Create Customer</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input 
                    type="text" placeholder="Full Name" 
                    value={newUserForm.name} 
                    onChange={e => setNewUserForm({...newUserForm, name: e.target.value})}
                    className="border rounded p-2 text-sm"
                  />
                  <input 
                    type="email" placeholder="Email Address" 
                    value={newUserForm.email} 
                    onChange={e => setNewUserForm({...newUserForm, email: e.target.value})}
                    className="border rounded p-2 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleQuickCreateUser} isLoading={creatingUser} className="h-8 py-0">Create & Select</Button>
                  <Button onClick={() => setIsNewUser(false)} variant="outline" className="h-8 py-0">Cancel</Button>
                </div>
              </div>
            ) : (
              <div>
                <select 
                  value={selectedUserId} 
                  onChange={e => setSelectedUserId(e.target.value)} 
                  className="w-full border border-gray-300 rounded p-2 bg-white text-gray-900"
                >
                  <option value="">Select Existing Customer...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* 2. Order Items */}
          <div id="section-order-items" className="bg-white shadow rounded-lg p-6 border border-gray-200">
            <h2 className="text-lg font-bold mb-4">Items</h2>
            
            {/* Add Item Form */}
            <div className="bg-gray-50 p-4 rounded border mb-6">
               <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Product</label>
                    <select 
                      onChange={e => {
                        const p = products.find(prod => prod.id === e.target.value);
                        setSelectedProduct(p || null);
                        setSelectedSize('');
                        setSelectedColor('');
                      }} 
                      value={selectedProduct?.id || ''}
                      className="w-full border rounded p-1.5 text-sm"
                    >
                      <option value="">Select Product...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.title} (£{p.price})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Size</label>
                    <select 
                      value={selectedSize} 
                      onChange={e => setSelectedSize(e.target.value)} 
                      disabled={!selectedProduct}
                      className="w-full border rounded p-1.5 text-sm disabled:bg-gray-100"
                    >
                      <option value="">Size...</option>
                      {selectedProduct?.sizes?.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Color (Opt)</label>
                    <select 
                      value={selectedColor} 
                      onChange={e => setSelectedColor(e.target.value)} 
                      disabled={!selectedProduct || !selectedProduct.colors?.length}
                      className="w-full border rounded p-1.5 text-sm disabled:bg-gray-100"
                    >
                      <option value="">Color...</option>
                      {selectedProduct?.colors?.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
               </div>
               <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                     <label className="text-xs font-medium text-gray-500">Qty:</label>
                     <input 
                       type="number" min="1" value={quantity} onChange={e => setQuantity(+e.target.value)} 
                       className="w-16 border rounded p-1 text-sm text-center"
                     />
                  </div>
                  <Button onClick={addItem} disabled={!selectedProduct} variant="secondary" className="h-8 text-xs">Add Item</Button>
               </div>
            </div>

            {/* Items List */}
            {items.length > 0 ? (
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Product</th>
                    <th className="px-4 py-2 text-center">Size/Color</th>
                    <th className="px-4 py-2 text-center">Qty</th>
                    <th className="px-4 py-2 text-right">Price</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 font-medium">{item.title}</td>
                      <td className="px-4 py-2 text-center text-gray-500">
                        {item.size}{item.selectedColor && ` / ${item.selectedColor}`}
                      </td>
                      <td className="px-4 py-2 text-center">{item.quantity}</td>
                      <td className="px-4 py-2 text-right">£{(item.price * item.quantity).toFixed(2)}</td>
                      <td className="px-4 py-2 text-right">
                        <button onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-700">×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center text-gray-500 py-4 text-sm">No items added yet.</p>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-8">
          
          {/* Shipping Address */}
          <div className="bg-white shadow rounded-lg p-6 border border-gray-200 space-y-3">
             <h2 className="text-lg font-bold mb-2">Shipping Details</h2>
             <input type="text" placeholder="Address Line 1" value={shippingAddress.address1} onChange={e => setShippingAddress({...shippingAddress, address1: e.target.value})} className="w-full border rounded p-2 text-sm" />
             <input type="text" placeholder="Address Line 2" value={shippingAddress.address2 || ''} onChange={e => setShippingAddress({...shippingAddress, address2: e.target.value})} className="w-full border rounded p-2 text-sm" />
             <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="City" value={shippingAddress.city} onChange={e => setShippingAddress({...shippingAddress, city: e.target.value})} className="w-full border rounded p-2 text-sm" />
                <input type="text" placeholder="Postcode" value={shippingAddress.postcode} onChange={e => setShippingAddress({...shippingAddress, postcode: e.target.value})} className="w-full border rounded p-2 text-sm" />
             </div>
             <select value={shippingAddress.country} onChange={e => setShippingAddress({...shippingAddress, country: e.target.value})} className="w-full border rounded p-2 text-sm">
                <option value="United Kingdom">United Kingdom</option>
                <option value="United States">United States</option>
                <option value="Other">Other</option>
             </select>
             <input type="text" placeholder="Phone (Optional)" value={shippingAddress.phone || ''} onChange={e => setShippingAddress({...shippingAddress, phone: e.target.value})} className="w-full border rounded p-2 text-sm" />
          </div>

          {/* Notes */}
          <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
             <h2 className="text-lg font-bold mb-2">Order Notes</h2>
             <textarea 
               value={notes} onChange={e => setNotes(e.target.value)} 
               rows={3} 
               className="w-full border rounded p-2 text-sm"
               placeholder="Internal notes or special instructions..."
             />
          </div>

          {/* Summary & Action */}
          <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
             <h2 className="text-lg font-bold mb-4">Summary</h2>
             <div className="flex justify-between mb-2 text-sm">
                <span>Items Subtotal</span>
                <span>£{items.reduce((acc, i) => acc + (i.price * i.quantity), 0).toFixed(2)}</span>
             </div>
             <p className="text-xs text-gray-500 mb-4">Shipping & Tax calculated upon creation.</p>
             <div id="btn-create-order">
                <Button fullWidth onClick={handleSubmit} isLoading={processing}>Create Order</Button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};