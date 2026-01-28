
import React from 'react';
import { useCopilot } from '../../../contexts/CopilotContext';

export const CopilotWidget: React.FC = () => {
  const { toggleDrawer, isOpen } = useCopilot();

  if (isOpen) return null;

  return (
    <button
      id="copilot-widget"
      onClick={toggleDrawer}
      className="fixed bottom-6 right-6 w-14 h-14 bg-brand-dark text-brand-hope rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-[9990] border-2 border-brand-hope"
      aria-label="Open AI Copilot"
    >
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 6C13.66 6 15 7.34 15 9C15 10.66 13.66 12 12 12C10.34 12 9 10.66 9 9C9 7.34 10.34 6 12 6ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z" fill="currentColor"/>
      </svg>
    </button>
  );
};
