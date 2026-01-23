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
  // FIX: Add 'cartTotal' to the type, as it's provided by the context but was missing from the interface.
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

  // This is the manual refresh function passed to consumers.
  const refreshOrders = useCallback(async () => {
    if (auth.user) {
        try {
          const data = auth.user.role === 'admin'
              ? await api.getAllOrders()
              : await api.getOrders(auth.user.id);
          setOrders(data);
        } catch (e) {
          console.error("Failed to refresh orders", e);
        }
    } else {
        setOrders([]);
    }
  }, [auth.user]);

  // This useEffect handles the AUTOMATIC fetching of orders when the user logs in or out.
  // It contains the fetching logic directly and depends only on `auth.user`.
  // This breaks the render loop caused by the previous implementation.
  useEffect(() => {
    const fetchUserOrders = async () => {
        if (auth.user) {
            try {
                const data = (auth.user.role === 'admin')
                    ? await api.getAllOrders()
                    : await api.getOrders(auth.user.id);
                setOrders(data);
            } catch (e) {
                console.error("Failed to automatically fetch orders", e);
            }
        } else {
            setOrders([]);
        }
    };
    fetchUserOrders();
  }, [auth.user]);

  const placeOrder = useCallback(async (shippingAddress: ShippingAddress) => {
      if (!auth.user) throw new Error("Must be logged in");
      
      const orderItems = cart.cart.map(c => ({
        productId: c.id,
        quantity: c.quantity,
        size: c.selectedSize,
        title: c.title,
        price: c.price,
        // FIX: The 'CartItem' type has an 'images' array. Use the first image for the order item snapshot.
        image: c.images[0]
      }));

      await api.createOrder({
        userId: auth.user.id,
        products: orderItems,
        total: cart.cartTotal,
        shippingAddress
      });
      
      cart.clearCart();
      await refreshOrders(); // Manual refresh after placing order
      await shop.refreshData(); // Update product stock/sales
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
