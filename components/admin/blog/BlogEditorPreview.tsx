import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { api } from '../../../lib/db';
import { useToast } from '../../../context/ToastContext';
import { cn } from '../../../lib/utils';
import { Button } from '../../ui/Button';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

interface BlockMenuItem {
  icon: React.ReactNode;
  label: string;
  description: string;
  command: () => void;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isUpdatingRef = useRef(false);
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [blockMenuPosition, setBlockMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const blockMenuRef = useRef<HTMLDivElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
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
        placeholder: placeholder || 'Type "/" for commands or click "+" to add blocks...',
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

  // Close block menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (blockMenuRef.current && !blockMenuRef.current.contains(event.target as Node)) {
        setShowBlockMenu(false);
      }
    };

    if (showBlockMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showBlockMenu]);

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
      setShowBlockMenu(false);
      showToast('Image inserted', 'success');
    } catch (error) {
      showToast('Failed to upload image', 'error');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [editor, showToast]);

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
    setShowBlockMenu(false);
  };

  const openBlockMenu = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const containerRect = editorContainerRef.current?.getBoundingClientRect();

    if (containerRect) {
      setBlockMenuPosition({
        top: rect.bottom - containerRect.top + 8,
        left: rect.left - containerRect.left,
      });
      setShowBlockMenu(true);
    }
  }, []);

  const insertBlock = useCallback((command: () => void) => {
    command();
    setShowBlockMenu(false);
    editor?.commands.focus();
  }, [editor]);

  const blockMenuItems: BlockMenuItem[] = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      ),
      label: 'Paragraph',
      description: 'Start writing with plain text',
      command: () => editor?.chain().focus().setParagraph().run() || (() => {}),
    },
    {
      icon: <span className="text-lg font-bold">H1</span>,
      label: 'Heading 1',
      description: 'Big section heading',
      command: () => editor?.chain().focus().toggleHeading({ level: 1 }).run() || (() => {}),
    },
    {
      icon: <span className="text-base font-bold">H2</span>,
      label: 'Heading 2',
      description: 'Medium section heading',
      command: () => editor?.chain().focus().toggleHeading({ level: 2 }).run() || (() => {}),
    },
    {
      icon: <span className="text-sm font-bold">H3</span>,
      label: 'Heading 3',
      description: 'Small section heading',
      command: () => editor?.chain().focus().toggleHeading({ level: 3 }).run() || (() => {}),
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      ),
      label: 'Bullet List',
      description: 'Create a simple bullet list',
      command: () => editor?.chain().focus().toggleBulletList().run() || (() => {}),
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
        </svg>
      ),
      label: 'Numbered List',
      description: 'Create a list with numbering',
      command: () => editor?.chain().focus().toggleOrderedList().run() || (() => {}),
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      ),
      label: 'Quote',
      description: 'Capture a quote or citation',
      command: () => editor?.chain().focus().toggleBlockquote().run() || (() => {}),
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      label: 'Image',
      description: 'Upload an image from your device',
      command: () => triggerImageUpload(),
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      ),
      label: 'Divider',
      description: 'Add a horizontal line',
      command: () => editor?.chain().focus().setHorizontalRule().run() || (() => {}),
    },
  ];

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({ onClick, isActive, children, title }: any) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        'p-2 rounded-lg text-sm font-bold transition-all',
        isActive
          ? 'bg-brand-green text-white shadow-md'
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      )}
    >
      {children}
    </button>
  );

  return (
    <div
      ref={editorContainerRef}
      className="border border-slate-200 rounded-xl bg-white flex flex-col overflow-hidden h-[700px] relative"
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={addImage}
      />

      {/* MINIMAL TOOLBAR - Only text formatting */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-200 bg-slate-50 sticky top-0 z-20">
        <span className="text-[10px] font-black text-brand-green uppercase mr-2 tracking-wider bg-brand-light/50 px-2 py-1 rounded">
          Block Editor
        </span>

        <div className="w-px h-5 bg-slate-200 mx-1"></div>

        {/* Text Formatting Only */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold (Cmd+B)"
        >
          <strong className="font-serif">B</strong>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic (Cmd+I)"
        >
          <em className="font-serif">I</em>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Strikethrough"
        >
          <s>S</s>
        </ToolbarButton>
        <ToolbarButton
          onClick={setLink}
          isActive={editor.isActive('link')}
          title="Add Link (Cmd+K)"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </ToolbarButton>

        <div className="flex-1"></div>

        <button
          type="button"
          onClick={() => setShowHelp(true)}
          className="text-slate-400 hover:text-brand-green p-2 rounded-full hover:bg-brand-light/30 transition-colors"
          title="Editor Help"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      {/* Bubble Menu for Text Selection */}
      {editor && (
        <BubbleMenu
          className="bg-white shadow-xl border border-slate-200 rounded-xl flex overflow-hidden p-1 gap-1"
          tippyOptions={{ duration: 100, maxWidth: 'none' }}
          editor={editor}
        >
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold"
          >
            <strong className="font-serif">B</strong>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic"
          >
            <em className="font-serif">I</em>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="Strike"
          >
            <s>S</s>
          </ToolbarButton>
          <div className="w-px h-6 bg-slate-200"></div>
          <ToolbarButton
            onClick={setLink}
            isActive={editor.isActive('link')}
            title="Link"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </ToolbarButton>
        </BubbleMenu>
      )}

      {/* Editor Content with Block Insertion */}
      <div className="flex-1 overflow-y-auto bg-white custom-scrollbar relative">
        <div className="block-editor-wrapper group">
          {/* Floating + Button */}
          <div className="absolute left-2 top-8 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button
              type="button"
              onClick={openBlockMenu}
              className="w-8 h-8 rounded-lg border-2 border-slate-300 bg-white hover:border-brand-green hover:bg-brand-green hover:text-white text-slate-400 flex items-center justify-center transition-all shadow-sm hover:shadow-md"
              title="Add block"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          <div onClick={() => editor?.commands.focus()}>
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      {/* Block Insertion Menu */}
      {showBlockMenu && blockMenuPosition && (
        <div
          ref={blockMenuRef}
          className="absolute bg-white border border-slate-200 rounded-xl shadow-2xl z-50 w-80 max-h-96 overflow-y-auto"
          style={{
            top: `${blockMenuPosition.top}px`,
            left: `${blockMenuPosition.left}px`,
          }}
        >
          <div className="p-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2">
              Insert Block
            </div>
            <div className="space-y-1">
              {blockMenuItems.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => insertBlock(item.command)}
                  className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-left group"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-brand-green group-hover:text-white flex items-center justify-center transition-colors">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 text-sm">{item.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{item.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* HELP MODAL */}
      {showHelp && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center p-8 animate-fade-in">
          <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl p-8 max-w-md w-full relative">
            <button
              onClick={() => setShowHelp(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-xl font-bold font-serif text-brand-dark mb-4">Block Editor Guide</h3>
            <div className="space-y-3 text-sm text-slate-600">
              <p>
                <strong className="text-slate-900">Adding Blocks:</strong> Hover over the editor to see the "+" button. Click it to insert paragraphs, headings, lists, images, and more.
              </p>
              <p>
                <strong className="text-slate-900">Text Formatting:</strong> Select any text to see formatting options (Bold, Italic, Link).
              </p>
              <p>
                <strong className="text-slate-900">Keyboard Shortcuts:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <code className="bg-slate-100 px-1 rounded">Cmd+B</code> Bold
                </li>
                <li>
                  <code className="bg-slate-100 px-1 rounded">Cmd+I</code> Italic
                </li>
                <li>
                  <code className="bg-slate-100 px-1 rounded">Cmd+K</code> Link
                </li>
              </ul>
              <p>
                <strong className="text-slate-900">Markdown Shortcuts:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <code className="bg-slate-100 px-1 rounded"># </code> Heading 1
                </li>
                <li>
                  <code className="bg-slate-100 px-1 rounded">## </code> Heading 2
                </li>
                <li>
                  <code className="bg-slate-100 px-1 rounded">- </code> Bullet List
                </li>
                <li>
                  <code className="bg-slate-100 px-1 rounded">1. </code> Numbered List
                </li>
                <li>
                  <code className="bg-slate-100 px-1 rounded">&gt; </code> Quote
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <Button onClick={() => setShowHelp(false)} size="sm">
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx global>{`
        .block-editor-wrapper {
          position: relative;
        }
        
        .block-editor-wrapper:hover .absolute {
          opacity: 1;
        }

        /* Make blocks more visible on hover */
        .ProseMirror p,
        .ProseMirror h1,
        .ProseMirror h2,
        .ProseMirror h3,
        .ProseMirror ul,
        .ProseMirror ol,
        .ProseMirror blockquote {
          position: relative;
          transition: background-color 0.15s ease;
        }

        .ProseMirror p:hover,
        .ProseMirror h1:hover,
        .ProseMirror h2:hover,
        .ProseMirror h3:hover,
        .ProseMirror ul:hover,
        .ProseMirror ol:hover,
        .ProseMirror blockquote:hover {
          background-color: rgba(241, 245, 249, 0.5);
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};