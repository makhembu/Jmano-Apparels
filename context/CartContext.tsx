
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
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const userRef = useRef(user);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // 1. Initial Load: Use CacheManager to get local cart
  useEffect(() => {
    try {
      const savedCart = CacheManager.local.get<CartItem[]>(STORAGE_KEYS.CART);
      if (savedCart) {
        setCart(savedCart);
      }
    } catch (e) {
      console.error("Error loading cart from storage", e);
    }
    setIsLoaded(true);
  }, []);

  // 2. Auth Merge: When user logs in, fetch DB cart and merge
  useEffect(() => {
    if (!isLoaded || authLoading) return;

    if (user) {
      api.fetchCart(user.id).then(serverCart => {
        setCart(currentLocalCart => {
          if (currentLocalCart.length === 0) return serverCart;

          const merged = [...serverCart];

          currentLocalCart.forEach(localItem => {
             const exists = merged.find(serverItem => 
               serverItem.id === localItem.id && 
               serverItem.selectedSize === localItem.selectedSize && 
               serverItem.selectedColor === localItem.selectedColor
             );

             if (!exists) {
                merged.push(localItem);
             }
          });
          
          return merged;
        });
      }).catch(err => {
        if (!isAbortError(err)) console.error("Failed to fetch cart", err);
      });
    }
  }, [user, isLoaded, authLoading]);

  // 3. Persistence: Save to CacheManager and DB
  useEffect(() => {
    if (!isLoaded) return;
    
    // Save to local via centralized manager
    CacheManager.local.set(STORAGE_KEYS.CART, cart);

    // Save to DB
    const currentUser = userRef.current;
    if (currentUser) {
      api.syncCart(currentUser.id, cart).catch(err => {
        if (!isAbortError(err)) console.error("Failed to sync cart", err);
      });
    }
  }, [cart, isLoaded]);

  const addToCart = useCallback((product: Product, size: string, quantity: number, color?: string) => {
    if (product.stockQuantity !== undefined && product.stockQuantity < quantity) {
        showToast(`Only ${product.stockQuantity} items left in stock.`, 'error');
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
            showToast(`Cannot add more. You have ${existingItem.quantity} in cart and stock is ${product.stockQuantity}.`, 'error');
            return prev;
        }

        const newCart = [...prev];
        newCart[existingIndex] = { ...existingItem, quantity: newQty };
        return newCart;
      }
      
      return [...prev, { ...product, quantity, selectedSize: size, selectedColor: color }];
    });
  }, [showToast]);

  const removeFromCart = useCallback((productId: string, size: string, color?: string) => {
    setCart(prev => prev.filter(item => 
      !(item.id === productId && 
        item.selectedSize === size && 
        (item.selectedColor === color || (!item.selectedColor && !color)))
    ));
    showToast('Item removed', 'info');
  }, [showToast]);

  const clearCart = useCallback(() => {
    setCart([]);
    CacheManager.local.remove(STORAGE_KEYS.CART);
    const currentUser = userRef.current;
    if (currentUser) {
      api.syncCart(currentUser.id, []).catch(err => {
        if (!isAbortError(err)) console.error("Failed to clear remote cart", err);
      });
    }
  }, []);

  const cartTotal = cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const value = useMemo(() => ({ cart, addToCart, removeFromCart, clearCart, cartTotal, cartCount }), [cart, addToCart, removeFromCart, clearCart, cartTotal, cartCount]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
