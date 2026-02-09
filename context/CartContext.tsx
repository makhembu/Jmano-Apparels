
import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { CartItem, Product } from '../types';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { api } from '../lib/db';
import { isAbortError } from '../lib/utils';
import { CacheManager, STORAGE_KEYS } from '../lib/cache';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, size: string, quantity: number, color?: string) => void;
  removeFromCart: (productId: string, size: string, color?: string) => void;
  updateQuantity: (productId: string, size: string, color: string | undefined, newQuantity: number) => void;
  clearCart: () => void;
  refreshCart: (userId: string) => Promise<void>;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [cartAnnouncement, setCartAnnouncement] = useState('');
  
  // Calculate derived state early to be available for callbacks
  const cartTotal = cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const userRef = useRef(user);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // 1. Initial Local Load
  useEffect(() => {
    try {
      const savedCart = CacheManager.local.get<CartItem[]>(STORAGE_KEYS.CART);
      if (savedCart) setCart(savedCart);
    } catch (e) {
      console.error("Error loading local cart", e);
    }
    setIsLoaded(true);
  }, []);

  // 2. Explicit Refresh (Called by App Orchestrator)
  const refreshCart = useCallback(async (userId: string) => {
    if (!userId) return;
    console.log(`[Cart] Refreshing for user ${userId}...`);
    
    try {
      const serverCart = await api.fetchCart(userId);
      
      setCart(currentLocalCart => {
        if (currentLocalCart.length === 0) {
            if (JSON.stringify(serverCart) === JSON.stringify(currentLocalCart)) return currentLocalCart;
            return serverCart;
        }

        const merged = [...currentLocalCart];
        let hasChanges = false;

        serverCart.forEach(serverItem => {
           const exists = merged.find(localItem => 
             localItem.id === serverItem.id && 
             localItem.selectedSize === serverItem.selectedSize && 
             localItem.selectedColor === serverItem.selectedColor
           );

           if (!exists) {
              merged.push(serverItem);
              hasChanges = true;
           }
        });

        return hasChanges ? merged : currentLocalCart;
      });
    } catch (err) {
      if (!isAbortError(err)) console.error("Failed to fetch remote cart", err);
    }
  }, []);

  // 3. Persistence (Debounced Sync)
  useEffect(() => {
    if (!isLoaded) return;
    
    CacheManager.local.set(STORAGE_KEYS.CART, cart);

    const currentUser = userRef.current;
    if (currentUser?.id) {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

      syncTimeoutRef.current = setTimeout(() => {
        api.syncCart(currentUser.id, cart).catch(err => {
          if (!isAbortError(err)) console.error("DB Sync failed", err);
        });
      }, 2000); // 2s debounce
    }

    return () => {
        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [cart, isLoaded]); 
  
  // Accessibility Helper
  const announceCartUpdate = useCallback((message: string) => {
    setCartAnnouncement(message);
    // Clear message shortly after to allow re-announcements of same message if needed
    setTimeout(() => setCartAnnouncement(''), 3000);
  }, []);

  const addToCart = useCallback((product: Product, size: string, quantity: number, color?: string) => {
    if (product.stockQuantity !== undefined && product.stockQuantity < quantity) {
        showToast(`Only ${product.stockQuantity} items left.`, 'error');
        announceCartUpdate(`Could not add item. Only ${product.stockQuantity} items left.`);
        return;
    }

    setCart(prev => {
      const existingIndex = prev.findIndex(item => 
        item.id === product.id && 
        item.selectedSize === size && 
        (item.selectedColor === color || (!item.selectedColor && !color))
      );

      if (existingIndex > -1) {
        const existingItem = prev[existingIndex];
        const newQty = existingItem.quantity + quantity;
        
        if (product.stockQuantity !== undefined && newQty > product.stockQuantity) {
            showToast(`Stock limit reached.`, 'error');
            announceCartUpdate(`Stock limit reached for ${product.title}`);
            return prev;
        }

        const newCart = [...prev];
        newCart[existingIndex] = { ...existingItem, quantity: newQty };
        return newCart;
      }
      return [...prev, { ...product, quantity, selectedSize: size, selectedColor: color }];
    });
    
    showToast(`Added ${product.title}`, 'success');
    announceCartUpdate(`${quantity} ${product.title} added to cart. Total items in cart: ${cartCount + quantity}`);
  }, [showToast, cartCount]); // Added cartCount to dependency for accurate announcement

  const updateQuantity = useCallback((productId: string, size: string, color: string | undefined, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCart(prev => prev.map(item => {
      if (item.id === productId && item.selectedSize === size && item.selectedColor === color) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
    announceCartUpdate(`Cart item quantity updated to ${newQuantity}`);
  }, []);

  const removeFromCart = useCallback((productId: string, size: string, color?: string) => {
    setCart(prev => prev.filter(item => 
      !(item.id === productId && 
        item.selectedSize === size && 
        (item.selectedColor === color || (!item.selectedColor && !color)))
    ));
    showToast('Item removed', 'info');
    announceCartUpdate('Item removed from cart');
  }, [showToast]);

  const clearCart = useCallback(() => {
    setCart([]);
    CacheManager.local.remove(STORAGE_KEYS.CART);
    const currentUser = userRef.current;
    if (currentUser) {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      api.syncCart(currentUser.id, []).catch(console.error);
    }
    announceCartUpdate('Cart cleared');
  }, []);

  const value = useMemo(() => ({ 
      cart, addToCart, removeFromCart, updateQuantity, clearCart, refreshCart, cartTotal, cartCount 
  }), [cart, addToCart, removeFromCart, updateQuantity, clearCart, refreshCart, cartTotal, cartCount]);

  return (
    <CartContext.Provider value={value}>
      {children}
      {/* ARIA Live Region for Cart Updates */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {cartAnnouncement}
      </div>
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
