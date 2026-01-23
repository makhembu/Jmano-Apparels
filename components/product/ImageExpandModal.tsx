import React from 'react';

interface ImageExpandModalProps {
  images: string[];
  startIndex: number;
  productTitle: string;
  onClose: () => void;
}

export const ImageExpandModal: React.FC<ImageExpandModalProps> = ({ images, startIndex, productTitle, onClose }) => {
  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-dark/95 backdrop-blur-md animate-fade-in cursor-zoom-out"
      onClick={onClose}
    >
      <button 
        className="absolute top-8 right-8 text-white/50 hover:text-brand-hope transition-all z-[110] bg-white/10 p-3 rounded-full hover:bg-white/20"
        onClick={onClose}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      <div className="relative max-w-[95vw] max-h-[90vh] flex flex-col items-center">
        <img 
          // FIX: Use the 'images' array and 'startIndex' prop to display the correct image.
          src={images[startIndex]} 
          alt={productTitle} 
          className="max-w-full max-h-[80vh] object-contain rounded-3xl shadow-2xl ring-1 ring-white/10"
          onClick={(e) => e.stopPropagation()}
        />
        <div className="mt-8 text-center px-6">
          <h2 className="text-white font-serif text-2xl font-bold">{productTitle}</h2>
          <p className="text-brand-light/60 text-xs font-bold uppercase tracking-[0.2em] mt-2">Jambo Apparels Collection</p>
        </div>
      </div>
    </div>
  );
};
