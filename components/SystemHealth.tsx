
import React, { useState, useEffect } from 'react';
import { useDBHealthCheck } from '../hooks/useDBHealthCheck';

export const SystemHealth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { status, error, retry } = useDBHealthCheck();
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('health_check_dismissed');
    if (dismissed === 'true') {
        setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
      setIsDismissed(true);
      sessionStorage.setItem('health_check_dismissed', 'true');
  };

  return (
    <>
      {children}

      {/* Critical: Missing Tables (Unseeded) - Cannot be dismissed permanently as app won't work */}
      {(status === 'unseeded' || status === 'empty') && !isDismissed && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center border-t-8 border-amber-500">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
               <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Database Setup Required</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Your app is connected to Supabase, but the database appears to be empty or missing tables.
            </p>
            <div className="bg-slate-50 p-4 rounded-xl text-left text-sm text-slate-700 mb-6 border border-slate-200">
               <p className="font-bold mb-2">To fix this:</p>
               <ol className="list-decimal list-inside space-y-1">
                  <li>Go to your Supabase Dashboard</li>
                  <li>Open the <strong>SQL Editor</strong></li>
                  <li>Run the migration scripts provided in <code>seed.sql</code></li>
               </ol>
            </div>
            <div className="flex gap-3 justify-center">
               <button onClick={retry} className="bg-brand-green text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-brand-dark transition-colors">
                  I've Ran the Scripts, Retry
               </button>
               <button onClick={handleDismiss} className="text-slate-400 font-bold px-4 py-3 hover:text-slate-600">
                  Ignore (Developer)
               </button>
            </div>
          </div>
        </div>
      )}

      {/* General Connection Error - Dismissible */}
      {status === 'error' && !isDismissed && (
        <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-96 z-[100] animate-slide-in">
          <div className="bg-white rounded-lg shadow-2xl border-l-4 border-red-500 p-4 ring-1 ring-black/5">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-sm font-bold text-red-800 flex items-center gap-2">
                  Connection Error
                </h3>
                <p className="text-xs text-gray-600 mt-1 mb-3">
                  {error || 'Unable to connect to the database.'}
                </p>
                <div className="flex gap-2">
                  <button onClick={retry} className="text-xs bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1.5 rounded font-bold transition-colors">Retry</button>
                  <button onClick={handleDismiss} className="text-xs text-gray-500 hover:text-gray-800 px-2 py-1.5 underline">Dismiss</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
