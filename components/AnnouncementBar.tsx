
import React from 'react';
import { useApp } from '../context/AppContext';

export const AnnouncementBar: React.FC = () => {
  const { settings } = useApp();

  if (!settings.isAnnouncementEnabled || !settings.announcementText) {
    return null;
  }

  return (
    <div className="bg-brand-hope text-brand-dark px-4 py-2.5 text-center relative z-50 transition-all duration-300 ease-in-out shadow-sm border-b border-brand-dark/10">
      <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] leading-tight">
        {settings.announcementText}
      </p>
    </div>
  );
};
