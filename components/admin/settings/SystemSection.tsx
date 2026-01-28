
import React from 'react';
import { AppSettings } from '../../../types';

interface SystemSectionProps {
  settings: AppSettings;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSmtpChange: (smtp: any) => void;
}

export const SystemSection: React.FC<SystemSectionProps> = ({ settings, onChange }) => {
  return (
    <div className="space-y-6">
      {/* Maintenance Mode */}
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
          <div className="animate-fade-in">
            <label className="block text-sm font-medium text-gray-700">Maintenance Message</label>
            <textarea name="maintenanceMessage" value={settings.maintenanceMessage || ''} onChange={onChange} rows={2} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900" />
          </div>
        )}
      </div>

      {/* AI Configuration */}
      <div className="bg-white shadow rounded-lg p-6 border border-gray-200 space-y-4">
        <h3 className="text-lg font-medium border-b pb-2 text-brand-green">AI Capabilities</h3>
        <p className="text-sm text-gray-500">Configure the API Key for your Admin Copilot and AI content generation tools.</p>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Gemini API Key</label>
          <input 
            type="password" 
            name="geminiApiKey" 
            value={settings.geminiApiKey || ''} 
            onChange={onChange} 
            placeholder="AI Key from Google AI Studio"
            className="w-full border border-gray-300 rounded-lg p-3 text-sm font-mono focus:ring-2 focus:ring-brand-green/20 outline-none"
          />
          <p className="text-[10px] text-slate-400 mt-2">
            Obtain your key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-brand-green hover:underline">Google AI Studio</a>.
          </p>
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
         <p className="text-sm text-gray-500">Email Configuration is managed in the <strong>Notifications</strong> tab.</p>
      </div>
    </div>
  );
};
