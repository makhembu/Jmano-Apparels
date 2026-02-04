
import React from 'react';
// @ts-ignore
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { useShop } from '../context/ShopContext';
import { OptimizedImage } from './ui/OptimizedImage';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index }) => {
  const { categories } = useShop();
  const category = categories.find(c => c.key === product.categoryKey);
  
  // Define color rotation palette with Accessible Contrast Ratios
  // Most text updated to text-brand-dark per user request for "green" titles
  const colors = [
    { 
      bg: 'bg-brand-hope', 
      text: 'text-brand-dark', 
      price: 'text-brand-dark', 
      muted: 'text-slate-800/80', 
      border: 'border-brand-hope', 
      hover: 'hover:shadow-brand-hope/30' 
    }, 
    { 
      bg: 'bg-brand-testament', 
      text: 'text-brand-dark', 
      price: 'text-brand-dark', 
      muted: 'text-slate-800/80', 
      border: 'border-brand-testament', 
      hover: 'hover:shadow-brand-testament/30' 
    }, 
    { 
      bg: 'bg-brand-humility', 
      text: 'text-brand-dark', 
      price: 'text-brand-dark', 
      muted: 'text-slate-800/80', 
      border: 'border-brand-humility', 
      hover: 'hover:shadow-brand-humility/30' 
    }, 
    { 
      bg: 'bg-brand-patience', 
      text: 'text-white', // Keep white for contrast on red
      price: 'text-white', 
      muted: 'text-white/90', 
      border: 'border-brand-patience', 
      hover: 'hover:shadow-brand-patience/30' 
    }, 
    { 
      bg: 'bg-brand-triumph', 
      text: 'text-brand-dark', 
      price: 'text-brand-dark', 
      muted: 'text-slate-800/80', 
      border: 'border-brand-triumph', 
      hover: 'hover:shadow-brand-triumph/30' 
    }, 
  ];

  const defaultStyle = { 
    bg: 'bg-white', 
    text: 'text-brand-dark', 
    price: category?.color || 'text-brand-green', 
    muted: 'text-gray-500', 
    border: 'border-gray-100',
    hover: 'hover:shadow-brand-green/10'
  };

  const style = index !== undefined ? colors[index % colors.length] : defaultStyle;
  const categoryColor = index !== undefined ? style.muted : (category?.color || '#2E7D32');
  
  // Use a reliable Unsplash fallback that allows robots
  const primaryImage = product.images?.[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&h=800&fit=crop';
  
  return (
    <Link 
      to={`/product/${product.slug || product.id}`} 
      className={`group block ${style.bg} border ${style.border} rounded-2xl overflow-hidden hover:shadow-xl ${style.hover} transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col`}
    >
      <div className="aspect-square w-full bg-gray-100 overflow-hidden relative">
        <OptimizedImage
          src={primaryImage}
          alt={product.title}
          width={500}
          height={500}
          quality={80}
          className="group-hover:scale-105 transition-transform duration-500"
        />
        {category && index === undefined && (
           <div 
             className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
             style={{ backgroundColor: category.color }}
           />
        )}
      </div>
      {/* Updated padding for mobile grid (p-3 on small screens, p-5 on desktop) */}
      <div className="p-3 md:p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2 gap-2">
           <p 
             className={`text-[9px] md:text-[10px] font-bold uppercase tracking-widest ${index !== undefined ? style.muted : ''}`}
             style={index === undefined ? { color: categoryColor } : {}}
           >
             {category?.label || product.categoryKey}
           </p>
           {product.stockQuantity !== undefined && product.stockQuantity <= 5 && product.stockQuantity > 0 && (
             <span className="flex-shrink-0 text-[8px] md:text-[9px] text-red-500 font-bold bg-white/90 px-1.5 py-0.5 rounded shadow-sm">Low Stock</span>
           )}
        </div>
        <h3 className={`text-sm md:text-lg font-serif font-bold ${style.text} leading-tight transition-colors mb-auto`}>
          {product.title}
        </h3>
        <div className="mt-3 md:mt-4 flex items-center justify-between">
           <p 
             className={`text-sm md:text-xl font-bold ${index !== undefined ? style.price : ''}`}
             style={index === undefined ? { color: categoryColor } : {}}
           >
             £{product.price.toFixed(2)}
           </p>
           {product.isOnSale && (
             <span className={`text-[10px] md:text-sm line-through ${index !== undefined ? style.muted : 'text-gray-400'}`}>
                £{product.salePrice?.toFixed(2)}
             </span>
           )}
        </div>
      </div>
    </Link>
  );
};
