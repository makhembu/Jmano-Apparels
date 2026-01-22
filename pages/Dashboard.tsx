import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Button } from '../components/ui/Button';
import { api } from '../lib/db';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { useToast } from '../context/ToastContext';

type Tab = 'overview' | 'orders' | 'wishlist' | 'settings';

export const Dashboard: React.FC = () => {
  const { user, orders, loading: appLoading } = useApp();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  
  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name, email: user.email });
      
      // Fetch wishlist in background for counts
      setWishlistLoading(true);
      api.getWishlistProducts(user.id)
        .then(setWishlistItems)
        .catch(err => console.error("Wishlist fetch error", err))
        .finally(() => setWishlistLoading(false));
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    try {
      await api.updateUserProfile(user.id, profileForm);
      showToast('Profile updated successfully', 'success');
      setIsEditingProfile(false);
      // Ideally refresh auth context here, but simplest is to prompt re-login or partial update
    } catch (e) {
      showToast('Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  if (appLoading) return <LoadingSpinner fullScreen />;
  if (!user) return <div className="p-10 text-center">Please sign in to view your dashboard.</div>;

  const myOrders = orders.filter(o => o.userId === user.id);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'orders', label: 'My Orders' },
    { id: 'wishlist', label: 'Wishlist' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold font-serif mb-2 text-brand-dark">My Dashboard</h1>
      <p className="text-gray-600 mb-8">Welcome back, {user.name}!</p>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-brand-green text-white shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <div className="flex-1 min-h-[400px]">
          
          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-brand-green">
                  <h3 className="text-gray-500 text-xs uppercase font-bold">Total Orders</h3>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{myOrders.length}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-brand-hope">
                  <h3 className="text-gray-500 text-xs uppercase font-bold">Wishlist Items</h3>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{wishlistItems.length}</p>
                  <button onClick={() => setActiveTab('wishlist')} className="text-brand-green text-sm mt-2 hover:underline">View Wishlist &rarr;</button>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-brand-testament">
                  <h3 className="text-gray-500 text-xs uppercase font-bold">Member Since</h3>
                  <p className="text-sm font-medium text-gray-900 mt-1">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>

              <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
                <div className="px-4 py-5 sm:px-6 bg-gray-50 flex justify-between items-center">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Order</h3>
                  <button onClick={() => setActiveTab('orders')} className="text-sm text-brand-green hover:underline">View All</button>
                </div>
                <div className="px-4 py-5">
                   {myOrders.length > 0 ? (
                     <div>
                       <div className="flex justify-between items-center mb-2">
                          <p className="font-bold">Order #{myOrders[0].orderNumber || myOrders[0].id.slice(0,8)}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${myOrders[0].status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {myOrders[0].status}
                          </span>
                       </div>
                       <p className="text-sm text-gray-500">{new Date(myOrders[0].createdAt).toLocaleDateString()}</p>
                       <p className="mt-2 text-brand-dark font-medium">£{myOrders[0].total.toFixed(2)}</p>
                     </div>
                   ) : (
                     <p className="text-gray-500 text-sm">No recent orders.</p>
                   )}
                </div>
              </div>
            </div>
          )}

          {/* ORDERS */}
          {activeTab === 'orders' && (
             <div className="space-y-6 animate-fade-in">
               <h2 className="text-xl font-bold border-b pb-2">Order History</h2>
               {myOrders.length === 0 ? (
                 <EmptyState title="No orders yet" description="Start your collection today." actionLabel="Shop Now" actionLink="/shop" />
               ) : (
                 <div className="space-y-4">
                  {myOrders.map(order => (
                    <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                          <div>
                            <span className="font-bold text-gray-700 text-lg">Order #{order.orderNumber || order.id.slice(0, 8)}</span>
                            <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-GB')}</p>
                            {order.shippingAddress && (
                              <p className="text-xs text-gray-400 mt-1">Delivering to: {order.shippingAddress.city}, {order.shippingAddress.postcode}</p>
                            )}
                          </div>
                          <div className="text-right">
                             <span className={`px-3 py-1 rounded-full text-xs font-semibold ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {order.status}
                             </span>
                             {order.trackingNumber && <p className="text-xs text-gray-500 mt-1">Tracking: {order.trackingNumber}</p>}
                          </div>
                        </div>
                        <ul className="text-sm mb-4 space-y-1 text-gray-600 bg-gray-50 p-3 rounded">
                          {order.products.map((p, idx) => (
                              <li key={idx} className="flex justify-between">
                                <span>{p.quantity}x {p.title} ({p.size})</span>
                                <span>£{(p.price * p.quantity).toFixed(2)}</span>
                              </li>
                          ))}
                        </ul>
                        <div className="flex justify-end">
                          <p className="font-bold text-xl text-brand-dark">Total: £{order.total.toFixed(2)}</p>
                        </div>
                    </div>
                  ))}
                 </div>
               )}
             </div>
          )}

          {/* WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="animate-fade-in">
               <h2 className="text-xl font-bold border-b pb-4 mb-6">My Wishlist</h2>
               {wishlistLoading ? (
                 <LoadingSpinner />
               ) : wishlistItems.length === 0 ? (
                 <EmptyState title="Wishlist is empty" description="Save items you love for later." actionLabel="Explore Products" actionLink="/shop" />
               ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlistItems.map(p => (
                       <ProductCard key={p.id} product={p} />
                    ))}
                 </div>
               )}
            </div>
          )}

          {/* SETTINGS / PROFILE */}
          {activeTab === 'settings' && (
             <div className="bg-white shadow rounded-lg p-6 border border-gray-200 animate-fade-in">
                <h2 className="text-xl font-bold mb-6">Account Settings</h2>
                
                {!isEditingProfile ? (
                   <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b pb-4">
                         <div className="text-sm font-medium text-gray-500">Full Name</div>
                         <div className="col-span-2 text-sm text-gray-900">{user.name}</div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b pb-4">
                         <div className="text-sm font-medium text-gray-500">Email Address</div>
                         <div className="col-span-2 text-sm text-gray-900">{user.email}</div>
                      </div>
                      <div className="pt-4">
                         <Button onClick={() => setIsEditingProfile(true)} variant="outline">Edit Profile</Button>
                      </div>
                   </div>
                ) : (
                   <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-md">
                      <div>
                         <label className="block text-sm font-medium text-gray-700">Full Name</label>
                         <input 
                           type="text" 
                           value={profileForm.name} 
                           onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                           className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900"
                           required
                         />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-gray-700">Email (Read Only)</label>
                         <input 
                           type="email" 
                           value={profileForm.email} 
                           disabled
                           className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100 text-gray-500 cursor-not-allowed"
                         />
                         <p className="text-xs text-gray-500 mt-1">Contact support to change email.</p>
                      </div>
                      <div className="flex gap-3">
                         <Button type="submit" isLoading={savingProfile}>Save Changes</Button>
                         <Button type="button" variant="outline" onClick={() => setIsEditingProfile(false)}>Cancel</Button>
                      </div>
                   </form>
                )}
             </div>
          )}

        </div>
      </div>
    </div>
  );
};