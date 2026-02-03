
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getVisibleProducts, searchProducts } from '../../lib/utils';
import { Product } from '../../types';

interface MobileSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSearchOverlay: React.FC<MobileSearchOverlayProps> = ({ isOpen, onClose }) => {
  const { products } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      onClose();
    }
  };

  const handleProductClick = (product: Product) => {
    navigate(`/product/${product.slug || product.id}`);
    setSearchQuery('');
    onClose();
  };

  const visibleProducts = getVisibleProducts(products);
  const searchResults = searchProducts(visibleProducts, searchQuery);
  const filteredResults = searchResults.slice(0, 5);

  if (!isOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 z-[60] bg-white animate-fade-in flex flex-col">
      <div className="flex items-center gap-2 p-4 border-b border-gray-100">
        <button onClick={onClose} className="p-2 text-slate-400">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <form onSubmit={handleSearch} className="flex-1">
          <input
            autoFocus
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search collection..."
            className="w-full h-10 px-4 text-base border-none focus:ring-0 bg-transparent text-slate-900 font-medium"
          />
        </form>
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="p-2 text-slate-300">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50/30">
        {searchQuery.trim() ? (
          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Suggestions</p>
            {filteredResults.map(product => (
              <button key={product.id} onClick={() => handleProductClick(product)} className="w-full flex items-center gap-4 p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                <img src={product.images[0]} className="w-12 h-12 rounded-xl object-cover border border-slate-50" alt={product.title} />
                <div className="text-left overflow-hidden">
                  <p className="text-sm font-bold text-slate-900 truncate">{product.title}</p>
                  <p className="text-xs text-brand-green font-black">£{product.price.toFixed(2)}</p>
                </div>
              </button>
            ))}
            {filteredResults.length === 0 && <p className="text-center text-sm text-slate-500 py-10">No results found for "{searchQuery}"</p>}
          </div>
        ) : (
          <div className="text-center py-24 px-8">
            <div className="bg-brand-light w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <h3 className="text-lg font-serif font-bold text-brand-dark mb-2">Finding your thread...</h3>
            <p className="text-sm text-slate-400 italic">Start typing to find your next scripture-inspired piece.</p>
          </div>
        )}
      </div>
    </div>
  );
};
