import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ToastProvider } from './context/ToastContext';
import './index.css';
import './styles/copilot.css';

// --- CRITICAL: Service Worker Cleanup ---
// Unregister any existing service workers to force network requests for new assets
if ('serviceWorker' in navigator) {
  try {
    navigator.serviceWorker.getRegistrations()
      .then((registrations) => {
        for (const registration of registrations) {
          console.log('[System] Unregistering Service Worker:', registration);
          registration.unregister().catch(err => console.warn('[System] SW unregister failed:', err));
        }
      })
      .catch((error) => {
        console.warn('[System] Service Worker cleanup skipped (invalid state or restricted):', error);
      });
  } catch (e) {
    console.warn('[System] Service Worker not accessible:', e);
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </React.StrictMode>
);