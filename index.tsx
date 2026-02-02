
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ToastProvider } from './context/ToastContext';
import './index.css';
import './styles/copilot.css';

// --- CRITICAL: Service Worker Cleanup ---
// Safely attempt to unregister existing service workers without crashing
const unregisterServiceWorkers = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        // console.log('[System] Unregistering Service Worker:', registration);
        await registration.unregister();
      }
    } catch (error: any) {
      // Silently ignore specific errors related to invalid document states or restricted contexts
      // These often happen in sandboxed environments (like StackBlitz/Replit) or if called too early
      return;
    }
  }
};

unregisterServiceWorkers();

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
