
import { createClient } from '@supabase/supabase-js';
import { Database } from '../database.types';
import { SECRETS } from '../secrets';

// Helper to safely access environment variables
const getEnv = (key: string) => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    return (import.meta as any).env[key];
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return undefined;
};

// Prioritize standard Vercel/Supabase environment variables
// Fallback to SECRETS for local development without .env
const supabaseUrl = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL') || SECRETS.SUPABASE_URL;
const supabaseKey = getEnv('VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY') || getEnv('SUPABASE_PUBLISHABLE_DEFAULT_KEY') || getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY') || SECRETS.SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('[Supabase] CRITICAL: Client configuration missing. Please check .env or secrets.ts');
}

export const supabase = createClient<Database>(
  supabaseUrl || '',
  supabaseKey || '', 
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'jambo_auth_v1',
    },
  }
);
