import React from 'react';
import { Link } from 'react-router-dom';
import { Product, Category } from '../../types';

interface ProductInfoProps {
  product: Product;
  category?: Category;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({ product, category }) => {
  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
        <div>
          <nav className="flex mb-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]" aria-label="Breadcrumb">
            <Link to="/shop" className="hover:text-brand-green">Shop</Link>
            <span className="mx-2 opacity-30">/</span>
            <span className="text-brand-green">{category?.label}</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-dark leading-[1.1]">{product.title}</h1>
        </div>
        <div className="flex flex-col items-start sm:items-end">
          <p className="text-4xl font-bold text-brand-green font-serif">£{product.price.toFixed(2)}</p>
          {product.isOnSale && product.salePrice && (
            <p className="text-sm text-slate-400 line-through mt-1">Originally £{product.price.toFixed(2)}</p>
          )}
        </div>
      </div>

      <div className="mb-10 p-6 bg-slate-50 rounded-3xl border border-slate-100">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Spiritually Threaded</h3>
        <div className="text-base text-slate-700 font-light leading-relaxed">
          <p>{product.description}</p>
        </div>
      </div>
    </>
  );
};
