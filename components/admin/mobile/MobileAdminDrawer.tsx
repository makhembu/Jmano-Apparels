
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface MobileAdminDrawerProps {
  onClose: () => void;
}

export const MobileAdminDrawer: React.FC<MobileAdminDrawerProps> = ({ onClose }) => {
  const navigate = useNavigate();

  const menuItems = [
    { label: 'Analytics', path: '/admin/analytics', icon: <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /> },
    { label: 'Payments', path: '/admin/payments', icon: <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /> },
    { label: 'Blog', path: '/admin/blog', icon: <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /> },
    { label: 'Newsletter', path: '/admin/newsletter', icon: <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /> },
    { label: 'Contact', path: '/admin/contact', icon: <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /> },
    { label: 'Shop Settings', path: '/admin/shop-settings', icon: <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /> },
    { label: 'App Settings', path: '/admin/app-settings', icon: <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /> },
    { label: 'My Profile', path: '/admin/profile', icon: <path d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /> },
  ];

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[70] max-h-[85vh] overflow-y-auto animate-slide-in shadow-[0_-10px_40px_rgba(0,0,0,0.2)] pb-safe">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold font-serif text-brand-dark">More Options</h3>
            <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  onClose();
                }}
                className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-100 transition-all active:scale-95"
              >
                <svg className="w-6 h-6 mb-2 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  {item.icon}
                </svg>
                <span className="text-xs font-bold text-gray-700">{item.label}</span>
              </button>
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-100">
             <Link to="/" className="flex items-center justify-center gap-2 w-full py-3 bg-brand-dark text-white rounded-xl font-bold text-sm">
                <span>View Shop</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
             </Link>
          </div>
        </div>
      </div>
    </>
  );
};
