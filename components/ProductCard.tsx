import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <Link to={`/product/${product.id}`} className="group block bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="aspect-w-1 aspect-h-1 w-full bg-gray-200 overflow-hidden xl:aspect-w-7 xl:aspect-h-8">
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          className="w-full h-64 object-cover object-center group-hover:opacity-90 transition-opacity"
        />
      </div>
      <div className="p-4">
        <h3 className="mt-1 text-lg font-medium text-gray-900 truncate">{product.title}</h3>
        <p className="mt-1 text-sm text-gray-500">{product.categoryKey}</p>
        <div className="flex items-center gap-2 mt-2">
           {product.salePrice ? (
              <>
                 <span className="text-lg font-bold text-red-600">£{product.salePrice.toFixed(2)}</span>
                 <span className="text-sm text-gray-400 line-through">£{product.price.toFixed(2)}</span>
              </>
           ) : (
              <p className="text-lg font-bold text-brand-green">£{product.price.toFixed(2)}</p>
           )}
        </div>
      </div>
    </Link>
  );
};