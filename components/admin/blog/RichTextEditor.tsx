import React, { useCallback, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { marked } from 'marked';
import TurndownService from 'turndown';
import { api } from '../../../lib/db';
import { useToast } from '../../../context/ToastContext';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced'
});

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isUpdatingRef = useRef(false);

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
          class: 'rounded-xl shadow-md my-4 max-w-full',
        },
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[500px] p-4',
      },
    },
    onUpdate: ({ editor }) => {
      isUpdatingRef.current = true;
      const html = editor.getHTML();
      const markdown = turndownService.turndown(html);
      onChange(markdown);
      isUpdatingRef.current = false;
    },
  });

  // Sync value changes from parent (only if not currently typing)
  useEffect(() => {
    if (editor && !isUpdatingRef.current) {
        // Simple check to prevent loop: if markdown roughly matches, skip
        // Note: This is imperfect because md->html->md is lossy, 
        // but prevents jarring cursor jumps on remote updates.
        // Ideally we only setContent on initial load.
        
        // Only set content if editor is empty to avoid overwriting work in progress loop
        if (editor.isEmpty && value) {
             const html = marked.parse(value) as string;
             editor.commands.setContent(html);
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

  if (!editor) {
    return null;
  }

  const ToolbarBtn = ({ onClick, isActive = false, children, title }: any) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg text-sm font-bold transition-all ${
        isActive 
          ? 'bg-brand-green text-white shadow-sm' 
          : 'text-slate-500 hover:bg-slate-200 hover:text-slate-900'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-slate-200 rounded-xl bg-white flex flex-col overflow-hidden h-[600px]">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
        <span className="text-[10px] font-black text-brand-green uppercase mr-2 tracking-wider bg-brand-light/50 px-2 py-1 rounded">Rich Text</span>
        <div className="w-px h-5 bg-slate-200 mx-1"></div>
        
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold"
        >
          B
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic"
        >
          I
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Strike"
        >
          S
        </ToolbarBtn>

        <div className="w-px h-5 bg-slate-200 mx-1"></div>

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          H2
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          H3
        </ToolbarBtn>

        <div className="w-px h-5 bg-slate-200 mx-1"></div>

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          • List
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Ordered List"
        >
          1. List
        </ToolbarBtn>
        
        <div className="w-px h-5 bg-slate-200 mx-1"></div>

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Quote"
        >
          ""
        </ToolbarBtn>

        <div className="w-px h-5 bg-slate-200 mx-1"></div>

        <ToolbarBtn onClick={setLink} isActive={editor.isActive('link')} title="Link">
          Link
        </ToolbarBtn>
        <ToolbarBtn onClick={() => fileInputRef.current?.click()} title="Image">
          Image
        </ToolbarBtn>
        
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={addImage}
        />
      </div>

      <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
         <EditorContent editor={editor} />
      </div>
      
      {placeholder && editor.isEmpty && (
          <div className="absolute top-16 left-4 text-slate-300 pointer-events-none text-sm font-light">
             {placeholder}
          </div>
      )}
    </div>
  );
};