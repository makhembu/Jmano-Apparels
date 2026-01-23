import React from 'react';
import { AppSettings } from '../../../types';

interface NotificationSectionProps {
  settings: AppSettings;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const NotificationSection: React.FC<NotificationSectionProps> = ({ settings, onChange }) => {
  const masterSwitchEnabled = settings.enableEmailNotifications ?? false;

  const Toggle = ({ name, label, description }: { name: keyof AppSettings, label: string, description: string }) => (
    <div className={`flex items-start justify-between p-4 rounded-lg transition-colors ${masterSwitchEnabled ? 'bg-white' : 'bg-gray-50 opacity-60'}`}>
      <div>
        <label htmlFor={name} className={`font-bold text-sm ${masterSwitchEnabled ? 'text-gray-900' : 'text-gray-500'}`}>{label}</label>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <div className="flex items-center h-6">
        <input 
          id={name}
          name={name}
          type="checkbox"
          checked={!!settings[name] && masterSwitchEnabled}
          onChange={onChange}
          disabled={!masterSwitchEnabled && name !== 'enableEmailNotifications'}
          className="h-4 w-4 rounded border-gray-300 text-brand-green focus:ring-brand-green disabled:opacity-50"
        />
      </div>
    </div>
  );

  return (
    <div className="bg-white shadow rounded-lg p-6 border border-gray-200 space-y-4">
      <div className="border-b pb-4">
        <h3 className="text-lg font-medium text-brand-green">Email Notifications</h3>
        <p className="text-sm text-gray-500 mt-1">Manage automated emails sent to customers. Requires SMTP settings to be configured.</p>
      </div>

      <Toggle 
        name="enableEmailNotifications"
        label="Enable All Email Notifications"
        description="Master switch to turn all automated customer emails on or off."
      />
      
      <div className="space-y-2 pl-4 border-l-2 border-gray-100">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-4">Transactional Emails</h4>
        <Toggle 
          name="enableEmailWelcome"
          label="Welcome Email"
          description="Send to new users upon successful sign-up."
        />
        <Toggle 
          name="enableEmailNewOrder"
          label="New Order Confirmation"
          description="Send to customers after they complete a purchase."
        />
        <Toggle 
          name="enableEmailOrderShipped"
          label="Order Shipped Notification"
          description="Send when an order's status is updated to 'Shipped'."
        />
      </div>
    </div>
  );
};