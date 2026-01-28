
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
  const { settings } = useApp();
  const location = useLocation();
  const gaInjected = useRef(false);
  const customInjected = useRef(false);

  // 1. Google Analytics Initialization
  useEffect(() => {
    // Only inject if ID exists and hasn't been injected yet
    if (settings.googleAnalyticsId && !gaInjected.current) {
      
      // Create the script tag for GTM
      const scriptUrl = `https://www.googletagmanager.com/gtag/js?id=${settings.googleAnalyticsId}`;
      const script = document.createElement('script');
      script.async = true;
      script.src = scriptUrl;
      document.head.appendChild(script);

      // Initialize dataLayer and gtag function
      window.dataLayer = window.dataLayer || [];
      
      // Define gtag function
      window.gtag = function(...args: any[]) {
        window.dataLayer.push(args);
      };

      // Config call
      window.gtag('js', new Date());
      window.gtag('config', settings.googleAnalyticsId);

      gaInjected.current = true;
      console.log(`[Analytics] GA Initialized with ID: ${settings.googleAnalyticsId}`);
    }
  }, [settings.googleAnalyticsId]);

  // 2. Track Page Views on Route Change (SPA Support)
  useEffect(() => {
    if (settings.googleAnalyticsId && window.gtag) {
      // Send page_view event to GA
      window.gtag('config', settings.googleAnalyticsId, {
        page_path: location.pathname + location.search,
      });
    }
  }, [location, settings.googleAnalyticsId]);

  // 3. Custom Head Scripts (e.g. Pixel, Chat widgets)
  useEffect(() => {
    if (settings.customHeadScripts && !customInjected.current) {
      try {
        const range = document.createRange();
        // Use body as context to ensure scripts execute properly when appended to head
        range.selectNode(document.body);
        const fragment = range.createContextualFragment(settings.customHeadScripts);
        document.head.appendChild(fragment);
        customInjected.current = true;
        console.log('[Analytics] Custom scripts injected');
      } catch (e) {
        console.error("Failed to inject custom scripts", e);
      }
    }
  }, [settings.customHeadScripts]);

  return null;
};
