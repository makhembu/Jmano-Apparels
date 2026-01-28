
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

// Simple Client-Side Geo Approximation (Timezone/Locale based) to avoid blocking external API calls
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
  return new URL(referrer).hostname;
};

export const analytics = {
  track: async (eventType: string, metadata: Record<string, any> = {}, duration: number = 0) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const geo = getApproxGeo();

      const payload = {
        session_id: getSessionId(),
        user_id: session?.user?.id || null,
        event_type: eventType,
        path: window.location.pathname,
        referrer: document.referrer,
        source: getSource(),
        metadata: metadata,
        geo_country: geo.country,
        geo_city: geo.city,
        duration: duration
      };

      // Fire and forget
      supabase.from('analytics_events').insert(payload).then(({ error }) => {
        if (error) console.error("Analytics Error:", error);
      });

    } catch (e) {
      console.warn("Tracking failed", e);
    }
  },

  trackPageView: () => {
    analytics.track('page_view');
  },

  trackPageLeave: (path: string, durationSeconds: number) => {
    // We send a specific 'page_leave' event or we could update the previous 'page_view'
    // For this prototype, we'll log a separate event with duration which aggregation can sum/avg
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
