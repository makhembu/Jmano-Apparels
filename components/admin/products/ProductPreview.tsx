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
  const primaryImage = product.images?.[0];

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden animate-fade-in">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex justify-between items-center">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Live Preview</span>
        <span className="text-xs text-gray-400">Customer View</span>
      </div>
      
      {/* Image Area */}
      <div className="aspect-w-1 aspect-h-1 w-full bg-gray-100 relative">
        {primaryImage ? (
          <img src={primaryImage} alt={product.title} className="w-full h-64 object-cover object-center" />
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-300 bg-gray-50">
            <div className="text-center">
               <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
               </svg>
               <span className="text-sm">Image Preview</span>
            </div>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
           {product.isOnSale && (
             <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">SALE</span>
           )}
           {product.isFeatured && (
             <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded shadow-sm">FEATURED</span>
           )}
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <h2 className="text-xl font-bold font-serif text-gray-900 leading-tight">
            {product.title || 'Product Title'}
          </h2>
          {category && (
            <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium text-white ${category.bgColorClass} shadow-sm`}>
              {category.label}
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-2">
           <span className="text-2xl font-bold text-brand-green">
             £{(product.isOnSale && product.salePrice ? product.salePrice : (product.price || 0)).toFixed(2)}
           </span>
           {product.isOnSale && product.salePrice && product.price && (
             <span className="text-sm text-gray-400 line-through">
               £{product.price.toFixed(2)}
             </span>
           )}
        </div>

        <div className="text-sm text-gray-600 line-clamp-4 min-h-[40px]">
          {product.description || 'Product description will appear here...'}
        </div>

        {/* Stock Status */}
        <div>
           {isOutOfStock ? (
              <span className="text-red-600 font-bold text-sm">Out of Stock</span>
           ) : (
              <span className={`text-sm ${lowStock ? 'text-orange-600 font-medium' : 'text-green-600'}`}>
                 {lowStock ? `Only ${stock} left in stock` : 'In Stock'}
              </span>
           )}
        </div>

        {/* Colors */}
        {(product.colors && product.colors.length > 0) && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Colors</p>
            <div className="flex flex-wrap gap-2">
              {product.colors.map(c => (
                 <div 
                    key={c} 
                    className="w-6 h-6 rounded-full border border-gray-200 shadow-sm" 
                    style={{backgroundColor: c.toLowerCase().includes('/') ? c.split('/')[0].toLowerCase() : c.toLowerCase().replace(' ', '')}} 
                    title={c}
                 ></div>
              ))}
            </div>
          </div>
        )}

        {/* Sizes */}
        {(product.sizes && product.sizes.length > 0) && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Sizes</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map(s => (
                 <span key={s} className="px-2 py-1 border rounded text-xs text-gray-600 bg-gray-50 uppercase">{s}</span>
              ))}
            </div>
          </div>
        )}

        <button className="w-full bg-brand-green text-white py-2 rounded font-medium opacity-50 cursor-not-allowed">
           Add to Cart
        </button>
      </div>
    </div>
  );
};