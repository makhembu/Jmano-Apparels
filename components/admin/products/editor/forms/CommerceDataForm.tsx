import React from 'react';
import { Product } from '../../../../../types';
import { Switch } from '../../../../ui/Switch';

interface CommerceDataFormProps {
    formData: Partial<Product>;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSwitchChange: (name: string, val: boolean) => void;
}

export const CommerceDataForm: React.FC<CommerceDataFormProps> = ({ formData, onChange, onSwitchChange }) => (
    <div className="bg-white shadow-xl shadow-slate-200/50 rounded-2xl p-6 md:p-8 border border-slate-200">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 border-b border-slate-50 pb-4">Commerce Data</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Regular Price (£)</label>
                    <input type="number" step="0.01" name="price" value={formData.price} onChange={onChange} className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 font-bold" />
                </div>
                <div className="p-4 bg-brand-light/10 rounded-xl border border-brand-green/10">
                    <Switch
                        label="On Sale"
                        checked={!!formData.isOnSale}
                        onChange={(val) => onSwitchChange('isOnSale', val)}
                        className="mb-2 border-0 bg-transparent p-0 hover:shadow-none"
                    />
                    {formData.isOnSale && (
                        <input type="number" step="0.01" name="salePrice" value={formData.salePrice || ''} onChange={onChange} placeholder="Sale Price £" className="w-full border border-slate-200 rounded-lg p-2 bg-white text-sm mt-2" />
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">SKU (Opt)</label>
                        <input type="text" name="sku" value={formData.sku || ''} onChange={onChange} className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 text-xs font-mono" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Weight (kg)</label>
                        <input type="number" step="0.01" name="weight" value={formData.weight} onChange={onChange} className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Stock Level</label>
                        <input type="number" name="stockQuantity" value={formData.stockQuantity} onChange={onChange} className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 font-bold" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Low Alert</label>
                        <input type="number" name="lowStockThreshold" value={formData.lowStockThreshold} onChange={onChange} className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50" />
                    </div>
                </div>
            </div>
        </div>
    </div>
);
