
import React, { useState } from 'react';

interface MessageInputProps {
  onSend: (text: string) => void;
  isLoading: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSend, isLoading }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSend(text);
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-slate-200 p-4 bg-white">
      <div className="flex gap-2 relative">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask Copilot..."
          className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 pr-12 text-sm focus:ring-2 focus:ring-brand-testament/20 focus:bg-white transition-all outline-none placeholder:text-slate-400 font-medium"
          disabled={isLoading}
        />
        <button 
          type="submit" 
          disabled={isLoading || !text.trim()}
          className="absolute right-1.5 top-1.5 bottom-1.5 aspect-square bg-brand-dark text-white rounded-lg hover:bg-brand-testament disabled:opacity-50 disabled:hover:bg-brand-dark transition-colors flex items-center justify-center shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </form>
  );
};
