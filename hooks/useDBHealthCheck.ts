
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export type HealthStatus = 'idle' | 'checking' | 'healthy' | 'error';

interface CheckResult {
  table: string;
  status: 'ok' | 'missing' | 'schema_mismatch' | 'timeout' | 'aborted';
  details?: string;
}

export const useDBHealthCheck = () => {
  const [status, setStatus] = useState<HealthStatus>('idle');
  const [results, setResults] = useState<CheckResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const verifyTable = async (table: string, columns: string[]): Promise<CheckResult> => {
    try {
      const { error } = await supabase
        .from(table as any)
        .select(columns.join(','))
        .limit(1);

      if (error) {
        // If error looks like an abort/network issue, classify as timeout/aborted
        if (error.message?.includes('AbortError') || error.message?.includes('aborted')) {
             return { table, status: 'aborted', details: 'Request cancelled' };
        }
        console.warn(`[HealthCheck] Issue on table '${table}':`, error.message);
        return { table, status: 'schema_mismatch', details: error.message };
      }
      
      return { table, status: 'ok' };
    } catch (e: any) {
      if (e.name === 'AbortError' || e.message?.includes('aborted')) {
          return { table, status: 'aborted', details: 'Request cancelled' };
      }
      console.error(`[HealthCheck] Error checking table '${table}':`, e);
      return { table, status: 'missing', details: e.message };
    }
  };

  const runChecks = async (forceHardReload = false) => {
    if (forceHardReload) {
        window.location.href = window.location.href.split('#')[0] + '?t=' + Date.now();
        return;
    }

    setStatus('checking');
    setError(null);
    setResults([]);

    // OPTIMIZATION: Light Check
    // Just check app_settings first. If this works, the DB is likely fine.
    // This reduces startup overhead significantly.
    const lightCheck = await verifyTable('app_settings', ['id']);
    
    if (lightCheck.status === 'ok') {
        setStatus('healthy');
        return;
    }
    
    // If aborted, don't show error, just stay in checking or idle
    if (lightCheck.status === 'aborted') {
        // Likely page navigation or strict mode re-mount
        return; 
    }

    // If light check failed, run FULL diagnostic
    console.warn('[HealthCheck] Light check failed, running full diagnostic...');
    const TABLE_TIMEOUT = 15000;

    try {
        const schemaRequirements = [
          { table: 'categories', columns: ['key', 'label'] },
          { table: 'products', columns: ['id', 'title'] },
          { table: 'app_settings', columns: ['id', 'slogan'] },
          { table: 'orders', columns: ['id', 'status'] }
        ];

        const checks = await Promise.all(schemaRequirements.map(async (req) => {
          const timeoutPromise = new Promise<CheckResult>(resolve => 
             setTimeout(() => resolve({
                table: req.table,
                status: 'timeout',
                details: `Connection timed out`
             }), TABLE_TIMEOUT)
          );
          
          const verifyPromise = verifyTable(req.table, req.columns);
          return await Promise.race([verifyPromise, timeoutPromise]);
        }));

        setResults(checks);

        const hasErrors = checks.some(c => c.status !== 'ok');
      
        if (hasErrors) {
            const firstError = checks.find(c => c.status !== 'ok');
            // Don't flag 'aborted' as a system error
            if (firstError?.status === 'aborted') return;
            
            throw new Error(`DB Integrity: ${firstError?.table} is ${firstError?.status}`);
        }
        
        setStatus('healthy');
    } catch (e: any) {
        setStatus('error');
        setError(e.message);
    }
  };

  useEffect(() => {
    // Run checks on mount, but non-blocking (handled by component)
    runChecks();
  }, []);

  return { status, results, error, retry: () => runChecks(true) };
};
