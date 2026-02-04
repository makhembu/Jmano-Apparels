
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MobileAdminDrawer } from './MobileAdminDrawer';

export const BottomAdminNav: React.FC = () => {
  const location = useLocation();
  const [showDrawer, setShowDrawer] = useState(false);

  const isActive = (path: string) => {
      if (path === '/admin' && location.pathname === '/admin') return true;
      if (path !== '/admin' && location.pathname.startsWith(path)) return true;
      return false;
  };

  const navItems = [
    { 
        label: 'Dash', 
        path: '/admin', 
        icon: <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /> 
    },
    { 
        label: 'Products', 
        path: '/admin/products', 
        icon: <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /> 
    },
    { 
        label: 'Orders', 
        path: '/admin/orders', 
        icon: <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /> 
    },
    { 
        label: 'Users', 
        path: '/admin/users', 
        icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /> 
    },
  ];

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[60] pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full active:scale-95 transition-transform ${
                isActive(item.path) ? 'text-brand-green' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive(item.path) ? 2.5 : 2}>
                {item.icon}
              </svg>
              <span className="text-[9px] font-bold mt-1">{item.label}</span>
            </Link>
          ))}
          
          <button
            onClick={() => setShowDrawer(true)}
            className="flex flex-col items-center justify-center flex-1 h-full active:scale-95 transition-transform"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-0.5 shadow-md bg-gradient-to-br from-[#B96AD9] via-[#9D50BB] to-[#6E48AA] ring-2 ring-white ring-offset-1 ring-offset-white ${showDrawer ? 'ring-brand-testament' : ''}`}>
               <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
               </svg>
            </div>
            <span className="text-[9px] font-bold text-gray-500 mt-0.5">More</span>
          </button>
        </div>
      </nav>

      {showDrawer && <MobileAdminDrawer onClose={() => setShowDrawer(false)} />}
    </>
  );
};
