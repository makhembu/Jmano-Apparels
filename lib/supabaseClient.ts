import { createClient } from '@supabase/supabase-js';
import { Database } from '../database.types';

// WARNING: Hardcoding API keys is unsafe for production. 
// These keys are allowed here for testing/prototyping purposes only.
// In a real production environment, use environment variables (process.env.REACT_APP_SUPABASE_URL, etc).

const supabaseUrl = 'https://irsurnyfjgjmlhlrkbeh.supabase.co';
const supabaseKey = 'sb_publishable_Zqgj49fvzbeSxzKBaRM38Q_6bLHV2rZ';

console.warn('[Security] Supabase client initialized with hardcoded keys. Do not use in production.');

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
