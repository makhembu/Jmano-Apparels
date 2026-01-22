import React from 'react';
import { Product, Category } from '../../../types';

interface ProductPreviewProps {
  product: Partial<Product>;
  categories: Category[];
}

export const ProductPreview: React.FC<ProductPreviewProps> = ({ product, categories }) => {
  const category = categories.find(c => c.key === product.categoryKey);
  const stock = product.stockQuantity || 0;
  const isOutOfStock = stock <= 0;
  const lowStock = stock > 0 && stock <= (product.lowStockThreshold || 5);

  return (
    <div className="sticky top-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4 font-serif">Live Preview</h3>
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {/* Image Area */}
        <div className="aspect-w-1 aspect-h-1 bg-gray-100 relative h-64 overflow-hidden">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.title || 'Product Preview'} 
              className="w-full h-full object-cover object-center"
              onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/400x400?text=No+Image')} 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
              <div className="text-center p-4">
                <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm block mt-2">Image Preview</span>
              </div>
            </div>
          )}
          {product.isFeatured && (
             <span className="absolute top-2 left-2 bg-yellow-400 text-brand-dark text-xs font-bold px-2 py-1 rounded shadow-sm">Featured</span>
          )}
          {product.isOnSale && (
             <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">Sale</span>
          )}
        </div>

        <div className="p-6">
          {/* Category */}
          <div className="mb-3">
             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${category?.bgColorClass || 'bg-gray-100'} text-gray-800`}>
               {category?.label || product.categoryKey || 'Uncategorized'}
             </span>
          </div>

          {/* Title */}
          <h1 className="text-xl font-bold text-gray-900 font-serif mb-2 leading-tight">
            {product.title || 'Product Title'}
          </h1>

          {/* Price */}
          <div className="mt-2 flex items-baseline gap-2 mb-4">
            <p className="text-2xl text-brand-green font-bold">
              £{(product.salePrice || product.price || 0).toFixed(2)}
            </p>
            {product.salePrice && product.salePrice < (product.price || 0) && (
               <span className="text-sm text-gray-500 line-through">£{(product.price || 0).toFixed(2)}</span>
            )}
          </div>

          {/* Description */}
          <div className="prose prose-sm text-gray-500 line-clamp-3 mb-6">
             {product.description || 'Product description will appear here...'}
          </div>

          {/* Status */}
          <div className="border-t pt-4">
             <div className="flex items-center justify-between mb-4">
                <span className={`text-sm font-medium ${isOutOfStock ? 'text-red-600' : lowStock ? 'text-orange-600' : 'text-green-600'}`}>
                   {isOutOfStock ? 'Out of Stock' : lowStock ? `Only ${stock} left` : 'In Stock'}
                </span>
                <span className="text-xs text-gray-400 font-mono">SKU: {product.sku || 'N/A'}</span>
             </div>

             {/* Swatches Preview */}
             {(product.colors && product.colors.length > 0) && (
               <div className="mb-4">
                 <p className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">Colors</p>
                 <div className="flex flex-wrap gap-2">
                   {product.colors.map(c => (
                     <div key={c} className="w-6 h-6 rounded-full border border-gray-200 shadow-sm flex items-center justify-center relative group" title={c}>
                        <div className="w-full h-full rounded-full" style={{backgroundColor: c.toLowerCase().replace(' ', '')}}></div>
                        {/* Tooltip for color name */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap z-10">
                          {c}
                        </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}

             {(product.sizes && product.sizes.length > 0) && (
               <div>
                 <p className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">Sizes</p>
                 <div className="flex flex-wrap gap-2">
                   {product.sizes.map(s => (
                     <span key={s} className="px-3 py-1 border border-gray-200 rounded text-xs text-gray-600 bg-gray-50 uppercase">{s}</span>
                   ))}
                 </div>
               </div>
             )}
          </div>
          
          {/* Fake Add to Cart Button */}
          <div className="mt-6">
            <button className="w-full bg-brand-green text-white py-3 rounded-md font-bold opacity-50 cursor-not-allowed text-sm uppercase tracking-wider">
               Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};