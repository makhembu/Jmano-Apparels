import React from 'react';
import { useProductEditor } from '../../hooks/useProductEditor';
import { useShop } from '../../context/ShopContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ProductEditorHeader } from '../../components/admin/products/editor/ProductEditorHeader';
import { ProductOverviewTab } from '../../components/admin/products/editor/ProductOverviewTab';
import { ProductSettingsTab } from '../../components/admin/products/editor/ProductSettingsTab';

export const AdminProductEditor: React.FC = () => {
    const { categories, settings } = useShop();
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

    const handleAiApply = (field: string, value: string) => {
        const syntheticEvent = {
            target: { name: field, value, type: 'text' }
        } as React.ChangeEvent<HTMLInputElement>;
        handleChange(syntheticEvent);
    };

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
                        apiKey={settings.opencodeApiKey || settings.geminiApiKey}
                        onChange={handleChange}
                        onAiApply={handleAiApply}
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