import React from 'react';
import { useDBHealthCheck } from '../hooks/useDBHealthCheck';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { Button } from './ui/Button';

export const SystemHealth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { status, results, error, retry } = useDBHealthCheck();

  if (status === 'checking' || status === 'idle') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <LoadingSpinner />
        <p className="mt-4 text-gray-500">Verifying System Integrity...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl border-t-4 border-red-600 p-8">
          <h1 className="text-2xl font-bold text-red-700 mb-2">System Check Failed</h1>
          <p className="text-gray-600 mb-6">
            {typeof error === 'string' ? error : (error ? JSON.stringify(error) : 'Unknown error occurred')}
          </p>
          
          <div className="bg-gray-100 rounded-lg p-4 mb-6 max-h-60 overflow-y-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left font-medium text-gray-500 pb-2">Table</th>
                  <th className="text-left font-medium text-gray-500 pb-2">Status</th>
                  <th className="text-left font-medium text-gray-500 pb-2">Details</th>
                </tr>
              </thead>
              <tbody>
                {(results || []).map((r) => (
                  <tr key={r.table} className="border-t border-gray-200">
                    <td className="py-2 font-mono">{r.table}</td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${r.status === 'ok' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {r.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2 text-gray-500 truncate max-w-xs">{r.details || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-4">
            <Button onClick={retry} variant="primary">Retry Connection</Button>
            <div className="text-xs text-gray-400 flex items-center">
               Please ensure Supabase is connected and seed.sql has been run.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};