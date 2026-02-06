import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';

interface AppInitializerProps {
  children: React.ReactNode;
}

export const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const { isAuthReady, user } = useAuth();
  const { initShopData } = useShop();
  const { refreshCart } = useCart();
  const { refreshOrders } = useOrders();
  
  const publicInitDone = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    // --- 1. PUBLIC DATA INIT (Runs once on app start) ---
    if (!publicInitDone.current) {
        publicInitDone.current = true;
        initShopData();
    }
    
    // --- 2. USER DATA SYNC (Auth Dependent & runs on user change) ---
    if (!isAuthReady) return;

    const currentUserId = user?.id || null;
    if (lastUserIdRef.current === currentUserId) return; // No change, do nothing

    lastUserIdRef.current = currentUserId; // Track current user state

    if (currentUserId) {
        // User logged in or session restored
        console.log(`[AppInitializer] Syncing data for user ${currentUserId}`);
        Promise.all([
            refreshCart(currentUserId),
            refreshOrders()
        ]).catch(console.error);
    } else {
        // User logged out
        console.log(`[AppInitializer] User logged out, clearing user-specific data.`);
        refreshOrders(); // This will clear orders as user is null
        // We don't clear the cart to preserve guest cart state.
    }

  }, [isAuthReady, user, initShopData, refreshCart, refreshOrders]);

  return <>{children}</>;
};
