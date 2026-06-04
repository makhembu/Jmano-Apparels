import React, { useState } from 'react';
import { ImageEditorModal } from '../ImageEditorModal';

interface VisualsFormProps {
    images: string[];
    isUploading: boolean;
    onUpload: (file: File) => void;
    onUpdateUrls: (urls: string[]) => void;
    onEditSave: (blob: Blob, index: number) => void;
}

export const VisualsForm: React.FC<VisualsFormProps> = ({ images, isUploading, onUpload, onUpdateUrls, onEditSave }) => {
    const [newImageUrl, setNewImageUrl] = useState('');
    const [editingImage, setEditingImage] = useState<{ src: string, index: number } | null>(null);

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
            {editingImage && (
                <ImageEditorModal
                    src={editingImage.src}
                    onClose={() => setEditingImage(null)}
                    onSave={(blob) => {
                        onEditSave(blob, editingImage.index);
                        setEditingImage(null);
                    }}
                />
            )}
            <div className="flex justify-between items-center border-b border-slate-50 pb-4 mb-6">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Visual Gallery</h2>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded">Max 5MB per image</span>
                    <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded font-medium">1:1 ratio recommended</span>
                </div>
            </div>
            <div className="space-y-6">
                {images && images.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                        {images.map((img, idx) => (
                            <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                                <img src={img} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button type="button" onClick={() => setEditingImage({ src: img, index: idx })} className="bg-white/20 text-white p-2 rounded-full hover:bg-white/30" title="Edit Image">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    </button>
                                    <button type="button" onClick={() => removeImage(idx)} className="bg-red-500/80 text-white p-2 rounded-full hover:bg-red-500" title="Remove Image">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
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