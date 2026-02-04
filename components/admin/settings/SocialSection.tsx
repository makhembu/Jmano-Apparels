
import React, { useState, useEffect } from 'react';
import { AppSettings } from '../../../types';
import { Input } from '../../ui/Input';

interface SocialSectionProps {
  settings: AppSettings;
  onSocialChange: (socials: Record<string, string>) => void;
}

export const SocialSection: React.FC<SocialSectionProps> = ({ settings, onSocialChange }) => {
  const [socials, setSocials] = useState<Record<string, string>>({
    facebook: '', instagram: '', twitter: '', tiktok: '', linkedin: ''
  });

  useEffect(() => {
    if (settings.socialLinks) {
      setSocials({ ...socials, ...settings.socialLinks });
    }
  }, [settings.socialLinks]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSocials = { ...socials, [e.target.name]: e.target.value };
    setSocials(newSocials);
    onSocialChange(newSocials);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 border border-gray-200 space-y-4">
      <h3 className="text-lg font-medium border-b pb-2 text-brand-green">Social Media</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['facebook', 'instagram', 'twitter', 'tiktok', 'linkedin'].map(platform => (
          <div key={platform}>
            <Input 
              label={`${platform.charAt(0).toUpperCase() + platform.slice(1)} URL`}
              type="text" 
              name={platform} 
              value={socials[platform]} 
              onChange={handleChange} 
            />
          </div>
        ))}
      </div>
    </div>
  );
};
