import React from 'react';
import { Link } from 'react-router-dom';

interface MobileTopNavProps {
  onSearchClick: () => void;
}

export const MobileTopNav: React.FC<MobileTopNavProps> = ({ onSearchClick }) => {
  return (
    <nav className="h-16 flex items-center px-4 justify-between">
      <Link to="/" className="flex-shrink-0">
        <img 
          src="https://i.imgur.com/pkaScEv.png" 
          alt="Jambo" 
          className="h-8 w-auto" 
        />
      </Link>
      <div className="flex items-center gap-2">
        <button 
          onClick={onSearchClick} 
          className="p-2 text-slate-500 hover:text-brand-green transition-colors"
          aria-label="Open search"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </nav>
  );
};