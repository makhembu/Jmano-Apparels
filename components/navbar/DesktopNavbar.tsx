import React, { useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useClickOutside, getVisibleProducts, searchProducts } from '../../lib/utils';

export const DesktopNavbar: React.FC = () => {
  const { user, cartCount, logout, products } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;
  const activeClass = "text-brand-green font-semibold";
  const inactiveClass = "text-gray-500 hover:text-brand-green";

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowResults(false);
    }
  };

  const visibleProducts = getVisibleProducts(products);
  const searchResults = searchProducts(visibleProducts, searchQuery);
  const filteredResults = searchResults.slice(0, 5);

  useClickOutside(searchRef, () => setShowResults(false));

  return (
    <nav>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img src="https://i.imgur.com/pkaScEv.png" alt="Jambo Apparels" className="h-8 w-auto" />
            </Link>
          </div>
          
          <div className="flex items-center space-x-8 h-full">
            <div className="flex items-center space-x-8 h-10">
              <Link to="/" className={`${isActive('/') ? activeClass : inactiveClass} text-sm transition-colors`}>Home</Link>
              <Link to="/shop" className={`${isActive('/shop') ? activeClass : inactiveClass} text-sm transition-colors`}>Shop</Link>
              <Link to="/blog" className={`${isActive('/blog') ? activeClass : inactiveClass} text-sm transition-colors`}>Journal</Link>
              <Link to="/about" className={`${isActive('/about') ? activeClass : inactiveClass} text-sm transition-colors`}>About Us</Link>
            </div>

            <div className="h-6 w-px bg-gray-200"></div>

            <div className="flex items-center space-x-6 h-10">
              <div className="relative h-10" ref={searchRef}>
                <form onSubmit={handleSearch} className="relative flex items-center h-full">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true); }}
                    onFocus={() => setShowResults(true)}
                    placeholder="Search..."
                    className="pl-10 pr-4 h-10 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 w-40 lg:w-56 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                  />
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </form>
                {showResults && searchQuery.trim() && (
                  <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden animate-fade-in divide-y divide-gray-50 z-50">
                    {filteredResults.length > 0 ? (
                      <>
                        {filteredResults.map(product => (
                          <button key={product.id} onClick={() => { navigate(`/product/${product.id}`); setShowResults(false); setSearchQuery(''); }} className="w-full flex items-center p-3 hover:bg-gray-50 transition-colors text-left group">
                            <img src={product.images[0]} alt="" className="h-10 w-10 rounded-md object-cover border border-gray-100" />
                            <div className="ml-3 overflow-hidden">
                              <p className="text-xs font-semibold text-gray-900 truncate group-hover:text-brand-green">{product.title}</p>
                              <p className="text-[10px] font-bold text-brand-green">£{product.price.toFixed(2)}</p>
                            </div>
                          </button>
                        ))}
                        {searchResults.length > 5 && (
                            <button onClick={() => handleSearch()} className="w-full p-3 text-center text-xs font-bold text-brand-green bg-brand-light/50 hover:bg-brand-light">
                                View all {searchResults.length} results &rarr;
                            </button>
                        )}
                      </>
                    ) : (
                      <div className="p-4 text-center text-xs text-gray-500">No matches for "{searchQuery}"</div>
                    )}
                  </div>
                )}
              </div>

              <Link to="/cart" className="relative text-gray-400 hover:text-brand-green transition-colors">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-green text-white text-[9px] font-black rounded-full h-4 w-4 flex items-center justify-center ring-2 ring-white">
                    {cartCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="relative group">
                  <button className="flex items-center text-gray-500 hover:text-brand-green text-sm font-medium">
                    <span>{user.name.split(' ')[0]}</span>
                    <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  <div className="absolute right-0 top-full w-48 bg-white border border-gray-100 rounded-lg shadow-xl hidden group-hover:block pt-2 overflow-hidden z-50">
                    <Link to="/dashboard" className="block px-4 py-2 text-xs text-gray-700 hover:bg-brand-light">Dashboard</Link>
                    {user.role === 'admin' && <Link to="/admin" className="block px-4 py-2 text-xs text-gray-700 hover:bg-brand-light">Admin Panel</Link>}
                    <button onClick={logout} className="block w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50">Sign Out</button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="bg-brand-dark text-white px-5 py-2 rounded-lg hover:bg-brand-green transition-all text-xs font-bold shadow-sm">Sign In</Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};