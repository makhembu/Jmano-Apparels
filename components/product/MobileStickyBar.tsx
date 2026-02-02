
import React from 'react';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';

interface MobileStickyBarProps {
  product: Product;
  show: boolean;
  onAddToCart: () => void;
}

export const MobileStickyBar: React.FC<MobileStickyBarProps> = ({ product, show, onAddToCart }) => {
  const { settings } = useApp();
  const isOutOfStock = (product.stockQuantity ?? 0) <= 0;
  
  // Calculate top offset: Navbar (h-16) + AnnouncementBar (h-10 if enabled)
  const hasAnnouncement = settings.isAnnouncementEnabled && settings.announcementText;
  const topPositionClass = hasAnnouncement ? 'top-[6.5rem]' : 'top-16';

  return (
    <div className={`md:hidden fixed ${topPositionClass} left-0 right-0 z-30 transition-all duration-500 ease-in-out transform ${show ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>
       <div className="bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-lg px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-hidden">
             <img src={product.images?.[0]} className="w-10 h-10 rounded-2xl object-cover shadow-sm ring-1 ring-slate-100" alt="" />
             <div className="overflow-hidden">
                <p className="text-[10px] font-black text-slate-900 truncate uppercase tracking-tighter">{product.title}</p>
                <p className="text-sm font-black text-brand-green">£{product.price.toFixed(2)}</p>
             </div>
          </div>
          <button onClick={onAddToCart} disabled={isOutOfStock} className={`flex-shrink-0 h-10 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${isOutOfStock ? 'bg-slate-100 text-slate-400' : 'bg-brand-green text-white shadow-lg shadow-brand-green/20'}`}>
             {isOutOfStock ? 'Sold' : 'Buy Now'}
          </button>
       </div>
    </div>
  );
};
