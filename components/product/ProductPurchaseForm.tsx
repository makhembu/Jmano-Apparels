
import React from 'react';
import { Product, Category } from '../../types';
import { Button } from '../ui/Button';
import { getColorHex } from '../../lib/utils';

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
  const isLowStock = stock > 0 && stock < 10;
  
  // Dynamic color for primary action based on category, defaulting to brand green
  const themeColor = category?.color || '#2E7D32';

  return (
    <div className="space-y-5" ref={optionsRef}>
      
      {/* Selectors Grid */}
      <div className="space-y-4">
        {product.colors && product.colors.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-2">
               <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Select Color</h3>
               <span className="text-xs font-medium text-gray-500">{selectedColor || 'Choose option'}</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {product.colors.map(color => {
                const bgStyle = getColorHex(color);
                
                return (
                <button 
                  key={color} 
                  onClick={() => setSelectedColor(color)} 
                  className={`group relative w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${ 
                    selectedColor === color 
                      ? 'border-brand-dark ring-1 ring-brand-dark/20 scale-110' 
                      : 'border-slate-200 hover:border-slate-400' 
                  }`}
                  aria-label={`Select ${color}`}
                  title={color}
                >
                  <span 
                    className="w-7 h-7 rounded-full shadow-sm border border-black/5"
                    style={{ backgroundColor: bgStyle }}
                  ></span>
                  {selectedColor === color && (
                    <span className="absolute -bottom-6 text-[9px] font-bold text-brand-dark bg-white px-1.5 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">{color}</span>
                  )}
                </button>
              )})}
            </div>
          </div>
        )}

        <div>
          <div className="flex justify-between items-center mb-2">
             <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Select Size</h3>
             <a href="#" className="text-[10px] text-brand-green underline decoration-brand-green/30 hover:text-brand-dark font-bold">Size Guide</a>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {product.sizes.map(size => (
              <button 
                key={size} 
                onClick={() => setSelectedSize(size)} 
                className={`h-11 flex items-center justify-center rounded-xl text-sm font-bold border-2 transition-all duration-200 ${ 
                  selectedSize === size 
                    ? 'border-brand-dark bg-brand-dark text-white shadow-md' 
                    : 'border-slate-200 text-slate-700 hover:border-brand-dark hover:text-brand-dark bg-white' 
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Area */}
      <div className="pt-4 border-t border-slate-100" ref={buySectionRef}>
        {!isOutOfStock ? (
            <div className="flex flex-col gap-3">
                <Button 
                    onClick={() => handleAddToCart(false)} 
                    disabled={isAdding || isOrderingNow}
                    isLoading={isAdding}
                    className="w-full h-14 rounded-2xl text-sm md:text-base font-black uppercase tracking-widest shadow-xl shadow-brand-green/20 transform transition-transform active:scale-[0.98]"
                    style={{ backgroundColor: themeColor }}
                >
                    Add to Cart
                </Button>
                
                <div className="grid grid-cols-3 gap-3">
                     {/* Quantity Stepper (Compact) */}
                    <div className="col-span-1 flex items-center justify-between border-2 border-slate-200 rounded-xl bg-white h-12 px-1">
                        <button 
                            onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                            className="w-8 h-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors text-lg"
                        >
                            -
                        </button>
                        <span className="font-bold text-slate-900 text-sm">{quantity}</span>
                        <button 
                            onClick={() => setQuantity(quantity + 1)} 
                            className="w-8 h-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors text-lg"
                        >
                            +
                        </button>
                    </div>

                    <Button 
                        onClick={() => handleAddToCart(true)} 
                        disabled={isOrderingNow || isAdding}
                        isLoading={isOrderingNow}
                        variant="secondary"
                        className="col-span-2 w-full h-12 rounded-xl text-xs font-bold uppercase tracking-widest bg-brand-hope text-brand-dark border-0 hover:bg-yellow-400"
                    >
                        Buy Now
                    </Button>
                </div>
            </div>
        ) : (
            <div className="w-full py-4 bg-gray-100 rounded-xl text-center border border-gray-200">
                <span className="text-gray-500 font-bold uppercase text-sm tracking-widest">Out of Stock</span>
            </div>
        )}
      </div>

      {/* Trust & Stock Signals */}
      <div className="flex flex-col gap-2">
          {!isOutOfStock && (
            <div className="flex items-center gap-2 text-xs font-bold text-brand-dark bg-brand-light/40 p-2.5 rounded-lg border border-brand-green/10">
              <span className={`w-2 h-2 rounded-full ${isLowStock ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`}></span>
              {isLowStock ? `Hurry! Only ${stock} left in stock.` : 'In stock, ready to ship.'}
            </div>
          )}
          <div className="flex items-center justify-center gap-4 text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-1">
             <span className="flex items-center gap-1"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg> Secure Checkout</span>
             <span className="flex items-center gap-1"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> 30-Day Returns</span>
          </div>
      </div>
    </div>
  );
};
