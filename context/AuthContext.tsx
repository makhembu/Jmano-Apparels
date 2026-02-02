
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
    if (!sessionUser) return;
    
    try {
      const { data, error } = await supabase.from('users').select('*').eq('id', sessionUser.id).maybeSingle();

      if (error && error.code === '42P17') {
           showToast("System sync error. Please run the SQL fix.", 'error');
           return;
      }

      let profile: User | null = data ? {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role as UserRole,
        createdAt: data.created_at || undefined,
      } : null;
      
      if (!profile) {
          try {
            profile = await api.createUserProfile({
                id: sessionUser.id,
                email: sessionUser.email!,
                name: sessionUser.user_metadata?.name || sessionUser.email?.split('@')[0],
                role: 'user'
            });
          } catch (createError: any) {
            if (createError.code === '23505') { 
               profile = await api.getUserProfile(sessionUser.id);
            }
          }
      }
      
      if (profile) setUser(profile);
    } catch (error: any) {
      if (isAbortError(error)) return;
      console.error("User sync critical failure:", error);
    }
  }, [showToast]);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        // Cast to any to avoid type checking errors
        const { data, error } = await (supabase.auth as any).getSession();
        if (error) throw error;
        if (data.session?.user && mounted) await syncUser(data.session.user);
      } catch (e: any) {
        if (isAbortError(e)) return;
        console.error("Auth init failed", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    init();

    // Cast to any to avoid type checking errors
    const { data: { subscription } } = (supabase.auth as any).onAuthStateChange(async (event: string, session: any) => {
      if (!mounted) return;
      if (event === 'SIGNED_IN' && session?.user) await syncUser(session.user);
      else if (event === 'SIGNED_OUT') setUser(null);
    });

    return () => { mounted = false; subscription.unsubscribe(); };
  }, [syncUser]);

  const login = useCallback(async (email: string, password: string) => {
    // Cast to any to avoid type checking errors
    const { error } = await (supabase.auth as any).signInWithPassword({ email, password });
    if (error) {
      showToast(error.message === "Invalid login credentials" ? "Incorrect email or password." : error.message, 'error');
      throw error;
    }
  }, [showToast]);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    // Cast to any to avoid type checking errors
    const { error } = await (supabase.auth as any).signUp({ email, password, options: { data: { name } } });
    if (error) { showToast(error.message, 'error'); throw error; }
  }, [showToast]);

  const logout = useCallback(async () => {
    // Cast to any to avoid type checking errors
    const { error } = await (supabase.auth as any).signOut();
    if (error) showToast("Error signing out", 'error');
    setUser(null);
  }, [showToast]);

  const refreshProfile = useCallback(async () => {
    // Cast to any to avoid type checking errors
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
