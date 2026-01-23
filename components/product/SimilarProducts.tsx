import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { ProductCard } from '../ProductCard';

interface SimilarProductsProps {
  similarProducts: Product[];
}

export const SimilarProducts: React.FC<SimilarProductsProps> = ({ similarProducts }) => {
  if (similarProducts.length === 0) return null;

  return (
    <section className="mt-16 border-t border-slate-100 pt-20">
      <div className="flex flex-col md:flex-row justify-between items-baseline mb-12 gap-4">
         <h2 className="text-3xl font-serif font-bold text-brand-dark">Complete the Testimony</h2>
         <Link to="/shop" className="text-[10px] font-black text-brand-green uppercase tracking-[0.2em] border-b-2 border-brand-green/20 pb-1">View Full Collection</Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {similarProducts.map(similar => (
          <ProductCard key={similar.id} product={similar} />
        ))}
      </div>
    </section>
  );
};
