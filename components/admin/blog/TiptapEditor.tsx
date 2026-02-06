
import React, { useRef } from 'react';

interface TiptapEditorProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
}

const ToolbarButton: React.FC<{ onClick: (e: React.MouseEvent) => void, title: string, children: React.ReactNode }> = ({ onClick, title, children }) => (
    <button
        type="button"
        onClick={onClick}
        title={title}
        className="p-2 rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors text-xs font-bold"
    >
        {children}
    </button>
);

export const TiptapEditor: React.FC<TiptapEditorProps> = ({ value, onChange, placeholder }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

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
                <ToolbarButton title="Bullet List" onClick={applyList}>List</ToolbarButton>
            </div>
            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full h-96 p-4 font-mono text-sm text-slate-800 leading-relaxed resize-y focus:outline-none bg-white rounded-b-xl custom-scrollbar"
                spellCheck="false"
            />
        </div>
    );
};
