import React from 'react';
// @ts-ignore
import ReactQuill from 'react-quill';

interface SafeReactQuillProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  placeholder?: string;
}

export const SafeReactQuill: React.FC<SafeReactQuillProps> = ({ value, onChange, className, placeholder }) => {
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet',
    'link', 'image'
  ];

  return (
    // The parent container in AdminBlogEditor.tsx provides the height constraint.
    // This component will fill that height.
    <div className={`flex flex-col ${className || ''}`}>
      <style>{`
        .ql-toolbar.ql-snow {
          border-top-left-radius: 0.75rem;
          border-top-right-radius: 0.75rem;
          background-color: #f8fafc; /* bg-slate-50 */
          border-color: #e2e8f0; /* border-slate-200 */
        }
        .ql-container.ql-snow {
          border-bottom-left-radius: 0.75rem;
          border-bottom-right-radius: 0.75rem;
          border-color: #e2e8f0; /* border-slate-200 */
          border-top: 0;
          font-family: 'Merriweather', serif;
          font-size: 1rem;
          flex-grow: 1;
        }
        .ql-editor {
          min-height: 400px; /* Generous writing space */
        }
        .ql-editor.ql-blank::before {
          font-style: italic;
          color: #9ca3af; /* text-slate-400 */
        }
      `}</style>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || "Thread your testimony here..."}
        className="flex flex-col flex-grow"
      />
    </div>
  );
};