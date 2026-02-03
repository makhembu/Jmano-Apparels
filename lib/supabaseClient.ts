
import { createClient } from '@supabase/supabase-js';
import { Database } from '../database.types';
import { SECRETS } from '../secrets';

// Helper to safely access environment variables
const getEnv = (key: string) => {
  // Vite standard
  if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[key]) {
    return (import.meta as any).env[key];
  }
  // Fallback for some node/build environments
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return undefined;
};

const formatUrl = (url?: string) => {
  if (!url) return '';
  let clean = url.trim();
  if (!clean.startsWith('http')) clean = `https://${clean}`;
  if (clean.endsWith('/')) clean = clean.slice(0, -1);
  return clean;
};

// --- CONFIGURATION ---
const PROJECT_ID = 'irsurnyfjgjmlhlrkbeh'; 
const HARDCODED_URL = `https://${PROJECT_ID}.supabase.co`;

const envUrl = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL');
const envKey = getEnv('VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY') || getEnv('VITE_SUPABASE_ANON_KEY');

const supabaseUrl = envUrl ? formatUrl(envUrl) : (SECRETS.SUPABASE_URL || HARDCODED_URL);
const supabaseKey = envKey || SECRETS.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('[Supabase] CRITICAL: No API Key found. Auth will fail.');
}

// Custom Storage Adapter to be explicit
const localStorageAdapter = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(key);
  },
};

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseKey || '', 
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'jambo_auth_v1', // Simplified key
      storage: localStorageAdapter,
    },
  }
);