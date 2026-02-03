
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useClickOutside } from '../../lib/utils';
import { api } from '../../lib/db';
import { Product } from '../../types';

export const DesktopNavbar: React.FC = () => {
  const { user, cartCount, logout, settings } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;
  const activeClass = "text-brand-hope font-bold border-b-2 border-brand-hope pb-1";
  const inactiveClass = "text-brand-light/90 hover:text-white transition-colors font-medium";

  // Debounced Search Effect
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true);
        try {
          // Fetch top 5 matching products
          const result = await api.getPaginatedProducts(1, 5, { search: searchQuery });
          setSearchResults(result.data);
          setShowResults(true);
        } catch (e) {
          console.error("Search failed", e);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowResults(false);
      setSearchQuery(''); // Optional: clear after search
    }
  };

  useClickOutside(searchRef, () => setShowResults(false));

  return (
    <nav>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/">
              <img 
                src={settings.logoImage || "https://i.imgur.com/pkaScEv.png"} 
                alt="Jambo Apparels" 
                className="h-12 w-auto object-contain brightness-0 invert"
                width="48"
                height="48"
              />
            </Link>
          </div>
          
          <div className="flex items-center space-x-8 h-full">
            <div className="flex items-center space-x-8 h-10">
              <Link to="/shop" className={`${isActive('/shop') ? activeClass : inactiveClass} text-sm transition-all`}>Shop</Link>
              <Link to="/blog" className={`${isActive('/blog') ? activeClass : inactiveClass} text-sm transition-all`}>Journal</Link>
              <Link to="/about" className={`${isActive('/about') ? activeClass : inactiveClass} text-sm transition-all`}>About Us</Link>
            </div>

            <div className="h-6 w-px bg-brand-green"></div>

            <div className="flex items-center space-x-6 h-10">
              <div className="relative h-10" ref={searchRef}>
                <form onSubmit={handleSearchSubmit} className="relative flex items-center h-full">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => { if (searchResults.length > 0) setShowResults(true); }}
                    placeholder="Search..."
                    className="pl-10 pr-4 h-10 text-xs font-bold border border-transparent rounded-2xl bg-brand-green/30 text-white placeholder-brand-light/60 w-40 lg:w-56 focus:outline-none focus:bg-white focus:text-brand-dark focus:placeholder-gray-400 transition-all shadow-inner uppercase tracking-wide"
                  />
                  {isSearching ? (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4">
                       <div className="animate-spin h-3 w-3 border-2 border-brand-light rounded-full border-t-transparent"></div>
                    </div>
                  ) : (
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-light/70 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </form>
                {showResults && (
                  <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden animate-fade-in divide-y divide-gray-50 z-50">
                    {searchResults.length > 0 ? (
                      <>
                        {searchResults.map(product => (
                          <button key={product.id} onClick={() => { navigate(`/product/${product.slug || product.id}`); setShowResults(false); setSearchQuery(''); }} className="w-full flex items-center p-3 hover:bg-gray-50 transition-colors text-left group">
                            <img src={product.images[0]} alt="" width="40" height="40" className="h-10 w-10 rounded-xl object-cover border border-gray-100" />
                            <div className="ml-3 overflow-hidden">
                              <p className="text-xs font-bold text-gray-900 truncate group-hover:text-brand-green">{product.title}</p>
                              <p className="text-[10px] font-black text-brand-green">£{product.price.toFixed(2)}</p>
                            </div>
                          </button>
                        ))}
                        <button onClick={() => handleSearchSubmit()} className="w-full p-3 text-center text-[10px] font-black uppercase tracking-widest text-brand-green bg-brand-light/50 hover:bg-brand-light">
                            View all results &rarr;
                        </button>
                      </>
                    ) : (
                      !isSearching && <div className="p-4 text-center text-xs text-gray-500 font-medium">No matches found</div>
                    )}
                  </div>
                )}
              </div>

              <Link to="/cart" className="relative text-brand-light hover:text-brand-hope transition-colors group">
                <svg className="h-6 w-6 transform group-hover:-translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-hope text-brand-dark text-[9px] font-black rounded-full h-4 w-4 flex items-center justify-center shadow-sm">
                    {cartCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="relative group">
                  <button className="flex items-center text-brand-light hover:text-white text-sm font-bold">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="ml-2 hidden lg:block">{user.name.split(' ')[0]}</span>
                    <svg className="h-4 w-4 ml-1 hidden lg:block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  <div className="absolute right-0 top-full w-48 bg-white border border-gray-100 rounded-2xl shadow-xl hidden group-hover:block pt-2 overflow-hidden z-50">
                    <Link to="/dashboard" className="block px-4 py-3 text-xs font-bold text-gray-700 hover:bg-brand-light hover:text-brand-dark">Dashboard</Link>
                    {user.role === 'admin' && <Link to="/admin" className="block px-4 py-3 text-xs font-bold text-gray-700 hover:bg-brand-light hover:text-brand-dark">Admin Panel</Link>}
                    <button onClick={logout} className="block w-full text-left px-4 py-3 text-xs font-bold text-red-600 hover:bg-red-50">Sign Out</button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="text-brand-light hover:text-brand-hope transition-colors flex items-center group" aria-label="Log In">
                   <svg className="h-6 w-6 transform group-hover:-translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                   </svg>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
