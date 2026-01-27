
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';

interface MobileMenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenuOverlay: React.FC<MobileMenuOverlayProps> = ({ isOpen, onClose }) => {
  const { user, logout, settings } = useApp();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogout = async () => {
    await logout();
    onClose();
    navigate('/');
  };

  return (
    <div className="md:hidden fixed inset-0 z-[60] bg-brand-dark/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="absolute right-0 top-0 bottom-0 w-4/5 max-w-xs bg-slate-50 shadow-2xl flex flex-col animate-slide-in border-l border-white/10" onClick={e => e.stopPropagation()}>
        <div className="p-6 flex justify-between items-center border-b border-slate-200 bg-white">
          <img src={settings.logoImage || "https://i.imgur.com/pkaScEv.png"} className="h-8 w-auto object-contain" alt="Jambo" />
          <button onClick={onClose} className="text-slate-400 p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <nav className="flex-1 p-6 space-y-8 overflow-y-auto">
          {/* Admin Quick Link */}
          {user?.role === 'admin' && (
             <div className="mb-6">
                <Link to="/admin" onClick={onClose} className="flex items-center gap-3 p-4 bg-brand-dark text-white rounded-xl shadow-lg shadow-brand-dark/20">
                   <svg className="w-5 h-5 text-brand-hope" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                   <span className="font-bold text-sm">Admin Dashboard</span>
                </Link>
             </div>
          )}

          <div>
            <h3 className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Explore</h3>
            <div className="space-y-1">
              <Link to="/shop" onClick={onClose} className="flex items-center gap-4 px-3 py-3 rounded-xl text-slate-700 hover:bg-white hover:text-brand-green font-bold text-sm transition-all hover:shadow-sm">
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                <span>Full Collection</span>
              </Link>
              <Link to="/blog" onClick={onClose} className="flex items-center gap-4 px-3 py-3 rounded-xl text-slate-700 hover:bg-white hover:text-brand-green font-bold text-sm transition-all hover:shadow-sm">
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                <span>Journal</span>
              </Link>
              <Link to="/about" onClick={onClose} className="flex items-center gap-4 px-3 py-3 rounded-xl text-slate-700 hover:bg-white hover:text-brand-green font-bold text-sm transition-all hover:shadow-sm">
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>About Us</span>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Support</h3>
            <div className="space-y-1">
              <Link to="/returns" onClick={onClose} className="block px-3 py-2 rounded-lg text-slate-500 hover:bg-white hover:text-brand-green text-sm transition-colors">Returns & Refunds</Link>
              <Link to="/terms" onClick={onClose} className="block px-3 py-2 rounded-lg text-slate-500 hover:bg-white hover:text-brand-green text-sm transition-colors">Terms & Conditions</Link>
              <Link to="/privacy" onClick={onClose} className="block px-3 py-2 rounded-lg text-slate-500 hover:bg-white hover:text-brand-green text-sm transition-colors">Privacy Policy</Link>
            </div>
          </div>
        </nav>

        <div className="p-6 mt-auto border-t border-slate-200 bg-white">
          {user ? (
            <div>
              <Link to="/dashboard" onClick={onClose} className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-brand-green/30 transition-all">
                <div className="w-10 h-10 rounded-full bg-brand-light text-brand-dark flex items-center justify-center font-serif font-bold text-lg border border-white shadow-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                  <p className="text-xs text-brand-green font-bold">View Profile &rarr;</p>
                </div>
              </Link>
              <button onClick={handleLogout} className="w-full text-center text-sm font-bold text-red-500 hover:text-red-700 hover:bg-red-50 p-3 rounded-xl transition-colors">
                Sign Out
              </button>
            </div>
          ) : (
            <div className="space-y-3">
               <p className="text-center text-xs text-slate-400">Have an account?</p>
               <Link to="/login" onClick={onClose}>
                 <Button fullWidth className="h-12 rounded-xl shadow-lg shadow-brand-green/20">Sign In</Button>
               </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
