
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

/**
 * Maps a color name to a Hex code or valid CSS color.
 * Handles common clothing color names like "Navy Blue", "Forest Green".
 */
export const getColorHex = (colorName: string): string => {
  if (!colorName) return 'transparent';
  // Remove spaces and hyphens for matching
  const normalized = colorName.toLowerCase().replace(/[^a-z]/g, '');
  
  const map: Record<string, string> = {
      white: '#FFFFFF',
      black: '#000000',
      navy: '#000080',
      navyblue: '#000080',
      royal: '#4169E1',
      royalblue: '#4169E1',
      sky: '#87CEEB',
      skyblue: '#87CEEB',
      lightblue: '#ADD8E6',
      blue: '#0000FF',
      forest: '#228B22',
      forestgreen: '#228B22',
      kelly: '#4CBB17',
      kellygreen: '#4CBB17',
      green: '#008000',
      red: '#FF0000',
      maroon: '#800000',
      burgundy: '#800020',
      crimson: '#DC143C',
      orange: '#FFA500',
      yellow: '#FFFF00',
      gold: '#FFD700',
      mustard: '#FFDB58',
      purple: '#800080',
      lavender: '#E6E6FA',
      pink: '#FFC0CB',
      hotpink: '#FF69B4',
      grey: '#808080',
      gray: '#808080',
      charcoal: '#36454F',
      brown: '#A52A2A',
      tan: '#D2B48C',
      beige: '#F5F5DC',
      cream: '#FFFDD0',
      khaki: '#F0E68C',
      olive: '#808000',
      teal: '#008080',
      turquoise: '#40E0D0',
      mint: '#98FF98',
      coral: '#FF7F50',
      peach: '#FFDAB9'
  };
  
  return map[normalized] || colorName;
};
