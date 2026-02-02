
import React from 'react';
import { Product, Category } from '../../types';
import { Button } from '../ui/Button';

interface ProductPurchaseFormProps {
  product: Product;
  category?: Category;
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
  product, category, buySectionRef, optionsRef,
  selectedSize, setSelectedSize,
  selectedColor, setSelectedColor,
  quantity, setQuantity,
  handleAddToCart, isAdding, isOrderingNow
}) => {

  const stock = product.stockQuantity ?? 0;
  const isOutOfStock = stock <= 0;
  const lowStock = stock > 0 && stock <= (product.lowStockThreshold || 5);

  // Default theme fallback
  const themeColorClass = category?.bgColorClass?.replace('bg-', '') || 'brand-green'; 
  // Map brand classes to specific hex/text/border styles dynamically
  const isHope = themeColorClass.includes('hope');
  
  // Dynamic classes based on category theme
  const activeBorderClass = `border-${themeColorClass}`;
  const activeBgClass = `bg-${themeColorClass}`;
  const activeTextClass = `text-${themeColorClass}`;
  
  // For text contrast: Hope/Yellow needs dark text, others white usually ok
  const buttonTextClass = isHope ? 'text-brand-dark' : 'text-white';
  
  // For outlined button text: If Hope (Yellow), use dark text for readability against white bg
  const outlineTextClass = isHope ? 'text-brand-dark' : activeTextClass;

  return (
    <div className="space-y-10 transition-all duration-300 rounded-3xl" ref={optionsRef}>
      {product.colors && product.colors.length > 0 && (
        <div>
          <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] mb-4">Choose Color</h3>
          <div className="flex flex-wrap gap-3">
            {product.colors.map(color => (
              <button 
                key={color} 
                onClick={() => setSelectedColor(color)} 
                className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border-2 transition-all duration-300 ${ 
                  selectedColor === color 
                    ? `${activeBorderClass} ${activeTextClass} bg-white shadow-md scale-105` 
                    : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200' 
                }`}
              >
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
            <button 
              key={size} 
              onClick={() => setSelectedSize(size)} 
              className={`min-w-[4rem] h-14 flex items-center justify-center rounded-2xl text-sm font-black border-2 transition-all duration-300 ${ 
                selectedSize === size 
                  ? `${activeBgClass} ${activeBorderClass} ${buttonTextClass} shadow-xl scale-105` 
                  : 'border-slate-100 text-slate-600 hover:border-slate-200 bg-white' 
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 flex flex-col sm:flex-row gap-4" ref={buySectionRef}>
        <div className="flex items-center border-2 border-slate-100 rounded-2xl bg-white w-full sm:w-auto h-14 shrink-0 justify-between sm:justify-start">
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className={`px-6 h-full text-slate-400 hover:${outlineTextClass} transition-colors text-xl font-bold`}>-</button>
          <span className="px-4 font-black text-slate-900 w-12 text-center text-lg">{quantity}</span>
          <button onClick={() => setQuantity(quantity + 1)} className={`px-6 h-full text-slate-400 hover:${outlineTextClass} transition-colors text-xl font-bold`}>+</button>
        </div>
        
        {/* Side-by-side buttons on mobile using Grid */}
        <div className="flex-1 grid grid-cols-2 gap-3 sm:flex sm:flex-row sm:gap-4">
          <button 
            onClick={() => handleAddToCart(false)} 
            disabled={isAdding || isOutOfStock || isOrderingNow}
            className={`flex-1 h-14 font-black uppercase tracking-widest text-[10px] sm:text-xs rounded-2xl border-2 transition-all w-full ${
                isOutOfStock ? 'border-slate-100 text-slate-400 bg-slate-50' : 
                `bg-white ${activeBorderClass} ${outlineTextClass} hover:bg-slate-50`
            }`}
          >
            {isAdding ? 'Adding...' : isOutOfStock ? 'Sold Out' : 'Add to Basket'}
          </button>

          {!isOutOfStock && (
            <button 
                onClick={() => handleAddToCart(true)} 
                disabled={isOrderingNow || isAdding}
                className={`flex-1 h-14 font-black uppercase tracking-widest text-[10px] sm:text-xs rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-95 w-full ${activeBgClass} ${buttonTextClass} shadow-black/5`}
            >
              {isOrderingNow ? 'Processing...' : 'Checkout Now'}
            </button>
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
          <div className={`flex items-center gap-2 font-black text-[10px] uppercase tracking-widest ${outlineTextClass}`}>
            <span className={`w-2 h-2 rounded-full ${activeBgClass}`}></span> Divinely Stocked & Ready
          </div>
        )}
      </div>
    </div>
  );
};
