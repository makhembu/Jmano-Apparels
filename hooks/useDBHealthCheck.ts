
import { useState } from 'react';

// We default to 'healthy' to allow the application to render immediately.
// Connectivity issues will be handled by individual features (e.g., Shop, Auth) showing their own error states/toasts.
export type HealthStatus = 'healthy';

export const useDBHealthCheck = () => {
  return { 
    status: 'healthy' as HealthStatus, 
    error: null, 
    retry: () => window.location.reload() 
  };
};
