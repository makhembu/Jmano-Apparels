
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
      const { data, error } = await supabase
        .from(table as any)
        .select('count', { count: 'exact', head: true });

      if (error) {
        // PostgREST 42P01: relation does not exist (Table missing)
        if (error.code === '42P01') {
            return { table, status: 'missing_table', details: 'Table does not exist' };
        }
        // AbortError (Navigation)
        if (error.message?.includes('AbortError') || error.message?.includes('aborted')) {
             return { table, status: 'aborted' };
        }
        return { table, status: 'error', details: error.message };
      }
      
      // Check if table is empty (count === 0)
      // Note: count can be null if head request fails to get count, but usually returns number
      if (data === null && (error as any) === null) {
          // Sometimes head:true returns null data but valid count in header, supabase-js handles this usually
          // For simplicity, if we got here without error, the table exists.
      }
      
      return { table, status: 'ok' }; // We treat 'ok' as table exists and is accessible
    } catch (e: any) {
      if (e.name === 'AbortError') return { table, status: 'aborted' };
      return { table, status: 'error', details: e.message };
    }
  };

  const runChecks = async (forceHardReload = false) => {
    if (forceHardReload) {
        window.location.reload();
        return;
    }

    setStatus('checking');
    setError(null);
    setResults([]);

    const TABLE_TIMEOUT = 10000;

    try {
        const requiredTables = ['app_settings', 'products', 'categories', 'users'];
        
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
            setStatus('error');
            setError('Connection unstable. Check internet or API keys.');
            return;
        }
        
        // Double check specifically for data content in app_settings (if table exists but empty)
        const { count } = await supabase.from('app_settings').select('*', { count: 'exact', head: true });
        if (count === 0) {
            setStatus('empty');
            setError('Database connected but empty. Please run Seed scripts.');
            return;
        }

        setStatus('healthy');
    } catch (e: any) {
        setStatus('error');
        setError(e.message);
    }
  };

  useEffect(() => {
    runChecks();
  }, []);

  return { status, results, error, retry: () => runChecks(true) };
};
