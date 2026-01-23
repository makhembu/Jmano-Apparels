import React, { useState } from 'react';
import { Product } from '../../types';

interface ProductImageGalleryProps {
  product: Product;
  isWishlisted: boolean;
  onWishlistToggle: () => void;
  onImageExpand: (index: number) => void;
}

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ 
  product, 
  isWishlisted, 
  onWishlistToggle, 
  onImageExpand 
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const images = product.images || [];

  return (
    <div className="flex flex-col md:flex-row gap-4 lg:gap-6">
      {/* Thumbnails Sidebar - Desktop Vertical / Mobile Horizontal */}
      {images.length > 1 && (
        <div className="order-2 md:order-1 flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto no-scrollbar py-2 md:py-0 md:max-h-[600px]">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              onMouseEnter={() => setActiveIndex(idx)}
              className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                activeIndex === idx 
                  ? 'border-brand-green ring-2 ring-brand-green/10 scale-105 shadow-md' 
                  : 'border-white md:border-slate-100 hover:border-slate-300'
              }`}
            >
              <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Main Display Container */}
      <div className="order-1 md:order-2 flex-1 space-y-4">
        <div 
          className="relative aspect-square rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-2xl bg-white cursor-zoom-in group ring-1 ring-black/[0.03]"
          onClick={() => onImageExpand(activeIndex)}
        >
          {/* Main Image with Transition */}
          <img 
            key={images[activeIndex]}
            src={images[activeIndex]} 
            alt={product.title} 
            className="w-full h-full object-center object-cover animate-fade-in transition-transform duration-1000 group-hover:scale-110"
          />
          
          {/* Expand UI Overlay */}
          <div className="absolute bottom-8 right-8 bg-white/80 backdrop-blur-md p-4 rounded-3xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <svg className="w-6 h-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Wishlist Button */}
          <button 
            onClick={(e) => { e.stopPropagation(); onWishlistToggle(); }} 
            className="absolute top-8 right-8 bg-white/80 backdrop-blur-md p-4 rounded-3xl shadow-xl hover:bg-white transition-all transform hover:scale-110 active:scale-95 z-20 border border-slate-50"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
             {isWishlisted ? (
               <svg className="w-6 h-6 text-red-500 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
             ) : (
               <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
             )}
          </button>

          {/* Badges */}
          <div className="absolute top-8 left-8 flex flex-col gap-2">
            {product.isOnSale && (
              <span className="bg-red-600 text-white text-[10px] font-black px-5 py-2 rounded-full shadow-lg z-20 uppercase tracking-[0.2em] animate-pulse">
                Sale
              </span>
            )}
            {product.isFeatured && (
               <span className="bg-brand-hope text-brand-dark text-[10px] font-black px-5 py-2 rounded-full shadow-lg z-20 uppercase tracking-[0.2em]">
                 Featured
               </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 text-slate-400 mt-6">
           <div className="h-px w-8 bg-slate-200"></div>
           <span className="text-[10px] font-black uppercase tracking-[0.25em]">Interactive Experience</span>
           <div className="h-px w-8 bg-slate-200"></div>
        </div>
      </div>
    </div>
  );
};