
import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { useCart } from '../context/CartContext';

interface AppInitializerProps {
  children: React.ReactNode;
}

export const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const { isAuthReady, user } = useAuth();
  const shop = useShop();
  const cart = useCart();
  
  const initStartedRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Public data (Shop/Settings) is already triggered by AppProvider (AppContext.tsx)
    // We only need to handle User-Specific data here once Auth is ready.

    // 1. Wait for Auth to settle first
    if (!isAuthReady) return;

    // 2. Check if we need to re-initialize (user changed)
    const userChanged = lastUserIdRef.current !== (user?.id || null);
    
    // 3. Prevent duplicate initialization unless user changed
    if (initStartedRef.current && !userChanged) return;
    
    initStartedRef.current = true;
    lastUserIdRef.current = user?.id || null;

    const initializeUserData = async () => {
      if (user?.id) {
        console.log(`[App] 🛒 Loading cart for user ${user.id}...`);
        try {
          await cart.refreshCart(user.id);
          console.log("[App] ✅ Cart synced");
        } catch (e) {
          console.warn("[App] Cart sync warning", e);
        }
      }
    };

    initializeUserData();
  }, [isAuthReady, user?.id]);

  // NON-BLOCKING RENDER: We return children immediately.
  // Auth checking happens in background.
  // Protected routes (Admin/Dashboard) handle their own loading states.
  return <>{children}</>;
};
