
import { useEffect, RefObject } from 'react';
import { Product } from '../types';

/**
 * ClassName utility to merge conditional classes
 */
export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Format bytes as human-readable string (e.g. "1.5 MB")
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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
      charcoalgrey: '#36454F',
      charcoalgray: '#36454F',
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
      peach: '#FFDAB9',
      silver: '#C0C0C0',
      bronze: '#CD7F32',
      copper: '#B87333',
      rosegold: '#B76E79',
      mauve: '#E0B0FF',
      blush: '#DE5D83',
      nude: '#E3BC9A',
      camel: '#C19A6B',
      taupe: '#483C32',
      ivory: '#FFFFF0',
      offwhite: '#FAF9F6',
      chocolate: '#7B3F00',
      cobalt: '#0047AB',
      cobaltblue: '#0047AB',
      indigo: '#4B0082',
      magenta: '#FF00FF',
      lilac: '#C8A2C8',
      violet: '#8F00FF',
      wine: '#722F37',
      rust: '#B7410E',
      terracotta: '#E2725B',
      sage: '#BCB88A',
      sagegreen: '#BCB88A',
      champagne: '#F7E7CE',
      pewter: '#899499',
      plum: '#8E4585',
      slate: '#708090',
      steel: '#4682B4',
      steelblue: '#4682B4',
      aqua: '#00FFFF',
      aquamarine: '#7FFFD4',
      jade: '#00A86B',
      emerald: '#50C878',
      hunter: '#355E3B',
      hunternavy: '#355E3B',
      huntergreen: '#355E3B',
      merlot: '#7B2229',
      cherry: '#DE3163',
      salmon: '#FA8072',
      tomato: '#FF6347',
      brick: '#CB4154',
      rose: '#FF007F',
      fuchsia: '#FF00FF',
      berry: '#4C0070',
      grape: '#6F2DA8',
      orchid: '#DA70D6',
      lemon: '#FFF700',
      honey: '#FFC30B',
      amber: '#FFBF00',
      cinnamon: '#D2691E',
      mocha: '#967969',
      espresso: '#6F4E37',
      cognac: '#7F3A3C',
      mahogany: '#C04000',
      chestnut: '#954535',
      walnut: '#773F1A',
      almond: '#FFEBCD',
      bone: '#E3DAC9',
      putty: '#C8BAA2',
      heather: '#B7B5B3',
      heathergrey: '#B7B5B3',
      heathergray: '#B7B5B3',
      oxford: '#002147',
      oxfordblue: '#002147',
      midnight: '#191970',
      midnightblue: '#191970'
  };
  
  return map[normalized] || colorName;
};
