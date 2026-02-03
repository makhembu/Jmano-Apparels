
import React from 'react';
import { useCopilot } from '../../../context/CopilotContext';

export const CopilotWidget: React.FC = () => {
  const { toggleDrawer, isOpen } = useCopilot();

  if (isOpen) return null;

  return (
    <button
      id="copilot-widget"
      onClick={toggleDrawer}
      className="fixed bottom-8 right-8 w-16 h-16 rounded-2xl shadow-[0_20px_50px_rgba(185,106,217,0.35)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 z-[9995] bg-gradient-to-br from-brand-testament via-[#9D50BB] to-[#6E48AA] text-white group border border-white/20 overflow-hidden"
      aria-label="Open Jambo Copilot"
    >
      {/* Glossy overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative">
        <svg 
          className="w-8 h-8 transition-transform duration-500 group-hover:rotate-[15deg] drop-shadow-md" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          {/* Main AI Sparkle */}
          <path d="M12 3l1.5 4.5 4.5 1.5-4.5 1.5L12 15l-1.5-4.5-4.5-1.5 4.5-1.5L12 3z" fill="currentColor" />
          {/* Decorative Sparkles */}
          <path d="M19 8l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" fill="currentColor" />
          <path d="M5 15l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" fill="currentColor" />
        </svg>
        
        {/* Notification indicator */}
        <span className="absolute -top-2 -right-2 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-hope opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-brand-hope border-2 border-[#9D50BB]"></span>
        </span>
      </div>
    </button>
  );
};
