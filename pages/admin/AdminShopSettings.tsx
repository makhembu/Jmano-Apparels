
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GeneralSettingsTab } from '../../components/admin/shop/GeneralSettingsTab';
import { CategoriesTab } from '../../components/admin/shop/CategoriesTab';
import { ShippingTab } from '../../components/admin/shop/ShippingTab';
import { DiscountsTab } from '../../components/admin/shop/DiscountsTab';

type Tab = 'general' | 'categories' | 'shipping' | 'discounts';

export const AdminShopSettings: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as Tab) || 'general';

  const handleTabChange = (tab: Tab) => {
    setSearchParams({ tab });
  };

  return (
    <div className="max-w-6xl pb-20 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
         <h1 className="text-2xl font-bold font-serif text-brand-dark">Shop Configuration</h1>
      </div>

      <div className="flex gap-4 mb-8 border-b overflow-x-auto no-scrollbar">
         {['general', 'categories', 'shipping', 'discounts'].map((tab) => (
             <button 
                key={tab}
                onClick={() => handleTabChange(tab as Tab)}
                className={`pb-3 px-6 text-sm font-bold capitalize transition-colors whitespace-nowrap ${activeTab === tab ? 'border-b-2 border-brand-green text-brand-green' : 'text-gray-500 hover:text-gray-800'}`}
             >
                {tab}
             </button>
         ))}
      </div>
      
      {activeTab === 'general' && <GeneralSettingsTab />}
      {activeTab === 'categories' && <CategoriesTab />}
      {activeTab === 'shipping' && <ShippingTab />}
      {activeTab === 'discounts' && <DiscountsTab />}

    </div>
  );
};
