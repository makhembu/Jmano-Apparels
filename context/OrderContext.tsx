import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Order } from '../types';
import { useAuth } from './AuthContext';
import { api } from '../lib/db';

interface OrderContextType {
  orders: Order[];
  refreshOrders: () => Promise<void>;
  loading: boolean;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshOrders = useCallback(async () => {
    if (!user) {
        setOrders([]);
        return;
    }
    setLoading(true);
    try {
      const data = user.role === 'admin'
          ? await api.getAllOrders(50) 
          : await api.getOrders(user.id);
      setOrders(data);
    } catch (e) {
      console.error("Order fetch failed:", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const value = useMemo(() => ({
    orders,
    refreshOrders,
    loading
  }), [orders, refreshOrders, loading]);

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error("useOrders must be used within an OrderProvider");
  return context;
};
