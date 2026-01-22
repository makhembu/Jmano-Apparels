
import React, { useState, useEffect } from 'react';
import { AppSettings } from '../../../types';

interface SystemSectionProps {
  settings: AppSettings;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSmtpChange: (smtp: any) => void;
}

export const SystemSection: React.FC<SystemSectionProps> = ({ settings, onChange, onSmtpChange }) => {
  const [smtpJson, setSmtpJson] = useState('');

  useEffect(() => {
    if (settings.smtpSettings) {
      setSmtpJson(JSON.stringify(settings.smtpSettings, null, 2));
    }
  }, [settings.smtpSettings]);

  const handleSmtpTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSmtpJson(e.target.value);
    try {
      if(e.target.value) {
        onSmtpChange(JSON.parse(e.target.value));
      } else {
        onSmtpChange(undefined);
      }
    } catch(err) {
      // Invalid JSON, don't propagate yet
    }
  };

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
      <div className="pt-2">
        <label className="block text-sm font-medium text-gray-700">SMTP Settings (JSON)</label>
        <textarea 
          value={smtpJson} 
          onChange={handleSmtpTextChange} 
          rows={4} 
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-50 text-gray-800 font-mono text-xs" 
          placeholder='{"host": "smtp.example.com", "port": 587}'
        />
      </div>
    </div>
  );
};
