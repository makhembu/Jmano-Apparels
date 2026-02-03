
import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { User, Product, CartItem, Order, BlogPost, AppSettings, Category, ShippingAddress, ProductReview } from '../types';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import { useShop } from './ShopContext';
import { api } from '../lib/db';

// Legacy Interface Compatibility
interface AppContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  
  products: Product[];
  categories: Category[];
  blogPosts: BlogPost[];
  latestReviews: ProductReview[];
  
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (product: Product, size: string, quantity: number, color?: string) => void;
  removeFromCart: (productId: string, size: string, color?: string) => void;
  clearCart: () => void;
  
  settings: AppSettings;
  updateSettings: (newSettings: AppSettings) => Promise<void>;
  
  orders: Order[];
  placeOrder: (shippingAddress: ShippingAddress) => Promise<void>;
  refreshOrders: () => Promise<void>;
  
  loading: boolean;
  isAuthReady: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// This component acts as the Central Orchestrator
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const shop = useShop();
  const cart = useCart();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Manual refresh function for orders
  const refreshOrders = useCallback(async () => {
    if (!auth.user) {
        setOrders([]);
        return;
    }
    setOrdersLoading(true);
    try {
      console.log("[App] Refreshing orders...");
      const data = auth.user.role === 'admin'
          ? await api.getAllOrders()
          : await api.getOrders(auth.user.id);
      setOrders(data);
    } catch (e) {
      console.error("Order fetch failed:", e);
    } finally {
      setOrdersLoading(false);
    }
  }, [auth.user]);

  // --- 1. PUBLIC DATA INIT (Immediate & Non-Blocking) ---
  useEffect(() => {
    // Initialize Shop Data immediately on mount
    // This allows the UI (Home, Shop) to render content while Auth is still checking in background.
    shop.initShopData();
  }, []);

  // --- 2. USER DATA SYNC (Auth Dependent) ---
  useEffect(() => {
    // Only proceed once Auth Status is definitive
    if (!auth.isAuthReady) return;

    if (auth.user) {
        // Parallel fetch for user data
        Promise.all([
            cart.refreshCart(auth.user.id),
            refreshOrders()
        ]).catch(console.error);
    } else {
        // Handle guest state or cleanup if necessary
        setOrders([]);
        // We do NOT clear cart here to preserve guest carts loaded from local storage
    }
  }, [auth.isAuthReady, auth.user?.id]); // Re-run if user changes

  const placeOrder = useCallback(async (shippingAddress: ShippingAddress) => {
      if (!auth.user && !cart.cart.length) throw new Error("Cart is empty");
      
      const orderItems = cart.cart.map(c => ({
        productId: c.id,
        quantity: c.quantity,
        size: c.selectedSize,
        title: c.title,
        price: c.price,
        selectedColor: c.selectedColor,
        image: c.images[0]
      }));

      // Supports both Guest and Auth checkout
      await api.createOrder({
        userId: auth.user?.id || null, 
        products: orderItems,
        total: cart.cartTotal,
        shippingAddress
      });
      
      cart.clearCart();
      if (auth.user) await refreshOrders();
  }, [auth.user, cart, refreshOrders]);

  const loading = auth.loading || shop.loading;

  const value = useMemo(() => ({
    ...auth,
    ...shop,
    ...cart,
    orders,
    placeOrder,
    refreshOrders,
    loading
  }), [auth, shop, cart, orders, placeOrder, refreshOrders, loading]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
