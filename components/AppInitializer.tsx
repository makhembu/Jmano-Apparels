import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { useCart } from '../context/CartContext';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface AppInitializerProps {
  children: React.ReactNode;
}

export const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const { isAuthReady, user } = useAuth();
  const shop = useShop();
  const cart = useCart();
  
  const [appReady, setAppReady] = useState(false);
  const initStartedRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    // 1. Wait for Auth to settle first (critical prerequisite)
    if (!isAuthReady) return;

    // 2. Check if we need to re-initialize (user changed)
    const userChanged = lastUserIdRef.current !== (user?.id || null);
    
    // 3. Prevent duplicate initialization unless user changed
    if (initStartedRef.current && !userChanged) return;
    
    initStartedRef.current = true;
    lastUserIdRef.current = user?.id || null;

    const initializeApp = async () => {
      console.log("[App] 🚀 Starting application initialization");
      
      try {
        // 3. Load Shop Data (Products, Categories, Settings) - Blocking
        console.log("[App] 📦 Loading shop data...");
        await shop.initShopData();
        console.log("[App] ✅ Shop data loaded");

        // 4. Load Cart (Only if user logged in) - Sequential to avoid race
        if (user?.id) {
          console.log(`[App] 🛒 Loading cart for user ${user.id}...`);
          await cart.refreshCart(user.id);
          console.log("[App] ✅ Cart loaded");
        } else {
          console.log("[App] 👻 No user, skipping cart load");
        }

      } catch (err) {
        console.error("[App] ⚠️ Initialization warning:", err);
        // We continue even if some data fails to allow the app to render error states
      } finally {
        console.log("[App] 🎉 Application initialization complete");
        setAppReady(true);
      }
    };

    initializeApp();
  }, [isAuthReady, user?.id]); // ✅ Depend on user ID, not entire user object

  if (!appReady) {
    return <LoadingSpinner fullScreen />;
  }

  return <>{children}</>;
};