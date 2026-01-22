import React, { createContext, useContext } from 'react';
import { User, Product, CartItem, Order, BlogPost, AppSettings, Category, ShippingAddress } from '../types';
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
  
  cart: CartItem[];
  addToCart: (product: Product, size: string, quantity: number, color?: string) => void;
  removeFromCart: (productId: string, size: string, color?: string) => void;
  clearCart: () => void;
  
  settings: AppSettings;
  updateSettings: (newSettings: AppSettings) => Promise<void>;
  
  orders: Order[];
  placeOrder: (shippingAddress: ShippingAddress) => Promise<void>;
  
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// This component now acts as a bridge
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const shop = useShop();
  const cart = useCart();
  const { showToast } = useToast();
  const [orders, setOrders] = React.useState<Order[]>([]);

  // Order logic (kept here for now or moved to a useOrder hook later)
  React.useEffect(() => {
      if (auth.user) {
          if (auth.user.role === 'admin') {
              api.getAllOrders().then(setOrders).catch(console.error);
          } else {
              api.getOrders(auth.user.id).then(setOrders).catch(console.error);
          }
      } else {
          setOrders([]);
      }
  }, [auth.user]);

  const placeOrder = async (shippingAddress: ShippingAddress) => {
      if (!auth.user) throw new Error("Must be logged in");
      
      const orderItems = cart.cart.map(c => ({
        productId: c.id,
        quantity: c.quantity,
        size: c.selectedSize,
        title: c.title,
        price: c.price
      }));

      await api.createOrder({
        userId: auth.user.id,
        products: orderItems,
        total: cart.cartTotal,
        shippingAddress
      });
      
      cart.clearCart();
      // Refresh orders
      const newOrders = await api.getOrders(auth.user.id);
      setOrders(newOrders);
  };

  const loading = auth.loading || shop.loading;

  return (
    <AppContext.Provider value={{
      ...auth,
      ...shop,
      ...cart,
      orders,
      placeOrder,
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