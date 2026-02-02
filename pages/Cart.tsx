
import React from 'react';
// @ts-ignore
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';

export const Cart: React.FC = () => {
  const { cart, removeFromCart, clearCart, user, settings } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    // Logic: If login is required AND user is not logged in, force login.
    // Otherwise (login not required OR user is logged in), proceed to checkout.
    if (settings.requireLoginForCheckout && !user) {
      showToast("Please sign in to proceed to checkout", 'info');
      navigate('/login', { state: { from: '/checkout' } });
    } else {
      navigate('/checkout');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="bg-slate-50 min-h-screen">
        <header className="relative bg-brand-dark pt-12 pb-20 md:pt-20 md:pb-28 text-center border-b border-brand-green/20">
          <div className="max-w-5xl mx-auto px-4 relative z-10">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">Your Basket</h1>
            <p className="text-brand-light font-light max-w-2xl mx-auto text-lg">Ready to carry your testimony?</p>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-20 pb-20">
          <EmptyState 
            title="Your basket is empty"
            description="Looks like you haven't added any items yet."
            actionLabel="Start Shopping"
            actionLink="/shop"
            icon={
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Branded Header */}
      <header className="relative bg-brand-dark pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden text-center border-b border-brand-green/20">
        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <span className="text-brand-dark text-[10px] font-black uppercase tracking-[0.5em] mb-4 inline-block bg-brand-hope px-6 py-2 rounded-full shadow-lg">
            Review Order
          </span>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">
            Your <span className="text-brand-humility">Basket</span>
          </h1>
          <p className="text-base md:text-xl text-brand-light font-light max-w-2xl mx-auto leading-relaxed">
            "{settings.secondarySlogan}"
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20 pb-24">
        <div className="bg-white shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden border border-slate-100">
          <ul className="divide-y divide-slate-100">
            {cart.map((item) => (
              <li key={`${item.id}-${item.selectedSize}-${item.selectedColor || 'none'}`} className="px-6 py-6 flex items-center hover:bg-slate-50/50 transition-colors">
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
                  <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover object-center" />
                </div>
                <div className="ml-6 flex-1 flex flex-col sm:flex-row sm:justify-between">
                  <div>
                     <h3 className="text-lg font-bold text-slate-900 hover:text-brand-green transition font-serif">
                       <Link to={`/product/${item.id}`}>{item.title}</Link>
                     </h3>
                     <div className="text-xs font-bold text-slate-400 mt-2 space-x-3 uppercase tracking-widest">
                       <span>Size: {item.selectedSize}</span>
                       {item.selectedColor && (
                          <>
                            <span className="text-slate-300">|</span>
                            <span>{item.selectedColor}</span>
                          </>
                       )}
                       <span className="text-slate-300">|</span>
                       <span>Qty: {item.quantity}</span>
                     </div>
                  </div>
                  <div className="mt-4 sm:mt-0 flex flex-col items-end">
                     <p className="text-xl font-bold text-brand-dark">£{(item.price * item.quantity).toFixed(2)}</p>
                     <button 
                      onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                      className="text-xs font-bold text-red-500 hover:text-red-700 mt-2 uppercase tracking-widest border-b border-red-200 pb-0.5 hover:border-red-500 transition-all"
                     >
                       Remove
                     </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          
          <div className="px-8 py-8 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center border-t border-slate-200 gap-6">
             <button onClick={clearCart} className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest hover:underline">
                Clear Basket
             </button>
             
             <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
                <div className="text-right">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Subtotal</p>
                   <p className="text-3xl font-serif font-bold text-slate-900">£{subtotal.toFixed(2)}</p>
                </div>
                <Button onClick={handleCheckout} className="h-14 px-10 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-brand-green/20 hover:scale-[1.02] active:scale-95 transition-all">
                  Proceed to Checkout
                </Button>
             </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
           <Link to="/shop" className="text-brand-green font-bold text-sm hover:underline">
              &larr; Continue Shopping
           </Link>
        </div>
      </div>
    </div>
  );
};