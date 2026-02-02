import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export type HealthStatus = 'idle' | 'checking' | 'healthy' | 'error';

interface CheckResult {
  table: string;
  status: 'ok' | 'missing' | 'schema_mismatch' | 'timeout';
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
        console.error(`[HealthCheck] Error on table '${table}':`, error);
        return { table, status: 'schema_mismatch', details: error.message };
      }
      
      return { table, status: 'ok' };
    } catch (e: any) {
      console.error(`[HealthCheck] Catastrophic error checking table '${table}':`, e);
      return { table, status: 'missing', details: e.message };
    }
  };

  const runChecks = async (forceHardReload = false) => {
    if (forceHardReload) {
        // Bust cache completely
        window.location.href = window.location.href.split('#')[0] + '?t=' + Date.now();
        return;
    }

    setStatus('checking');
    setError(null);
    setResults([]);

    const TABLE_TIMEOUT = 30000; // Increased to 30 seconds to allow for project wake-up

    try {
        console.log('[HealthCheck] Starting database integrity checks...');
        
        const schemaRequirements = [
          { table: 'categories', columns: ['key', 'label', 'color', 'bg_class'] },
          { table: 'products', columns: ['id', 'title', 'price', 'category_key', 'images', 'stock_quantity'] },
          { table: 'app_settings', columns: ['id', 'slogan', 'currency', 'tax_rate'] },
          { table: 'cart_items', columns: ['user_id', 'product_id', 'quantity', 'selected_size'] },
          { table: 'blog_posts', columns: ['id', 'title', 'slug', 'content', 'status'] },
          { table: 'shipping_zones', columns: ['id', 'countries', 'base_rate'] }
        ];

        const checks = await Promise.all(schemaRequirements.map(async (req) => {
          const timeoutPromise = new Promise<CheckResult>(resolve => 
             setTimeout(() => resolve({
                table: req.table,
                status: 'timeout',
                details: `Connection to table timed out after ${TABLE_TIMEOUT / 1000}s. Project may be paused in Supabase.`
             }), TABLE_TIMEOUT)
          );
          
          const verifyPromise = verifyTable(req.table, req.columns);
          return await Promise.race([verifyPromise, timeoutPromise]);
        }));

        setResults(checks);

        const hasErrors = checks.some(c => c.status !== 'ok');
      
        if (hasErrors) {
            const firstError = checks.find(c => c.status !== 'ok');
            throw new Error(`Database integrity check failed on table '${firstError?.table}'. Status: ${firstError?.status}. Details: ${firstError?.details || 'N/A'}`);
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