import React, { useRef, useState } from 'react';
import { Product } from '../../../types';
import { api } from '../../../lib/db';
import { useToast } from '../../../context/ToastContext';

interface TiptapEditorProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    products: Product[];
}

const ToolbarButton: React.FC<{ onClick: (e: React.MouseEvent) => void, title: string, children: React.ReactNode, disabled?: boolean }> = ({ onClick, title, children, disabled }) => (
    <button
        type="button"
        onClick={onClick}
        title={title}
        disabled={disabled}
        className="p-2 rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors text-xs font-bold disabled:opacity-50 disabled:cursor-wait"
    >
        {children}
    </button>
);

export const TiptapEditor: React.FC<TiptapEditorProps> = ({ value, onChange, placeholder, products }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const { showToast } = useToast();

    const applyMarkdown = (syntaxStart: string, syntaxEnd: string = syntaxStart) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        
        const newText = `${textarea.value.substring(0, start)}${syntaxStart}${selectedText}${syntaxEnd}${textarea.value.substring(end)}`;
        
        onChange(newText);
        
        setTimeout(() => {
            textarea.focus();
            if (selectedText) {
                textarea.setSelectionRange(start + syntaxStart.length, end + syntaxStart.length);
            } else {
                textarea.setSelectionRange(start + syntaxStart.length, start + syntaxStart.length);
            }
        }, 0);
    };

    const applyLink = () => {
        const url = window.prompt("Enter URL:", "https://");
        if (url) {
            applyMarkdown(`[`, `](${url})`);
        }
    };
    
    const triggerImageUpload = () => {
        fileInputRef.current?.click();
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            showToast('Image file too large (max 5MB)', 'error');
            return;
        }

        setIsUploading(true);
        try {
            const publicUrl = await api.uploadImage(file);
            const markdownImage = `\n![Alt text](${publicUrl})\n`;
            
            const textarea = textareaRef.current;
            if (!textarea) return;

            const start = textarea.selectionStart;
            const newText = `${textarea.value.substring(0, start)}${markdownImage}${textarea.value.substring(start)}`;
            
            onChange(newText);
            showToast('Image uploaded and inserted!', 'success');

        } catch (error: any) {
            showToast(error.message || 'Image upload failed', 'error');
        } finally {
            setIsUploading(false);
            if (e.target) e.target.value = '';
        }
    };

    const applyHeading = (level: number) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const lineStart = textarea.value.lastIndexOf('\n', start - 1) + 1;
        const prefix = '#'.repeat(level) + ' ';

        const newText = `${textarea.value.substring(0, lineStart)}${prefix}${textarea.value.substring(lineStart)}`;
        onChange(newText);
    };

    const applyList = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const lineStart = textarea.value.lastIndexOf('\n', start - 1) + 1;

        const newText = `${textarea.value.substring(0, lineStart)}- ${textarea.value.substring(lineStart)}`;
        onChange(newText);
    }

    const handleEmbedProduct = (productId: string) => {
        const embedCode = `\n@[product:${productId}]\n`;
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const newText = `${textarea.value.substring(0, start)}${embedCode}${textarea.value.substring(start)}`;
        onChange(newText);
        setIsProductModalOpen(false);
    };

    return (
        <div className="border border-slate-200 rounded-xl bg-white flex flex-col">
            <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-200 bg-slate-50 rounded-t-xl sticky top-0 z-10">
                <ToolbarButton title="Heading 1" onClick={() => applyHeading(1)}>H1</ToolbarButton>
                <ToolbarButton title="Heading 2" onClick={() => applyHeading(2)}>H2</ToolbarButton>
                <ToolbarButton title="Heading 3" onClick={() => applyHeading(3)}>H3</ToolbarButton>
                <div className="w-px h-5 bg-slate-200 mx-1"></div>
                <ToolbarButton title="Bold" onClick={() => applyMarkdown('**')}><strong>B</strong></ToolbarButton>
                <ToolbarButton title="Italic" onClick={() => applyMarkdown('*')}><em>I</em></ToolbarButton>
                <div className="w-px h-5 bg-slate-200 mx-1"></div>
                <ToolbarButton title="Link" onClick={applyLink}>Link</ToolbarButton>
                <ToolbarButton title="Image" onClick={triggerImageUpload} disabled={isUploading}>
                    {isUploading ? (
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                            <span>Uploading</span>
                        </div>
                    ) : (
                        'Image'
                    )}
                </ToolbarButton>
                <ToolbarButton title="Bullet List" onClick={applyList}>List</ToolbarButton>
                <div className="w-px h-5 bg-slate-200 mx-1"></div>
                <ToolbarButton title="Embed Product" onClick={() => setIsProductModalOpen(true)}>Product</ToolbarButton>
            </div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
            />
            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full h-96 p-4 font-mono text-sm text-slate-800 leading-relaxed resize-y focus:outline-none bg-white rounded-b-xl custom-scrollbar"
                spellCheck="false"
            />

            {/* Product Embed Modal */}
            {isProductModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsProductModalOpen(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold p-4 border-b">Embed a Product</h3>
                        <div className="overflow-y-auto p-4 space-y-2">
                            {products.map(p => (
                                <button key={p.id} onClick={() => handleEmbedProduct(p.id)} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 text-left">
                                    <img src={p.images[0]} alt={p.title} className="w-12 h-12 rounded-md object-cover" />
                                    <span className="font-bold text-sm text-slate-800">{p.title}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};