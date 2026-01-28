
import React, { useEffect, useMemo } from 'react';
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

  // 1. Determine the Google Analytics ID
  // Logic: Use DB setting if available, otherwise fallback to hardcoded ID.
  const gaId = useMemo(() => {
    const HARDCODED_DEFAULT = 'G-26S55GN10D';
    const dbValue = settings.googleAnalyticsId?.trim();
    
    // Use DB value if it exists and isn't empty, otherwise default
    const activeId = dbValue || HARDCODED_DEFAULT;
    
    // Ensure "G-" prefix is present (Google requirement)
    return activeId.startsWith('G-') ? activeId : `G-${activeId}`;
  }, [settings.googleAnalyticsId]);

  // 2. Initialize Google Analytics (Run Once)
  useEffect(() => {
    if (loading) return;

    // Prevent duplicate script injection if already present
    const scriptId = 'google-analytics-script';
    if (document.getElementById(scriptId)) return;

    // Create and inject the script tag
    const script = document.createElement('script');
    script.id = scriptId;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    
    // Define the global gtag function
    window.gtag = function(...args: any[]) {
      window.dataLayer.push(args);
    };

    // Initial Configuration
    window.gtag('js', new Date());
    
    // Disable automatic page view to avoid double counting on first load,
    // as we handle it manually in the effect below.
    window.gtag('config', gaId, {
      send_page_view: false
    });

    console.log(`[Analytics] Initialized with ID: ${gaId}`);
  }, [loading, gaId]);

  // 3. Track Page Views on Route Change (SPA support)
  useEffect(() => {
    if (loading || !window.gtag) return;

    // Send page_view event with the new path
    window.gtag('event', 'page_view', {
      page_path: location.pathname + location.search,
      send_to: gaId
    });
  }, [location, gaId, loading]);

  // 4. Inject Custom Head Scripts (Optional - e.g. Meta Pixel)
  useEffect(() => {
    if (loading) return;
    if (!settings.customHeadScripts) return;
    
    const containerId = 'custom-injected-scripts';
    if (document.getElementById(containerId)) return;

    try {
      // Create a hidden container to hold custom scripts
      const container = document.createElement('div');
      container.id = containerId;
      container.style.display = 'none';
      
      // Use createContextualFragment to safely parse and execute scripts
      const range = document.createRange();
      range.selectNode(document.body);
      const fragment = range.createContextualFragment(settings.customHeadScripts);
      
      container.appendChild(fragment);
      document.body.appendChild(container);
    } catch (e) {
      console.error("[Analytics] Failed to inject custom scripts", e);
    }
  }, [loading, settings.customHeadScripts]);

  return null;
};
