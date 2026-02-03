
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Product, Category, BlogPost, AppSettings, ProductReview } from '../types';
import { api } from '../lib/db';
import { useToast } from './ToastContext';
import { ProductFilters } from '../lib/services/catalog';
import { isAbortError } from '../lib/utils';
import { useAuth } from './AuthContext';

interface ShopContextType {
  products: Product[]; // Currently visible products in the shop
  allProducts: Product[]; // Keeping a cache for Admin/Legacy use if needed
  categories: Category[];
  blogPosts: BlogPost[];
  latestReviews: ProductReview[];
  settings: AppSettings;
  
  loading: boolean; // GLOBAL INITIAL LOAD ONLY
  productsLoading: boolean; // SHOP FILTERING LOAD ONLY
  
  // Pagination Props
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMore: () => void;
  filters: ProductFilters;
  updateFilters: (f: Partial<ProductFilters>) => void;
  
  refreshData: () => Promise<void>;
  updateSettings: (s: AppSettings) => Promise<void>;
}

const defaultSettings: AppSettings = {
  id: 0,
  slogan: "Loading...",
  secondarySlogan: "Loading...",
  mission: "Loading...",
  vision: "Loading...",
  coreValues: "Loading..."
};

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  
  // Prevent double-fetch on mount
  const hasInitialized = useRef(false);
  const isLoadingRef = useRef(false);
  
  // Split Loading States
  const [initialLoading, setInitialLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  
  // Data
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [latestReviews, setLatestReviews] = useState<ProductReview[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  // Pagination State
  const [filters, setFilters] = useState<ProductFilters>({ sortBy: 'newest' });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Specialized fetcher for the shop grid
  const fetchPaginated = async (p: number, currentFilters: ProductFilters, reset: boolean = false) => {
    try {
        const res = await api.getPaginatedProducts(p, 12, currentFilters);
        if (reset) {
            setProducts(res.data);
        } else {
            setProducts(prev => [...prev, ...res.data]);
        }
        setHasMore(res.hasMore);
        setPage(p);
    } catch (e: any) {
        if (isAbortError(e)) return;
        console.error("Pagination error", e);
        // Don't re-throw, just fail gracefully
    }
  };

  // Initial Data Load (Settings, Cats, Blogs - Small payloads)
  const loadInitialData = useCallback(async () => {
    // Prevent concurrent calls
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    setInitialLoading(true);
    
    try {
      console.log("Starting initial data load...");
      
      // TIMEOUT SAFETY: 10s max
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Data fetch timed out")), 10000)
      );

      const fetchDataPromise = async () => {
          // Wrap critical calls to prevent cascading failure
          const [fetchedSettings, fetchedCats, fetchedPosts, fetchedReviews] = await Promise.all([
            api.getAppSettings().catch(err => { console.warn("Settings fetch failed", err); return null; }),
            api.getCategories().catch(err => { console.warn("Categories fetch failed", err); return []; }),
            api.getBlogPosts().catch(err => { console.warn("Blog posts fetch failed", err); return []; }),
            api.getRecentReviews(6).catch(err => { console.warn("Reviews fetch failed", err); return []; })
          ]);

          if (fetchedSettings) setSettings(fetchedSettings);
          if (fetchedCats) setCategories(fetchedCats);
          if (fetchedPosts) setBlogPosts(fetchedPosts);
          if (fetchedReviews) setLatestReviews(fetchedReviews);
          
          // Load All Products for Admin/Home compatibility (legacy support)
          try {
            const all = await api.getProducts();
            setAllProducts(all);
          } catch (e) {
            console.warn("Legacy product fetch failed", e);
          }

          // Initial Paginated Load
          await fetchPaginated(1, { sortBy: 'newest' }, true);
      };

      await Promise.race([fetchDataPromise(), timeoutPromise]);
      
    } catch (error: any) {
      if (isAbortError(error)) return;
      console.error("Data fetch error:", error);
      // Even on error, we proceed so the app isn't stuck on a white screen
    } finally {
      setInitialLoading(false);
      isLoadingRef.current = false;
    }
  }, []);

  // Called when user changes filters (Category, Search)
  const updateFilters = useCallback((newFilters: Partial<ProductFilters>) => {
      const updated = { ...filters, ...newFilters };
      setFilters(updated);
      setProductsLoading(true);
      fetchPaginated(1, updated, true)
        .finally(() => setProductsLoading(false));
  }, [filters]);

  // Called when user clicks "Load More"
  const loadMore = useCallback(async () => {
      if (!hasMore || isLoadingMore) return;
      setIsLoadingMore(true);
      try {
        await fetchPaginated(page + 1, filters, false);
      } finally {
        setIsLoadingMore(false);
      }
  }, [page, hasMore, isLoadingMore, filters]);

  // Refresh data function
  const refreshData = useCallback(async () => {
    hasInitialized.current = false; // Allow re-initialization
    await loadInitialData();
  }, [loadInitialData]);

  // Load immediately on mount - DECOUPLED FROM AUTH
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      loadInitialData();
    }
  }, [loadInitialData]);

  const updateSettings = useCallback(async (newSettings: AppSettings) => {
    try {
        await api.updateAppSettings(settings.id, newSettings);
        setSettings(newSettings);
        showToast('Settings updated', 'success');
    } catch (e: any) {
        if (isAbortError(e)) return;
        console.error(e);
        showToast('Failed to update settings', 'error');
    }
  }, [settings.id, showToast]);

  const value = useMemo(() => ({ 
      products, 
      allProducts,
      categories, 
      blogPosts, 
      latestReviews, 
      settings, 
      loading: initialLoading,
      productsLoading, 
      refreshData, 
      updateSettings,
      hasMore,
      isLoadingMore,
      loadMore,
      filters,
      updateFilters
  }), [
    products, 
    allProducts, 
    categories, 
    blogPosts, 
    latestReviews, 
    settings, 
    initialLoading, 
    productsLoading, 
    refreshData, 
    updateSettings, 
    hasMore, 
    isLoadingMore, 
    loadMore, 
    filters, 
    updateFilters
  ]);

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) throw new Error("useShop must be used within ShopProvider");
  return context;
};
