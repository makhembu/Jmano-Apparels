import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartItem } from '../../types';
import { Button } from '../ui/Button';

interface CartPreviewPopupProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  cartTotal: number;
}

export const CartPreviewPopup: React.FC<CartPreviewPopupProps> = ({ isOpen, onClose, cart, cartTotal }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLinkClick = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[92%] max-w-sm z-[60] animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-900">Your Basket</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 p-1 rounded-full text-lg">&times;</button>
        </div>

        {cart.length > 0 ? (
          <div className="max-h-64 overflow-y-auto custom-scrollbar">
            <ul className="divide-y divide-slate-50 p-2">
              {cart.map(item => (
                <li key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}>
                  <button onClick={() => handleLinkClick(`/product/${item.id}`)} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors text-left">
                    <img src={item.images[0]} alt={item.title} className="w-12 h-12 rounded-lg object-cover border border-slate-100" />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs font-bold text-slate-800 truncate">{item.title}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Size: {item.selectedSize} &times; {item.quantity}</p>
                    </div>
                    <p className="text-xs font-bold text-brand-dark">£{(item.price * item.quantity).toFixed(2)}</p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-center text-xs text-slate-400 py-10 px-4">Your basket is empty.</p>
        )}

        {cart.length > 0 && (
          <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Subtotal</p>
              <p className="font-bold text-brand-dark text-lg">£{cartTotal.toFixed(2)}</p>
            </div>
            <button onClick={() => handleLinkClick('/cart')}>
              <Button className="rounded-xl px-6 h-10 text-xs font-bold">View Full Cart</Button>
            </button>
          </div>
        )}
      </div>
      {/* Beak */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r border-b border-slate-100 transform rotate-45"></div>
    </div>
  );
};
