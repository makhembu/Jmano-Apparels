import React from 'react';
import { AppSettings } from '../../../types';

interface SystemSectionProps {
  settings: AppSettings;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSmtpChange: (smtp: any) => void;
}

export const SystemSection: React.FC<SystemSectionProps> = ({ settings, onChange }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6 border border-gray-200 space-y-4">
      <h3 className="text-lg font-medium border-b pb-2 text-brand-green">System Status</h3>
      <div className="flex items-center">
        <input 
          type="checkbox" 
          id="maintenanceMode"
          name="maintenanceMode" 
          checked={!!settings.maintenanceMode} 
          onChange={onChange} 
          className="h-4 w-4 text-brand-green border-gray-300 rounded focus:ring-brand-green" 
        />
        <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-900 font-bold">Enable Maintenance Mode</label>
      </div>
      {settings.maintenanceMode && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Maintenance Message</label>
          <textarea name="maintenanceMessage" value={settings.maintenanceMessage || ''} onChange={onChange} rows={2} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900" />
        </div>
      )}
      <div className="pt-4 mt-4 border-t border-gray-100">
         <p className="text-sm text-gray-500">Email Configuration has been moved to the <strong>Notifications</strong> tab.</p>
      </div>
    </div>
  );
};