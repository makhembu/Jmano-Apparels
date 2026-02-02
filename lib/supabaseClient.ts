
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

// Fallback keys for Sandbox/Development mode
// These allow the app to function immediately in preview environments without env var configuration
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
const envUrl = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL');
const envKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY') || getEnv('SUPABASE_ANON_KEY');

// Logic: Use Env vars if available (Production), otherwise use Fallback (Sandbox)
const supabaseUrl = envUrl ? formatUrl(envUrl) : FALLBACK_URL;
const supabaseKey = envKey || FALLBACK_KEY;

// Debug logging to help diagnose connection issues
if (envUrl && envKey) {
  console.log(`[Supabase] Using PRODUCTION credentials. Host: ${supabaseUrl.substring(0, 20)}...`);
} else {
  console.warn(`[Supabase] Using FALLBACK/SANDBOX credentials. Host: ${FALLBACK_URL}`);
  if (envUrl) console.log('[Supabase] Note: Env URL present but Key missing.');
  if (envKey) console.log('[Supabase] Note: Env Key present but URL missing.');
}

if (!supabaseUrl || !supabaseKey) {
  console.error('CRITICAL: Supabase credentials could not be determined.');
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
      storageKey: 'jambo_auth_token_v1', // Unique key to prevent collisions
    },
  }
);
