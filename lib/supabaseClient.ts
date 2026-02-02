
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

// Fallback keys for testing/development (The Populated Demo Database)
const FALLBACK_URL = 'https://irsurnyfjgjmlhlrkbeh.supabase.co';
const FALLBACK_KEY = 'sb_publishable_Zqgj49fvzbeSxzKBaRM38Q_6bLHV2rZ';

// Sanitize URL: Remove trailing slash, ensure https
const formatUrl = (url?: string) => {
  if (!url) return '';
  let clean = url.trim();
  if (!clean.startsWith('http')) clean = `https://${clean}`;
  if (clean.endsWith('/')) clean = clean.slice(0, -1);
  return clean;
};

// --- CONFIGURATION ---
// Priority: 1. Vercel/Vite Env Vars, 2. Fallback Demo Keys

const rawUrl = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL');
const rawKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY') || getEnv('SUPABASE_ANON_KEY');

// Determine if we are using real credentials or fallback
const isRealEnv = !!rawUrl && !!rawKey;
const supabaseUrl = isRealEnv ? formatUrl(rawUrl) : FALLBACK_URL;
const supabaseKey = isRealEnv ? rawKey : FALLBACK_KEY;

if (!isRealEnv) {
  console.log('[Supabase] Environment variables missing. Using DEMO MODE (Fallback).');
} else {
  console.log('[Supabase] Client initialized with Environment Variables.');
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
