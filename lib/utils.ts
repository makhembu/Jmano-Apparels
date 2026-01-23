import { useEffect, RefObject } from 'react';
import { Product } from '../types';

/**
 * A custom hook to detect clicks outside a specified element.
 * @param ref - The RefObject of the element to monitor.
 * @param handler - The callback function to execute on an outside click.
 */
export const useClickOutside = (ref: RefObject<HTMLElement>, handler: (event: MouseEvent) => void) => {
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      // Do nothing if clicking ref's element or descendent elements
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

/**
 * Filters an array of products to return only those that are published.
 * @param products - The array of products to filter.
 * @returns A new array containing only published products.
 */
export const getVisibleProducts = (products: Product[]): Product[] => {
  return products.filter(p => p.isPublished !== false);
};

/**
 * Searches an array of products based on a query string, checking title and tags.
 * Returns an empty array if the query is empty.
 * This is specific to the Navbar's search preview functionality.
 * @param products - The array of products to search within.
 * @param query - The search term.
 * @returns A new array of products matching the query.
 */
export const searchProducts = (products: Product[], query: string): Product[] => {
  if (!query.trim()) {
    return [];
  }
  const lowercasedQuery = query.toLowerCase();
  return products.filter(p => 
    p.title.toLowerCase().includes(lowercasedQuery) || 
    p.tags?.some(t => t.toLowerCase().includes(lowercasedQuery))
  );
};
