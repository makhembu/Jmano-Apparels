import React from 'react';
import { Product } from '../../types';

interface ProductImageGalleryProps {
  product: Product;
  isWishlisted: boolean;
  onWishlistToggle: () => void;
  onImageExpand: () => void;
}

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ product, isWishlisted, onWishlistToggle, onImageExpand }) => {
  return (
    <div className="space-y-4">
      <div 
        className="relative aspect-square rounded-[2rem] overflow-hidden border border-gray-100 shadow-xl bg-white cursor-pointer group ring-1 ring-black/5"
        onClick={onImageExpand}
      >
        <img 
          // FIX: The 'Product' type has an 'images' array. Use the first image.
          src={product.images[0]} 
          alt={product.title} 
          className="w-full h-full object-center object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur p-3 rounded-2xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="w-6 h-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); onWishlistToggle(); }} 
          className="absolute top-6 right-6 bg-white/90 backdrop-blur p-3 rounded-2xl shadow-xl hover:bg-white transition-all transform hover:scale-110 active:scale-95 z-20 border border-slate-100"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
           {isWishlisted ? <span className="text-red-500 text-2xl leading-none">♥</span> : <span className="text-slate-400 text-2xl leading-none">♡</span>}
        </button>
        {product.isOnSale && (
          <span className="absolute top-6 left-6 bg-red-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg z-20 uppercase tracking-[0.2em]">
            Sale
          </span>
        )}
      </div>
      <div className="flex items-center justify-center gap-2 text-slate-400">
         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
         <span className="text-[10px] font-bold uppercase tracking-widest">Tap to zoom</span>
      </div>
    </div>
  );
};
