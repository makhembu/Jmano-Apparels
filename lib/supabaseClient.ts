import { createClient } from '@supabase/supabase-js';
import { Database } from '../database.types';

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

// Default values for prototype testing if env vars are missing
const DEFAULT_URL = 'https://irsurnyfjgjmlhlrkbeh.supabase.co';
const DEFAULT_KEY = 'sb_publishable_Zqgj49fvzbeSxzKBaRM38Q_6bLHV2rZ';

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || DEFAULT_URL;
const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY') || DEFAULT_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials missing. Ensure .env.local is configured.');
}

export const supabase = createClient<Database>(
  supabaseUrl || '', 
  supabaseKey || ''
);