
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { api } from '../lib/db';
import { Product, Order } from '../types';
import { Overview } from '../components/dashboard/Overview';
import { Orders } from '../components/dashboard/Orders';
import { Wishlist } from '../components/dashboard/Wishlist';
import { Profile } from '../components/dashboard/Profile';
import { PrivacySettings } from '../components/dashboard/PrivacySettings';

type Tab = 'overview' | 'orders' | 'wishlist' | 'profile' | 'privacy';

export const Dashboard: React.FC = () => {
  const { user, isAuthReady } = useAuth();
  
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthReady && user) {
      setLoading(true);
      Promise.all([
        api.getOrders(user.id),
        api.getWishlistProducts(user.id)
      ])
      .then(([fetchedOrders, fetchedWishlist]) => {
        setOrders(fetchedOrders);
        setWishlistItems(fetchedWishlist);
      })
      .catch(err => console.error("Dashboard data fetch failed", err))
      .finally(() => setLoading(false));
    } else if (isAuthReady && !user) {
        setLoading(false);
    }
  }, [isAuthReady, user?.id]);

  if (!isAuthReady) return <LoadingSpinner fullScreen />;
  
  if (!user) return (
    <div className="p-20 text-center animate-fade-in">
        <p className="text-gray-500 mb-4">Please sign in to access your dashboard.</p>
        <Link to="/login" className="text-brand-green font-bold underline underline-offset-4">Sign In Now &rarr;</Link>
    </div>
  );

  if (loading) return <LoadingSpinner fullScreen />;

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
    { id: 'orders', label: 'Order History', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg> },
    { id: 'wishlist', label: 'Wishlist', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg> },
    { id: 'profile', label: 'Profile & Security', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
    { id: 'privacy', label: 'My Data Rights', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg> },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                 <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-brand-light text-brand-dark flex items-center justify-center font-serif font-bold text-lg">
                       {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                       <p className="font-bold text-gray-900 truncate">{user.name}</p>
                       <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                 </div>
              </div>
              <nav className="p-2 space-y-1">
                {menuItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as Tab)}
                    className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150 ${
                      activeTab === item.id 
                        ? 'bg-brand-light text-brand-dark border border-brand-green/10' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className={`mr-3 ${activeTab === item.id ? 'text-brand-green' : 'text-gray-400'}`}>
                      {item.icon}
                    </span>
                    {item.label}
                  </button>
                ))}
              </nav>
              <div className="p-4 border-t border-gray-200">
                 <Link to="/shop" className="block text-center text-xs font-medium text-gray-500 hover:text-brand-green py-2">
                    &larr; Back to Shop
                 </Link>
              </div>
            </div>
          </aside>

          <main className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-h-[500px]">
              <h1 className="text-2xl font-serif font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4 capitalize">
                {menuItems.find(m => m.id === activeTab)?.label}
              </h1>

              {activeTab === 'overview' && (
                <Overview user={user} orders={orders} wishlistCount={wishlistItems.length} onNavigate={(tab) => setActiveTab(tab as Tab)} />
              )}
              {activeTab === 'orders' && <Orders orders={orders} />}
              {activeTab === 'wishlist' && <Wishlist products={wishlistItems} loading={false} />}
              {activeTab === 'profile' && <Profile user={user} />}
              {activeTab === 'privacy' && <PrivacySettings />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
