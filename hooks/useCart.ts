import { useState, useEffect } from 'react';
import { Product, CartItem } from '../types';
import { useToast } from '../context/ToastContext';

export const useCart = () => {
  const { showToast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);

  // -- Cart Persistence --
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('dt_cart');
      if (savedCart) setCart(JSON.parse(savedCart));
    } catch (e) {
      console.error("Failed to load cart", e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dt_cart', JSON.stringify(cart));
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

  const clearCart = () => setCart([]);

  return { cart, addToCart, removeFromCart, clearCart };
};
