import React, { useState } from 'react';

interface VisualsFormProps {
    images: string[];
    isUploading: boolean;
    onUpload: (file: File) => void;
    onUpdateUrls: (urls: string[]) => void;
}

export const VisualsForm: React.FC<VisualsFormProps> = ({ images, isUploading, onUpload, onUpdateUrls }) => {
    const [newImageUrl, setNewImageUrl] = useState('');

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        onUpload(e.target.files[0]);
    };

    const addImageUrl = () => {
        if (!newImageUrl) return;
        onUpdateUrls([...images, newImageUrl]);
        setNewImageUrl('');
    };

    const removeImage = (index: number) => {
        onUpdateUrls(images.filter((_, i) => i !== index));
    };

    return (
        <div className="bg-white shadow-xl shadow-slate-200/50 rounded-2xl p-6 md:p-8 border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4 mb-6">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Visual Gallery</h2>
                <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded">Max 5MB per image</span>
            </div>
            <div className="space-y-6">
                {images && images.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                        {images.map((img, idx) => (
                            <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                                <img src={img} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                                <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                                {idx === 0 && <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] font-bold text-center py-1">PRIMARY</div>}
                            </div>
                        ))}
                    </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center hover:bg-slate-50 transition-colors relative cursor-pointer text-center">
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" disabled={isUploading} />
                        {isUploading ? (
                            <div className="animate-spin h-6 w-6 border-2 border-brand-green rounded-full border-t-transparent"></div>
                        ) : (
                            <>
                                <svg className="w-6 h-6 text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                <span className="text-xs font-bold text-brand-green uppercase tracking-wide">Upload File</span>
                            </>
                        )}
                    </div>
                    <div className="flex flex-col justify-center gap-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Or Add via URL</label>
                        <div className="flex gap-2">
                            <input type="text" value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} placeholder="https://..." className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-xs" />
                            <button type="button" onClick={addImageUrl} className="bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg text-slate-600">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
