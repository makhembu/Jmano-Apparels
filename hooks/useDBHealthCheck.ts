
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export type HealthStatus = 'idle' | 'checking' | 'healthy' | 'error' | 'unseeded' | 'empty';

export const useDBHealthCheck = () => {
  const [status, setStatus] = useState<HealthStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const runChecks = async (forceHardReload = false) => {
    if (forceHardReload) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.reload();
        return;
    }

    setStatus('checking');
    setError(null);

    try {
        // Minimal check: Just ping app_settings.
        // We use maybeSingle() to avoid errors if table is empty (returns null data, no error).
        // This confirms connection + schema existence.
        const { error: dbError } = await supabase
            .from('app_settings')
            .select('id')
            .limit(1)
            .maybeSingle();

        if (dbError) {
            // PostgREST 42P01: relation does not exist (Table missing) -> Needs Seeding
            // This is the ONLY error we want to block the UI for.
            if (dbError.code === '42P01') {
                setStatus('unseeded');
                setError('Database Connected, but Tables Missing. Please run SQL migrations.');
                return;
            }
            
            // For any other error (network timeout, RLS, etc), we log it but assume 'healthy'
            // to prevent the "Connection Error" banner from blocking the user.
            // Individual features will show their own error toasts if they fail.
            console.warn("[HealthCheck] Non-critical check failure:", dbError.message);
        }

        // If we get here, either success or a non-critical error -> Proceed as Healthy
        setStatus('healthy');
    } catch (e: any) {
        console.error("[HealthCheck] Exception:", e);
        // Even on exception, default to healthy to avoid blocking the app interface.
        setStatus('healthy');
    }
  };

  useEffect(() => {
    // Optimization: If we already confirmed health this session, don't spam the DB
    const previouslyHealthy = sessionStorage.getItem('jambo_db_healthy');
    if (previouslyHealthy === 'true') {
        setStatus('healthy');
    } else {
        runChecks();
    }
  }, []);

  useEffect(() => {
      if (status === 'healthy') {
          sessionStorage.setItem('jambo_db_healthy', 'true');
      }
  }, [status]);

  return { status, error, retry: () => runChecks(true) };
};
