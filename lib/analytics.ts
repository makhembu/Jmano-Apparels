
import { supabase } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';

const SESSION_KEY = 'jambo_session_id';

// Helper to get or create a session ID
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = uuidv4();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
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
  track: async (eventType: string, metadata: Record<string, any> = {}) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const payload = {
        session_id: getSessionId(),
        user_id: session?.user?.id || null,
        event_type: eventType,
        path: window.location.pathname,
        referrer: document.referrer,
        source: getSource(),
        metadata: metadata
      };

      // Fire and forget - don't await to avoid blocking UI
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
    // 1. Track the main order event
    analytics.track('purchase', {
      order_id: order.id,
      total: order.total
    });

    // 2. Track individual items purchased (for product performance)
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
