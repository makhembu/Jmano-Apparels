
import { supabase } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';

const SESSION_KEY = 'jambo_session_id';
const GEO_KEY = 'jambo_geo_data';

// Helper to get or create a session ID
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = uuidv4();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
};

// Simple Client-Side Geo Approximation (Timezone/Locale based)
const getApproxGeo = () => {
  try {
    const stored = sessionStorage.getItem(GEO_KEY);
    if (stored) return JSON.parse(stored);

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const country = timeZone.split('/')[0] || 'Unknown'; // Rough approximation
    const city = timeZone.split('/')[1] || 'Unknown';
    
    const geo = { country, city: city.replace('_', ' ') };
    sessionStorage.setItem(GEO_KEY, JSON.stringify(geo));
    return geo;
  } catch (e) {
    return { country: 'Unknown', city: 'Unknown' };
  }
};

// Helper to determine traffic source
const getSource = (): string => {
  const referrer = document.referrer;
  if (!referrer || referrer.includes(window.location.hostname)) return 'direct';
  if (referrer.includes('google')) return 'google';
  if (referrer.includes('facebook') || referrer.includes('instagram')) return 'social';
  try {
    return new URL(referrer).hostname;
  } catch {
    return 'unknown';
  }
};

export const analytics = {
  track: async (eventType: string, metadata: Record<string, any> = {}, duration: number = 0) => {
    try {
      // Wrap session retrieval to catch auth errors/aborts
      let userId = null;
      try {
        const { data } = await supabase.auth.getSession();
        userId = data.session?.user?.id || null;
      } catch (authError) {
        // Ignore auth errors during tracking, proceed as guest
      }

      const geo = getApproxGeo();
      const safeDuration = Math.round(duration || 0);

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
        duration: safeDuration
      };

      // Fire and forget, but catch promise rejections
      supabase.from('analytics_events').insert(payload).then(({ error }) => {
        if (error) {
            // Suppress logs for common schema mismatch if migration hasn't run yet
            // Also suppress AbortError which happens on navigation/unmount
            if (error.code !== 'PGRST204' && !error.message?.includes('AbortError')) {
                console.warn("[Analytics] Tracking warning:", error.message);
            }
        }
      }).catch(err => {
         // Silently ignore network aborts
         if (err.name === 'AbortError' || err.message?.includes('aborted')) return;
         console.warn("[Analytics] Network error:", err);
      });

    } catch (e: any) {
      if (e.name === 'AbortError' || e.message?.includes('aborted')) return;
      console.warn("[Analytics] Exception:", e);
    }
  },

  trackPageView: () => {
    analytics.track('page_view');
  },

  trackPageLeave: (path: string, durationSeconds: number) => {
    if (durationSeconds > 0) {
        analytics.track('page_view', { is_exit: true, path_exited: path }, durationSeconds);
    }
  },

  trackProductView: (product: { id: string; title: string; price: number }) => {
    analytics.track('view_item', {
      product_id: product.id,
      product_title: product.title,
      price: product.price
    });
  },

  trackAddToCart: (product: { id: string; title: string; price: number }, quantity: number) => {
    analytics.track('add_to_cart', {
      product_id: product.id,
      product_title: product.title,
      price: product.price,
      quantity
    });
  },

  trackPurchase: (order: { id: string; total: number; products: any[] }) => {
    analytics.track('purchase', {
      order_id: order.id,
      total: order.total
    });

    order.products.forEach(p => {
      analytics.track('purchase_item', {
        product_id: p.productId,
        product_title: p.title,
        price: p.price,
        quantity: p.quantity
      });
    });
  }
};
