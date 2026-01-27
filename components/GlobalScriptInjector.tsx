
import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

export const GlobalScriptInjector: React.FC = () => {
  const { settings } = useApp();
  const gaInjected = useRef(false);
  const customInjected = useRef(false);

  useEffect(() => {
    // 1. Google Analytics
    if (settings.googleAnalyticsId && !gaInjected.current) {
      const scriptUrl = `https://www.googletagmanager.com/gtag/js?id=${settings.googleAnalyticsId}`;
      const script = document.createElement('script');
      script.async = true;
      script.src = scriptUrl;
      document.head.appendChild(script);

      const initScript = document.createElement('script');
      initScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${settings.googleAnalyticsId}');
      `;
      document.head.appendChild(initScript);
      gaInjected.current = true;
    }

    // 2. Custom Head Scripts (e.g. Pixel)
    if (settings.customHeadScripts && !customInjected.current) {
        // Warning: This is dangerous XSS territory if not admin-controlled.
        // We assume settings are only editable by trusted admins.
        const range = document.createRange();
        const fragment = range.createContextualFragment(settings.customHeadScripts);
        document.head.appendChild(fragment);
        customInjected.current = true;
    }
  }, [settings.googleAnalyticsId, settings.customHeadScripts]);

  return null;
};
