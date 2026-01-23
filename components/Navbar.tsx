import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const Navbar: React.FC = () => {
  const { user, cart, logout, products } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const isActive = (path: string) => location.pathname === path;
  const activeClass = "text-brand-green font-semibold";
  const inactiveClass = "text-gray-500 hover:text-brand-green";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowResults(false);
      setIsSearchOpen(false);
    }
  };

  const filteredResults = products
    .filter(p => p.isPublished !== false)
    .filter(p => {
      if (!searchQuery.trim()) return false;
      const q = searchQuery.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.tags?.some(t => t.toLowerCase().includes(q));
    })
    .slice(0, 5);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu/search when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* --- DESKTOP NAVBAR --- */}
      <nav className="hidden md:block bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
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
                <Link to="/about" className={`${isActive('/about') ? activeClass : inactiveClass} text-sm transition-colors`}>Mission</Link>
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
                      className="pl-9 pr-4 h-9 text-xs border border-gray-200 rounded-full focus:outline-none focus:ring-1 focus:ring-brand-green w-40 lg:w-56 bg-gray-50 text-gray-900"
                    />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </form>
                  {showResults && searchQuery.trim() && (
                    <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden animate-fade-in divide-y divide-gray-50 z-50">
                      {filteredResults.length > 0 ? (
                        filteredResults.map(product => (
                          <button key={product.id} onClick={() => { navigate(`/product/${product.id}`); setShowResults(false); setSearchQuery(''); }} className="w-full flex items-center p-3 hover:bg-gray-50 transition-colors text-left group">
                            <img src={product.image} alt="" className="h-10 w-10 rounded-md object-cover border border-gray-100" />
                            <div className="ml-3 overflow-hidden">
                              <p className="text-xs font-semibold text-gray-900 truncate group-hover:text-brand-green">{product.title}</p>
                              <p className="text-[10px] font-bold text-brand-green">£{product.price.toFixed(2)}</p>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-xs text-gray-500">No matches found</div>
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
                  <Link to="/login" className="bg-brand-dark text-white px-5 py-2 rounded-full hover:bg-brand-green transition-all text-xs font-bold shadow-sm">Sign In</Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* --- MOBILE TOP HEADER: REBRANDED FOR VISIBILITY --- */}
      <nav className="md:hidden bg-brand-green sticky top-0 z-40 h-14 flex items-center px-4 justify-between shadow-lg ring-1 ring-black/5">
        <Link to="/" className="flex-shrink-0">
          <img 
            src="https://i.imgur.com/pkaScEv.png" 
            alt="Jambo" 
            className="h-7 w-auto brightness-0 invert" 
          />
        </Link>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsSearchOpen(true)} 
            className="p-2 text-brand-light hover:text-white transition-colors bg-white/10 rounded-full"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </nav>

      {/* --- MOBILE BOTTOM TAB BAR: REBRANDED FOR VISIBILITY --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-around h-16 px-2">
          
          {/* Home Tab */}
          <Link to="/" className={`flex-1 flex flex-col items-center justify-center h-full transition-all duration-300 relative`}>
            <div className={`flex flex-col items-center p-2 rounded-2xl ${isActive('/') ? 'bg-brand-light/60 text-brand-green' : 'text-slate-500'}`}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive('/') ? 2.5 : 2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">Home</span>
            </div>
            {isActive('/') && <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-brand-green rounded-full"></div>}
          </Link>

          {/* Shop Tab */}
          <Link to="/shop" className={`flex-1 flex flex-col items-center justify-center h-full transition-all duration-300 relative`}>
            <div className={`flex flex-col items-center p-2 rounded-2xl ${isActive('/shop') ? 'bg-brand-light/60 text-brand-green' : 'text-slate-500'}`}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive('/shop') ? 2.5 : 2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">Shop</span>
            </div>
            {isActive('/shop') && <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-brand-green rounded-full"></div>}
          </Link>

          {/* Cart Tab */}
          <Link to="/cart" className={`flex-1 flex flex-col items-center justify-center h-full transition-all duration-300 relative`}>
            <div className={`flex flex-col items-center p-2 rounded-2xl ${isActive('/cart') ? 'bg-brand-light/60 text-brand-green' : 'text-slate-500'}`}>
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
            {isActive('/cart') && <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-brand-green rounded-full"></div>}
          </Link>

          {/* User Tab */}
          <Link to={user ? "/dashboard" : "/login"} className={`flex-1 flex flex-col items-center justify-center h-full transition-all duration-300 relative`}>
            <div className={`flex flex-col items-center p-2 rounded-2xl ${isActive('/dashboard') || isActive('/login') ? 'bg-brand-light/60 text-brand-green' : 'text-slate-500'}`}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive('/dashboard') || isActive('/login') ? 2.5 : 2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">{user ? 'Me' : 'Login'}</span>
            </div>
            {(isActive('/dashboard') || isActive('/login')) && <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-brand-green rounded-full"></div>}
          </Link>

          {/* Menu Tab */}
          <button onClick={() => setIsMenuOpen(true)} className={`flex-1 flex flex-col items-center justify-center h-full transition-all duration-300 relative`}>
            <div className={`flex flex-col items-center p-2 rounded-2xl ${isMenuOpen ? 'bg-brand-light/60 text-brand-green' : 'text-slate-500'}`}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">More</span>
            </div>
          </button>
        </div>
      </nav>

      {/* --- MOBILE SEARCH OVERLAY --- */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[60] bg-white animate-fade-in flex flex-col">
          <div className="flex items-center gap-2 p-4 border-b border-gray-100">
            <button onClick={() => setIsSearchOpen(false)} className="p-2 text-slate-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <form onSubmit={handleSearch} className="flex-1">
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search collection..."
                className="w-full h-10 px-4 text-base border-none focus:ring-0 bg-transparent text-slate-900 font-medium"
              />
            </form>
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="p-2 text-slate-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50/30">
            {searchQuery.trim() ? (
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Suggestions</p>
                {filteredResults.map(product => (
                  <button key={product.id} onClick={() => navigate(`/product/${product.id}`)} className="w-full flex items-center gap-4 p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <img src={product.image} className="w-12 h-12 rounded-xl object-cover border border-slate-50" />
                    <div className="text-left overflow-hidden">
                      <p className="text-sm font-bold text-slate-900 truncate">{product.title}</p>
                      <p className="text-xs text-brand-green font-black">£{product.price.toFixed(2)}</p>
                    </div>
                  </button>
                ))}
                {filteredResults.length === 0 && <p className="text-center text-sm text-slate-500 py-10">No results found for "{searchQuery}"</p>}
              </div>
            ) : (
              <div className="text-center py-24 px-8">
                <div className="bg-brand-light w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <h3 className="text-lg font-serif font-bold text-brand-dark mb-2">Finding your thread...</h3>
                <p className="text-sm text-slate-400 italic">Start typing to find your next scripture-inspired piece.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- MOBILE MORE MENU OVERLAY --- */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-brand-dark/50 backdrop-blur-md animate-fade-in" onClick={() => setIsMenuOpen(false)}>
          <div className="absolute right-0 top-0 bottom-0 w-4/5 max-w-sm bg-white shadow-2xl p-8 flex flex-col animate-slide-in rounded-l-[40px]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-16">
              <img src="https://i.imgur.com/pkaScEv.png" className="h-7 w-auto" />
              <button onClick={() => setIsMenuOpen(false)} className="text-slate-400 p-2 bg-slate-50 rounded-full">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="space-y-10 flex-1">
              <div>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-6">Explore</p>
                <div className="space-y-6">
                  <Link to="/blog" className="block text-3xl font-serif font-bold text-slate-900 hover:text-brand-green transition-colors">Journal</Link>
                  <Link to="/about" className="block text-3xl font-serif font-bold text-slate-900 hover:text-brand-green transition-colors">Mission</Link>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-6">Details</p>
                <div className="space-y-4 text-lg font-bold text-slate-500">
                  <Link to="/returns" className="block hover:text-brand-green">Returns</Link>
                  <Link to="/terms" className="block hover:text-brand-green">Legal</Link>
                  <Link to="/privacy" className="block hover:text-brand-green">Privacy</Link>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-8 border-t border-slate-100">
              {user ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-brand-light flex items-center justify-center font-black text-brand-green text-lg border border-brand-green/10">{user.name[0]}</div>
                    <div>
                      <p className="text-sm font-black text-slate-900 leading-none mb-1">{user.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.role}</p>
                    </div>
                  </div>
                  <button onClick={logout} className="w-full py-4 text-center text-[10px] font-black text-red-500 uppercase tracking-[0.2em] bg-red-50 rounded-2xl border border-red-100 active:scale-95 transition-transform">Sign Out Account</button>
                </div>
              ) : (
                <Link to="/login" className="block w-full py-5 text-center text-xs font-black text-white uppercase tracking-[0.2em] bg-brand-green rounded-2xl shadow-xl shadow-brand-green/20 active:scale-95 transition-transform">Sign In</Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
