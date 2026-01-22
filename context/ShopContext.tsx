import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, Category, BlogPost, AppSettings } from '../types';
import { api } from '../lib/db';
import { useToast } from './ToastContext';

interface ShopContextType {
  products: Product[];
  categories: Category[];
  blogPosts: BlogPost[];
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
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      // Use allSettled to allow partial data loading if one service fails
      const results = await Promise.allSettled([
        api.getAppSettings(),
        api.getCategories(),
        api.getProducts(),
        api.getBlogPosts()
      ]);

      // 0: Settings
      if (results[0].status === 'fulfilled' && results[0].value) {
        setSettings(results[0].value);
      } else {
        console.error("Failed to load settings", results[0].status === 'rejected' ? results[0].reason : null);
      }

      // 1: Categories
      if (results[1].status === 'fulfilled' && results[1].value) {
        setCategories(results[1].value);
      }

      // 2: Products
      if (results[2].status === 'fulfilled' && results[2].value) {
        setProducts(results[2].value);
      }

      // 3: Blog Posts
      if (results[3].status === 'fulfilled' && results[3].value) {
        setBlogPosts(results[3].value);
      }

      // Check if critical data failed
      if (results[0].status === 'rejected' || results[2].status === 'rejected') {
        showToast("Some content failed to load. Please refresh.", 'error');
      }

    } catch (error) {
      console.error("Critical Data fetch error:", error);
      showToast("Critical connection issue.", 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const updateSettings = async (newSettings: AppSettings) => {
    try {
        await api.updateAppSettings(settings.id, newSettings);
        setSettings(newSettings);
        showToast('Settings updated', 'success');
    } catch (e) {
        console.error(e);
        showToast('Failed to update settings', 'error');
    }
  };

  return (
    <ShopContext.Provider value={{ products, categories, blogPosts, settings, loading, refreshData, updateSettings }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) throw new Error("useShop must be used within ShopProvider");
  return context;
};