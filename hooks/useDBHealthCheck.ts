import { useState, useEffect } from 'react';
import { api } from '../lib/db';
import { supabase } from '../lib/supabaseClient';

export type HealthStatus = 'idle' | 'checking' | 'healthy' | 'error';

interface CheckResult {
  table: string;
  status: 'ok' | 'missing' | 'schema_mismatch';
  details?: string;
}

export const useDBHealthCheck = () => {
  const [status, setStatus] = useState<HealthStatus>('idle');
  const [results, setResults] = useState<CheckResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const verifyTable = async (table: string, columns: string[]): Promise<CheckResult> => {
    try {
      // Attempt to select specific critical columns (limit 1 to be fast)
      // Cast table to any because TS can't verify dynamic string against strict table names
      const { error } = await supabase
        .from(table as any)
        .select(columns.join(','))
        .limit(1);

      if (error) {
        console.error(`Health check failed for ${table}:`, error.message);
        return { table, status: 'schema_mismatch', details: error.message };
      }

      return { table, status: 'ok' };
    } catch (e: any) {
      return { table, status: 'missing', details: e.message };
    }
  };

  const runChecks = async () => {
    setStatus('checking');
    setError(null);
    setResults([]);

    // Define critical schema expectations based on seed.sql
    const schemaRequirements = [
      { 
        table: 'categories', 
        columns: ['key', 'label', 'color', 'bg_class'] 
      },
      { 
        table: 'products', 
        columns: ['id', 'title', 'price', 'category_key', 'image', 'stock_quantity'] 
      },
      { 
        table: 'app_settings', 
        columns: ['id', 'slogan', 'currency', 'tax_rate'] 
      },
      {
        table: 'cart_items',
        columns: ['user_id', 'product_id', 'quantity', 'selected_size']
      },
      {
        table: 'blog_posts',
        columns: ['id', 'title', 'slug', 'content', 'status']
      },
      {
        table: 'shipping_zones',
        columns: ['id', 'countries', 'base_rate']
      }
    ];

    try {
      const checks = await Promise.all(
        schemaRequirements.map(req => verifyTable(req.table, req.columns))
      );

      setResults(checks);

      const hasErrors = checks.some(c => c.status !== 'ok');
      
      if (hasErrors) {
        setStatus('error');
        setError("Database integrity check failed. Some tables or columns are missing.");
      } else {
        // Verify seeded data existence (simple check)
        const { count } = await supabase.from('products').select('*', { count: 'exact', head: true });
        if (count === 0) {
           setStatus('error');
           setError("Database tables exist but appear empty. Please run seed.sql.");
        } else {
           setStatus('healthy');
        }
      }
    } catch (e: any) {
      setStatus('error');
      setError(e.message || "Unknown database connection error");
    }
  };

  useEffect(() => {
    runChecks();
  }, []);

  return { status, results, error, retry: runChecks };
};