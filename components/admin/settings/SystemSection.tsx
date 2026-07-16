
import React from 'react';
import { AppSettings } from '../../../types';
import { Switch } from '../../ui/Switch';

interface SystemSectionProps {
  settings: AppSettings;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
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

      {/* AI Configuration */}
      <div className="bg-white shadow rounded-lg p-6 border border-gray-200 space-y-4">
        <h3 className="text-lg font-medium border-b pb-2 text-brand-green">AI & Intelligence</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">OpenCode API Key</label>
          <div className="relative rounded-md shadow-sm">
            <input 
              type="password" 
              name="opencodeApiKey" 
              value={settings.opencodeApiKey || ''} 
              onChange={onChange} 
              className="block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-brand-green sm:text-sm pr-10" 
              placeholder="sk-..."
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Required for <strong>Jambo Copilot</strong>, SEO generation, and AI analytics features.
            <br/>
            <a href="https://opencode.ai" target="_blank" rel="noreferrer" className="text-brand-green hover:underline font-bold inline-flex items-center gap-1 mt-1">
              Get an API Key &rarr;
            </a>
          </p>
        </div>

        <div className="pt-2 border-t border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-1">Legacy Gemini API Key</label>
          <div className="relative rounded-md shadow-sm">
            <input 
              type="password" 
              name="geminiApiKey" 
              value={settings.geminiApiKey || ''} 
              onChange={onChange} 
              className="block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-brand-green sm:text-sm pr-10" 
              placeholder="AIzaSy..."
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Fallback if OpenCode key is not set.
          </p>
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
         <p className="text-sm text-gray-500">Email Configuration is managed in the <strong>Notifications</strong> tab.</p>
      </div>
    </div>
  );
};
