import React from 'react';
import { User, Order } from '../../types';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

interface OverviewProps {
  user: User;
  orders: Order[];
  wishlistCount: number;
  onNavigate: (tab: string) => void;
}

export const Overview: React.FC<OverviewProps> = ({ user, orders, wishlistCount, onNavigate }) => {
  const { cart, cartTotal } = useCart();
  const latestOrder = orders[0];
  const totalInvestment = orders.reduce((acc, curr) => acc + (curr.total || 0), 0);

  return (
    <div className="space-y-12 animate-fade-in max-w-5xl">
      {/* SECTION 1: ACCOUNT SUMMARY */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Account Summary</h3>
           <span className="text-[10px] text-slate-300 font-medium">LATEST UPDATE TODAY</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          <div className="p-8">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Member Since</p>
            <p className="text-2xl font-serif font-bold text-slate-900">
              {user.createdAt ? new Date(user.createdAt).getFullYear() : '2026'}
            </p>
          </div>
          <div className="p-8">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Total Orders</p>
            <p className="text-2xl font-serif font-bold text-slate-900">{orders.length}</p>
          </div>
          <div className="p-8">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Saved Pieces</p>
            <p className="text-2xl font-serif font-bold text-slate-900">{wishlistCount}</p>
          </div>
          <div className="p-8">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Total Value</p>
            <p className="text-2xl font-serif font-bold text-brand-green">£{(totalInvestment || 0).toFixed(2)}</p>
          </div>
        </div>
      </section>

      {/* SECTION 2: CURRENT BASKET (NEW) */}
      {cart.length > 0 && (
        <section className="space-y-6">
          <div className="flex justify-between items-end px-2">
            <div className="space-y-1">
               <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.25em]">Checkout Required</h3>
               <h2 className="text-xl font-serif font-bold text-slate-800">Your Shopping Basket</h2>
            </div>
            <Link to="/cart" className="text-xs font-bold text-brand-green hover:underline uppercase tracking-widest flex items-center gap-1">
              Edit Basket <span className="text-lg">→</span>
            </Link>
          </div>

          <div className="bg-amber-50/30 border border-amber-100 rounded-3xl p-6 md:p-8 relative overflow-hidden">
             <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                <div className="flex -space-x-4">
                   {cart.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="h-16 w-16 md:h-20 md:w-20 rounded-2xl border-4 border-white shadow-md overflow-hidden bg-white">
                         <img src={item.image} alt="" className="h-full w-full object-cover" />
                      </div>
                   ))}
                   {cart.length > 3 && (
                      <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl border-4 border-white shadow-md bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm">
                         +{cart.length - 3}
                      </div>
                   )}
                </div>
                
                <div className="flex-1 text-center md:text-left">
                   <p className="text-sm font-bold text-slate-900">Ready to thread your next pieces?</p>
                   <p className="text-xs text-slate-500 mt-1">{cart.length} items waiting in your persistent basket.</p>
                </div>

                <div className="flex items-center gap-6">
                   <div className="text-right hidden sm:block">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subtotal</p>
                      <p className="text-xl font-bold text-slate-900">£{(cartTotal || 0).toFixed(2)}</p>
                   </div>
                   <Link to="/checkout" className="bg-brand-green text-white px-8 py-3 rounded-xl text-xs font-bold shadow-lg shadow-brand-green/20 hover:scale-105 active:scale-95 transition-all">
                      Secure Checkout
                   </Link>
                </div>
             </div>
          </div>
        </section>
      )}

      {/* SECTION 3: LATEST PURCHASE FEATURE */}
      <section className="space-y-6">
        <div className="flex justify-between items-end px-2">
          <div className="space-y-1">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Active Status</h3>
             <h2 className="text-xl font-serif font-bold text-slate-800">Latest Purchase</h2>
          </div>
          <button onClick={() => onNavigate('orders')} className="text-xs font-bold text-brand-green hover:underline uppercase tracking-widest flex items-center gap-1">
            Browse History <span className="text-lg">→</span>
          </button>
        </div>

        {latestOrder ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-10 shadow-lg shadow-slate-200/40 relative overflow-hidden group">
            {/* Background Decorative Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-light/20 rounded-bl-[100%] pointer-events-none -mr-10 -mt-10 transition-transform group-hover:scale-125 duration-700"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></span>
                    Order #{latestOrder.orderNumber}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">Placed on {new Date(latestOrder.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <span className="text-[10px] font-black text-brand-green uppercase tracking-[0.2em] px-4 py-1.5 bg-brand-light rounded-full border border-brand-green/10">
                  {latestOrder.status}
                </span>
              </div>

              <div className="flex items-center gap-6 md:gap-10 mb-10">
                <div className="h-24 w-24 md:h-32 md:w-32 flex-shrink-0 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shadow-inner">
                  <img src={latestOrder.products[0]?.image} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg md:text-xl font-serif font-bold text-slate-800 truncate">{latestOrder.products[0]?.title}</h4>
                  <p className="text-sm text-slate-400 mt-1 font-light">Size {latestOrder.products[0]?.size} • {latestOrder.products.length} Total Items</p>
                  <p className="text-2xl font-bold text-slate-900 mt-4">£{(latestOrder.total || 0).toFixed(2)}</p>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                  <span className={latestOrder.status !== 'Delivered' ? 'text-brand-green' : ''}>01. Processing</span>
                  <span className="h-px w-6 bg-slate-100"></span>
                  <span className={latestOrder.status === 'Shipped' ? 'text-brand-green' : ''}>02. Shipped</span>
                  <span className="h-px w-6 bg-slate-100"></span>
                  <span className={latestOrder.status === 'Delivered' ? 'text-brand-green' : ''}>03. Arrived</span>
                </div>
                <Link to="/shop" className="w-full md:w-auto bg-slate-900 text-white px-8 py-3 rounded-xl text-xs font-bold text-center hover:bg-brand-green transition-all shadow-md active:scale-95">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl py-20 text-center">
            <div className="mb-4 text-slate-200 flex justify-center">
               <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            </div>
            <p className="text-slate-400 font-serif italic">Your journey with us hasn't started yet.</p>
            <Link to="/shop" className="text-[10px] font-black text-brand-green hover:underline mt-6 inline-block uppercase tracking-[0.2em]">Explore New Collection</Link>
          </div>
        )}
      </section>

      {/* SECTION 4: UTILITY CALLOUT */}
      <section className="bg-slate-100/50 rounded-2xl p-6 border border-slate-200/60 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-left">
          <p className="text-xs font-bold text-slate-700">Account Assistance</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-medium">Service Hours: Mon - Fri, 9am - 6pm GMT</p>
        </div>
        <button 
           onClick={() => window.location.href = '/#/about'} 
           className="text-[10px] font-black text-slate-900 border-2 border-slate-900 px-6 py-2 rounded-lg hover:bg-slate-900 hover:text-white transition-all uppercase tracking-widest"
        >
          Contact Support
        </button>
      </section>
    </div>
  );
};
