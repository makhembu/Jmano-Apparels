
import React from 'react';
import { AppSettings } from '../../../types';

interface IdentitySectionProps {
  settings: AppSettings;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const IdentitySection: React.FC<IdentitySectionProps> = ({ settings, onChange }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6 border border-gray-200 space-y-4">
      <h3 className="text-lg font-medium border-b pb-2 text-brand-green">Identity & Branding</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Primary Slogan</label>
          <input type="text" name="slogan" value={settings.slogan} onChange={onChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Secondary Slogan</label>
          <input type="text" name="secondarySlogan" value={settings.secondarySlogan} onChange={onChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Mission Statement</label>
        <textarea name="mission" value={settings.mission} onChange={onChange} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Vision</label>
        <textarea name="vision" value={settings.vision} onChange={onChange} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Core Values</label>
        <input type="text" name="coreValues" value={settings.coreValues} onChange={onChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Hero Image URL</label>
          <input type="text" name="heroBannerImage" value={settings.heroBannerImage || ''} onChange={onChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Hero Text</label>
          <input type="text" name="heroBannerText" value={settings.heroBannerText || ''} onChange={onChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900" />
        </div>
      </div>
    </div>
  );
};
