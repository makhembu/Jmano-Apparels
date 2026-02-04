
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Validate Admin Authorization
    // Create a client with the user's JWT to verify they are actually logged in
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error("Missing Authorization header");

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) throw new Error("Unauthorized");

    // CRITICAL SECURITY CHECK: Verify the requester is an Admin
    // We check the public.users table for the role.
    const { data: userProfile, error: profileError } = await supabaseClient
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile || userProfile.role !== 'admin') {
      console.error(`Unauthorized access attempt by user ${user.id} (${user.email})`);
      throw new Error("Forbidden: Admin privileges required.");
    }

    const { email, password, name, role } = await req.json();

    if (!email || !password) throw new Error("Email and password are required.");

    // 2. Initialize Supabase Admin Client (Service Role) for privileged actions
    const sbServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const sbUrl = Deno.env.get('SUPABASE_URL');

    if (!sbUrl || !sbServiceKey) {
      throw new Error("Missing server configuration (SUPABASE_SERVICE_ROLE_KEY)");
    }

    const supabaseAdmin = createClient(sbUrl, sbServiceKey);

    // 3. Create Auth User
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm so they can login immediately
      user_metadata: { name: name }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("Failed to create auth user");

    // 4. Create Public Profile
    const { error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email: email,
        name: name,
        role: role || 'user',
        created_at: new Date().toISOString()
      });

    if (insertError) {
        // Rollback: Delete the Auth user if profile creation fails to keep data clean
        console.error("Profile creation failed, rolling back auth user:", insertError);
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        throw insertError;
    }

    return new Response(JSON.stringify({ user: authData.user }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error("Edge Function Error:", error);
    const status = error.message.includes("Forbidden") || error.message.includes("Unauthorized") ? 403 : 400;
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: status,
    });
  }
});
