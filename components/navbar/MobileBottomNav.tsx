import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useLongPress } from '../../hooks/useLongPress';
import { MobileCartIcon } from './MobileCartIcon';

interface MobileBottomNavProps {
  onMenuClick: () => void;
  onCartLongPress: () => void;
  isMenuOpen: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onMenuClick, onCartLongPress, isMenuOpen }) => {
  const { cartCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const cartLongPressHandlers = useLongPress({
    onLongPress: () => {
      if (cartCount > 0) {
        onCartLongPress();
      }
    },
    onClick: () => {
      navigate('/cart');
    },
  });

  const NavItem = ({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) => (
    <Link to={to} className="flex-1 flex flex-col items-center justify-center h-full group">
      <div className={`flex flex-col items-center p-2 rounded-2xl transition-all duration-200 ${isActive(to) ? 'bg-brand-light/40 text-brand-green scale-105' : 'text-slate-400 group-active:scale-95'}`}>
        {icon}
        <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">{label}</span>
      </div>
    </Link>
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-100 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-around h-16 px-2">
        <NavItem 
          to="/shop" 
          label="Collection"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive('/shop') ? 2.5 : 2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
        />

        <NavItem 
          to="/blog" 
          label="Journal" 
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive('/blog') ? 2.5 : 2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>} 
        />

        <div {...cartLongPressHandlers} className="flex-1 flex flex-col items-center justify-center h-full cursor-pointer group select-none">
           <MobileCartIcon isActive={isActive('/cart')} />
        </div>

        <button 
          onClick={onMenuClick}
          className="flex-1 flex flex-col items-center justify-center h-full group"
        >
          <div className={`flex flex-col items-center p-2 rounded-2xl transition-all duration-200 ${isMenuOpen ? 'bg-brand-dark text-white scale-105' : 'text-slate-400 group-active:scale-95'}`}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
            <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">Menu</span>
          </div>
        </button>
      </div>
    </nav>
  );
};