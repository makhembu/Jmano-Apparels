import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { api } from '../lib/db';
import { Product, Order } from '../types';
import { Overview } from '../components/dashboard/Overview';
import { Orders } from '../components/dashboard/Orders';
import { Wishlist } from '../components/dashboard/Wishlist';
import { Profile } from '../components/dashboard/Profile';

type Tab = 'overview' | 'orders' | 'wishlist' | 'profile';

export const Dashboard: React.FC = () => {
  const { user, orders, loading: appLoading } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setWishlistLoading(true);
      api.getWishlistProducts(user.id)
        .then(setWishlistItems)
        .catch(err => console.error("Wishlist fetch error", err))
        .finally(() => setWishlistLoading(false));
    }
  }, [user]);

  if (appLoading) return <LoadingSpinner fullScreen />;
  if (!user) return <div className="p-20 text-center animate-fade-in"><p className="text-gray-500 mb-4">Please sign in to access your dashboard.</p><a href="/#/login" className="text-brand-green font-bold underline underline-offset-4">Sign In Now &rarr;</a></div>;

  const myOrders = orders.filter(o => o.userId === user.id);

  const getGreeting = () => {
    const hour = new Date().getHours();
    let timeGreeting = 'Good morning';
    if (hour >= 12 && hour < 17) timeGreeting = 'Good afternoon';
    else if (hour >= 17) timeGreeting = 'Good evening';
    
    return `${timeGreeting}, ${user.name.split(' ')[0]}.`;
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
    { id: 'orders', label: 'Order History', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg> },
    { id: 'wishlist', label: 'Wishlist', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg> },
    { id: 'profile', label: 'Profile Settings', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        <header className="mb-10 md:mb-12 border-b border-slate-200 pb-8">
          <p className="text-[10px] font-bold text-brand-green uppercase tracking-[0.4em] mb-4">Customer Portal</p>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 leading-tight">
            {getGreeting()}
          </h1>
        </header>

        <div className="flex flex-col lg:flex-row gap-10 md:gap-16 items-start">
          {/* Sidebar Nav - Professional Sidebar Style */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 no-scrollbar lg:sticky lg:top-24">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as Tab)}
                  className={`flex-shrink-0 lg:w-full flex items-center px-5 py-3.5 text-sm transition-all duration-200 group whitespace-nowrap rounded-xl ${
                    activeTab === item.id 
                      ? 'text-brand-green font-bold bg-white shadow-md shadow-slate-200/50 ring-1 ring-slate-100' 
                      : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className={`mr-3 transition-colors ${activeTab === item.id ? 'text-brand-green' : 'text-slate-300 group-hover:text-slate-500'}`}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              ))}
              
              <div className="hidden lg:block pt-6 mt-6 border-t border-slate-200">
                 <button 
                  onClick={() => window.location.href = '/#/shop'}
                  className="w-full text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-brand-green transition-colors flex items-center gap-2"
                 >
                   <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                   Return to Store
                 </button>
              </div>
            </nav>
          </aside>

          {/* Dynamic Content Area */}
          <main className="flex-1 w-full min-h-[400px]">
            {activeTab === 'overview' && (
              // Fix: Wrapped setActiveTab in a type-safe anonymous function to match OverviewProps expected onNavigate signature
              <Overview user={user} orders={myOrders} wishlistCount={wishlistItems.length} onNavigate={(tab) => setActiveTab(tab as Tab)} />
            )}
            
            {activeTab === 'orders' && (
              <Orders orders={myOrders} />
            )}

            {activeTab === 'wishlist' && (
              <Wishlist products={wishlistItems} loading={wishlistLoading} />
            )}

            {activeTab === 'profile' && (
              <Profile user={user} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};