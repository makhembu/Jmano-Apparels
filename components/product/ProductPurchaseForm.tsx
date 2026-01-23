import React from 'react';
import { Product } from '../../types';
import { Button } from '../ui/Button';

interface ProductPurchaseFormProps {
  product: Product;
  buySectionRef: React.RefObject<HTMLDivElement>;
  optionsRef: React.RefObject<HTMLDivElement>;
  selectedSize: string;
  setSelectedSize: (s: string) => void;
  selectedColor: string;
  setSelectedColor: (c: string) => void;
  quantity: number;
  setQuantity: (q: number) => void;
  handleAddToCart: (redirect: boolean) => void;
  isAdding: boolean;
  isOrderingNow: boolean;
}

export const ProductPurchaseForm: React.FC<ProductPurchaseFormProps> = ({ 
  product, buySectionRef, optionsRef,
  selectedSize, setSelectedSize,
  selectedColor, setSelectedColor,
  quantity, setQuantity,
  handleAddToCart, isAdding, isOrderingNow
}) => {

  const stock = product.stockQuantity ?? 0;
  const isOutOfStock = stock <= 0;
  const lowStock = stock > 0 && stock <= (product.lowStockThreshold || 5);

  return (
    <div className="space-y-10 transition-all duration-300 rounded-3xl" ref={optionsRef}>
      {product.colors && product.colors.length > 0 && (
        <div>
          <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] mb-4">Choose Color</h3>
          <div className="flex flex-wrap gap-3">
            {product.colors.map(color => (
              <button key={color} onClick={() => setSelectedColor(color)} className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border-2 transition-all duration-300 ${ selectedColor === color ? 'border-brand-green bg-brand-light/60 text-brand-green shadow-md scale-105' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200' }`}>
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] mb-4">Select Size</h3>
        <div className="flex flex-wrap gap-3">
          {product.sizes.map(size => (
            <button key={size} onClick={() => setSelectedSize(size)} className={`min-w-[4rem] h-14 flex items-center justify-center rounded-2xl text-sm font-black border-2 transition-all duration-300 ${ selectedSize === size ? 'border-brand-green bg-brand-green text-white shadow-xl scale-105' : 'border-slate-100 text-slate-600 hover:border-slate-200 bg-white' }`}>
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 flex flex-col sm:flex-row gap-4" ref={buySectionRef}>
        <div className="flex items-center border-2 border-slate-100 rounded-2xl bg-white w-full sm:w-fit h-14">
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-6 h-full text-slate-400 hover:text-brand-green transition-colors text-xl font-bold">-</button>
          <span className="px-4 font-black text-slate-900 w-12 text-center text-lg">{quantity}</span>
          <button onClick={() => setQuantity(quantity + 1)} className="px-6 h-full text-slate-400 hover:text-brand-green transition-colors text-xl font-bold">+</button>
        </div>
        
        <div className="flex-1 flex flex-col sm:flex-row gap-4">
          <Button onClick={() => handleAddToCart(false)} isLoading={isAdding} disabled={isOutOfStock || isOrderingNow} variant="outline" fullWidth className="h-14 font-black uppercase tracking-widest text-xs rounded-2xl border-2">
            {isOutOfStock ? 'Sold Out' : 'Add to Basket'}
          </Button>

          {!isOutOfStock && (
            <Button onClick={() => handleAddToCart(true)} isLoading={isOrderingNow} disabled={isAdding} fullWidth className="h-14 font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-brand-green/20">
              Checkout Now
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 ring-1 ring-black/[0.02]">
        {isOutOfStock ? (
          <div className="flex items-center gap-2 text-red-500 font-black text-[10px] uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-red-500"></span> Currently Out of Stock
          </div>
        ) : lowStock ? (
          <div className="flex items-center gap-2 text-orange-600 font-black text-[10px] uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse"></span> Only {stock} remaining
          </div>
        ) : (
          <div className="flex items-center gap-2 text-brand-green font-black text-[10px] uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-brand-green"></span> Divinely Stocked & Ready
          </div>
        )}
      </div>
    </div>
  );
};
