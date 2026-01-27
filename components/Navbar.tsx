import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useClickOutside } from '../lib/utils';
import { DesktopNavbar } from './navbar/DesktopNavbar';
import { MobileTopNav } from './navbar/MobileTopNav';
import { MobileBottomNav } from './navbar/MobileBottomNav';
import { MobileSearchOverlay } from './navbar/MobileSearchOverlay';
import { MobileMenuOverlay } from './navbar/MobileMenuOverlay';
import { CartPreviewPopup } from './navbar/CartPreviewPopup';

export const Navbar: React.FC = () => {
  const { cart, cartTotal } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartPreviewOpen, setIsCartPreviewOpen] = useState(false);
  
  const location = useLocation();
  const cartPopupRef = useRef<HTMLDivElement>(null);

  // Close all overlays on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
    setIsCartPreviewOpen(false);
  }, [location.pathname]);

  // Close cart preview when clicking outside
  useClickOutside(cartPopupRef, () => {
    if (isCartPreviewOpen) {
      setIsCartPreviewOpen(false);
    }
  });

  return (
    <>
      <header className="sticky top-0 z-50 bg-brand-dark shadow-md border-b border-brand-green">
        {/* --- DESKTOP NAVBAR --- */}
        <div className="hidden md:block">
          <DesktopNavbar />
        </div>

        {/* --- MOBILE TOP NAV --- */}
        <div className="md:hidden">
          <MobileTopNav onSearchClick={() => setIsSearchOpen(true)} />
        </div>
      </header>

      {/* --- MOBILE BOTTOM NAV (Separate for fixed positioning) --- */}
      <div className="md:hidden">
        <MobileBottomNav 
          onMenuClick={() => setIsMenuOpen(true)}
          onCartLongPress={() => setIsCartPreviewOpen(true)}
          isMenuOpen={isMenuOpen}
        />
      </div>

      {/* --- OVERLAYS --- */}
      <MobileSearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <MobileMenuOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      
      {/* This div is the container for the ref to detect outside clicks */}
      <div ref={cartPopupRef}>
        <CartPreviewPopup
          isOpen={isCartPreviewOpen}
          cart={cart}
          cartTotal={cartTotal}
          onClose={() => setIsCartPreviewOpen(false)}
        />
      </div>
    </>
  );
};