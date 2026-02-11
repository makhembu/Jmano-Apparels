
import { createClient } from '@supabase/supabase-js';

/**
 * Verifies the Authorization header Bearer token.
 * Returns the user object if valid, throws error if invalid.
 * 
 * @param {Request} req 
 * @param {boolean} requireAdmin - If true, checks if user role is 'admin' or has admin metadata
 */
export async function verifyAuth(req, requireAdmin = false) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    throw new Error('Missing Authorization header');
  }

  const token = authHeader.replace('Bearer ', '');
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!supabaseUrl || !supabaseKey) {
      throw new Error('Server configuration error: Missing Supabase keys');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new Error('Invalid or expired token');
  }

  if (requireAdmin) {
    // Check public.users table for role
    // We use the service role key here ONLY for the lookup to bypass RLS for the check itself
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) throw new Error("Server configuration error: Missing Service Key for Admin Check");
    
    const adminClient = createClient(supabaseUrl, serviceKey);
    const { data: profile } = await adminClient
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
        
    if (!profile || profile.role !== 'admin') {
        throw new Error('Forbidden: Admin access required');
    }
  }

  return user;
}
