
/**
 * CENTRAL CACHE CONFIGURATION
 * Toggle these values to enable/disable specific caching layers globally.
 */
export const CACHE_CONFIG = {
  // 1. Service Workers: Handles offline capabilities and asset caching
  ENABLE_SERVICE_WORKER: false, 
  
  // 2. Local Persistence: Saves Cart, Settings, and Auth state to browser
  ENABLE_LOCAL_STORAGE: true,

  // 3. Session Storage: Track per-tab session data (Geo, Session ID)
  // Fix: Decoupled session storage from local storage flag
  ENABLE_SESSION_STORAGE: true,

  // 4. API Memory Cache: Caches expensive API calls (Analytics, etc.) in RAM
  ENABLE_API_CACHE: true,
  
  // 5. Version Control: Current version of the app. Bumping this clears old cache.
  // Value is injected via vite.config.ts to avoid importing package.json in browser
  APP_VERSION: (import.meta as any).env?.VITE_APP_VERSION || '1.0.0', 
};

// --- KEYS REGISTRY ---
export const STORAGE_KEYS = {
  CART: 'dt_cart',
  SETTINGS: 'jambo_app_settings',
  GEO: 'jambo_geo_data',
  SESSION: 'jambo_session_id',
  VERSION: 'app_version'
};

/**
 * Memory Cache with Time-To-Live (TTL)
 */
class MemoryCache {
  private cache = new Map<string, { data: any; expiry: number }>();

  get<T>(key: string): T | null {
    if (!CACHE_CONFIG.ENABLE_API_CACHE) return null;

    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  set(key: string, data: any, ttlSeconds: number = 300): void {
    if (!CACHE_CONFIG.ENABLE_API_CACHE) return;
    
    const expiry = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { data, expiry });
  }

  // Fix: Added method for manual cache invalidation
  delete(key: string): void {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }
}

/**
 * Local Storage Wrapper
 */
class LocalStorageManager {
  get<T>(key: string): T | null {
    if (!CACHE_CONFIG.ENABLE_LOCAL_STORAGE) return null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error(`Error reading ${key} from local storage`, e);
      return null;
    }
  }

  set(key: string, data: any): void {
    if (!CACHE_CONFIG.ENABLE_LOCAL_STORAGE) return;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e: any) {
      // Fix: Handle Storage Quota Exceeded errors
      if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        console.warn(`[LocalStorage] Quota exceeded. Unable to save ${key}.`);
      } else {
        console.error(`Error writing ${key} to local storage`, e);
      }
    }
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }

  clearAppSpecificKeys() {
    // Only clear keys defined in STORAGE_KEYS to avoid wiping unrelated site data
    Object.values(STORAGE_KEYS).forEach(key => {
      // Don't clear version immediately, handled separately
      if (key !== STORAGE_KEYS.VERSION) this.remove(key);
    });
  }
}

/**
 * Session Storage Wrapper
 */
class SessionStorageManager {
  get<T>(key: string): T | null {
    // Fix: Use separate ENABLE_SESSION_STORAGE config
    if (!CACHE_CONFIG.ENABLE_SESSION_STORAGE) return null; 
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error(`Error reading ${key} from session storage`, e);
      return null;
    }
  }

  set(key: string, data: any): void {
    // Fix: Use separate ENABLE_SESSION_STORAGE config
    if (!CACHE_CONFIG.ENABLE_SESSION_STORAGE) return;
    try {
      sessionStorage.setItem(key, JSON.stringify(data));
    } catch (e: any) {
      // Fix: Handle Storage Quota Exceeded errors
      if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        console.warn(`[SessionStorage] Quota exceeded. Unable to save ${key}.`);
      } else {
        console.error(`Error writing ${key} to session storage`, e);
      }
    }
  }

  remove(key: string): void {
    sessionStorage.removeItem(key);
  }
}

/**
 * Main Cache Manager
 */
export const CacheManager = {
  memory: new MemoryCache(),
  local: new LocalStorageManager(),
  session: new SessionStorageManager(),

  /**
   * Initializes system-level caching (Service Workers)
   */
  initialize: async () => {
    if ('serviceWorker' in navigator) {
      if (CACHE_CONFIG.ENABLE_SERVICE_WORKER) {
        // Registration logic would go here if we had a sw.js
        // console.log('Service Worker registration enabled');
      } else {
        // Force Unregister existing workers AND clear Cache Storage API
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            await registration.unregister();
          }

          // Fix: Clear Cache Storage API when service workers are disabled
          if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(
              cacheNames.map(name => caches.delete(name))
            );
            if (cacheNames.length > 0) {
              console.log('[CacheManager] Cleared stale Cache Storage entries.');
            }
          }
        } catch (error) {
          // Ignore errors in sandboxed environments or if caches API is unavailable
          console.warn('[CacheManager] SW Cleanup warning:', error);
        }
      }
    }
  },

  /**
   * Checks app version and nukes stale data if version mismatch
   */
  checkVersion: () => {
    if (!CACHE_CONFIG.ENABLE_LOCAL_STORAGE) return;

    const storedVersion = localStorage.getItem(STORAGE_KEYS.VERSION);
    
    // Initial set if missing
    if (!storedVersion) {
        localStorage.setItem(STORAGE_KEYS.VERSION, CACHE_CONFIG.APP_VERSION);
        return;
    }
    
    if (storedVersion !== CACHE_CONFIG.APP_VERSION) {
      console.log(`[CacheManager] Update detected (${storedVersion} -> ${CACHE_CONFIG.APP_VERSION}). Clearing cache...`);
      
      CacheManager.local.clearAppSpecificKeys();
      CacheManager.memory.clear();
      
      localStorage.setItem(STORAGE_KEYS.VERSION, CACHE_CONFIG.APP_VERSION);
      
      // Fix: Removed automatic reload. Dispatched event for UI to handle notification if needed.
      // This prevents jarring page reloads for users.
      window.dispatchEvent(new CustomEvent('app_update_available', {
        detail: { oldVersion: storedVersion, newVersion: CACHE_CONFIG.APP_VERSION }
      }));
    }
  }
};
