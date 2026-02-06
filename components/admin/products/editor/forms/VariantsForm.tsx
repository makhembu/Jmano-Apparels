import React, { useState, useEffect } from 'react';

interface VariantsFormProps {
    sizes: string[];
    colors: string[];
    onArrayUpdate: (field: 'sizes' | 'colors', value: string[]) => void;
}

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
                        className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50"
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
                        className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50"
                        placeholder="Red, Blue, Forest Green"
                    />
                    <div className="flex flex-wrap gap-2 mt-3">
                        {colors?.map(c => <span key={c} className="px-2 py-1 bg-gray-100 text-xs rounded border border-gray-200">{c}</span>)}
                    </div>
                </div>
            </div>
        </div>
    );
};
