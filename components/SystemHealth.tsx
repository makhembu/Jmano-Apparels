import React, { useState } from 'react';
import { useDBHealthCheck } from '../hooks/useDBHealthCheck';
import { Button } from './ui/Button';

export const SystemHealth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { status, results, error, retry } = useDBHealthCheck();
  const [isDismissed, setIsDismissed] = useState(false);

  // Non-blocking: We render children immediately regardless of checking status.
  // We only intervene if there is a confirmed critical error.

  return (
    <>
      {children}

      {/* Persistent Error Banner (Only shows if there's an error and not dismissed) */}
      {status === 'error' && !isDismissed && (
        <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-96 z-[100] animate-slide-in">
          <div className="bg-white rounded-lg shadow-2xl border-l-4 border-red-500 p-4 ring-1 ring-black/5">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-sm font-bold text-red-800 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  System Connection Issue
                </h3>
                <p className="text-xs text-gray-600 mt-1 mb-3">
                  {typeof error === 'string' ? error : 'Database connection unstable. Some features may be unavailable.'}
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={retry} 
                    className="text-xs bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1.5 rounded font-bold transition-colors"
                  >
                    Retry
                  </button>
                  <button 
                    onClick={() => setIsDismissed(true)} 
                    className="text-xs text-gray-500 hover:text-gray-800 px-2 py-1.5 underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
            
            {/* Detailed Debug Info (Collapsed by default, maybe visible on hover or extended click? keeping simple for user) */}
            {(results || []).some(r => r.status !== 'ok') && (
               <div className="mt-3 pt-2 border-t border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Diagnostics</p>
                  <ul className="mt-1 space-y-1">
                    {results.filter(r => r.status !== 'ok').slice(0, 3).map(r => (
                      <li key={r.table} className="text-[10px] text-red-600 flex justify-between">
                        <span>{r.table}</span>
                        <span className="font-mono">{r.status}</span>
                      </li>
                    ))}
                  </ul>
               </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};