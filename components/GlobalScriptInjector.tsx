
import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export const GlobalScriptInjector: React.FC = () => {
  const { settings, loading } = useApp();
  const location = useLocation();
  const initialized = useRef(false);

  // 1. Define ID Priority: DB Setting > Hardcoded Default
  const HARDCODED_ID = 'G-26S55GN10D';
  const rawId = settings.googleAnalyticsId?.trim() || HARDCODED_ID;
  
  // Ensure ID has correct prefix
  const gaId = rawId.startsWith('G-') ? rawId : `G-${rawId}`;

  // 2. Initialize Script (Run once)
  useEffect(() => {
    if (loading) return;
    if (initialized.current) return;

    // Inject Script Tag
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    // Initialize Data Layer
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(...args: any[]) {
      window.dataLayer.push(args);
    };

    // Initial Config
    window.gtag('js', new Date());
    window.gtag('config', gaId, {
      page_path: window.location.pathname,
    });

    initialized.current = true;
    console.log(`[Analytics] Initialized with ID: ${gaId}`);
  }, [loading, gaId]);

  // 3. Track Route Changes (SPA)
  useEffect(() => {
    if (!loading && initialized.current && window.gtag) {
      window.gtag('config', gaId, {
        page_path: location.pathname + location.search,
      });
    }
  }, [location, gaId, loading]);

  // 4. Custom Scripts Injection (Optional)
  useEffect(() => {
    if (!loading && settings.customHeadScripts) {
      try {
        const range = document.createRange();
        range.selectNode(document.body);
        const fragment = range.createContextualFragment(settings.customHeadScripts);
        document.head.appendChild(fragment);
      } catch (e) {
        console.error("Failed to inject custom scripts", e);
      }
    }
  }, [loading, settings.customHeadScripts]);

  return null;
};
