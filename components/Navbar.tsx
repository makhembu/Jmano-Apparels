import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const Navbar: React.FC = () => {
  const { user, cart, logout } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const isActive = (path: string) => location.pathname === path ? "text-brand-green font-semibold" : "text-gray-600 hover:text-brand-green";

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
            <img
              src="https://i.imgur.com/pkaScEv.png"
              alt="Jambo Apparels"
              className="h-8 w-auto"
            />
          </Link>
          
          </div>
          
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link to="/" className={isActive('/')}>Home</Link>
            <Link to="/shop" className={isActive('/shop')}>Shop</Link>
            <Link to="/blog" className={isActive('/blog')}>Journal</Link>
            <Link to="/about" className={isActive('/about')}>Mission</Link>
            
            <Link to="/cart" className="relative text-gray-600 hover:text-brand-green">
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-patience text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative group">
                <button className="text-gray-600 hover:text-brand-green focus:outline-none">
                  {user.name}
                </button>
                <div className="absolute right-0 w-48 bg-white border rounded shadow-lg hidden group-hover:block pt-2">
                  <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-brand-light">Dashboard</Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-brand-light">Admin Panel</Link>
                  )}
                  <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-brand-light">Sign Out</button>
                </div>
              </div>
            ) : (
               <Link to="/login" className="bg-brand-green text-white px-4 py-2 rounded-md hover:bg-brand-dark transition text-sm">Sign In</Link>
            )}
          </div>

          <div className="-mr-2 flex items-center md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none">
              <span className="sr-only">Open menu</span>
              {/* Hamburger Icon */}
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-brand-green">Home</Link>
            <Link to="/shop" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-brand-green">Shop</Link>
            <Link to="/blog" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-brand-green">Journal</Link>
            <Link to="/about" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-brand-green">Mission</Link>
            <Link to="/cart" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-brand-green">Cart ({cartCount})</Link>
             {user ? (
               <>
                 <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-brand-green">Dashboard</Link>
                 {user.role === 'admin' && <Link to="/admin" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-brand-green">Admin</Link>}
                 <button onClick={() => { logout(); setIsOpen(false); }} className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-brand-green">Sign Out</button>
               </>
             ) : (
                <Link to="/login" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-brand-green font-bold">Sign In</Link>
             )}
          </div>
        </div>
      )}
    </nav>
  );
};