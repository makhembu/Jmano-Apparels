
import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { User, Product, CartItem, Order, BlogPost, AppSettings, Category, ShippingAddress, ProductReview } from '../types';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import { useShop } from './ShopContext';
import { api } from '../lib/db';
import { useToast } from './ToastContext';

// Legacy Interface Compatibility
interface AppContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// This component now acts as a bridge
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const shop = useShop();
  const cart = useCart();
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);

  // Manual refresh function
  const refreshOrders = useCallback(async () => {
    if (auth.user) {
        try {
          const data = auth.user.role === 'admin'
              ? await api.getAllOrders()
              : await api.getOrders(auth.user.id);
          setOrders(data);
        } catch (e) {
          console.error("Failed to refresh orders (DB might be unreachable):", e);
          // Don't throw, just log. UI will show empty orders.
        }
    } else {
        setOrders([]);
    }
  }, [auth.user]);

  // Automatic fetch on user change
  useEffect(() => {
    let mounted = true;
    const fetchUserOrders = async () => {
        if (auth.user) {
            try {
                // If user just logged in, small delay to ensure DB token is ready
                await new Promise(r => setTimeout(r, 200));
                
                const data = (auth.user.role === 'admin')
                    ? await api.getAllOrders()
                    : await api.getOrders(auth.user.id);
                
                if (mounted) setOrders(data);
            } catch (e) {
                console.error("Failed to fetch orders:", e);
                // Silent fail - don't spam toasts on auto-fetch
                if (mounted) setOrders([]);
            }
        } else {
            if (mounted) setOrders([]);
        }
    };
    fetchUserOrders();
    return () => { mounted = false; };
  }, [auth.user]);

  const placeOrder = useCallback(async (shippingAddress: ShippingAddress) => {
      if (!auth.user) throw new Error("Must be logged in");
      
      const orderItems = cart.cart.map(c => ({
        productId: c.id,
        quantity: c.quantity,
        size: c.selectedSize,
        title: c.title,
        price: c.price,
        selectedColor: c.selectedColor,
        image: c.images[0]
      }));

      await api.createOrder({
        userId: auth.user.id,
        products: orderItems,
        total: cart.cartTotal,
        shippingAddress
      });
      
      cart.clearCart();
      await refreshOrders();
      await shop.refreshData(); 
  }, [auth.user, cart, shop, refreshOrders]);

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
