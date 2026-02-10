import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { useToast } from '../context/ToastContext';
import { useCopilot } from '../context/CopilotContext';
import { api } from '../lib/db';
import { Product } from '../types';

interface ExtendedProduct extends Product {
    isFreeShipping?: boolean;
}

const emptyProduct: Partial<ExtendedProduct> = {
  title: '', price: 0, salePrice: undefined, isOnSale: false, categoryKey: '',
  images: [], description: '', sizes: ['S', 'M', 'L', 'XL'], colors: [], tags: [],
  isFeatured: false, isPublished: true, sku: '', slug: '', stockQuantity: 0, lowStockThreshold: 5, weight: 0,
  isFreeShipping: false,
  seoTitle: '', seoDescription: '', canonicalUrl: '', isNoIndex: false, isNoFollow: false, keywords: []
};

export const useProductEditor = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { products, refreshData } = useShop();
    const { showToast } = useToast();
    const { setPageData } = useCopilot();

    const [formData, setFormData] = useState<Partial<ExtendedProduct>>(emptyProduct);
    const [isFormLoading, setIsFormLoading] = useState(!!id);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'settings'>(id ? 'overview' : 'settings');

    const generateSlug = (text: string) => {
        return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    };

    useEffect(() => {
        if (id) {
            const p = products.find(prod => prod.id === id);
            if (p) {
                setFormData(p);
                setPageData(p as any);
                setIsFormLoading(false);
            } else if (products.length > 0) {
                // If products are loaded but this ID isn't found
                showToast("Product not found.", "error");
                navigate('/admin/products');
            }
        } else {
            setFormData(emptyProduct);
            setPageData(undefined);
            setActiveTab('settings');
            setIsFormLoading(false);
        }
        return () => setPageData(undefined);
    }, [id, products, setPageData, navigate, showToast]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (type === 'number') {
            setFormData(prev => ({ ...prev, [name]: value === '' ? 0 : parseFloat(value) }));
        } else if (name === 'title' && !id && !formData.slug) {
            setFormData(prev => ({ ...prev, title: value, slug: generateSlug(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    }, [id, formData.slug]);

    const handleSwitchChange = useCallback((name: string, val: boolean) => {
        setFormData(prev => ({ ...prev, [name]: val }));
    }, []);

    const handleArrayUpdate = useCallback((field: 'sizes' | 'colors' | 'tags' | 'keywords', value: string[]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);
    
    const handleImageUpload = useCallback(async (file: File) => {
        if (file.size > 5 * 1024 * 1024) {
            showToast('File too large (max 5MB)', 'error');
            return;
        }
        setIsUploading(true);
        try {
            const publicUrl = await api.uploadImage(file);
            setFormData(prev => ({ ...prev, images: [...(prev.images || []), publicUrl] }));
            showToast('Image uploaded', 'success');
        } catch (error: any) {
            showToast(error.message || 'Failed to upload image', 'error');
        } finally {
            setIsUploading(false);
        }
    }, [showToast]);

    const handleImageUrlsUpdate = useCallback((urls: string[]) => {
        setFormData(prev => ({ ...prev, images: urls }));
    }, []);

    const handleImageEdit = useCallback(async (blob: Blob, index: number) => {
        if (!formData.images || formData.images[index] === undefined) return;
        
        const originalFileName = formData.images[index].split('/').pop()?.split('?')[0] || `edited-${Date.now()}.jpg`;
        const file = new File([blob], originalFileName, { type: blob.type });

        setIsUploading(true);
        try {
            const newUrl = await api.uploadImage(file);
            const newImages = [...(formData.images || [])];
            newImages[index] = newUrl;
            setFormData(prev => ({ ...prev, images: newImages }));
            showToast('Image updated successfully', 'success');
            // TODO: Consider deleting old image from storage
        } catch (error: any) {
            showToast(error.message || 'Failed to save edited image', 'error');
        } finally {
            setIsUploading(false);
        }
    }, [formData.images, showToast]);

    const handleSubmit = useCallback(async () => {
        if (!formData.title || !formData.categoryKey) {
            showToast('Title and Category are required', 'error');
            return;
        }
        setIsSaving(true);
        try {
            const payload = { ...formData };
            if (id) await api.adminUpdateProduct(id, payload);
            else await api.adminCreateProduct(payload);
            await refreshData();
            showToast('Product saved successfully', 'success');
            navigate('/admin/products');
        } catch (err: any) {
            showToast(`Error: ${err.message}`, 'error');
        } finally {
            setIsSaving(false);
        }
    }, [formData, id, navigate, refreshData, showToast]);

    return {
        id,
        formData,
        isFormLoading,
        isSaving,
        isUploading,
        activeTab,
        setActiveTab,
        handleChange,
        handleSwitchChange,
        handleArrayUpdate,
        handleImageUpload,
        handleImageUrlsUpdate,
        handleImageEdit,
        handleSubmit
    };
};