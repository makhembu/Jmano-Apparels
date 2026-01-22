import React, { createContext, useContext, useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  action?: ToastAction;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, action?: ToastAction) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info', action?: ToastAction) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type, action }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto transform transition-all duration-300 ease-in-out translate-y-0 opacity-100 flex items-center p-4 rounded-lg shadow-lg border-l-4 w-80 md:w-96 ${
              toast.type === 'success' ? 'bg-white border-green-500' :
              toast.type === 'error' ? 'bg-white border-red-500' :
              'bg-white border-blue-500'
            }`}
          >
            <div className="flex-shrink-0">
              {toast.type === 'success' && <span className="text-green-500 text-xl">✓</span>}
              {toast.type === 'error' && <span className="text-red-500 text-xl">✕</span>}
              {toast.type === 'info' && <span className="text-blue-500 text-xl">ℹ</span>}
            </div>
            <div className="ml-3 w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">{toast.message}</p>
              {toast.action && (
                <button 
                  onClick={() => { toast.action?.onClick(); removeToast(toast.id); }}
                  className="mt-2 text-xs font-bold text-brand-green uppercase hover:underline focus:outline-none"
                >
                  {toast.action.label}
                </button>
              )}
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className="bg-transparent rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={() => removeToast(toast.id)}
              >
                <span className="sr-only">Close</span>
                <span className="text-lg">×</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};