import React from 'react';
import { Product, Category } from '../../../../types';
import { ProductPreview } from '../../products/ProductPreview';
import { SeoFieldGroup } from '../../seo/SeoFieldGroup';
import { BasicInfoForm } from './forms/BasicInfoForm';
import { VisualsForm } from './forms/VisualsForm';
import { CommerceDataForm } from './forms/CommerceDataForm';
import { VariantsForm } from './forms/VariantsForm';
import { VisibilityForm } from './forms/VisibilityForm';

interface ExtendedProduct extends Product {
    isFreeShipping?: boolean;
}

interface ProductSettingsTabProps {
    formData: Partial<ExtendedProduct>;
    categories: Category[];
    isNew: boolean;
    isUploading: boolean;
    apiKey?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onAiApply?: (field: string, value: string) => void;
    onSwitchChange: (name: string, val: boolean) => void;
    onArrayUpdate: (field: 'sizes' | 'colors' | 'tags' | 'keywords', value: string[]) => void;
    onImageUpload: (file: File) => void;
    onImageUrlsUpdate: (urls: string[]) => void;
    onImageEdit: (blob: Blob, index: number) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export const ProductSettingsTab: React.FC<ProductSettingsTabProps> = (props) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-fade-in">
            <div className="lg:col-span-2 space-y-8">
                <form id="product-form" onSubmit={props.onSubmit}>
                    <BasicInfoForm
                        formData={props.formData}
                        categories={props.categories}
                        isNew={props.isNew}
                        onChange={props.onChange}
                        onAiApply={props.onAiApply}
                    />
                    <VisualsForm
                        images={props.formData.images || []}
                        isUploading={props.isUploading}
                        onUpload={props.onImageUpload}
                        onUpdateUrls={props.onImageUrlsUpdate}
                        onEditSave={props.onImageEdit}
                    />
                    <CommerceDataForm
                        formData={props.formData}
                        onChange={props.onChange}
                        onSwitchChange={props.onSwitchChange}
                    />
                    <VariantsForm
                        sizes={props.formData.sizes || []}
                        colors={props.formData.colors || []}
                        onArrayUpdate={props.onArrayUpdate}
                    />
                    <div className="bg-white shadow-xl shadow-slate-200/50 rounded-2xl p-6 md:p-8 border border-slate-200">
                        <SeoFieldGroup
                            data={props.formData}
                            onChange={props.onChange}
                            onKeywordsChange={(k) => props.onArrayUpdate('keywords', k)}
                            apiKey={props.apiKey}
                            defaultTitle={props.formData.title}
                            defaultDescription={props.formData.description?.substring(0, 160)}
                            previewImage={props.formData.images?.[0]}
                            permalink={`https://jamboapparels.com/product/${props.formData.slug || props.formData.id || 'new'}`}
                            contextData={{ title: props.formData.title || '', description: props.formData.description || '', type: 'product' }}
                        />
                    </div>
                    <VisibilityForm
                        isPublished={!!props.formData.isPublished}
                        isFeatured={!!props.formData.isFeatured}
                        onSwitchChange={props.onSwitchChange}
                    />
                </form>
            </div>
            <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-[160px] space-y-8">
                    <ProductPreview product={props.formData} categories={props.categories} />
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-800 text-xs leading-relaxed">
                        <strong className="block mb-1">Tip:</strong>
                        Ensure your product images are high-resolution (min 800x800) and your description includes relevant keywords.
                    </div>
                </div>
            </div>
        </div>
    );
};