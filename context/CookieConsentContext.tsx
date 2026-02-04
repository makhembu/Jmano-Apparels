
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ConsentSettings {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

interface CookieConsentContextType {
  consent: ConsentSettings;
  hasInteracted: boolean;
  saveConsent: (settings: ConsentSettings) => void;
  acceptAll: () => void;
  resetConsent: () => void;
  isBannerOpen: boolean;
  setBannerOpen: (isOpen: boolean) => void;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

const STORAGE_KEY = 'jambo_cookie_consent';
const DEFAULT_CONSENT: ConsentSettings = { necessary: true, analytics: false, marketing: false };

export const CookieConsentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [consent, setConsent] = useState<ConsentSettings>(DEFAULT_CONSENT);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isBannerOpen, setBannerOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setConsent(parsed);
        setHasInteracted(true);
      } catch (e) {
        setBannerOpen(true);
      }
    } else {
      setBannerOpen(true);
    }
  }, []);

  const saveConsent = (settings: ConsentSettings) => {
    const finalSettings = { ...settings, necessary: true }; // Force necessary
    setConsent(finalSettings);
    setHasInteracted(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(finalSettings));
    setBannerOpen(false);
    
    // If analytics accepted, we might need to reload or trigger events that were queued
    if (finalSettings.analytics) {
      window.dispatchEvent(new Event('consent_updated'));
    }
  };

  const acceptAll = () => {
    saveConsent({ necessary: true, analytics: true, marketing: true });
  };

  const resetConsent = () => {
    setBannerOpen(true);
  };

  return (
    <CookieConsentContext.Provider value={{ 
      consent, 
      hasInteracted, 
      saveConsent, 
      acceptAll, 
      resetConsent,
      isBannerOpen,
      setBannerOpen
    }}>
      {children}
    </CookieConsentContext.Provider>
  );
};

export const useConsent = () => {
  const context = useContext(CookieConsentContext);
  if (!context) throw new Error("useConsent must be used within CookieConsentProvider");
  return context;
};
