
import React from 'react';
import { Link } from 'react-router-dom';
import { Product, Category } from '../../types';

interface ProductInfoProps {
  product: Product;
  category?: Category;
  enableReviews?: boolean;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({ product, category, enableReviews = true }) => {
  const themeClass = category?.bgColorClass ? category.bgColorClass.replace('bg-', 'text-') : 'text-brand-green';

  const renderStars = (rating: number) => {
    const rounded = Math.round(rating);
    return '★'.repeat(rounded) + '☆'.repeat(5 - rounded);
  };

  return (
    <>
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
            <Link to={`/shop?cat=${product.categoryKey}`} className={`text-[10px] font-black uppercase tracking-[0.2em] block ${themeClass} opacity-80 hover:opacity-100 transition-opacity`}>
              {category?.label || 'Collection'}
            </Link>
            
            {/* Real Dynamic Reviews */}
            {enableReviews && product.reviewCount > 0 && (
              <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })}>
                 <div className="flex text-amber-400 text-xs tracking-tighter" role="img" aria-label={`${product.averageRating} out of 5 stars`}>
                    {renderStars(product.averageRating)}
                 </div>
                 <span className="text-[10px] text-gray-400 font-bold underline decoration-dotted">
                   {product.reviewCount} reviews
                 </span>
              </div>
            )}
        </div>

        <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-dark leading-tight mb-2">
          {product.title}
        </h1>
        
        <div className="flex items-baseline gap-3 mt-1">
          <p className="text-xl md:text-2xl font-serif font-bold text-brand-dark">£{product.price.toFixed(2)}</p>
          {product.isOnSale && product.salePrice && (
            <div className="flex items-center gap-2">
               <span className="text-sm text-gray-400 line-through decoration-1">£{product.salePrice.toFixed(2)}</span>
               <span className="bg-red-50 text-red-600 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Save {Math.round(((product.salePrice - product.price) / product.salePrice) * 100)}%</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
