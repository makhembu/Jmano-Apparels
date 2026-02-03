
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
    console.log(`[Auth] 📥 Fetching profile for ${email}`);
    
    // 1. Default Fallback
    const fallback: User = {
      id: uid,
      email: email,
      name: metaName || email.split('@')[0] || 'User',
      role: 'user', 
      createdAt: new Date().toISOString()
    };

    try {
      // 2. Single DB Query (No retries loop here, let UI handle retry if needed)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', uid)
        .maybeSingle();
      
      if (!error && data) {
        console.log(`[Auth] ✅ Profile loaded: role=${data.role}`);
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
    
    console.log("[Auth] Using fallback profile");
    return fallback;
  }, []);

  // --- CORE INITIALIZATION LOGIC ---
  useEffect(() => {
    // Strict Mode Guard: Prevent double initialization
    if (listenerInitialized.current) return;
    listenerInitialized.current = true;

    console.log("[Auth] 🔐 Initializing auth listener (ONCE)");
    let subscription: any = null;

    const init = async () => {
      try {
        // 1. Check Initial Session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log("[Auth] 👤 Initial session found");
          const profile = await fetchProfile(
            session.user.id,
            session.user.email!,
            session.user.user_metadata?.name
          );
          if (mountedRef.current) setUser(profile);
        }
      } catch (e) {
        console.error("[Auth] Init Error", e);
      } finally {
        if (mountedRef.current) {
          setLoading(false);
          setIsAuthReady(true);
        }
      }

      // 2. Set up Listener (ONCE)
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log(`[Auth] Event: ${event}`);
        
        if (!mountedRef.current) return;

        if (event === 'SIGNED_IN' && session?.user) {
          setLoading(true);
          const profile = await fetchProfile(
            session.user.id,
            session.user.email!,
            session.user.user_metadata?.name
          );
          if (mountedRef.current) {
            setUser(profile);
            setLoading(false);
          }
        } else if (event === 'SIGNED_OUT') {
          if (mountedRef.current) {
            setUser(null);
            setLoading(false);
            navigate('/');
          }
        }
        // Ignored: TOKEN_REFRESHED, INITIAL_SESSION (handled manually above)
      });
      subscription = data.subscription;
    };

    init();

    return () => {
      mountedRef.current = false;
      if (subscription) subscription.unsubscribe();
      listenerInitialized.current = false;
    };
  }, []); // Empty dependency array is CRITICAL

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
