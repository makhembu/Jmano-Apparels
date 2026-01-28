
import React, { useState, useEffect } from 'react';
import { AppSettings } from '../../../types';
import { Switch } from '../../ui/Switch';

interface ContactSectionProps {
  settings: AppSettings;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onHoursChange: (hours: Record<string, string>) => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ settings, onChange, onHoursChange }) => {
  const [hours, setHours] = useState<Record<string, string>>({
    monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '', sunday: ''
  });

  useEffect(() => {
    if (settings.businessHours) {
      setHours({ ...hours, ...settings.businessHours });
    }
  }, [settings.businessHours]);

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHours = { ...hours, [e.target.name]: e.target.value };
    setHours(newHours);
    onHoursChange(newHours);
  };

  const handleSwitchChange = (val: boolean) => {
    // Create synthetic event for compatibility with parent handler
    const syntheticEvent = {
        target: {
            name: 'enableContactForm',
            value: val,
            type: 'checkbox',
            checked: val
        }
    } as any;
    onChange(syntheticEvent);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 border border-gray-200 space-y-6">
      <h3 className="text-lg font-medium border-b pb-2 text-brand-green">Contact & Hours</h3>
      
      {/* Contact Form Toggle */}
      <Switch 
        label="Show Contact Form on About Page"
        description="Allow customers to send messages directly from the About Us page."
        checked={!!settings.enableContactForm}
        onChange={handleSwitchChange}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Contact Email</label>
          <input type="email" name="contactEmail" value={settings.contactEmail || ''} onChange={onChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input type="text" name="contactPhone" value={settings.contactPhone || ''} onChange={onChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Address</label>
        <input type="text" name="contactAddress" value={settings.contactAddress || ''} onChange={onChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900" />
      </div>

      <div className="pt-2">
        <h4 className="text-sm font-bold text-gray-700 mb-2">Business Hours (e.g. "09:00-18:00")</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
            <div key={day}>
              <label className="block text-xs uppercase font-medium text-gray-500">{day}</label>
              <input 
                type="text" 
                name={day} 
                value={hours[day]} 
                onChange={handleDayChange}
                placeholder="Closed"
                className="mt-1 block w-full border border-gray-300 rounded-md p-1.5 text-sm bg-white text-gray-900"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
