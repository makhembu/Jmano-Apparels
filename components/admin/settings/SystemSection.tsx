
import React from 'react';
import { AppSettings } from '../../../types';
import { Switch } from '../../ui/Switch';

interface SystemSectionProps {
  settings: AppSettings;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSmtpChange: (smtp: any) => void;
}

export const SystemSection: React.FC<SystemSectionProps> = ({ settings, onChange }) => {
  const handleSwitchChange = (val: boolean) => {
    // Create synthetic event
    const syntheticEvent = {
        target: {
            name: 'maintenanceMode',
            value: val,
            type: 'checkbox',
            checked: val
        }
    } as any;
    onChange(syntheticEvent);
  };

  return (
    <div className="space-y-6">
      {/* Maintenance Mode */}
      <div className="bg-white shadow rounded-lg p-6 border border-gray-200 space-y-4">
        <h3 className="text-lg font-medium border-b pb-2 text-brand-green">System Status</h3>
        
        <Switch 
          label="Enable Maintenance Mode"
          description="Prevent customers from accessing the shop while you make updates."
          checked={!!settings.maintenanceMode}
          onChange={handleSwitchChange}
        />

        {settings.maintenanceMode && (
          <div className="animate-fade-in pl-4 border-l-2 border-brand-green">
            <label className="block text-sm font-medium text-gray-700">Maintenance Message</label>
            <textarea name="maintenanceMessage" value={settings.maintenanceMessage || ''} onChange={onChange} rows={2} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900" />
          </div>
        )}
      </div>

      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
         <p className="text-sm text-gray-500">Email Configuration is managed in the <strong>Notifications</strong> tab.</p>
      </div>
    </div>
  );
};
