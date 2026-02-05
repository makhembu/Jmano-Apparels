
import { supabase } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { CacheManager, STORAGE_KEYS } from './cache';

// Helper to check consent
const checkConsent = (): boolean => {
  try {
    // 1. Check explicit consent
    const stored = localStorage.getItem('jambo_cookie_consent');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.analytics) return true;
    }
    
    // 2. Allow if user is logged in (Implied consent for service usage/admin testing)
    const session = CacheManager.local.get<any>('sb-access-token'); // Check generic SB token presence
    if (session) return true;

    return false;
  } catch {
    return false;
  }
};

const getSessionId = (): string => {
  let sessionId = CacheManager.session.get<string>(STORAGE_KEYS.SESSION);
  if (!sessionId) {
    sessionId = uuidv4();
    CacheManager.session.set(STORAGE_KEYS.SESSION, sessionId);
  }
  return sessionId;
};

const getApproxGeo = () => {
  try {
    const stored = CacheManager.session.get<{country: string, city: string}>(STORAGE_KEYS.GEO);
    if (stored) return stored;
    
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let country = 'Unknown';
    let city = 'Unknown';

    if (timeZone && timeZone.includes('/')) {
        const parts = timeZone.split('/');
        country = parts[0]; // e.g. Europe, America (Continent as proxy for region)
        city = parts[1].replace(/_/g, ' '); // e.g. London, New York
    }
    
    const geo = { country, city };
    CacheManager.session.set(STORAGE_KEYS.GEO, geo);
    return geo;
  } catch (e) {
    return { country: 'Unknown', city: 'Unknown' };
  }
};

const getSource = (): string => {
  const referrer = document.referrer;
  if (!referrer || referrer.includes(window.location.hostname)) return 'direct';
  if (referrer.includes('google')) return 'google';
  if (referrer.includes('facebook') || referrer.includes('instagram')) return 'social';
  try { return new URL(referrer).hostname; } catch { return 'unknown'; }
};

export const analytics = {
  track: async (eventType: string, metadata: Record<string, any> = {}, duration: number = 0) => {
    // GDPR Check
    if (!checkConsent()) {
        // console.debug(`[Analytics] Skipped ${eventType} (No Consent)`);
        return;
    }

    try {
      let userId = null;
      try {
        const { data } = await (supabase.auth as any).getSession();
        userId = data.session?.user?.id || null;
      } catch (authError) { /* ignore */ }

      const geo = getApproxGeo();
      
      const payload = {
        session_id: getSessionId(),
        user_id: userId,
        event_type: eventType,
        path: window.location.pathname,
        referrer: document.referrer || null,
        source: getSource(),
        metadata: metadata,
        geo_country: geo.country,
        geo_city: geo.city,
        duration: Math.round(duration || 0)
      };

      // Fire and forget
      supabase.from('analytics_events').insert(payload).then(({ error }) => {
        if (error && error.code !== 'PGRST204') {
            console.warn("[Analytics] Tracking failed:", error.message);
        }
      }); 

    } catch (e) { /* ignore */ }
  },

  trackPageView: () => analytics.track('page_view'),
  trackPageLeave: (path: string, durationSeconds: number) => {
    if (durationSeconds > 0) analytics.track('page_view', { is_exit: true, path_exited: path }, durationSeconds);
  },
  trackProductView: (product: { id: string; title: string; price: number }) => {
    analytics.track('view_item', { product_id: product.id, product_title: product.title, price: product.price });
  },
  trackAddToCart: (product: { id: string; title: string; price: number }, quantity: number) => {
    analytics.track('add_to_cart', { product_id: product.id, product_title: product.title, price: product.price, quantity });
  },
  trackPurchase: (order: { id: string; total: number; products: any[] }) => {
    analytics.track('purchase', { order_id: order.id, total: order.total });
    order.products.forEach(p => analytics.track('purchase_item', { product_id: p.productId, product_title: p.title, price: p.price, quantity: p.quantity }));
  }
};
