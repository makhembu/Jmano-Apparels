
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
  
  // Dynamic color for primary action based on category, defaulting to brand green
  const themeColor = category?.color || '#2E7D32';

  return (
    <div className="space-y-8" ref={optionsRef}>
      
      {/* Selectors Grid */}
      <div className="grid grid-cols-1 gap-6">
        {product.colors && product.colors.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-3">
               <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Color</h3>
               <span className="text-xs text-gray-500">{selectedColor || 'Select...'}</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {product.colors.map(color => (
                <button 
                  key={color} 
                  onClick={() => setSelectedColor(color)} 
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border ${ 
                    selectedColor === color 
                      ? 'border-gray-900 bg-gray-900 text-white shadow-md' 
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50' 
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex justify-between items-center mb-3">
             <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Size</h3>
             <a href="#" className="text-xs text-gray-400 underline decoration-gray-300 hover:text-gray-600">Size Guide</a>
          </div>
          <div className="flex flex-wrap gap-3">
            {product.sizes.map(size => (
              <button 
                key={size} 
                onClick={() => setSelectedSize(size)} 
                className={`min-w-[3.5rem] h-11 flex items-center justify-center rounded-lg text-sm font-bold border transition-all duration-200 ${ 
                  selectedSize === size 
                    ? 'border-gray-900 bg-gray-900 text-white shadow-md transform scale-105' 
                    : 'border-gray-200 text-gray-700 hover:border-gray-300 bg-white' 
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Area */}
      <div className="pt-2" ref={buySectionRef}>
        {!isOutOfStock ? (
            <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                    {/* Quantity Stepper */}
                    <div className="flex items-center border border-gray-200 rounded-xl bg-white h-14 shrink-0 w-32">
                        <button 
                            onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                            className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            -
                        </button>
                        <span className="flex-1 text-center font-bold text-gray-900">{quantity}</span>
                        <button 
                            onClick={() => setQuantity(quantity + 1)} 
                            className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            +
                        </button>
                    </div>
                    
                    <Button 
                        onClick={() => handleAddToCart(false)} 
                        disabled={isAdding || isOrderingNow}
                        isLoading={isAdding}
                        className="flex-1 h-14 rounded-xl text-sm uppercase tracking-widest shadow-xl shadow-brand-green/10"
                        style={{ backgroundColor: themeColor }}
                    >
                        Add to Cart
                    </Button>
                </div>
                
                <Button 
                    onClick={() => handleAddToCart(true)} 
                    disabled={isOrderingNow || isAdding}
                    isLoading={isOrderingNow}
                    variant="outline"
                    className="w-full h-12 rounded-xl text-xs uppercase tracking-widest border-gray-200 hover:border-gray-900 hover:bg-gray-50 text-gray-900"
                >
                    Buy Now
                </Button>
            </div>
        ) : (
            <div className="w-full py-4 bg-gray-100 rounded-xl text-center border border-gray-200">
                <span className="text-gray-500 font-bold uppercase text-sm tracking-widest">Out of Stock</span>
            </div>
        )}
      </div>

      {/* Stock Indicator */}
      <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
        <span className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-red-500' : 'bg-green-500'}`}></span>
        {isOutOfStock ? 'Currently unavailable' : 'In stock and ready to ship'}
      </div>
    </div>
  );
};
