
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../lib/supabaseClient';
import { api } from '../lib/db';
import { useToast } from './ToastContext';
import { isAbortError } from '../lib/utils';

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
    if (!sessionUser) {
      setUser(null);
      return;
    }
    
    try {
      // 1. Attempt to fetch full profile from public.users table
      // We use maybeSingle() to avoid 406 errors if row doesn't exist
      const { data, error } = await supabase.from('users').select('*').eq('id', sessionUser.id).maybeSingle();

      if (error) {
         // Log warning but don't crash execution flow
         console.warn("[Auth] DB Fetch Warning:", error.message);
      }

      let profile: User | null = data ? {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role as UserRole,
        createdAt: data.created_at || undefined,
      } : null;
      
      // 2. If no profile in DB (or DB error), Create fallback profile from Session
      if (!profile) {
          // Construct basic profile from Auth Metadata to keep app running
          profile = {
              id: sessionUser.id,
              email: sessionUser.email!,
              name: sessionUser.user_metadata?.name || sessionUser.email?.split('@')[0] || 'User',
              role: 'user', // Default role
              createdAt: new Date().toISOString()
          };

          // Background: Try to create/sync the missing profile record
          api.createUserProfile(profile).catch(err => console.error("Background profile creation failed", err));
      }
      
      setUser(profile);
    } catch (criticalError: any) {
      if (isAbortError(criticalError)) return;
      
      console.error("User sync critical failure:", criticalError);
      
      // Absolute fallback - ensure user state is populated so UI doesn't hang
      setUser({
         id: sessionUser.id,
         email: sessionUser.email || '',
         name: sessionUser.user_metadata?.name || 'Session User',
         role: 'user'
      });
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        // Cast to any to bypass strict type check for now
        const { data, error } = await (supabase.auth as any).getSession();
        
        if (data?.session?.user && mounted) {
            await syncUser(data.session.user);
        }
      } catch (e: any) {
        if (!isAbortError(e)) console.error("Auth init failed", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    init();

    const { data: { subscription } } = (supabase.auth as any).onAuthStateChange(async (event: string, session: any) => {
      if (!mounted) return;
      
      if (event === 'SIGNED_IN' && session?.user) {
          setLoading(true);
          await syncUser(session.user);
          setLoading(false);
      } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Optional: Refresh profile on token refresh if needed
          // await syncUser(session.user);
      }
    });

    return () => { mounted = false; subscription.unsubscribe(); };
  }, [syncUser]);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await (supabase.auth as any).signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    const { error } = await (supabase.auth as any).signUp({ 
        email, 
        password, 
        options: { data: { name } } 
    });
    if (error) throw error;
  }, []);

  const logout = useCallback(async () => {
    const { error } = await (supabase.auth as any).signOut();
    if (error) console.error("Sign out error", error);
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const { data: { session } } = await (supabase.auth as any).getSession();
    if (session?.user) await syncUser(session.user);
  }, [syncUser]);

  const value = useMemo(() => ({ user, loading, login, signUp, logout, refreshProfile }), [user, loading, login, signUp, logout, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
