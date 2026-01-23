import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';

interface MobileMenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenuOverlay: React.FC<MobileMenuOverlayProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useApp();

  if (!isOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="absolute right-0 top-0 bottom-0 w-4/5 max-w-xs bg-slate-50 shadow-2xl flex flex-col animate-slide-in" onClick={e => e.stopPropagation()}>
        <div className="p-6 flex justify-between items-center border-b border-slate-200">
          <img src="https://i.imgur.com/pkaScEv.png" className="h-7" alt="Jambo" />
          <button onClick={onClose} className="text-slate-400 p-2 bg-slate-100 rounded-full">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <nav className="flex-1 p-6 space-y-8 overflow-y-auto">
          <div>
            <h3 className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Explore</h3>
            <div className="space-y-1">
              <Link to="/blog" onClick={onClose} className="flex items-center gap-4 px-3 py-3 rounded-lg text-slate-700 hover:bg-white hover:text-brand-green font-bold text-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                <span>Journal</span>
              </Link>
              <Link to="/about" onClick={onClose} className="flex items-center gap-4 px-3 py-3 rounded-lg text-slate-700 hover:bg-white hover:text-brand-green font-bold text-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m-6 13v-5.5m6 5.5v-5.5" /></svg>
                <span>Our Story</span>
              </Link>
            </div>
          </div>
          <div>
            <h3 className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Support</h3>
            <div className="space-y-1">
              <Link to="/returns" onClick={onClose} className="block px-3 py-2 rounded-lg text-slate-500 hover:bg-white hover:text-brand-green text-sm">Returns & Refunds</Link>
              <Link to="/terms" onClick={onClose} className="block px-3 py-2 rounded-lg text-slate-500 hover:bg-white hover:text-brand-green text-sm">Terms & Conditions</Link>
              <Link to="/privacy" onClick={onClose} className="block px-3 py-2 rounded-lg text-slate-500 hover:bg-white hover:text-brand-green text-sm">Privacy Policy</Link>
            </div>
          </div>
        </nav>

        <div className="p-6 mt-auto border-t border-slate-200">
          {user ? (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-brand-light text-brand-dark flex items-center justify-center font-serif font-bold text-lg">{user.name[0]}</div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
              <button onClick={() => { logout(); onClose(); }} className="w-full text-left text-sm font-medium text-red-600 hover:bg-red-50 p-3 rounded-lg">Sign Out</button>
            </div>
          ) : (
            <Link to="/login" onClick={onClose}>
              <Button fullWidth className="h-12 rounded-xl">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
