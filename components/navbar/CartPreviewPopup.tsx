
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartItem } from '../../types';
import { Button } from '../ui/Button';
import { useCart } from '../../context/CartContext';

interface CartPreviewPopupProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  cartTotal: number;
}

export const CartPreviewPopup: React.FC<CartPreviewPopupProps> = ({ isOpen, onClose, cart, cartTotal }) => {
  const navigate = useNavigate();
  const { updateQuantity, removeFromCart } = useCart();

  if (!isOpen) return null;

  const handleLinkClick = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[95%] max-w-sm z-[60] animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden ring-1 ring-black/5">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 backdrop-blur-xl">
          <h3 className="font-bold text-sm text-slate-900 font-serif">Your Basket ({cart.reduce((a,c) => a + c.quantity, 0)})</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 p-1 rounded-full text-lg transition-colors">&times;</button>
        </div>

        {cart.length > 0 ? (
          <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
            <ul className="divide-y divide-slate-50">
              {cart.map(item => (
                <li key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="p-4 bg-white hover:bg-slate-50/50 transition-colors">
                  <div className="flex gap-4">
                    {/* Clickable Image */}
                    <div 
                      onClick={() => handleLinkClick(`/product/${item.slug || item.id}`)}
                      className="h-20 w-20 flex-shrink-0 rounded-xl overflow-hidden border border-slate-100 shadow-sm cursor-pointer group"
                    >
                      <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                           <h4 
                             onClick={() => handleLinkClick(`/product/${item.slug || item.id}`)}
                             className="text-sm font-bold text-slate-900 leading-snug cursor-pointer line-clamp-2 hover:text-brand-green transition-colors font-serif"
                           >
                             {item.title}
                           </h4>
                           <button 
                             onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                             className="text-slate-300 hover:text-red-500 transition-colors p-1 -mr-2 -mt-2 flex-shrink-0"
                             aria-label="Remove item"
                           >
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                           </button>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1.5 flex flex-wrap gap-2">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 border border-slate-200">{item.selectedSize}</span>
                          {item.selectedColor && (
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 border border-slate-200">{item.selectedColor}</span>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                         {/* Qty Stepper */}
                         <div className="flex items-center bg-gray-50 rounded-lg h-8 border border-gray-200">
                            <button 
                              onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                              className="w-8 h-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-gray-100 rounded-l-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                              disabled={item.quantity <= 1}
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                            </button>
                            <span className="text-xs font-bold text-slate-900 w-6 text-center select-none bg-white h-full flex items-center justify-center border-x border-gray-200">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                              className="w-8 h-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-gray-100 rounded-r-lg transition-colors"
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            </button>
                         </div>

                         <p className="text-sm font-bold text-brand-dark font-serif">
                           £{(item.price * item.quantity).toFixed(2)}
                         </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-center py-12 px-6">
             <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-100">
                <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
             </div>
             <p className="text-sm text-slate-500 font-medium">Your basket is empty.</p>
             <button onClick={() => handleLinkClick('/shop')} className="text-xs font-bold text-brand-green mt-2 hover:underline uppercase tracking-wider">Start Shopping</button>
          </div>
        )}

        {cart.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total</span>
              <span className="text-xl font-bold text-brand-dark font-serif">£{cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex gap-3">
               <button onClick={() => handleLinkClick('/cart')} className="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                  View Basket
               </button>
               <button onClick={() => handleLinkClick('/checkout')} className="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-white bg-brand-green rounded-xl shadow-lg shadow-brand-green/20 hover:bg-brand-dark transition-colors">
                  Checkout
               </button>
            </div>
          </div>
        )}
      </div>
      {/* Beak */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r border-b border-slate-100 transform rotate-45"></div>
    </div>
  );
};
