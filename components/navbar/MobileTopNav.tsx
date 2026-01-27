import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

interface MobileTopNavProps {
  onSearchClick: () => void;
}

export const MobileTopNav: React.FC<MobileTopNavProps> = ({ onSearchClick }) => {
  const { settings } = useApp();
  
  return (
    <nav className="h-16 flex items-center px-4 justify-between bg-brand-dark">
      <Link to="/" className="flex-shrink-0">
        <img 
          src={settings.logoImage || "https://i.imgur.com/pkaScEv.png"} 
          alt="Jambo" 
          className="h-10 w-auto object-contain brightness-0 invert" 
        />
      </Link>
      <div className="flex items-center gap-2">
        <button 
          onClick={onSearchClick} 
          className="p-2 text-brand-light hover:text-white transition-colors"
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