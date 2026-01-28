
import React from 'react';
import { useCopilot } from '../../../contexts/CopilotContext';
import { useCopilotShortcuts } from '../../../hooks/useCopilotShortcuts';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

export const CopilotDrawer: React.FC = () => {
  const { isOpen, messages, sendMessage, isLoading, toggleDrawer, clearHistory } = useCopilot();
  
  useCopilotShortcuts(toggleDrawer);

  if (!isOpen) return null;

  return (
    <div id="copilot-drawer" className="flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="bg-brand-dark px-4 py-3 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-brand-hope animate-pulse"></div>
           <span className="font-serif font-bold tracking-wide text-sm">Copilot</span>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={clearHistory} className="text-white/60 hover:text-white text-xs" title="Clear Chat">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
           </button>
           <button onClick={toggleDrawer} className="text-white/80 hover:text-white">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
        </div>
      </div>

      {/* Messages */}
      <MessageList messages={messages} isLoading={isLoading} />

      {/* Input */}
      <MessageInput onSend={sendMessage} isLoading={isLoading} />
      
      {/* Footer Hint */}
      <div className="bg-slate-50 border-t border-slate-100 px-4 py-1 text-[10px] text-slate-400 text-center">
         Powered by Gemini 2.5 Flash • Cmd+K to toggle
      </div>
    </div>
  );
};
