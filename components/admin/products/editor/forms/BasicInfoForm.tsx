import React from 'react';
import { Product, Category } from '../../../../../types';
import { AiFieldActions } from '../../../../ui/AiFieldActions';

interface BasicInfoFormProps {
    formData: Partial<Product>;
    categories: Category[];
    isNew: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onAiApply?: (field: string, value: string) => void;
}

export const BasicInfoForm: React.FC<BasicInfoFormProps> = ({ formData, categories, isNew, onChange, onAiApply }) => (
    <div className="bg-white shadow-xl shadow-slate-200/50 rounded-2xl p-6 md:p-8 border border-slate-200">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 border-b border-slate-50 pb-4">Essential Information</h2>
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                        Product Name*
                        {onAiApply && (
                            <AiFieldActions
                                currentValue={formData.title}
                                context={`${formData.title || ''} ${formData.description || ''} ${formData.categoryKey || ''}`.trim() || 'Christian apparel product'}
                                generateType="product-title"
                                polishType="product-polish"
                                extraContext={`Generate a product name for Jambo Apparels, a Christian streetwear brand. Category: ${formData.categoryKey || 'apparel'}.`}
                                onApply={(text) => onAiApply('title', text)}
                                label="product name"
                            />
                        )}
                    </label>
                    <input type="text" name="title" value={formData.title} onChange={onChange} required className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-brand-green/10 outline-none transition-all" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Category*</label>
                    <select name="categoryKey" value={formData.categoryKey} onChange={onChange} required className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-brand-green/10 outline-none">
                        <option value="">Select...</option>
                        {categories.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">URL Slug</label>
                <input
                    type="text" name="slug" value={formData.slug || ''} onChange={onChange}
                    className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 text-slate-700 text-sm font-mono focus:ring-2 focus:ring-brand-green/10 outline-none"
                    placeholder="product-url-slug"
                />
                <p className="text-[10px] text-gray-400 mt-1">Leave empty to auto-generate from title. Controls the product URL.</p>
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                    Description
                    {onAiApply && (
                        <AiFieldActions
                            currentValue={formData.description}
                            context={formData.title || 'Christian apparel product'}
                            generateType="product-desc"
                            polishType="product-polish"
                            extraContext={`Write a product description for "${formData.title || 'Product'}", a Christian streetwear item by Jambo Apparels. Category: ${formData.categoryKey || 'apparel'}.`}
                            onApply={(text) => onAiApply('description', text)}
                            label="description"
                        />
                    )}
                </label>
                <textarea name="description" rows={5} value={formData.description} onChange={onChange} className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50" placeholder="Describe the material, fit, and spiritual inspiration..." />
            </div>
        </div>
    </div>
);
