
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../lib/supabaseClient';
import { api } from '../lib/db';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const syncUser = useCallback(async (sessionUser: any) => {
    if (!sessionUser) return;
    
    try {
      // 1. Attempt to fetch profile
      // We wrap the API call to check if it's a real 'null' (missing) or an error
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', sessionUser.id)
        .maybeSingle();

      if (error) {
        console.error("Profile Fetch Error:", error);
        // If there's a DB error (like recursion), don't try to create a profile
        if (error.code === '42P17') {
           showToast("System sync error. Please run the SQL fix in seed_auth_fix.sql", 'error');
        }
        return;
      }

      // FIX: Manually map the raw DB user to the application's User type
      // to resolve type mismatches with `role` and `createdAt`.
      let profile: User | null = data ? {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role as UserRole,
        createdAt: data.created_at || undefined,
      } : null;
      
      // 2. Only if profile is strictly null (not found), do we create one
      if (!profile) {
          console.log("No profile record found, creating one for authenticated user...");
          const name = sessionUser.user_metadata?.name || sessionUser.email?.split('@')[0] || 'Ambassador';
          try {
            profile = await api.createUserProfile({
                id: sessionUser.id,
                email: sessionUser.email!,
                name: name,
                role: 'user'
            });
          } catch (createError: any) {
            // Handle race condition: profile created between check and insert
            if (createError.code === '23505') { 
               const retry = await api.getUserProfile(sessionUser.id);
               profile = retry;
            } else {
               throw createError;
            }
          }
      }
      
      if (profile) {
        setUser(profile);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      console.error("User sync critical failure:", error);
    }
  }, [showToast]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (data.session?.user && mounted) {
          await syncUser(data.session.user);
        }
      } catch (e: any) {
        // Ignore abort errors during init (likely double-mount in dev)
        if (e.name === 'AbortError' || e.message?.includes('aborted')) {
            return;
        }
        console.error("Auth init failed", e);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        await syncUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [syncUser]);

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      showToast(error.message === "Invalid login credentials" ? "Incorrect email or password." : error.message, 'error');
      throw error;
    }
    // Sync happens via onAuthStateChange
  }, [showToast]);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } }
    });
    if (error) {
      showToast(error.message, 'error');
      throw error;
    }
  }, [showToast]);

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) showToast("Error signing out", 'error');
    setUser(null);
  }, [showToast]);

  const refreshProfile = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) await syncUser(session.user);
  }, [syncUser]);

  const value = useMemo(() => ({ user, loading, login, signUp, logout, refreshProfile }), [user, loading, login, signUp, logout, refreshProfile]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
