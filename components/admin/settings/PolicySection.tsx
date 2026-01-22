
import React from 'react';
import { AppSettings } from '../../../types';

interface PolicySectionProps {
  settings: AppSettings;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const PolicySection: React.FC<PolicySectionProps> = ({ settings, onChange }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6 border border-gray-200 space-y-4">
      <h3 className="text-lg font-medium border-b pb-2 text-brand-green">Legal & Policies</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Shipping Policy</label>
          <textarea name="shippingPolicy" value={settings.shippingPolicy || ''} onChange={onChange} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Return Policy</label>
          <textarea name="returnPolicy" value={settings.returnPolicy || ''} onChange={onChange} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Privacy Policy</label>
          <textarea name="privacyPolicy" value={settings.privacyPolicy || ''} onChange={onChange} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Terms & Conditions</label>
          <textarea name="termsConditions" value={settings.termsConditions || ''} onChange={onChange} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900" />
        </div>
      </div>
    </div>
  );
};
