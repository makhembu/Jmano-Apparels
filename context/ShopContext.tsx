import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Product, Category, BlogPost, AppSettings, ProductReview } from '../types';
import { api } from '../lib/db';
import { useToast } from './ToastContext';

interface ShopContextType {
  products: Product[];
  categories: Category[];
  blogPosts: BlogPost[];
  latestReviews: ProductReview[];
  settings: AppSettings;
  loading: boolean;
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
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [latestReviews, setLatestReviews] = useState<ProductReview[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      const [fetchedSettings, fetchedCats, fetchedProds, fetchedPosts, fetchedReviews] = await Promise.all([
        api.getAppSettings(),
        api.getCategories(),
        api.getProducts(),
        api.getBlogPosts(),
        api.getRecentReviews(6) // Fetch latest 6 reviews for home
      ]);

      if (fetchedSettings) setSettings(fetchedSettings);
      if (fetchedCats) setCategories(fetchedCats);
      if (fetchedProds) setProducts(fetchedProds);
      if (fetchedPosts) setBlogPosts(fetchedPosts);
      if (fetchedReviews) setLatestReviews(fetchedReviews);

    } catch (error) {
      console.error("Data fetch error:", error);
      showToast("Connection issue. Some content may be missing.", 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

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

  const value = useMemo(() => ({ products, categories, blogPosts, latestReviews, settings, loading, refreshData, updateSettings }), [products, categories, blogPosts, latestReviews, settings, loading, refreshData, updateSettings]);

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