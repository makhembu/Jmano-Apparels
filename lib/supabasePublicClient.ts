
import { createClient } from '@supabase/supabase-js';
import { Database } from '../database.types';
import { SECRETS } from '../secrets';

// Helper to safely access environment variables across Vite/Node environments
const getEnv = (key: string) => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[key]) {
    return (import.meta as any).env[key];
  }
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

// Priority: Env Vars -> Secrets File -> Hardcoded Fallback
const supabaseUrl = envUrl ? formatUrl(envUrl) : (SECRETS.SUPABASE_URL || HARDCODED_URL);
const supabaseKey = envKey || SECRETS.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('[Supabase Public] CRITICAL: No API Key found.');
}

// Initialize the public client with NO session persistence
export const supabasePublic = createClient<Database>(
  supabaseUrl,
  supabaseKey || '', 
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);
