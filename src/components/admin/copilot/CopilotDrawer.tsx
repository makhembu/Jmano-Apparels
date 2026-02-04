
import React from 'react';
import { useCopilot } from '../../../contexts/CopilotContext';
import { useCopilotShortcuts } from '../../../hooks/useCopilotShortcuts';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

export const CopilotDrawer: React.FC = () => {
  const { 
    isOpen, messages, sendMessage, isLoading, 
    toggleDrawer, clearHistory
  } = useCopilot();
  
  useCopilotShortcuts(toggleDrawer);

  if (!isOpen) return null;

  return (
    <div 
      id="copilot-drawer" 
      className="fixed bottom-36 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-6 w-[95vw] md:w-96 h-[60vh] md:h-[600px] max-h-[80vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in z-[9999]"
    >
      {/* Header */}
      <div className="bg-brand-dark px-5 py-4 flex justify-between items-center text-white relative">
        <div className="flex items-center gap-3 relative z-10">
           <div className="w-8 h-8 rounded-xl bg-brand-testament flex items-center justify-center text-white shadow-lg">
             <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1-8.313-12.454z" /></svg>
           </div>
           <div>
              <span className="font-serif font-bold tracking-tight text-base block">Jambo Copilot</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-brand-hope opacity-80">Administrative Partner</span>
           </div>
        </div>
        <div className="flex items-center gap-2 relative z-10">
           <button onClick={clearHistory} className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors" title="Clear Chat">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
           </button>
           <button onClick={toggleDrawer} className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors" title="Minimize">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
           </button>
        </div>
      </div>

      <MessageList messages={messages} isLoading={isLoading} />
      <MessageInput onSend={sendMessage} isLoading={isLoading} />
      
      <div className="bg-slate-50 border-t border-slate-100 px-4 py-2 text-[10px] text-slate-400 text-center font-medium hidden md:block">
         Cmd+K to toggle Copilot
      </div>
    </div>
  );
};
