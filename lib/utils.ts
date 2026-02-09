
import { useEffect, RefObject } from 'react';
import { Product } from '../types';

/**
 * ClassName utility to merge conditional classes
 */
export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Format number as GBP Currency
 */
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);
};

/**
 * Format date string
 */
export const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Helper to check if an error is a fetch AbortError
 */
export const isAbortError = (error: any): boolean => {
  return (
    error?.name === 'AbortError' || 
    error?.message?.includes('aborted') || 
    error?.code === 20 
  );
};

/**
 * Wraps a promise with a timeout
 */
export function withTimeout<T>(promise: Promise<T>, ms: number = 10000): Promise<T> {
  const timeout = new Promise<T>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Operation timed out after ${ms}ms`));
    }, ms);
  });

  return Promise.race([promise, timeout]);
}

/**
 * A custom hook to detect clicks outside a specified element.
 */
export const useClickOutside = (ref: RefObject<HTMLElement>, handler: (event: MouseEvent) => void) => {
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
    };
  }, [ref, handler]);
};

export const getVisibleProducts = (products: Product[]): Product[] => {
  return products.filter(p => p.isPublished !== false);
};

export const searchProducts = (products: Product[], query: string): Product[] => {
  if (!query.trim()) return [];
  const lowercasedQuery = query.toLowerCase();
  return products.filter(p => 
    p.title.toLowerCase().includes(lowercasedQuery) || 
    p.tags?.some(t => t.toLowerCase().includes(lowercasedQuery))
  );
};