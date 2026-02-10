import React from 'react';
import { useProductEditor } from '../../hooks/useProductEditor';
import { useShop } from '../../context/ShopContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ProductEditorHeader } from '../../components/admin/products/editor/ProductEditorHeader';
import { ProductOverviewTab } from '../../components/admin/products/editor/ProductOverviewTab';
import { ProductSettingsTab } from '../../components/admin/products/editor/ProductSettingsTab';

export const AdminProductEditor: React.FC = () => {
    const { categories } = useShop();
    const {
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
    } = useProductEditor();

    if (isFormLoading) return <LoadingSpinner fullScreen />;

    return (
        <div className="animate-fade-in relative pb-20">
            <ProductEditorHeader
                product={formData}
                isNew={!id}
                onSave={handleSubmit}
                isSaving={isSaving}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            <div className="max-w-7xl mx-auto px-4 md:px-0">
                {id && activeTab === 'overview' && (
                    <ProductOverviewTab productId={id} product={formData} />
                )}

                {activeTab === 'settings' && (
                    <ProductSettingsTab
                        formData={formData}
                        categories={categories}
                        isNew={!id}
                        isUploading={isUploading}
                        onChange={handleChange}
                        onSwitchChange={handleSwitchChange}
                        onArrayUpdate={handleArrayUpdate}
                        onImageUpload={handleImageUpload}
                        onImageUrlsUpdate={handleImageUrlsUpdate}
                        onImageEdit={handleImageEdit}
                        onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
                    />
                )}
            </div>
        </div>
    );
};