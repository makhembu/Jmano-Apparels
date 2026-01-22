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
          className="w-full h-64 object-cover object-center group-hover:opacity-90"
        />
      </div>
      <div className="p-4">
        <h3 className="mt-1 text-lg font-medium text-gray-900 truncate">{product.title}</h3>
        <p className="mt-1 text-sm text-gray-500">{product.categoryKey}</p>
        <p className="mt-2 text-lg font-bold text-brand-green">£{product.price.toFixed(2)}</p>
      </div>
    </Link>
  );
};