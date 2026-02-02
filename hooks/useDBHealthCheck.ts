
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export type HealthStatus = 'idle' | 'checking' | 'healthy' | 'error' | 'unseeded' | 'empty';

interface CheckResult {
  table: string;
  status: 'ok' | 'missing_table' | 'empty' | 'timeout' | 'aborted' | 'error';
  details?: string;
}

export const useDBHealthCheck = () => {
  const [status, setStatus] = useState<HealthStatus>('idle');
  const [results, setResults] = useState<CheckResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const verifyTable = async (table: string): Promise<CheckResult> => {
    try {
      // Changed from HEAD to simple SELECT ID limit 1
      // This is often more reliable through proxies and firewalls
      const { data, error, status } = await supabase
        .from(table as any)
        .select('id')
        .limit(1);

      if (error) {
        // PostgREST 42P01: relation does not exist (Table missing)
        if (error.code === '42P01') {
            return { table, status: 'missing_table', details: 'Table does not exist' };
        }
        
        // PostgREST 42501: permission denied (RLS)
        if (error.code === '42501') {
            return { table, status: 'ok', details: 'RLS Protected' };
        }

        if (error.message?.includes('AbortError') || error.message?.includes('aborted')) {
             return { table, status: 'aborted' };
        }
        
        // PGRST204 means success but no content (for HEAD), but here we do SELECT
        // If status is 2xx, we are good even if error object is populated with hints
        if (status >= 200 && status < 300) {
            return { table, status: 'ok' };
        }

        return { table, status: 'error', details: error.message };
      }
      
      // If we got here, the request succeeded
      return { table, status: 'ok' }; 
    } catch (e: any) {
      if (e.name === 'AbortError') return { table, status: 'aborted' };
      return { table, status: 'error', details: e.message };
    }
  };

  const runChecks = async (forceHardReload = false) => {
    if (forceHardReload) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.reload();
        return;
    }

    setStatus('checking');
    setError(null);
    setResults([]);

    const TABLE_TIMEOUT = 10000; // 10s timeout

    try {
        // Reduced to single critical table to avoid connection saturation in sandbox
        const criticalTable = 'app_settings';
        
        const timeoutPromise = new Promise<CheckResult>(resolve => 
             setTimeout(() => resolve({ table: criticalTable, status: 'timeout' }), TABLE_TIMEOUT)
        );
        
        const result = await Promise.race([verifyTable(criticalTable), timeoutPromise]);
        
        setResults([result]);

        if (result.status === 'missing_table') {
            setStatus('unseeded');
            setError('Database Connected, but Tables Missing. Please run SQL migrations.');
            return;
        }

        if (result.status === 'error' || result.status === 'timeout') {
            console.warn(`[HealthCheck] ${criticalTable} check failed:`, result);
            // If it's a timeout, it might just be slow internet, but the app might still work.
            // We set error, but the UI allows dismissal.
            setStatus('error');
            setError(`Connection unstable (${result.status}). Check internet or API keys.`);
            return;
        }
        
        // Double check specifically for data content in app_settings (if table exists but empty)
        try {
            const { count } = await supabase.from('app_settings').select('*', { count: 'exact', head: true });
            if (count === 0) {
                setStatus('empty');
                setError('Database connected but empty. Please run Seed scripts.');
                return;
            }
        } catch (settingsError) {
            console.warn("App Settings count check skipped:", settingsError);
        }

        setStatus('healthy');
    } catch (e: any) {
        setStatus('error');
        setError(e.message || "Unknown health check error");
    }
  };

  useEffect(() => {
    runChecks();
  }, []);

  return { status, results, error, retry: () => runChecks(true) };
};
