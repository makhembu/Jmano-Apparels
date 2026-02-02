
import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { CartItem, Product } from '../types';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { api } from '../lib/db';
import { isAbortError } from '../lib/utils';

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
  
  // Use a ref to access the current user in effects without triggering them
  // This prevents the persistence effect from running immediately on login (before merge)
  const userRef = useRef(user);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // 1. Initial Load: Try LocalStorage first to show something immediately
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('dt_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error("Error loading cart from storage", e);
    }
    setIsLoaded(true);
  }, []);

  // 2. Auth Merge: When user logs in, fetch DB cart and intelligently merge with local
  useEffect(() => {
    if (!isLoaded || authLoading) return;

    if (user) {
      api.fetchCart(user.id).then(serverCart => {
        setCart(currentLocalCart => {
          // If local cart is empty, just take server cart
          if (currentLocalCart.length === 0) return serverCart;

          // Merge Logic: Create a Map based on unique item keys
          const merged = [...serverCart];

          currentLocalCart.forEach(localItem => {
             const exists = merged.find(serverItem => 
               serverItem.id === localItem.id && 
               serverItem.selectedSize === localItem.selectedSize && 
               serverItem.selectedColor === localItem.selectedColor
             );

             if (!exists) {
                // Local item doesn't exist on server, add it
                merged.push(localItem);
             }
             // If it exists, we prioritize server quantity
          });
          
          return merged;
        });
      }).catch(err => {
        if (!isAbortError(err)) console.error("Failed to fetch cart", err);
      });
    }
  }, [user, isLoaded, authLoading]);

  // 3. Persistence: Whenever cart changes, save to LocalStorage AND DB (if logged in)
  useEffect(() => {
    if (!isLoaded) return;
    
    // Save to local
    localStorage.setItem('dt_cart', JSON.stringify(cart));

    // Save to DB (Debounce could be added here for optimization, but kept simple for now)
    const currentUser = userRef.current;
    if (currentUser) {
      api.syncCart(currentUser.id, cart).catch(err => {
        if (!isAbortError(err)) console.error("Failed to sync cart", err);
      });
    }
  }, [cart, isLoaded]); // Removed 'user' from dependencies to prevent race condition

  const addToCart = useCallback((product: Product, size: string, quantity: number, color?: string) => {
    // Validate stock
    if (product.stockQuantity !== undefined && product.stockQuantity < quantity) {
        showToast(`Only ${product.stockQuantity} items left in stock.`, 'error');
        return;
    }

    setCart(prev => {
      // Find existing item matching ID, Size AND Color
      const existingIndex = prev.findIndex(item => 
        item.id === product.id && 
        item.selectedSize === size && 
        (item.selectedColor === color || (!item.selectedColor && !color))
      );

      if (existingIndex > -1) {
        const existingItem = prev[existingIndex];
        const newQty = existingItem.quantity + quantity;
        
        // Stock check on accumulation
        if (product.stockQuantity !== undefined && newQty > product.stockQuantity) {
            showToast(`Cannot add more. You have ${existingItem.quantity} in cart and stock is ${product.stockQuantity}.`, 'error');
            return prev;
        }

        const newCart = [...prev];
        newCart[existingIndex] = { ...existingItem, quantity: newQty };
        return newCart;
      }
      
      // Add new item
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
    localStorage.removeItem('dt_cart');
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
