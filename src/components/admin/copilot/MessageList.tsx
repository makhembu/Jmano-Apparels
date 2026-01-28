
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
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 copilot-scrollbar">
      {messages.length === 0 && (
        <div className="text-center text-gray-400 text-sm mt-10">
          <p>👋 Hi! I'm your Admin Copilot.</p>
          <p className="mt-2">Ask me to navigate, find orders, or highlight features.</p>
        </div>
      )}
      
      {messages.map((msg) => (
        <div 
          key={msg.id} 
          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div 
            className={`max-w-[85%] rounded-2xl px-4 py-3 copilot-message shadow-sm ${
              msg.role === 'user' 
                ? 'bg-brand-dark text-white rounded-br-none' 
                : msg.isError 
                  ? 'bg-red-50 text-red-800 border border-red-200 rounded-bl-none'
                  : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
            }`}
          >
            {msg.role === 'model' ? (
                <ReactMarkdown>{msg.content}</ReactMarkdown>
            ) : (
                <p>{msg.content}</p>
            )}
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-brand-green rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-brand-green rounded-full animate-bounce delay-75"></div>
            <div className="w-2 h-2 bg-brand-green rounded-full animate-bounce delay-150"></div>
          </div>
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
};
