import { useState, useEffect, useCallback } from 'react';
import { Product, Category, BlogPost, AppSettings } from '../types';
import { api } from '../lib/db';
import { useToast } from '../context/ToastContext';

const defaultSettings: AppSettings = {
  id: 0,
  slogan: "Loading...",
  secondarySlogan: "Loading...",
  mission: "Loading...",
  vision: "Loading...",
  coreValues: "Loading..."
};

export const useShopData = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      const [fetchedSettings, fetchedCats, fetchedProds, fetchedPosts] = await Promise.all([
        api.getAppSettings(),
        api.getCategories(),
        api.getProducts(),
        api.getBlogPosts()
      ]);

      if (fetchedSettings) setSettings(fetchedSettings);
      if (fetchedCats) setCategories(fetchedCats);
      if (fetchedProds) setProducts(fetchedProds);
      if (fetchedPosts) setBlogPosts(fetchedPosts);

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

  return {
    products,
    categories,
    blogPosts,
    settings,
    loading,
    refreshData,
    updateSettings
  };
};
