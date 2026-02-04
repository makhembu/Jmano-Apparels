
import React, { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useConsent } from '../context/CookieConsentContext';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export const GlobalScriptInjector: React.FC = () => {
  const { settings, loading } = useApp();
  const { consent } = useConsent();
  const location = useLocation();

  // 1. Determine the Google Analytics ID
  const gaId = useMemo(() => {
    const HARDCODED_DEFAULT = 'G-26S55GN10D';
    const dbValue = settings.googleAnalyticsId?.trim();
    const activeId = dbValue || HARDCODED_DEFAULT;
    return activeId.startsWith('G-') ? activeId : `G-${activeId}`;
  }, [settings.googleAnalyticsId]);

  // 2. Initialize Google Analytics (ONLY IF CONSENTED)
  useEffect(() => {
    if (loading) return;

    const scriptId = 'google-analytics-script';
    const existingScript = document.getElementById(scriptId);

    // If analytics allowed and not present, inject
    if (consent.analytics && !existingScript) {
      console.log(`[Analytics] Consent granted. Injecting ${gaId}`);
      
      const script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function(...args: any[]) {
        window.dataLayer.push(args);
      };

      window.gtag('js', new Date());
      window.gtag('config', gaId, { 
        send_page_view: false,
        anonymize_ip: true // GDPR Requirement
      });
    }
    // If analytics NOT allowed but present (revoked consent), remove it
    else if (!consent.analytics && existingScript) {
      console.log(`[Analytics] Consent revoked. Removing scripts.`);
      existingScript.remove();
      // Optionally clear cookies here if strictly required, but usually stopping tracking is enough
      // window.location.reload(); // Simple way to clear in-memory GTAG state
    }
  }, [loading, gaId, consent.analytics]);

  // 3. Track Page Views (ONLY IF CONSENTED)
  useEffect(() => {
    if (loading || !window.gtag || !consent.analytics) return;

    window.gtag('event', 'page_view', {
      page_path: location.pathname + location.search,
      send_to: gaId
    });
  }, [location, gaId, loading, consent.analytics]);

  // 4. Inject Custom Head Scripts (ONLY IF CONSENTED OR MARKED NECESSARY)
  // For safety, we assume custom scripts are tracking/marketing unless specified otherwise.
  // We strictly gate them behind 'marketing' consent here for safety.
  useEffect(() => {
    if (loading || !settings.customHeadScripts) return;
    if (!consent.marketing) {
       // Remove if exists
       const existing = document.getElementById('custom-injected-scripts');
       if(existing) existing.remove();
       return;
    }
    
    const containerId = 'custom-injected-scripts';
    if (document.getElementById(containerId)) return;

    try {
      const container = document.createElement('div');
      container.id = containerId;
      container.style.display = 'none';
      const range = document.createRange();
      range.selectNode(document.body);
      const fragment = range.createContextualFragment(settings.customHeadScripts);
      container.appendChild(fragment);
      document.body.appendChild(container);
    } catch (e) {
      console.error("[Analytics] Failed to inject custom scripts", e);
    }
  }, [loading, settings.customHeadScripts, consent.marketing]);

  return null;
};
