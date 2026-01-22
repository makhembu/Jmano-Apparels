import React from 'react';

interface SafeReactQuillProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  placeholder?: string;
}

export const SafeReactQuill: React.FC<SafeReactQuillProps> = ({ value, onChange, className, placeholder }) => {
  return (
    <div className={`flex flex-col ${className}`}>
        <div className="bg-gray-50 border border-gray-200 rounded-t-md p-2 flex justify-between items-center">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Raw Editor (HTML Supported)</span>
            <span className="text-xs text-gray-400">Rich text disabled</span>
        </div>
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || "Write your post content here. You can use standard HTML tags like <h2>, <p>, <ul>, etc."}
            className="block w-full h-[500px] rounded-b-md border-gray-300 shadow-sm focus:border-brand-green focus:ring-brand-green sm:text-sm font-mono p-4"
        />
    </div>
  );
};