
import { useState, useEffect } from 'react';
import { Product, CartItem } from '../types';
import { useToast } from '../context/ToastContext';
import { CacheManager, STORAGE_KEYS } from '../lib/cache';

export const useCart = () => {
  const { showToast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);

  // -- Cart Persistence --
  useEffect(() => {
    try {
      const savedCart = CacheManager.local.get<CartItem[]>(STORAGE_KEYS.CART);
      if (savedCart) setCart(savedCart);
    } catch (e) {
      console.error("Failed to load cart", e);
    }
  }, []);

  useEffect(() => {
    CacheManager.local.set(STORAGE_KEYS.CART, cart);
  }, [cart]);

  const addToCart = (product: Product, size: string, quantity: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedSize === size);
      if (existing) {
        return prev.map(item => 
          (item.id === product.id && item.selectedSize === size)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity, selectedSize: size }];
    });
    showToast(`Added ${product.title} to cart`, 'success');
  };

  const removeFromCart = (productId: string, size: string) => {
    setCart(prev => prev.filter(item => !(item.id === productId && item.selectedSize === size)));
    showToast('Item removed', 'info');
  };

  const clearCart = () => {
    setCart([]);
    CacheManager.local.remove(STORAGE_KEYS.CART);
  };

  return { cart, addToCart, removeFromCart, clearCart };
};
