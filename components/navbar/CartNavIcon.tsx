import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

export const CartNavIcon: React.FC = () => {
  const { cartCount } = useCart();

  return (
    <Link to="/cart" className="relative text-brand-light hover:text-brand-hope transition-colors group" aria-label="View Cart">
      <svg className="h-6 w-6 transform group-hover:-translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      {cartCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-brand-hope text-brand-dark text-[9px] font-black rounded-full h-4 w-4 flex items-center justify-center shadow-sm">
          {cartCount}
        </span>
      )}
    </Link>
  );
};