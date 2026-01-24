import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { useShop } from '../context/ShopContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { categories } = useShop();
  
  const category = categories.find(c => c.key === product.categoryKey);
  // Default to brand green if no category color found
  const accentColor = category?.color || '#2E7D32'; 

  const primaryImage = product.images?.[0] || 'https://via.placeholder.com/800x800.png?text=Image+Not+Found';
  
  return (
    <Link to={`/product/${product.id}`} className="group block bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-brand-green/10 transition-all duration-300 transform hover:-translate-y-1">
      <div className="aspect-w-1 aspect-h-1 w-full bg-gray-100 overflow-hidden relative">
        <img
          src={primaryImage}
          alt={product.title}
          className="w-full h-64 sm:h-72 md:h-64 object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        {/* Category Color Tag on Image */}
        {category && (
           <div 
             className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
             style={{ backgroundColor: accentColor }}
           />
        )}
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2 gap-2">
           <p 
             className="text-[10px] font-bold uppercase tracking-widest"
             style={{ color: accentColor }}
           >
             {category?.label || product.categoryKey}
           </p>
           {product.stockQuantity !== undefined && product.stockQuantity <= 5 && product.stockQuantity > 0 && (
             <span className="flex-shrink-0 text-[9px] text-red-500 font-bold bg-red-50 px-1.5 py-0.5 rounded">Low Stock</span>
           )}
        </div>
        <h3 className="text-lg font-serif font-bold text-gray-900 leading-tight group-hover:text-brand-green transition-colors">
          {product.title}
        </h3>
        <div className="mt-4 flex items-center justify-between">
           <p 
             className="text-xl font-bold"
             style={{ color: accentColor }}
           >
             £{product.price.toFixed(2)}
           </p>
           {product.isOnSale && (
             <span className="text-sm text-gray-400 line-through">
                £{product.salePrice?.toFixed(2)}
             </span>
           )}
        </div>
      </div>
    </Link>
  );
};