
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const syncUser = useCallback(async (sessionUser: any) => {
    if (!sessionUser) {
      setUser(null);
      return;
    }

    try {
      // TIMEOUT SAFETY: If DB fetch hangs (e.g. RLS deadlock), fallback after 8 seconds
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("User sync timed out")), 8000)
      );

      const dbPromise = supabase
        .from('users')
        .select('*')
        .eq('id', sessionUser.id)
        .maybeSingle();

      const { data, error } = await Promise.race([dbPromise, timeoutPromise]) as any;

      if (error) {
         console.warn("[Auth] DB Fetch Warning:", error.message);
      }

      if (data) {
        // Authoritative Profile found
        setUser({
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role as UserRole,
            createdAt: data.created_at || undefined,
        });
      } else {
        // No profile in DB (new user or data issue), create fallback from session
        console.warn("[Auth] No DB profile found, using session fallback.");
        const fallbackProfile: User = {
            id: sessionUser.id,
            email: sessionUser.email!,
            name: sessionUser.user_metadata?.name || sessionUser.email?.split('@')[0] || 'User',
            role: 'user', // Default safe role
            createdAt: new Date().toISOString()
        };
        
        setUser(fallbackProfile);
        
        // Self-heal: Create the missing profile in background
        api.createUserProfile(fallbackProfile).catch(err => console.error("Background profile creation failed", err));
      }
    } catch (criticalError: any) {
      console.error("User sync critical error:", criticalError);
      // Emergency fallback if DB is completely unreachable
      setUser({
          id: sessionUser.id,
          email: sessionUser.email!,
          name: sessionUser.user_metadata?.name || 'User',
          role: 'user',
          createdAt: new Date().toISOString()
      });
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // TIMEOUT SAFETY: Force completion after 12 seconds max
        const timeoutPromise = new Promise((resolve) => 
            setTimeout(() => {
                if (mounted) {
                    console.warn("[Auth] Initialization timed out, releasing block.");
                    resolve(null);
                }
            }, 12000)
        );

        const authTask = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) throw error;
            if (session?.user && mounted) {
                await syncUser(session.user);
            }
        };

        await Promise.race([authTask(), timeoutPromise]);

      } catch (e) {
        console.error("Auth initialization error:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      if (event === 'SIGNED_IN' && session?.user) {
          // Check if we need to sync (e.g. user changed or initial load didn't catch it)
          if (user?.id !== session.user.id) {
            setLoading(true);
            await syncUser(session.user);
            setLoading(false);
          }
      } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
          navigate('/'); 
      } else if (event === 'PASSWORD_RECOVERY') {
          navigate('/update-password');
      }
    });

    return () => { 
      mounted = false; 
      subscription.unsubscribe(); 
    };
  }, [syncUser, navigate]); // Removed 'user' dependency to avoid loop

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({ 
        email, 
        password, 
        options: { data: { name } } 
    });
    if (error) throw error;
  }, []);

  const logout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      console.error("Sign out error", err);
      setUser(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
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
