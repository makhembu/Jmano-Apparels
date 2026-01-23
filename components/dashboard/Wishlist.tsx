import React from 'react';
import { Product } from '../../types';
import { ProductCard } from '../ProductCard';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { EmptyState } from '../ui/EmptyState';

interface WishlistProps {
  products: Product[];
  loading: boolean;
}

export const Wishlist: React.FC<WishlistProps> = ({ products, loading }) => {
  if (loading) return <LoadingSpinner />;

  if (products.length === 0) {
    return <EmptyState title="Wishlist is empty" description="Keep track of apparel you love." actionLabel="Start Exploring" actionLink="/shop" />;
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-bold text-brand-dark mb-6 border-b pb-2">My Saved Pieces</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {products.map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
};