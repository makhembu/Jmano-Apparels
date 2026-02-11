
import React from 'react';
// @ts-ignore
import { Link, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { useShop } from '../context/ShopContext';
import { useCart } from '../context/CartContext';
import { OptimizedImage } from './ui/OptimizedImage';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index }) => {
  const { categories } = useShop();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  
  const category = categories.find(c => c.key === product.categoryKey);
  const stock = product.stockQuantity ?? 0;
  const isOutOfStock = stock <= 0;
  
  // Define color rotation with STRICT contrast rules
  const colors = [
    { 
      // Yellow Background -> DARK Text (Only exception)
      bg: 'bg-brand-hope', 
      text: 'text-brand-dark', 
      price: 'text-brand-dark', 
      muted: 'text-slate-900', 
      border: 'border-brand-hope', 
      hover: 'hover:shadow-brand-hope/30',
      badge: 'bg-brand-dark text-white'
    }, 
    { 
      // Purple Background -> WHITE Text
      bg: 'bg-brand-testament', 
      text: 'text-white', 
      price: 'text-white', 
      muted: 'text-white/80', 
      border: 'border-brand-testament', 
      hover: 'hover:shadow-brand-testament/30',
      badge: 'bg-white text-brand-testament'
    }, 
    { 
      // Green Background -> WHITE Text
      bg: 'bg-brand-humility', 
      text: 'text-white', 
      price: 'text-white', 
      muted: 'text-white/80', 
      border: 'border-brand-humility', 
      hover: 'hover:shadow-brand-humility/30',
      badge: 'bg-white text-brand-humility'
    }, 
    { 
      // Red Background -> WHITE Text
      bg: 'bg-brand-sainty', 
      text: 'text-white', 
      price: 'text-white', 
      muted: 'text-white/80', 
      border: 'border-brand-sainty', 
      hover: 'hover:shadow-brand-sainty/30',
      badge: 'bg-white text-brand-sainty'
    }, 
    { 
      // Orange Background -> WHITE Text (Better contrast than dark)
      bg: 'bg-brand-triumph', 
      text: 'text-white', 
      price: 'text-white', 
      muted: 'text-white/80', 
      border: 'border-brand-triumph', 
      hover: 'hover:shadow-brand-triumph/30',
      badge: 'bg-white text-brand-triumph'
    }, 
  ];

  const defaultStyle = { 
    bg: 'bg-white', 
    text: 'text-brand-dark', 
    price: category?.color || 'text-brand-green', 
    muted: 'text-gray-500', 
    border: 'border-gray-100',
    hover: 'hover:shadow-brand-green/10',
    badge: 'bg-brand-dark text-white'
  };

  const style = index !== undefined ? colors[index % colors.length] : defaultStyle;
  
  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // For products with variants, we should redirect to details to select size
    if (product.sizes?.length > 1 || product.colors?.length > 1) {
        navigate(`/product/${product.slug || product.id}`);
    } else {
        // Direct add for simple products (or default first size)
        const defaultSize = product.sizes?.[0] || 'One Size';
        addToCart(product, defaultSize, 1);
    }
  };

  return (
    <Link 
      to={`/product/${product.slug || product.id}`} 
      className={`group block ${style.bg} border ${style.border} rounded-2xl overflow-hidden hover:shadow-xl ${style.hover} transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col`}
    >
      <div className="aspect-square w-full bg-gray-100 overflow-hidden relative">
        <OptimizedImage
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&h=800&fit=crop'}
          alt={product.title}
          width={500}
          height={500}
          quality={80}
          className="group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* QUICK ADD BUTTON OVERLAY */}
        {!isOutOfStock && (
            <button
                onClick={handleQuickAdd}
                className="absolute bottom-3 right-3 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-brand-green hover:bg-brand-green hover:text-white transition-all transform hover:scale-110 active:scale-95 z-20"
                title="Quick Add to Cart"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
            </button>
        )}

        {/* Low Stock Badge */}
        {stock > 0 && stock <= 5 && (
            <span className="absolute top-3 left-3 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-md animate-pulse">
                Only {stock} Left
            </span>
        )}
        
        {/* Out of Stock Overlay */}
        {isOutOfStock && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                <span className="bg-slate-900 text-white px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest transform -rotate-6">Sold Out</span>
            </div>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-grow relative">
        <div className="flex justify-between items-start mb-2 gap-2">
           <p 
             className={`text-[9px] font-black uppercase tracking-widest opacity-80 ${style.muted}`}
           >
             {category?.label || 'Collection'}
           </p>
        </div>
        
        <h3 className={`text-base md:text-xl font-serif font-bold ${style.text} leading-tight transition-colors mb-auto`}>
          {product.title}
        </h3>
        
        <div className="mt-4 flex items-center justify-between">
           <div className="flex flex-col">
               {product.isOnSale && product.salePrice ? (
                 <>
                    <span className={`text-xs line-through opacity-70 ${style.text}`}>£{product.salePrice.toFixed(2)}</span>
                    <span className={`text-lg font-bold ${style.price}`}>£{product.price.toFixed(2)}</span>
                 </>
               ) : (
                    <span className={`text-lg font-bold ${style.price}`}>£{product.price.toFixed(2)}</span>
               )}
           </div>
           
           <div className={`text-[10px] font-bold px-2 py-1 rounded ${style.badge} opacity-0 group-hover:opacity-100 transition-opacity`}>
               View
           </div>
        </div>
      </div>
    </Link>
  );
};
