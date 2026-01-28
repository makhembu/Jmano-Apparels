
import React from 'react';
import { useCopilot } from '../../../contexts/CopilotContext';

export const CopilotWidget: React.FC = () => {
  const { toggleDrawer, isOpen } = useCopilot();

  if (isOpen) return null;

  return (
    <button
      id="copilot-widget"
      onClick={toggleDrawer}
      className="fixed bottom-8 right-8 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 z-[9995] bg-brand-testament text-white group border-2 border-white/20"
      aria-label="Open Jambo Copilot"
    >
      <div className="relative">
        <svg 
          className="w-8 h-8 transition-transform group-hover:rotate-12" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1-8.313-12.454z" />
          <path d="M15 5.5l.5.5.5-.5-.5-.5z" fill="currentColor" />
          <path d="M19 9.5l.5.5.5-.5-.5-.5z" fill="currentColor" />
          <path d="M12 12l.5.5.5-.5-.5-.5z" fill="currentColor" />
        </svg>
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-hope opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-hope"></span>
        </span>
      </div>
    </button>
  );
};
