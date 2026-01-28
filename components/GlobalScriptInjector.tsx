
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
  const gaInjected = useRef(false);
  const customInjected = useRef(false);

  // Hardcoded default ID provided by requirements
  const DEFAULT_GA_ID = 'G-26S55GN10D';

  // Helper to ensure ID always has G- prefix
  const getMeasurementId = (rawId: string | undefined) => {
    // Use DB setting if available and not empty, otherwise fallback to default
    const idToUse = (rawId && rawId.trim()) ? rawId : DEFAULT_GA_ID;
    
    const cleanId = idToUse.trim();
    return cleanId.startsWith('G-') ? cleanId : `G-${cleanId}`;
  };

  // Wait for app initialization (loading=false) to ensure we don't inject default
  // before checking if a custom one exists in the DB.
  const shouldInject = !loading;
  const gaId = shouldInject ? getMeasurementId(settings.googleAnalyticsId) : null;

  // 1. Google Analytics Initialization
  useEffect(() => {
    // Only inject if ID exists and hasn't been injected yet
    if (gaId && !gaInjected.current) {
      
      // Create the script tag for GTM
      const scriptUrl = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      const script = document.createElement('script');
      script.async = true;
      script.src = scriptUrl;
      
      script.onload = () => {
        console.log(`[Analytics] GA Script Loaded for: ${gaId}`);
      };

      document.head.appendChild(script);

      // Initialize dataLayer and gtag function
      window.dataLayer = window.dataLayer || [];
      
      // Define gtag function
      window.gtag = function(...args: any[]) {
        window.dataLayer.push(args);
      };

      // Config call
      window.gtag('js', new Date());
      window.gtag('config', gaId, {
        send_page_view: false // We handle page views manually in the effect below
      });

      gaInjected.current = true;
    }
  }, [gaId]);

  // 2. Track Page Views on Route Change (SPA Support)
  useEffect(() => {
    if (gaId && window.gtag && gaInjected.current) {
      // Send page_view event to GA
      window.gtag('event', 'page_view', {
        page_path: location.pathname + location.search,
        send_to: gaId
      });
    }
  }, [location, gaId]);

  // 3. Custom Head Scripts (e.g. Pixel, Chat widgets)
  useEffect(() => {
    if (shouldInject && settings.customHeadScripts && !customInjected.current) {
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
  }, [settings.customHeadScripts, shouldInject]);

  return null;
};
