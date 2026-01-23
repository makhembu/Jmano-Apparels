import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
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

  const refreshOrders = useCallback(async () => {
    if (auth.user) {
        try {
          if (auth.user.role === 'admin') {
              const data = await api.getAllOrders();
              setOrders(data);
          } else {
              const data = await api.getOrders(auth.user.id);
              setOrders(data);
          }
        } catch (e) {
          console.error("Failed to refresh orders", e);
        }
    } else {
        setOrders([]);
    }
  }, [auth.user]);

  // Order logic (kept here for now or moved to a useOrder hook later)
  useEffect(() => {
      refreshOrders();
  }, [refreshOrders]);

  const placeOrder = async (shippingAddress: ShippingAddress) => {
      if (!auth.user) throw new Error("Must be logged in");
      
      const orderItems = cart.cart.map(c => ({
        productId: c.id,
        quantity: c.quantity,
        size: c.selectedSize,
        title: c.title,
        price: c.price,
        image: c.image
      }));

      await api.createOrder({
        userId: auth.user.id,
        products: orderItems,
        total: cart.cartTotal,
        shippingAddress
      });
      
      cart.clearCart();
      await refreshOrders();
      await shop.refreshData(); // Update product stock/sales
  };

  const loading = auth.loading || shop.loading;

  return (
    <AppContext.Provider value={{
      ...auth,
      ...shop,
      ...cart,
      orders,
      placeOrder,
      refreshOrders,
      loading
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};