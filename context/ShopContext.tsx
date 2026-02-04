
import React, { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react';
import { Product, Category, BlogPost, AppSettings, ProductReview } from '../types';
import { api } from '../lib/db';
import { useToast } from './ToastContext';
import { ProductFilters } from '../lib/services/catalog';
import { SettingsService } from '../lib/services/content';
import { isAbortError } from '../lib/utils';

interface ShopContextType {
  products: Product[];
  categories: Category[];
  blogPosts: BlogPost[];
  latestReviews: ProductReview[];
  settings: AppSettings;
  
  loading: boolean;
  productsLoading: boolean;
  
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMore: () => void;
  filters: ProductFilters;
  updateFilters: (f: Partial<ProductFilters>) => void;
  
  initShopData: () => Promise<void>;
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
const settingsService = new SettingsService();

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  
  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [latestReviews, setLatestReviews] = useState<ProductReview[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  
  // Loading State
  const [initialLoading, setInitialLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const initializedRef = useRef(false);

  // Pagination
  const [filters, setFilters] = useState<ProductFilters>({ sortBy: 'newest' });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Helper for grid pagination
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
        if (!isAbortError(e)) console.error("Pagination error", e);
    }
  };

  // Main Initialization (Called by AppContext)
  const initShopData = useCallback(async () => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    
    setInitialLoading(true);
    console.log("[Shop] Initializing data...");

    try {
        // Use the SECURE get() method which filters out secrets
        const [fetchedSettings, fetchedCats, fetchedPosts, fetchedReviews] = await Promise.all([
          settingsService.get().catch(() => null),
          api.getCategories().catch(() => []),
          api.getBlogPosts().catch(() => []),
          api.getRecentReviews(6).catch(() => [])
        ]);

        if (fetchedSettings) setSettings(fetchedSettings);
        if (fetchedCats) setCategories(fetchedCats);
        if (fetchedPosts) setBlogPosts(fetchedPosts);
        if (fetchedReviews) setLatestReviews(fetchedReviews);
        
        await fetchPaginated(1, { sortBy: 'newest' }, true);

    } catch (e) {
        console.error("[Shop] Init failed", e);
    } finally {
        setInitialLoading(false);
    }
  }, []);

  const updateFilters = useCallback((newFilters: Partial<ProductFilters>) => {
      const updated = { ...filters, ...newFilters };
      setFilters(updated);
      setProductsLoading(true);
      fetchPaginated(1, updated, true).finally(() => setProductsLoading(false));
  }, [filters]);

  const loadMore = useCallback(async () => {
      if (!hasMore || isLoadingMore) return;
      setIsLoadingMore(true);
      try {
        await fetchPaginated(page + 1, filters, false);
      } finally {
        setIsLoadingMore(false);
      }
  }, [page, hasMore, isLoadingMore, filters]);

  const refreshData = useCallback(async () => {
    initializedRef.current = false;
    await initShopData();
  }, [initShopData]);

  const updateSettings = useCallback(async (newSettings: AppSettings) => {
    try {
        await api.updateAppSettings(settings.id, newSettings);
        setSettings(newSettings);
        showToast('Settings updated', 'success');
    } catch (e: any) {
        console.error(e);
        showToast('Failed to update settings', 'error');
    }
  }, [settings.id, showToast]);

  const value = useMemo(() => ({ 
      products, categories, blogPosts, latestReviews, settings, 
      loading: initialLoading, productsLoading, 
      initShopData, refreshData, updateSettings,
      hasMore, isLoadingMore, loadMore, filters, updateFilters
  }), [
    products, categories, blogPosts, latestReviews, settings, 
    initialLoading, productsLoading, 
    initShopData, refreshData, updateSettings, 
    hasMore, isLoadingMore, loadMore, filters, updateFilters
  ]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) throw new Error("useShop must be used within ShopProvider");
  return context;
};
