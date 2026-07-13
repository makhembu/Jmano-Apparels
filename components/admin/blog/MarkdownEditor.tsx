import React, { useRef, useState } from 'react';
import { Product } from '../../../types';
import { api } from '../../../lib/db';
import { useToast } from '../../../context/ToastContext';
import { getVideoEmbedUrl } from '../../../lib/video-utils';
import { MediaPicker } from '../../ui/MediaPicker';

interface MarkdownEditorProps {
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

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ value, onChange, placeholder, products }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [videoInput, setVideoInput] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const videoFileInputRef = useRef<HTMLInputElement>(null);
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
        <div className="border border-slate-200 rounded-xl bg-white flex flex-col h-[600px]">
            <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-200 bg-slate-50 rounded-t-xl sticky top-0 z-10">
                <span className="text-[10px] font-black text-slate-400 uppercase mr-2 tracking-wider">Markdown Mode</span>
                <div className="w-px h-5 bg-slate-200 mx-1"></div>
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
                <ToolbarButton title="Embed Video" onClick={() => setIsVideoModalOpen(true)}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </ToolbarButton>
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
                className="w-full flex-1 p-4 font-mono text-sm text-slate-800 leading-relaxed resize-none focus:outline-none bg-white rounded-b-xl custom-scrollbar"
                spellCheck="false"
            />

            {isVideoModalOpen && (
                <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4 animate-fade-in" onClick={() => { setIsVideoModalOpen(false); setVideoInput(''); }}>
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold p-0 pb-4 border-b">Embed Video</h3>
                        <p className="text-sm text-slate-600 mt-4 mb-3">Paste a URL, upload, or browse media:</p>
                        <textarea
                            value={videoInput}
                            onChange={(e) => setVideoInput(e.target.value)}
                            placeholder="https://youtube.com/watch?v=..."
                            className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 text-slate-900 text-xs focus:ring-2 focus:ring-brand-green/10 outline-none h-20 font-mono"
                        />
                        <div className="flex gap-2 mt-2">
                            <button type="button" onClick={() => setShowMediaPicker(true)} className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl p-2.5 text-[10px] font-bold text-slate-500 hover:border-brand-green/50 hover:text-brand-green hover:bg-slate-50 transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                Browse Media
                            </button>
                            <button type="button" onClick={() => videoFileInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl p-2.5 text-[10px] font-bold text-slate-500 hover:border-brand-green/50 hover:text-brand-green hover:bg-slate-50 transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                Upload New
                            </button>
                        </div>
                        <input type="file" ref={videoFileInputRef} accept="video/*" className="hidden" onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 100 * 1024 * 1024) { showToast('Video too large (max 100MB)', 'error'); return; }
                            try {
                                showToast('Uploading video...', 'info');
                                const url = await api.uploadVideo(file);
                                const embedCode = `\n<div class=\"video-responsive\"><video src=\"${url}\" controls preload=\"metadata\" class=\"w-full h-full\"></video></div>\n`;
                                const textarea = textareaRef.current;
                                if (textarea) {
                                    const start = textarea.selectionStart;
                                    const newText = `${textarea.value.substring(0, start)}${embedCode}${textarea.value.substring(start)}`;
                                    onChange(newText);
                                }
                                setIsVideoModalOpen(false);
                                setVideoInput('');
                                showToast('Video embedded', 'success');
                            } catch (err: any) { showToast(err.message || 'Upload failed', 'error'); }
                            if (e.target) e.target.value = '';
                        }} />
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => { setIsVideoModalOpen(false); setVideoInput(''); }} className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg">Cancel</button>
                            <button onClick={() => {
                                if (!videoInput.trim()) return;
                                let embedCode = '';
                                if (videoInput.trim().startsWith('<iframe')) {
                                    embedCode = `\n${videoInput.trim()}\n`;
                                } else {
                                    const embedUrl = getVideoEmbedUrl(videoInput.trim());
                                    if (embedUrl) {
                                        embedCode = `\n<div class=\"video-responsive\"><iframe src=\"${embedUrl}\" title=\"Embedded video\" loading=\"lazy\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" allowFullScreen></iframe></div>\n`;
                                    }
                                }
                                if (embedCode) {
                                    const textarea = textareaRef.current;
                                    if (textarea) {
                                        const start = textarea.selectionStart;
                                        const newText = `${textarea.value.substring(0, start)}${embedCode}${textarea.value.substring(start)}`;
                                        onChange(newText);
                                    }
                                    setIsVideoModalOpen(false);
                                    setVideoInput('');
                                    showToast('Video embedded', 'success');
                                } else {
                                    showToast('Invalid video URL', 'error');
                                }
                            }} className="px-4 py-2 text-sm font-bold bg-brand-green text-white rounded-lg hover:bg-brand-dark transition-colors">Embed</button>
                        </div>

                        {showMediaPicker && (
                            <MediaPicker onSelect={(url) => {
                                const embedCode = `\n<div class=\"video-responsive\"><video src=\"${url}\" controls preload=\"metadata\" class=\"w-full h-full\"></video></div>\n`;
                                const textarea = textareaRef.current;
                                if (textarea) {
                                    const start = textarea.selectionStart;
                                    const newText = `${textarea.value.substring(0, start)}${embedCode}${textarea.value.substring(start)}`;
                                    onChange(newText);
                                }
                                setIsVideoModalOpen(false);
                                setVideoInput('');
                                showToast('Video embedded', 'success');
                            }} onClose={() => setShowMediaPicker(false)} />
                        )}
                    </div>
                </div>
            )}

            {isProductModalOpen && (
                <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsProductModalOpen(false)}>
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