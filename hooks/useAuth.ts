import { useState, useEffect } from 'react';
import { User, Order, ShippingAddress } from '../types';
import { supabase } from '../lib/supabaseClient';
import { api } from '../lib/db';
import { useToast } from '../context/ToastContext';

export const useAuth = (cartTotal: number, cartItems: any[]) => {
  const { showToast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [authLoading, setAuthLoading] = useState(true);

  // Sync user profile from Supabase Auth -> DB Profile
  const syncUser = async (sessionUser: any) => {
    try {
      let profile = await api.getUserProfile(sessionUser.id);
      
      if (!profile) {
          // Create profile if missing
          const name = sessionUser.user_metadata?.name || sessionUser.email?.split('@')[0] || 'User';
          profile = await api.createUserProfile({
              id: sessionUser.id,
              email: sessionUser.email!,
              name: name,
              role: 'user'
          });
          showToast(`Welcome to the family, ${profile.name}!`, 'success');
      }
      
      setUser(profile);
      
      // Load Orders (All if admin, specific if user)
      try {
          if (profile.role === 'admin') {
              const allOrders = await api.getAllOrders();
              setOrders(allOrders);
          } else {
              const userOrders = await api.getOrders(profile.id);
              setOrders(userOrders);
          }
      } catch (e) {
          console.error("Error loading orders", e);
      }
      
    } catch (error) {
      console.error("User sync error:", error);
      showToast("Failed to sync user profile", 'error');
    }
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && mounted) {
        await syncUser(session.user);
      }
      if (mounted) setAuthLoading(false);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await syncUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setOrders([]);
        showToast('Signed out successfully.', 'info');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [showToast]);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      showToast(error.message, 'error');
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } }
    });
    if (error) {
      showToast(error.message, 'error');
      throw error;
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) showToast("Error signing out", 'error');
  };

  const placeOrder = async (shippingAddress: ShippingAddress, clearCartCb: () => void) => {
    if (!user) {
      showToast("Please log in to order.", 'error');
      return;
    }
    
    const orderItems = cartItems.map(c => ({
      productId: c.id,
      quantity: c.quantity,
      size: c.selectedSize,
      title: c.title,
      price: c.price
    }));

    try {
        const newOrder = await api.createOrder({
            userId: user.id,
            products: orderItems,
            total: cartTotal,
            shippingAddress
        });
        
        setOrders(prev => [newOrder, ...prev]);
        clearCartCb();
        showToast('Order placed successfully! God bless.', 'success');
    } catch (error: any) {
        console.error(error);
        showToast(error.message || "Failed to place order.", 'error');
        throw error;
    }
  };

  return { 
    user, 
    orders, 
    login, 
    signUp, 
    logout, 
    placeOrder,
    authLoading 
  };
};
