
import React, { useState, useEffect } from 'react';
import { getColorHex } from '../../../../../lib/utils';

interface VariantsFormProps {
    sizes: string[];
    colors: string[];
    onArrayUpdate: (field: 'sizes' | 'colors', value: string[]) => void;
}

const PRESET_COLORS = [
    'White', 'Black', 'Navy', 'Royal Blue', 
    'Forest Green', 'Kelly Green', 'Red', 'Maroon', 
    'Orange', 'Yellow', 'Gold', 'Purple', 
    'Pink', 'Grey', 'Tan', 'Cream'
];

export const VariantsForm: React.FC<VariantsFormProps> = ({ sizes, colors, onArrayUpdate }) => {
    const [sizesInput, setSizesInput] = useState('');
    const [colorsInput, setColorsInput] = useState('');

    useEffect(() => {
        setSizesInput(sizes.join(', '));
        setColorsInput(colors.join(', '));
    }, [sizes, colors]);

    const handleBlur = (field: 'sizes' | 'colors', value: string) => {
        const arr = value.split(',').map(s => s.trim()).filter(Boolean);
        onArrayUpdate(field, arr);
    };

    const addColor = (name: string) => {
        const current = colorsInput.split(',').map(s => s.trim()).filter(Boolean);
        if (!current.includes(name)) {
            const newColors = [...current, name];
            setColorsInput(newColors.join(', '));
            onArrayUpdate('colors', newColors);
        }
    };

    return (
        <div className="bg-white shadow-xl shadow-slate-200/50 rounded-2xl p-6 md:p-8 border border-slate-200">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 border-b border-slate-50 pb-4">Variants</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Sizes (Comma separated)</label>
                    <input
                        type="text"
                        value={sizesInput}
                        onChange={(e) => setSizesInput(e.target.value)}
                        onBlur={() => handleBlur('sizes', sizesInput)}
                        className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 text-sm"
                        placeholder="S, M, L, XL"
                    />
                    <div className="flex flex-wrap gap-2 mt-3">
                        {sizes?.map(s => <span key={s} className="px-2 py-1 bg-gray-100 text-xs rounded border border-gray-200">{s}</span>)}
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Colors (Comma separated)</label>
                    <input
                        type="text"
                        value={colorsInput}
                        onChange={(e) => setColorsInput(e.target.value)}
                        onBlur={() => handleBlur('colors', colorsInput)}
                        className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 text-sm"
                        placeholder="Red, Blue, Forest Green"
                    />
                    
                    <div className="mt-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Quick Add</span>
                        <div className="flex flex-wrap gap-2">
                            {PRESET_COLORS.map(c => {
                                const hex = getColorHex(c);
                                return (
                                    <button 
                                        key={c}
                                        type="button"
                                        onClick={() => addColor(c)}
                                        className="w-6 h-6 rounded-full border border-slate-200 shadow-sm hover:scale-110 transition-transform"
                                        style={{ backgroundColor: hex }}
                                        title={`Add ${c}`}
                                    ></button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                        {colors?.map(c => (
                             <div key={c} className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                                <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: getColorHex(c) }}></span>
                                <span className="text-xs text-slate-700">{c}</span>
                             </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
