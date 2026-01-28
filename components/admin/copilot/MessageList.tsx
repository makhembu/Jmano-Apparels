
import React, { useEffect, useRef } from 'react';
import { Message } from '../../../lib/ai/types';
import ReactMarkdown from 'react-markdown';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/30 copilot-scrollbar">
      {messages.length === 0 && (
        <div className="text-center py-12 px-6 flex flex-col items-center">
          <div className="w-16 h-16 rounded-3xl bg-brand-testament/10 flex items-center justify-center text-brand-testament mb-4">
             <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1-8.313-12.454z" /></svg>
          </div>
          <h3 className="text-slate-900 font-bold mb-1">Hello, Admin</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            I'm <strong>Jambo Copilot</strong>, your administrative operations partner. 
          </p>
          <p className="text-slate-400 text-xs mt-4">
            Try asking: "Who signed up last?" or "Show me the latest invoice."
          </p>
        </div>
      )}
      
      {messages.map((msg) => (
        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[85%] rounded-2xl px-4 py-3 copilot-message shadow-sm ${
            msg.role === 'user' 
              ? 'bg-brand-dark text-white rounded-br-none' 
              : msg.isError 
                ? 'bg-red-50 text-red-800 border border-red-100 rounded-bl-none'
                : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
          }`}>
            {msg.role === 'model' ? <ReactMarkdown>{msg.content}</ReactMarkdown> : <p>{msg.content}</p>}
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-brand-testament rounded-full animate-bounce"></div>
            <div className="w-1.5 h-1.5 bg-brand-testament rounded-full animate-bounce delay-75"></div>
            <div className="w-1.5 h-1.5 bg-brand-testament rounded-full animate-bounce delay-150"></div>
          </div>
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
};
