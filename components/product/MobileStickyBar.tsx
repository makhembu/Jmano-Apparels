import React from 'react';
import { Product } from '../../types';
// FIX: Replaced deprecated useApp with useShop
import { useShop } from '../../context/ShopContext';

interface MobileStickyBarProps {
  product: Product;
  show: boolean;
  onAddToCart: () => void;
}

export const MobileStickyBar: React.FC<MobileStickyBarProps> = ({ product, show, onAddToCart }) => {
  const { settings } = useShop();
  const isOutOfStock = (product.stockQuantity ?? 0) <= 0;
  
  // Calculate top offset if needed, but for "Bottom Sticky" typically it stays at bottom
  // This implementation places it at the BOTTOM of the screen on mobile, which is standard.
  
  return (
    <div 
        className={`fixed bottom-0 left-0 right-0 z-[60] bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] p-4 transition-transform duration-300 ease-in-out md:hidden flex items-center justify-between gap-4 pb-safe ${
            show ? 'translate-y-0' : 'translate-y-full'
        }`}
    >
       <div className="flex items-center gap-3 overflow-hidden">
          <div className="h-12 w-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200">
             <img src={product.images?.[0]} className="h-full w-full object-cover" alt="" />
          </div>
          <div className="flex flex-col overflow-hidden">
             <span className="text-sm font-bold text-gray-900 truncate">{product.title}</span>
             <span className="text-xs font-medium text-gray-500">£{product.price.toFixed(2)}</span>
          </div>
       </div>
       
       <button 
         onClick={onAddToCart} 
         disabled={isOutOfStock} 
         className={`flex-shrink-0 h-11 px-6 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 ${
            isOutOfStock 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-gray-900 text-white shadow-md'
         }`}
       >
          {isOutOfStock ? 'Sold' : 'Add'}
       </button>
    </div>
  );
};