
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserRole } from '../types';
import { supabase } from '../lib/supabaseClient';
import { useToast } from './ToastContext';

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

// Using 'any' cast for auth client to bypass type errors with Supabase v2 definitions
const authClient = supabase.auth as any;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  // State
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const mountedRef = useRef(true);

  // Helper: Fetch Profile
  const fetchProfile = useCallback(async (uid: string, email: string, metaName?: string) => {
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
    let subscription: any = null;

    const handleSession = async (session: any) => {
        if (session?.user) {
            console.log(`[Auth] Session active for ${session.user.email}`);
            const profile = await fetchProfile(
                session.user.id,
                session.user.email!,
                session.user.user_metadata?.name
            );
            if (mountedRef.current) {
                setUser(profile);
            }
        } else {
            console.log("[Auth] No session");
            if (mountedRef.current) {
                setUser(null);
            }
        }
        if (mountedRef.current) {
            setLoading(false);
            setIsAuthReady(true);
        }
    };

    // 1. Set up the listener FIRST
    const { data } = authClient.onAuthStateChange((event: string, session: any) => {
      console.log(`[Auth] Event: ${event}`);
      if (!mountedRef.current) return;

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        handleSession(session);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
        setIsAuthReady(true);
        navigate('/');
      }
    });
    subscription = data.subscription;

    // 2. Check explicitly once on mount (handles edge case where listener might miss the initial state)
    authClient.getSession().then(({ data: { session } }: any) => {
        if (!isAuthReady) {
            handleSession(session);
        }
    });

    return () => {
      mountedRef.current = false;
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    const { error } = await authClient.signInWithPassword({ email, password });
    if (error) {
        setLoading(false);
        throw error;
    }
    // State update handled by listener
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    setLoading(true);
    const { error } = await authClient.signUp({ 
        email, 
        password, 
        options: { data: { name } } 
    });
    if (error) {
        setLoading(false);
        throw error;
    }
    // If auto-confirm is off, they won't be signed in yet.
    if (mountedRef.current) setLoading(false);
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    await authClient.signOut();
    // State update handled by listener
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
