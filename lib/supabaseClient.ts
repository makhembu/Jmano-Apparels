
import { createClient } from '@supabase/supabase-js';
import { Database } from '../database.types';

// Helper to safely access environment variables across Vite/Node environments
const getEnv = (key: string) => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    return (import.meta as any).env[key];
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return undefined;
};

// Fallback keys for testing/development when env vars are not set
// Using the credentials provided in your configuration
const FALLBACK_URL = 'https://irsurnyfjgjmlhlrkbeh.supabase.co';
const FALLBACK_KEY = 'sb_publishable_Zqgj49fvzbeSxzKBaRM38Q_6bLHV2rZ';

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || FALLBACK_URL;
// Check standard key, then user's specific key, then fallback
const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY') || FALLBACK_KEY;

// Log to console if we are using fallbacks to help with debugging
if (!getEnv('VITE_SUPABASE_URL')) {
  console.log('Environment variables not found. Using fallback Supabase credentials for testing.');
  if (supabaseKey === FALLBACK_KEY) {
      console.warn('NOTE: Using a placeholder Supabase Key. Database connections might fail or be restricted.');
  }
}

if (!supabaseUrl || !supabaseKey) {
  console.error('CRITICAL: Supabase credentials missing. The app will not function correctly.');
}

// Initialize the client
export const supabase = createClient<Database>(
  supabaseUrl || '',
  supabaseKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
