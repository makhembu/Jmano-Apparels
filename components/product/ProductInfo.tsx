
import React from 'react';
import { Link } from 'react-router-dom';
import { Product, Category } from '../../types';

interface ProductInfoProps {
  product: Product;
  category?: Category;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({ product, category }) => {
  const themeClass = category?.bgColorClass ? category.bgColorClass.replace('bg-', 'text-') : 'text-brand-green';

  return (
    <>
      <div className="mb-6">
        <Link to={`/shop?cat=${product.categoryKey}`} className={`text-xs font-black uppercase tracking-[0.2em] mb-3 block ${themeClass} opacity-80 hover:opacity-100 transition-opacity`}>
           {category?.label || 'Collection'}
        </Link>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-900 leading-tight mb-4">
          {product.title}
        </h1>
        
        <div className="flex items-baseline gap-4 mt-4">
          <p className="text-3xl font-serif font-bold text-gray-900">£{product.price.toFixed(2)}</p>
          {product.isOnSale && product.salePrice && (
            <div className="flex items-center gap-2">
               <span className="text-lg text-gray-400 line-through decoration-1">£{product.salePrice.toFixed(2)}</span>
               <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Sale</span>
            </div>
          )}
        </div>
      </div>

      <div className="prose prose-slate prose-sm max-w-none text-gray-600 font-light leading-relaxed mb-8">
        <p>{product.description}</p>
      </div>
    </>
  );
};
