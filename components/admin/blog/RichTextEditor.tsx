import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { api } from '../../../lib/db';
import { useToast } from '../../../context/ToastContext';
import { cn } from '../../../lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isUpdatingRef = useRef(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      // We now save HTML directly, supporting the block editor structure
      const html = editor.getHTML();
      onChange(html);
      isUpdatingRef.current = false;
    },
  });

  // Sync value changes from parent (only if not currently typing)
  useEffect(() => {
    if (editor && !isUpdatingRef.current && value) {
        // Compare current content to avoid cursor jumps
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
      setIsMenuOpen(false); // Close menu after action
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

  // --- Menu Components ---

  const MenuButton = ({ onClick, isActive, children }: any) => (
    <button
      onClick={onClick}
      className={cn(
        "p-2 hover:bg-slate-100 rounded transition-colors text-slate-600",
        isActive ? "text-brand-green bg-brand-light/20" : ""
      )}
      type="button"
    >
      {children}
    </button>
  );

  const BlockOption = ({ onClick, icon, label, desc }: any) => (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full p-2 hover:bg-slate-50 rounded-lg transition-colors text-left group"
      type="button"
    >
      <div className="w-10 h-10 border border-slate-200 rounded-lg flex items-center justify-center bg-white text-slate-500 group-hover:border-brand-green group-hover:text-brand-green transition-colors shadow-sm">
        {icon}
      </div>
      <div>
        <span className="block text-sm font-bold text-slate-700 group-hover:text-brand-dark">{label}</span>
        <span className="block text-[10px] text-slate-400">{desc}</span>
      </div>
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

      {/* 1. BUBBLE MENU (Text Formatting on Selection) */}
      {editor && (
        <BubbleMenu 
          className="bg-white shadow-xl border border-slate-200 rounded-xl flex overflow-hidden divide-x divide-slate-100 p-1" 
          tippyOptions={{ duration: 100 }} 
          editor={editor}
        >
          <MenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12h8a4 4 0 100-8H6v8zm0 0h8a4 4 0 110 8H6v-8z" /></svg>
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>
          </MenuButton>
          <MenuButton
            onClick={setLink}
            isActive={editor.isActive('link')}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
          </MenuButton>
          <div className="flex items-center">
             <MenuButton 
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive('heading', { level: 2 })}
             >
                <span className="font-serif font-bold text-xs">H2</span>
             </MenuButton>
             <MenuButton 
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                isActive={editor.isActive('heading', { level: 3 })}
             >
                <span className="font-serif font-bold text-xs">H3</span>
             </MenuButton>
          </div>
        </BubbleMenu>
      )}

      {/* 2. FLOATING MENU (Block Insertion on Empty Lines) */}
      {editor && (
        <FloatingMenu 
          className="relative" 
          tippyOptions={{ duration: 100, placement: 'left-start', offset: [0, 20] }} 
          editor={editor}
          shouldShow={({ state }) => {
            const { selection } = state;
            const { $from } = selection;
            // Only show on empty paragraphs
            return selection.empty && $from.parent.type.name === 'paragraph' && $from.parent.content.size === 0;
          }}
        >
          <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`w-8 h-8 rounded-full border border-slate-200 shadow-sm flex items-center justify-center transition-all ${isMenuOpen ? 'bg-brand-dark text-white rotate-45 border-brand-dark' : 'bg-white text-slate-400 hover:text-brand-green hover:border-brand-green'}`}
              >
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                  <div className="absolute top-10 left-0 w-64 bg-white rounded-xl shadow-2xl border border-slate-100 p-2 z-50 flex flex-col gap-1 animate-fade-in max-h-80 overflow-y-auto">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-2 py-1">Basic Blocks</p>
                      
                      <BlockOption 
                        label="Heading 2" 
                        desc="Big section heading"
                        icon={<span className="font-serif font-bold text-lg">H2</span>}
                        onClick={() => {
                            editor.chain().focus().toggleHeading({ level: 2 }).run();
                            setIsMenuOpen(false);
                        }}
                      />
                      <BlockOption 
                        label="Heading 3" 
                        desc="Subsection heading"
                        icon={<span className="font-serif font-bold text-base">H3</span>}
                        onClick={() => {
                            editor.chain().focus().toggleHeading({ level: 3 }).run();
                            setIsMenuOpen(false);
                        }}
                      />
                      <BlockOption 
                        label="Bullet List" 
                        desc="Simple bullet points"
                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>}
                        onClick={() => {
                            editor.chain().focus().toggleBulletList().run();
                            setIsMenuOpen(false);
                        }}
                      />
                      <BlockOption 
                        label="Numbered List" 
                        desc="Ordered list"
                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>}
                        onClick={() => {
                            editor.chain().focus().toggleOrderedList().run();
                            setIsMenuOpen(false);
                        }}
                      />
                      
                      <div className="h-px bg-slate-100 my-1"></div>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-2 py-1">Media</p>
                      
                      <BlockOption 
                        label="Image" 
                        desc="Upload or embed"
                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                        onClick={triggerImageUpload}
                      />
                      <BlockOption 
                        label="Quote" 
                        desc="Capture a quote"
                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>}
                        onClick={() => {
                            editor.chain().focus().toggleBlockquote().run();
                            setIsMenuOpen(false);
                        }}
                      />
                  </div>
              )}
          </div>
        </FloatingMenu>
      )}

      <div className="flex-1 overflow-y-auto bg-white custom-scrollbar cursor-text" onClick={() => editor?.commands.focus()}>
         <EditorContent editor={editor} />
      </div>
    </div>
  );
};