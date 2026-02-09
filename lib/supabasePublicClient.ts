
import { createClient } from '@supabase/supabase-js';
import { Database } from '../database.types';
import { SECRETS } from '../secrets';

const getEnv = (key: string) => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    return (import.meta as any).env[key];
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return undefined;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL') || SECRETS.SUPABASE_URL;
// FIX: Changed SUPABASE_PUBLISHABLE_KEY to SUPABASE_PUBLISHABLE_DEFAULT_KEY
const supabaseKey = getEnv('VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY') || getEnv('SUPABASE_PUBLISHABLE_DEFAULT_KEY') || getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY') || SECRETS.SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export const supabasePublic = createClient<Database>(
  supabaseUrl || '',
  supabaseKey || '', 
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);