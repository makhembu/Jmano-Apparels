
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
      // Use HEAD request to check existence/permissions without fetching data
      const { count, error } = await supabase
        .from(table as any)
        .select('*', { count: 'exact', head: true });

      if (error) {
        // PostgREST 42P01: relation does not exist (Table missing)
        if (error.code === '42P01') {
            return { table, status: 'missing_table', details: 'Table does not exist' };
        }
        
        // PostgREST 42501: permission denied (RLS)
        // If we get this, the DB is reachable and the table exists, so it IS healthy.
        if (error.code === '42501') {
            return { table, status: 'ok', details: 'RLS Protected' };
        }

        // AbortError (Navigation)
        if (error.message?.includes('AbortError') || error.message?.includes('aborted')) {
             return { table, status: 'aborted' };
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
        // Explicitly clear all storage before reloading
        localStorage.clear();
        sessionStorage.clear();
        window.location.reload();
        return;
    }

    setStatus('checking');
    setError(null);
    setResults([]);

    const TABLE_TIMEOUT = 15000; // Increased timeout for slower connections

    try {
        // Only check PUBLIC tables to avoid RLS false negatives
        // 'users' was causing issues for unauthenticated visitors
        const requiredTables = ['app_settings', 'products', 'categories'];
        
        const checks = await Promise.all(requiredTables.map(async (table) => {
          const timeoutPromise = new Promise<CheckResult>(resolve => 
             setTimeout(() => resolve({ table, status: 'timeout' }), TABLE_TIMEOUT)
          );
          return await Promise.race([verifyTable(table), timeoutPromise]);
        }));

        setResults(checks);

        // Analysis
        const missingTables = checks.filter(c => c.status === 'missing_table');
        const errors = checks.filter(c => c.status === 'error' || c.status === 'timeout');
        
        if (missingTables.length > 0) {
            setStatus('unseeded');
            setError('Database Connected, but Tables Missing. Please run SQL migrations.');
            return;
        }

        if (errors.length > 0) {
            console.error("[HealthCheck] Failed Tables:", errors);
            // Construct a detailed error message
            const details = errors.map(e => `${e.table} (${e.status}: ${e.details || 'unknown'})`).join(', ');
            setStatus('error');
            setError(`Connection unstable. Failed tables: ${details}`);
            return;
        }
        
        // Double check specifically for data content in app_settings (if table exists but empty)
        // We catch errors here separately to be safe
        try {
            const { count } = await supabase.from('app_settings').select('*', { count: 'exact', head: true });
            if (count === 0) {
                setStatus('empty');
                setError('Database connected but empty. Please run Seed scripts.');
                return;
            }
        } catch (settingsError) {
            console.warn("App Settings check skipped due to error:", settingsError);
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
