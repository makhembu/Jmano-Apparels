import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { api } from '../../../lib/db';
import { useToast } from '../../../context/ToastContext';
import { cn } from '../../../lib/utils';
import { Button } from '../../ui/Button';
import { MediaPicker } from '../../ui/MediaPicker';
import { compressVideo, shouldCompress } from '../../../lib/video-compress';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isUpdatingRef = useRef(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-brand-green underline cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-xl shadow-md my-6 max-w-full',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Type "/" for commands...',
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[500px] p-8 pb-32',
      },
    },
    onUpdate: ({ editor }) => {
      isUpdatingRef.current = true;
      const html = editor.getHTML();
      onChange(html);
      isUpdatingRef.current = false;
    },
  });

  useEffect(() => {
    if (editor && !isUpdatingRef.current && value) {
        if (editor.getHTML() !== value) {
             editor.commands.setContent(value);
        }
    }
  }, [value, editor]);

  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image too large (max 5MB)', 'error');
      return;
    }

    try {
      showToast('Uploading image...', 'info');
      const url = await api.uploadImage(file);
      editor?.chain().focus().setImage({ src: url }).run();

      showToast('Image inserted', 'success');
    } catch (error) {
      showToast('Failed to upload image', 'error');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [editor, showToast]);

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({ onClick, isActive, children, title }: any) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "p-2 rounded-lg text-sm font-bold transition-all",
        isActive 
          ? "bg-brand-green text-white shadow-md" 
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-slate-200 rounded-xl bg-white flex flex-col overflow-hidden h-[700px] relative">
      <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={addImage}
      />

      {/* FIXED TOOLBAR */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-200 bg-slate-50 sticky top-0 z-20">
        <span className="text-[10px] font-black text-brand-green uppercase mr-2 tracking-wider bg-brand-light/50 px-2 py-1 rounded">Rich Text</span>
        
        <div className="w-px h-5 bg-slate-200 mx-1"></div>

        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold">
           <strong className="font-serif">B</strong>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic">
           <em className="font-serif">I</em>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strike">
           <s>S</s>
        </ToolbarButton>

        <div className="w-px h-5 bg-slate-200 mx-1"></div>

        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Heading 2">
           H2
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="Heading 3">
           H3
        </ToolbarButton>

        <div className="w-px h-5 bg-slate-200 mx-1"></div>

        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List">
           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Numbered List">
           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>
        </ToolbarButton>

        <div className="w-px h-5 bg-slate-200 mx-1"></div>

        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Quote">
           ""
        </ToolbarButton>
        <ToolbarButton onClick={setLink} isActive={editor.isActive('link')} title="Link">
           Link
        </ToolbarButton>
        <ToolbarButton onClick={triggerImageUpload} isActive={false} title="Image">
           Img
        </ToolbarButton>
        <ToolbarButton onClick={() => setShowVideoModal(true)} isActive={false} title="Embed Video">
           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </ToolbarButton>

        <div className="flex-1"></div>
        <button
          type="button"
          onClick={() => setShowHelp(true)}
          className="text-slate-400 hover:text-brand-green p-2 rounded-full hover:bg-brand-light/30 transition-colors"
          title="Editor Help"
        >
           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </button>
      </div>

      {/* Floating Menus */}
      {editor && (
        <BubbleMenu className="bg-white shadow-xl border border-slate-200 rounded-xl flex overflow-hidden divide-x divide-slate-100 p-1" tippyOptions={{ duration: 100 }} editor={editor}>
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')}>B</ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')}>I</ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')}>S</ToolbarButton>
          <ToolbarButton onClick={setLink} isActive={editor.isActive('link')}>Link</ToolbarButton>
        </BubbleMenu>
      )}

      <div className="flex-1 overflow-y-auto bg-white custom-scrollbar cursor-text" onClick={() => editor?.commands.focus()}>
         <EditorContent editor={editor} />
      </div>

      {/* VIDEO EMBED MODAL */}
      {showVideoModal && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center p-8 animate-fade-in">
           <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl p-8 max-w-md w-full relative">
              <button onClick={() => { setShowVideoModal(false); setVideoUrl(''); }} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900">
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <h3 className="text-xl font-bold font-serif text-brand-dark mb-4">Embed Video</h3>
              <div className="space-y-3">
                 <p className="text-sm text-slate-600">Paste a URL, upload, or browse media:</p>
                 <textarea
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=... or <iframe src=...></iframe>"
                    className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 text-slate-900 text-sm focus:ring-2 focus:ring-brand-green/10 outline-none h-20 font-mono text-xs"
                 />
                 <div className="flex gap-2">
                    <button type="button" onClick={() => setShowMediaPicker(true)} className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl p-2.5 text-[10px] font-bold text-slate-500 hover:border-brand-green/50 hover:text-brand-green hover:bg-slate-50 transition-colors">
                       <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                       Browse Media
                    </button>
                    <button type="button" onClick={() => videoFileInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl p-2.5 text-[10px] font-bold text-slate-500 hover:border-brand-green/50 hover:text-brand-green hover:bg-slate-50 transition-colors">
                       <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                       Upload New
                    </button>
                 </div>
              </div>
              <input type="file" ref={videoFileInputRef} accept="video/*" className="hidden" onChange={async (e) => {
                 const file = e.target.files?.[0];
                 if (!file) return;
                 if (file.size > 100 * 1024 * 1024) { showToast('Video too large (max 100MB)', 'error'); return; }
                 try {
                    let fileToUpload = file;
                    if (shouldCompress(file)) {
                       showToast('Compressing video...', 'info');
                       fileToUpload = await compressVideo(file);
                    }
                    showToast('Uploading video...', 'info');
                    const url = await api.uploadVideo(fileToUpload);
                    const iframeHtml = `<div class=\"video-responsive\"><video src=\"${url}\" controls preload=\"metadata\" class=\"w-full h-full\"></video></div>`;
                    editor?.chain().focus().insertContent(iframeHtml).run();
                    setShowVideoModal(false);
                    setVideoUrl('');
                    showToast('Video embedded', 'success');
                 } catch (err: any) { showToast(err.message || 'Upload failed', 'error'); }
              }} />
              <div className="mt-6 pt-6 border-t border-slate-100 flex justify-end gap-3">
                 <Button onClick={() => { setShowVideoModal(false); setVideoUrl(''); }} variant="ghost" size="sm">Cancel</Button>
                 <Button onClick={() => {
                    if (!videoUrl.trim()) return;
                    const iframeHtml = videoUrl.trim().startsWith('<iframe')
                       ? videoUrl.trim()
                       : `<div class=\"video-responsive\"><iframe src=\"${videoUrl.trim()}\" title=\"Embedded video\" loading=\"lazy\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" allowFullScreen></iframe></div>`;
                    editor?.chain().focus().insertContent(iframeHtml).run();
                    setShowVideoModal(false);
                    setVideoUrl('');
                    showToast('Video embedded', 'success');
                 }} size="sm">Embed</Button>
              </div>

              {showMediaPicker && (
                 <MediaPicker onSelect={(url) => {
                    const iframeHtml = `<div class=\"video-responsive\"><video src=\"${url}\" controls preload=\"metadata\" class=\"w-full h-full\"></video></div>`;
                    editor?.chain().focus().insertContent(iframeHtml).run();
                    setShowVideoModal(false);
                    setVideoUrl('');
                    showToast('Video embedded', 'success');
                 }} onClose={() => setShowMediaPicker(false)} />
              )}
           </div>
        </div>
      )}

      {/* HELP MODAL */}
      {showHelp && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center p-8 animate-fade-in">
           <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl p-8 max-w-md w-full relative">
              <button onClick={() => setShowHelp(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900">
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <h3 className="text-xl font-bold font-serif text-brand-dark mb-4">Editor Guide</h3>
              <div className="space-y-3 text-sm text-slate-600">
                 <p><strong className="text-slate-900">Formatting:</strong> Select text to see the floating menu or use the top toolbar.</p>
                 <p><strong className="text-slate-900">Shortcuts:</strong></p>
                 <ul className="list-disc pl-5 space-y-1">
                    <li><code className="bg-slate-100 px-1 rounded">Cmd+B</code> for Bold</li>
                    <li><code className="bg-slate-100 px-1 rounded">Cmd+I</code> for Italic</li>
                    <li><code className="bg-slate-100 px-1 rounded">Cmd+K</code> to add Link</li>
                 </ul>
                 <p><strong className="text-slate-900">Blocks:</strong> Start a new line with:</p>
                 <ul className="list-disc pl-5 space-y-1">
                    <li><code className="bg-slate-100 px-1 rounded"># </code> for Heading 1</li>
                    <li><code className="bg-slate-100 px-1 rounded">## </code> for Heading 2</li>
                    <li><code className="bg-slate-100 px-1 rounded">- </code> for Bullet List</li>
                    <li><code className="bg-slate-100 px-1 rounded">1. </code> for Numbered List</li>
                    <li><code className="bg-slate-100 px-1 rounded">&gt; </code> for Quote</li>
                 </ul>
                 <p><strong className="text-slate-900">Video:</strong> Click the play button in the toolbar to embed a video from YouTube, Vimeo, or any platform.</p>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                 <Button onClick={() => setShowHelp(false)} size="sm">Got it</Button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};