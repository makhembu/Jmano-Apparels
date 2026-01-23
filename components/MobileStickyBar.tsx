import React from 'react';
import { Product } from '../../types';

interface MobileStickyBarProps {
  product: Product;
  show: boolean;
  onAddToCart: () => void;
}

export const MobileStickyBar: React.FC<MobileStickyBarProps> = ({ product, show, onAddToCart }) => {
  const isOutOfStock = (product.stockQuantity ?? 0) <= 0;

  return (
    <div className={`md:hidden fixed top-16 left-0 right-0 z-30 transition-all duration-500 ease-in-out transform ${show ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>
       <div className="bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-lg px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-hidden">
             <img src={product.images[0]} className="w-10 h-10 rounded-xl object-cover shadow-sm ring-1 ring-slate-100" alt="" />
             <div className="overflow-hidden">
                <p className="text-[10px] font-black text-slate-900 truncate uppercase tracking-tighter">{product.title}</p>
                <p className="text-sm font-black text-brand-green">£{product.price.toFixed(2)}</p>
             </div>
          </div>
          <button onClick={onAddToCart} disabled={isOutOfStock} className={`flex-shrink-0 h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${isOutOfStock ? 'bg-slate-100 text-slate-400' : 'bg-brand-green text-white shadow-md shadow-brand-green/10'}`}>
             {isOutOfStock ? 'Sold' : 'Buy Now'}
          </button>
       </div>
    </div>
  );
};