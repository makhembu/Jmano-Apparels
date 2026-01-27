import { createClient } from '@supabase/supabase-js';
import { Database } from '../database.types';

// Hardcoded fallbacks for development/testing
const DEFAULT_URL = 'https://irsurnyfjgjmlhlrkbeh.supabase.co';
const DEFAULT_KEY = 'sb_publishable_Zqgj49fvzbeSxzKBaRM38Q_6bLHV2rZ';

// Helper to safely access environment variables
const getEnv = (key: string) => {
  // Check import.meta.env (Vite)
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    return (import.meta as any).env[key];
  }
  // Check process.env (Node/Webpack)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return undefined;
};

const envUrl = getEnv('VITE_SUPABASE_URL');
const envKey = getEnv('VITE_SUPABASE_ANON_KEY');

// Use env vars if available, otherwise fall back to hardcoded values
const supabaseUrl = envUrl || DEFAULT_URL;
const supabaseKey = envKey || DEFAULT_KEY;

if (!envUrl || !envKey) {
  console.warn('⚠️ Using hardcoded Supabase credentials. Ensure environment variables are set for production.');
}

let client;

try {
    client = createClient<Database>(
      supabaseUrl,
      supabaseKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      }
    );
} catch (e) {
    console.error("Failed to initialize Supabase client:", e);
    // Fallback for extreme failure cases to prevent white screen crash
    client = createClient<Database>('https://placeholder.supabase.co', 'placeholder');
}

export const supabase = client;