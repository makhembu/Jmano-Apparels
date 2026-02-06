import React from 'react';
// @ts-ignore
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { useCart } from '../context/CartContext';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../lib/utils';
import { BackButton } from '../components/ui/BackButton';

export const Cart: React.FC = () => {
  const { cart, removeFromCart, clearCart, updateQuantity } = useCart();
  const { user } = useAuth();
  const { settings } = useShop();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleCheckout = () => {
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
    <div className="bg-slate-50 min-h-screen pb-40 md:pb-0"> {/* Added padding bottom for mobile sticky bars */}
      <header className="relative bg-brand-dark pt-24 pb-24 md:pt-20 md:pb-28 overflow-hidden text-center border-b border-brand-green/20">
        {/* Mobile Back Button in Header */}
        <div className="md:hidden absolute top-4 left-4 z-20">
           <BackButton className="text-white hover:text-brand-hope" />
        </div>
        
        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <span className="text-brand-dark text-[10px] font-black uppercase tracking-[0.5em] mb-4 inline-block bg-brand-hope px-6 py-2 rounded-full shadow-lg">
            Review Order
          </span>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">
            Your <span className="text-brand-humility">Basket</span>
          </h1>
          <p className="text-base md:text-xl text-brand-light font-light max-w-2xl mx-auto leading-relaxed hidden md:block">
            "{settings.secondarySlogan}"
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 md:-mt-16 relative z-20">
        <div className="bg-white shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden border border-slate-100">
          <ul className="divide-y divide-slate-100">
            {cart.map((item) => (
              <li key={`${item.id}-${item.selectedSize}-${item.selectedColor || 'none'}`} className="p-4 sm:px-6 sm:py-6 flex gap-4 sm:items-center hover:bg-slate-50/50 transition-colors">
                
                {/* Image */}
                <Link to={`/product/${item.slug || item.id}`} className="block h-24 w-24 sm:h-24 sm:w-24 flex-shrink-0 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
                  <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover object-center" />
                </Link>

                {/* Details Container */}
                <div className="flex-1 flex flex-col justify-between min-h-[6rem]">
                   <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-lg font-bold text-slate-900 hover:text-brand-green transition font-serif line-clamp-2">
                          <Link to={`/product/${item.slug || item.id}`}>{item.title}</Link>
                        </h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                           <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                             Size: {item.selectedSize}
                           </span>
                           {item.selectedColor && (
                             <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                               {item.selectedColor}
                             </span>
                           )}
                        </div>
                      </div>
                      
                      {/* Price (Mobile & Desktop) */}
                      <p className="text-sm sm:text-xl font-bold text-brand-dark whitespace-nowrap">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                   </div>
                   
                   <div className="flex justify-between items-end mt-2 sm:mt-0">
                      {/* Quantity Control */}
                      <div className="flex items-center gap-3">
                          <div className="flex items-center bg-white rounded-lg h-8 sm:h-9 border border-gray-300 shadow-sm">
                              <button 
                                onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                                className="w-8 sm:w-10 h-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-gray-100 rounded-l-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                                disabled={item.quantity <= 1}
                              >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                              </button>
                              <span className="text-xs sm:text-sm font-bold text-slate-900 w-6 sm:w-8 text-center select-none border-x border-gray-100 h-full flex items-center justify-center">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                                className="w-8 sm:w-10 h-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-gray-100 rounded-r-lg transition-colors"
                              >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                              </button>
                           </div>
                      </div>

                      {/* Remove Button */}
                      <button 
                        onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                        className="text-[10px] font-bold text-red-400 hover:text-red-600 uppercase tracking-widest hover:underline py-2"
                      >
                        Remove
                      </button>
                   </div>
                </div>
              </li>
            ))}
          </ul>
          
          {/* Desktop Summary Footer */}
          <div className="hidden md:flex px-8 py-8 bg-slate-50/50 flex-col sm:flex-row justify-between items-center border-t border-slate-200 gap-6">
             <button onClick={clearCart} className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest hover:underline">
                Clear Basket
             </button>
             
             <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
                <div className="text-right">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Subtotal</p>
                   <p className="text-3xl font-serif font-bold text-slate-900">{formatCurrency(subtotal)}</p>
                </div>
                <Button onClick={handleCheckout} size="lg" className="shadow-xl shadow-brand-green/20">
                  Proceed to Checkout
                </Button>
             </div>
          </div>
        </div>
        
        <div className="mt-8 text-center hidden md:block">
           <Link to="/shop" className="text-brand-green font-bold text-sm hover:underline">
              &larr; Continue Shopping
           </Link>
        </div>
      </div>

      {/* Mobile Sticky Summary Bar */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] p-4 safe-area-bottom">
         <div className="flex items-center justify-between gap-4 mb-3">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total (Excl. Shipping)</span>
            <span className="text-xl font-serif font-bold text-slate-900">{formatCurrency(subtotal)}</span>
         </div>
         <Button onClick={handleCheckout} fullWidth size="lg" className="shadow-lg shadow-brand-green/20 h-12 text-sm">
            Checkout Now
         </Button>
         <div className="text-center mt-3">
            <button onClick={clearCart} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
               Clear Basket
            </button>
         </div>
      </div>
    </div>
  );
};
