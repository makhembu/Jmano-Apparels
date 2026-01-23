import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useLongPress } from '../../hooks/useLongPress';

interface MobileBottomNavProps {
  onMenuClick: () => void;
  onCartLongPress: () => void;
  isMenuOpen: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onMenuClick, onCartLongPress, isMenuOpen }) => {
  const { user, cartCount } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const cartLongPressHandlers = useLongPress({
    onLongPress: () => {
      // Only show popup if cart is not empty
      if (cartCount > 0) {
        onCartLongPress();
      }
    },
    onClick: () => {
      navigate('/cart');
    },
  });

  const NavItem = ({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) => (
    <Link to={to} className="flex-1 flex flex-col items-center justify-center h-full">
      <div className={`flex flex-col items-center p-2 rounded-2xl transition-colors ${isActive(to) ? 'bg-brand-light/60 text-brand-green' : 'text-slate-500'}`}>
        {icon}
        <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">{label}</span>
      </div>
    </Link>
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 pb-safe shadow-t-lg">
      <div className="flex items-center justify-around h-16 px-2">
        <NavItem 
          to="/" 
          label="Home" 
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive('/') ? 2.5 : 2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>} 
        />
        <NavItem 
          to="/shop" 
          label="Shop"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive('/shop') ? 2.5 : 2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
        />

        <div {...cartLongPressHandlers} className="flex-1 flex flex-col items-center justify-center h-full cursor-pointer">
          <div className={`flex flex-col items-center p-2 rounded-2xl transition-colors ${isActive('/cart') ? 'bg-brand-light/60 text-brand-green' : 'text-slate-500'}`}>
            <div className="relative">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive('/cart') ? 2.5 : 2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-brand-green text-white text-[8px] font-black rounded-full h-4 w-4 flex items-center justify-center ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">Cart</span>
          </div>
        </div>

        <NavItem
          to={user ? "/dashboard" : "/login"}
          label={user ? 'Me' : 'Login'}
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive('/dashboard') || isActive('/login') ? 2.5 : 2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
        />

        <button onClick={onMenuClick} className="flex-1 flex flex-col items-center justify-center h-full">
          <div className={`flex flex-col items-center p-2 rounded-2xl transition-colors ${isMenuOpen ? 'bg-brand-light/60 text-brand-green' : 'text-slate-500'}`}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">More</span>
          </div>
        </button>
      </div>
    </nav>
  );
};
