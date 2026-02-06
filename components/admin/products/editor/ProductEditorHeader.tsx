import React from 'react';
import { Button } from '../../../ui/Button';
import { Product } from '../../../../types';

interface ProductEditorHeaderProps {
    product: Partial<Product>;
    isNew: boolean;
    onSave: () => void;
    isSaving: boolean;
    activeTab: 'overview' | 'settings';
    onTabChange: (tab: 'overview' | 'settings') => void;
}

export const ProductEditorHeader: React.FC<ProductEditorHeaderProps> = ({ product, isNew, onSave, isSaving, activeTab, onTabChange }) => {
    return (
        <div className="sticky top-[-1rem] md:top-[-2rem] z-30 bg-gray-100/95 backdrop-blur-md border-b border-slate-200 -mx-4 md:-mx-8 px-4 md:px-8 py-4 mb-8 shadow-sm">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    {product.images?.[0] && (
                        <img src={product.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover border border-slate-200 shadow-sm" />
                    )}
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold font-serif text-slate-900">{isNew ? 'New Piece' : product.title}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${product.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                {product.isPublished ? 'Live' : 'Draft'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{isNew ? 'Unsaved' : `ID: ${product.id?.slice(0, 8)}`}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    {!isNew && (
                        <a href={`/#/product/${product.slug || product.id}`} target="_blank" rel="noreferrer">
                            <Button variant="outline" className="h-10 bg-white">View in Shop</Button>
                        </a>
                    )}
                    <Button id="btn-save-settings" onClick={onSave} isLoading={isSaving} className="h-10 shadow-lg shadow-brand-green/20 px-6">
                        {isNew ? 'Publish Product' : 'Save Changes'}
                    </Button>
                </div>
            </div>
            {!isNew && (
                <div className="max-w-7xl mx-auto mt-6 flex gap-6 border-b border-slate-200 px-1">
                    <button
                        onClick={() => onTabChange('overview')}
                        className={`pb-3 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'overview' ? 'border-b-2 border-brand-green text-brand-green' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => onTabChange('settings')}
                        className={`pb-3 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'settings' ? 'border-b-2 border-brand-green text-brand-green' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        Edit Settings
                    </button>
                </div>
            )}
        </div>
    );
};
