
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
    <div className="flex flex-col-reverse lg:flex-row gap-4 h-full">
      {/* Thumbnails Sidebar - Desktop Vertical / Mobile Horizontal */}
      {images.length > 1 && (
        <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto no-scrollbar py-2 lg:py-0 lg:w-20 lg:max-h-[600px] flex-shrink-0">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                activeIndex === idx 
                  ? 'border-gray-900 opacity-100 ring-1 ring-gray-900/10' 
                  : 'border-transparent opacity-60 hover:opacity-100 hover:border-gray-300'
              }`}
            >
              <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Main Display Container */}
      <div className="flex-1 relative group">
        <div 
          className="relative aspect-[4/5] lg:aspect-square w-full rounded-2xl lg:rounded-3xl overflow-hidden bg-gray-50 cursor-zoom-in shadow-sm"
          onClick={() => onImageExpand(activeIndex)}
        >
          <img 
            key={images[activeIndex]}
            src={images[activeIndex]} 
            alt={product.title} 
            className="w-full h-full object-center object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          
          {/* Hover Overlay Icon */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-black/5">
             <div className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg">
                <svg className="w-6 h-6 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
             </div>
          </div>

          {/* Wishlist Button (Floating) */}
          <button 
            onClick={(e) => { e.stopPropagation(); onWishlistToggle(); }} 
            className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all z-20 group/heart"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
             {isWishlisted ? (
               <svg className="w-5 h-5 text-red-500 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
             ) : (
               <svg className="w-5 h-5 text-gray-400 group-hover/heart:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
             )}
          </button>

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.isOnSale && (
              <span className="bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
                Sale
              </span>
            )}
            {product.isFeatured && (
               <span className="bg-gray-900 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
                 Featured
               </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
