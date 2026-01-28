
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from '../lib/analytics';

export const GlobalAnalyticsTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Exclude admin routes from tracking to keep data clean
    if (!location.pathname.startsWith('/admin')) {
      analytics.trackPageView();
    }
  }, [location.pathname]);

  return null;
};
