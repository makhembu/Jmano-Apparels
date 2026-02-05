
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { Button } from '../../components/ui/Button';
import { api } from '../../lib/db';
import { useToast } from '../../context/ToastContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';

export const AdminProducts: React.FC = () => {
  const { products, categories, refreshData } = useShop();
  const { showToast } = useToast();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Toggle single item selection
  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Toggle all items selection
  const toggleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map(p => p.id));
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await api.adminDeleteProduct(id);
        await refreshData();
        showToast("Product deleted", 'success');
      } catch (e) {
        showToast("Failed to delete", 'error');
      }
    }
  };

  // --- Bulk Action Handlers ---

  const handleBulkStatusUpdate = async (published: boolean) => {
    setIsBulkProcessing(true);
    try {
      await api.adminBulkUpdateProducts(selectedIds, { isPublished: published });
      showToast(`Updated ${selectedIds.length} products to ${published ? 'Published' : 'Draft'}`, 'success');
      setSelectedIds([]);
      await refreshData();
    } catch (e) {
      showToast("Bulk status update failed", 'error');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkCategoryUpdate = async (categoryKey: string) => {
    if (!categoryKey) return;
    setIsBulkProcessing(true);
    try {
      await api.adminBulkUpdateProducts(selectedIds, { categoryKey });
      showToast(`Moved ${selectedIds.length} products to new category`, 'success');
      setSelectedIds([]);
      await refreshData();
    } catch (e) {
      showToast("Bulk category move failed", 'error');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} products? This cannot be undone.`)) {
      setIsBulkProcessing(true);
      try {
        await api.adminBulkDeleteProducts(selectedIds);
        showToast(`Successfully deleted ${selectedIds.length} products`, 'success');
        setSelectedIds([]);
        await refreshData();
      } catch (e) {
        showToast("Bulk deletion failed", 'error');
      } finally {
        setIsBulkProcessing(false);
      }
    }
  };

  // Fix: Explicitly type component as React.FC to allow 'key' prop
  const MobileProductCard: React.FC<{ product: any }> = ({ product }) => {
    const category = categories.find(c => c.key === product.categoryKey);
    const isSelected = selectedIds.includes(product.id);
    
    return (
      <div className={`p-4 border rounded-xl mb-3 flex gap-4 ${isSelected ? 'bg-brand-light/20 border-brand-green' : 'bg-white border-slate-100 shadow-sm'}`}>
         <div className="flex flex-col justify-between items-center gap-2">
            <input 
              type="checkbox" 
              checked={isSelected}
              onChange={() => toggleSelection(product.id)}
              className="h-5 w-5 text-brand-green rounded border-slate-300 focus:ring-brand-green"
            />
            <div className="h-16 w-16 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
               <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
            </div>
         </div>
         <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-1">
               <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${category?.bgColorClass || 'bg-gray-100'} text-gray-700`}>
                  {category?.label || 'Uncategorized'}
               </span>
               <div className="flex gap-2">
                  <Link to={`/admin/products/${product.id}`} className="text-brand-green">
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </Link>
               </div>
            </div>
            <h3 className="font-bold text-slate-900 truncate mb-1">{product.title}</h3>
            <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
               <span>SKU: {product.sku || '-'}</span>
               <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
               <span>Stock: <strong className={(product.stockQuantity || 0) < 5 ? 'text-red-500' : 'text-slate-700'}>{product.stockQuantity || 0}</strong></span>
            </div>
            <div className="flex justify-between items-center">
               <span className="font-bold text-slate-900">£{product.price.toFixed(2)}</span>
               {product.isPublished ? (
                  <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">Live</span>
               ) : (
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Draft</span>
               )}
            </div>
         </div>
      </div>
    );
  };

  return (
    <div className="relative pb-24 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-900">Products</h1>
          <p className="text-sm text-slate-500">Manage your divine apparel collection.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
            <Link to="/admin/products/new" className="w-full sm:w-auto">
                <Button variant="primary" className="shadow-lg shadow-brand-green/20 w-full sm:w-auto">+ Add New Product</Button>
            </Link>
        </div>
      </div>
      
      {/* Selection Actions Header (Mobile) */}
      {selectedIds.length > 0 && isMobile && (
         <div className="mb-4 p-3 bg-brand-dark text-white rounded-xl flex justify-between items-center shadow-lg">
            <span className="text-xs font-bold">{selectedIds.length} Selected</span>
            <div className="flex gap-3">
               <button onClick={() => handleBulkStatusUpdate(true)} className="text-xs font-bold text-brand-green">Publish</button>
               <button onClick={() => handleBulkStatusUpdate(false)} className="text-xs font-bold text-slate-300">Draft</button>
               <button onClick={handleBulkDelete} className="text-xs font-bold text-red-400">Delete</button>
            </div>
         </div>
      )}

      {isMobile ? (
        // Mobile Card View
        <div className="space-y-1">
           {products.map(product => (
              <MobileProductCard key={product.id} product={product} />
           ))}
        </div>
      ) : (
        // Desktop Table View
        <div className="bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden sm:rounded-2xl overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left w-10">
                  <input 
                    type="checkbox" 
                    checked={products.length > 0 && selectedIds.length === products.length}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 text-brand-green rounded border-slate-300 focus:ring-brand-green"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Product</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Category</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Price</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {products.map(product => {
                const category = categories.find(c => c.key === product.categoryKey);
                const isSelected = selectedIds.includes(product.id);
                return (
                  <tr 
                    key={product.id} 
                    className={`transition-colors duration-150 ${isSelected ? 'bg-brand-light/20' : 'hover:bg-slate-50'}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => toggleSelection(product.id)}
                        className="h-4 w-4 text-brand-green rounded border-slate-300 focus:ring-brand-green"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-lg overflow-hidden border border-slate-100 bg-slate-50">
                          <img className="h-full w-full object-cover" src={product.images[0]} alt="" />
                        </div>
                        <div className="ml-4 overflow-hidden">
                          <div className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{product.title}</div>
                          <div className="text-[10px] text-slate-400 font-mono">ID: {product.id.slice(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 inline-flex text-[10px] font-black uppercase tracking-widest rounded-full ${category?.bgColorClass || 'bg-gray-100'} text-gray-800 border border-black/5`}>
                        {category?.label || product.categoryKey}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-500">
                      {product.sku || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-1.5">
                        {product.isPublished ? (
                          <span className="px-2 py-0.5 inline-flex text-[10px] font-bold rounded bg-green-50 text-green-700 border border-green-100">
                            Published
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 inline-flex text-[10px] font-bold rounded bg-slate-100 text-slate-600 border border-slate-200">
                            Draft
                          </span>
                        )}
                        {product.isOnSale && (
                          <span className="px-2 py-0.5 inline-flex text-[10px] font-bold rounded bg-brand-hope/20 text-brand-dark border border-brand-hope/30">
                            Sale
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-0.5 inline-flex text-xs font-black rounded ${
                        (product.stockQuantity || 0) < (product.lowStockThreshold || 5) 
                          ? 'bg-red-50 text-red-700 border border-red-100' 
                          : 'bg-green-50 text-green-700 border border-green-100'
                      }`}>
                        {product.stockQuantity || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-brand-dark">
                      £{product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <Link to={`/admin/products/${product.id}`} className="text-brand-green hover:text-brand-dark hover:underline font-bold">Manage</Link>
                      <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-700 text-xs">Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* --- BULK ACTIONS TOOLBAR (Desktop Only) --- */}
      {selectedIds.length > 0 && !isMobile && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-slide-in">
          <div className="bg-slate-900 text-white rounded-2xl shadow-2xl ring-1 ring-white/10 px-8 py-4 flex items-center gap-8 backdrop-blur-xl bg-opacity-95">
             <div className="flex items-center gap-3 border-r border-white/10 pr-8">
                <span className="bg-brand-green text-white text-[10px] font-black h-6 w-6 rounded-full flex items-center justify-center">
                   {selectedIds.length}
                </span>
                <p className="text-xs font-bold uppercase tracking-widest text-white/70">Selected</p>
             </div>

             <div className="flex items-center gap-6">
                {/* Visibility Toggles */}
                <div className="flex flex-col gap-1">
                   <p className="text-[9px] font-black text-white/40 uppercase tracking-tighter">Visibility</p>
                   <div className="flex gap-2">
                      <button 
                        onClick={() => handleBulkStatusUpdate(true)}
                        disabled={isBulkProcessing}
                        className="text-[10px] font-black uppercase tracking-widest hover:text-brand-green transition-colors disabled:opacity-30"
                      >
                        Publish
                      </button>
                      <button 
                        onClick={() => handleBulkStatusUpdate(false)}
                        disabled={isBulkProcessing}
                        className="text-[10px] font-black uppercase tracking-widest hover:text-slate-400 transition-colors disabled:opacity-30"
                      >
                        Draft
                      </button>
                   </div>
                </div>

                {/* Category Move Dropdown */}
                <div className="flex flex-col gap-1">
                   <p className="text-[9px] font-black text-white/40 uppercase tracking-tighter">Move to</p>
                   <select 
                      disabled={isBulkProcessing}
                      onChange={(e) => handleBulkCategoryUpdate(e.target.value)}
                      className="bg-slate-800 border-none text-[10px] font-black uppercase tracking-widest rounded-lg h-7 px-2 focus:ring-1 focus:ring-brand-green outline-none"
                   >
                      <option value="">Choose...</option>
                      {categories.map(cat => (
                        <option key={cat.key} value={cat.key}>{cat.label}</option>
                      ))}
                   </select>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 border-l border-white/10 pl-8">
                   <button 
                     onClick={handleBulkDelete}
                     disabled={isBulkProcessing}
                     className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-500 transition-colors disabled:opacity-30"
                   >
                     Delete
                   </button>
                   <button 
                     onClick={() => setSelectedIds([])}
                     disabled={isBulkProcessing}
                     className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-all"
                     title="Cancel selection"
                   >
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                   </button>
                </div>
             </div>
             
             {isBulkProcessing && (
                <div className="absolute inset-0 bg-slate-900/80 rounded-2xl flex items-center justify-center animate-pulse">
                   <span className="text-[10px] font-black uppercase tracking-[0.3em]">Processing Batch...</span>
                </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};
