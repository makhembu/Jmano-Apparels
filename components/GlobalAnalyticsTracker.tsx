
import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from '../lib/analytics';

export const GlobalAnalyticsTracker: React.FC = () => {
  const location = useLocation();
  const startTime = useRef<number>(Date.now());
  const currentPath = useRef<string>(location.pathname);

  useEffect(() => {
    // 1. End previous page session
    const duration = Math.floor((Date.now() - startTime.current) / 1000);
    if (!currentPath.current.startsWith('/admin') && duration > 0) {
        // Send duration metric for the PREVIOUS page
        // We actually attach duration to the *next* page_view call in some systems, 
        // but here we fire a dedicated 'page_leave' equivalent or update logic.
        // For simplicity in the dashboard aggregator, we'll log a specialized event.
        analytics.track('page_leave', { path: currentPath.current }, duration);
    }

    // 2. Start new page session
    startTime.current = Date.now();
    currentPath.current = location.pathname;

    // 3. Track new page view
    if (!location.pathname.startsWith('/admin')) {
      analytics.trackPageView();
    }
  }, [location.pathname]);

  return null;
};
