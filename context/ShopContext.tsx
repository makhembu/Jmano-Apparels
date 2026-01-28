
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Product, Category, BlogPost, AppSettings, ProductReview } from '../types';
import { api } from '../lib/db';
import { useToast } from './ToastContext';
import { ProductFilters } from '../lib/services/catalog';

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

  // Initial Data Load (Settings, Cats, Blogs - Small payloads)
  const refreshData = useCallback(async () => {
    try {
      // Note: We don't set initialLoading to true here if it's already false (re-fetching)
      // to avoid full screen blockers on background refreshes.
      
      const [fetchedSettings, fetchedCats, fetchedPosts, fetchedReviews] = await Promise.all([
        api.getAppSettings(),
        api.getCategories(),
        api.getBlogPosts(),
        api.getRecentReviews(6)
      ]);

      if (fetchedSettings) setSettings(fetchedSettings);
      if (fetchedCats) setCategories(fetchedCats);
      if (fetchedPosts) setBlogPosts(fetchedPosts);
      if (fetchedReviews) setLatestReviews(fetchedReviews);
      
      // Load All Products for Admin/Home compatibility (legacy support)
      const all = await api.getProducts();
      setAllProducts(all);

      // Initial Paginated Load
      await fetchPaginated(1, filters, true);

    } catch (error) {
      console.error("Data fetch error:", error);
      showToast("Connection issue. Some content may be missing.", 'error');
    } finally {
      setInitialLoading(false);
    }
  }, [showToast, filters]); // Note: filters dependency is okay here as it's part of initial grid load

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
    } catch (e) {
        console.error("Pagination error", e);
    }
  };

  // Called when user changes filters (Category, Search)
  const updateFilters = useCallback((newFilters: Partial<ProductFilters>) => {
      const updated = { ...filters, ...newFilters };
      setFilters(updated);
      setProductsLoading(true); // Only show local loading
      fetchPaginated(1, updated, true).finally(() => setProductsLoading(false));
  }, [filters]);

  // Called when user clicks "Load More"
  const loadMore = useCallback(async () => {
      if (!hasMore || isLoadingMore) return;
      setIsLoadingMore(true);
      await fetchPaginated(page + 1, filters, false);
      setIsLoadingMore(false);
  }, [page, hasMore, isLoadingMore, filters]);

  useEffect(() => {
    // Initial boot
    refreshData();
  }, []);

  const updateSettings = useCallback(async (newSettings: AppSettings) => {
    try {
        await api.updateAppSettings(settings.id, newSettings);
        setSettings(newSettings);
        showToast('Settings updated', 'success');
    } catch (e) {
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
      loading: initialLoading, // Only expose initial loading as the main 'loading' blocker
      productsLoading,         // Specific to shop grid
      refreshData, 
      updateSettings,
      hasMore,
      isLoadingMore,
      loadMore,
      filters,
      updateFilters
  }), [products, allProducts, categories, blogPosts, latestReviews, settings, initialLoading, productsLoading, refreshData, updateSettings, hasMore, isLoadingMore, loadMore, filters, updateFilters]);

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
