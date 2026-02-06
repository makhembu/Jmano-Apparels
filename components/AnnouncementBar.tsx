import React from 'react';
// FIX: Replaced deprecated useApp with useShop
import { useShop } from '../context/ShopContext';

export const AnnouncementBar: React.FC = () => {
  const { settings } = useShop();

  if (!settings.isAnnouncementEnabled || !settings.announcementText) {
    return null;
  }

  return (
    <div className="bg-brand-hope text-brand-dark h-10 relative z-50 overflow-hidden flex items-center border-b border-brand-dark/10 group">
      {/* 
        Using 'whitespace-nowrap' to keep text on one line.
        'animate-marquee' is defined in index.html tailwind config.
        'group-hover:[animation-play-state:paused]' allows users to read by hovering.
      */}
      <div className="w-full absolute whitespace-nowrap animate-marquee group-hover:[animation-play-state:paused]">
        <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] inline-block">
          {settings.announcementText}
        </p>
      </div>
    </div>
  );
};