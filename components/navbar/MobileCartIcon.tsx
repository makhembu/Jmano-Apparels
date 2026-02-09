import React from 'react';
import { useCart } from '../../context/CartContext';

interface MobileCartIconProps {
  isActive: boolean;
}

export const MobileCartIcon: React.FC<MobileCartIconProps> = ({ isActive }) => {
  const { cartCount } = useCart();

  return (
    <div className={`flex flex-col items-center p-2 rounded-2xl transition-all duration-200 ${isActive ? 'bg-brand-light/40 text-brand-green scale-105' : 'text-slate-400 group-active:scale-95'}`}>
      <div className="relative">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive ? 2.5 : 2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-2 bg-brand-green text-white text-[8px] font-black rounded-full h-4 w-4 flex items-center justify-center ring-2 ring-white animate-bounce shadow-sm">
            {cartCount}
          </span>
        )}
      </div>
      <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">Basket</span>
    </div>
  );
};