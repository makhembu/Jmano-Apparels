
import React from 'react';

export const SystemHealth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Global health blocking is disabled. 
  // The app will load, and specific API failures will be handled by the respective components.
  return <>{children}</>;
};
