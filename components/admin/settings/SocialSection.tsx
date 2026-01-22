
import React, { useState, useEffect } from 'react';
import { AppSettings } from '../../../types';

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
            <label className="block text-sm font-medium text-gray-700 capitalize">{platform} URL</label>
            <input type="text" name={platform} value={socials[platform]} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900" />
          </div>
        ))}
      </div>
    </div>
  );
};
