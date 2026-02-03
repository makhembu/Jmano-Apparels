
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserRole } from '../types';
import { supabase } from '../lib/supabaseClient';
import { useToast } from './ToastContext';
import { isAbortError } from '../lib/utils';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  // State
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Guards
  const listenerInitialized = useRef(false);
  const mountedRef = useRef(true);

  // Helper: Fetch Profile (Single Source of Truth)
  const fetchProfile = useCallback(async (uid: string, email: string, metaName?: string) => {
    // 1. Default Fallback
    const fallback: User = {
      id: uid,
      email: email,
      name: metaName || email.split('@')[0] || 'User',
      role: 'user', 
      createdAt: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', uid)
        .maybeSingle();
      
      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role as UserRole,
          createdAt: data.created_at || undefined,
        };
      }
    } catch (err: any) {
      console.warn(`[Auth] Profile fetch warning:`, err.message);
    }
    
    return fallback;
  }, []);

  // --- CORE INITIALIZATION LOGIC ---
  useEffect(() => {
    // Strict Mode Guard: Prevent double initialization
    if (listenerInitialized.current) return;
    listenerInitialized.current = true;

    console.log("[Auth] 🔐 Initializing auth listener");
    let subscription: any = null;

    const init = async () => {
      try {
        // 1. Check Initial Session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error("[Auth] Session restore error:", error.message);
            throw error;
        }
        
        if (session?.user) {
          console.log(`[Auth] 👤 Restored session for ${session.user.email}`);
          const profile = await fetchProfile(
            session.user.id,
            session.user.email!,
            session.user.user_metadata?.name
          );
          if (mountedRef.current) setUser(profile);
        } else {
          console.log("[Auth] No active session found (Guest)");
        }
      } catch (e: any) {
        if (!isAbortError(e)) {
          console.error("[Auth] Init Critical Error", e);
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
          setIsAuthReady(true);
        }
      }

      // 2. Set up Listener
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log(`[Auth] Event: ${event}`);
        
        if (!mountedRef.current) return;

        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
          // Only show loading on explicit sign in, not silent refresh
          if (event === 'SIGNED_IN') setLoading(true);
          
          const profile = await fetchProfile(
            session.user.id,
            session.user.email!,
            session.user.user_metadata?.name
          );
          
          if (mountedRef.current) {
            setUser(profile);
            setLoading(false);
            if (!isAuthReady) setIsAuthReady(true);
          }
        } else if (event === 'SIGNED_OUT') {
          if (mountedRef.current) {
            setUser(null);
            setLoading(false);
            setIsAuthReady(true); // Ensure app unblocks even on logout
            navigate('/');
          }
        }
      });
      subscription = data.subscription;
    };

    init();

    return () => {
      mountedRef.current = false;
      if (subscription) subscription.unsubscribe();
      listenerInitialized.current = false;
    };
  }, []);

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
    await supabase.auth.signOut();
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const profile = await fetchProfile(user.id, user.email, user.name);
    if (mountedRef.current) setUser(profile);
  }, [user, fetchProfile]);

  const value = useMemo(() => ({ 
    user, 
    loading, 
    isAuthReady, 
    login, 
    signUp, 
    logout, 
    refreshProfile 
  }), [user, loading, isAuthReady, login, signUp, logout, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
