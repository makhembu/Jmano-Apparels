import { supabase } from '../supabaseClient';
import { 
  AnalyticsOverview, DailyAnalytics, ProductPerformance, TrafficSource, 
  GeoStat, PageStat, LiveVisitor, DbOrder 
} from '../../types';
import { Mappers } from '../mappers';
import { log } from '../logger';

export class AnalyticsService {
  async getAnalyticsOverview(start: Date, end: Date): Promise<AnalyticsOverview> {
    log('RPC', 'analytics', 'get_analytics_overview');
    const { data, error } = await (supabase.rpc as any)('get_analytics_overview', {
      time_range_start: start.toISOString(),
      time_range_end: end.toISOString()
    });
    if (error) {
        console.error("Analytics Error", error);
        return { visitors: 0, pageviews: 0, orders: 0, revenue: 0, conversion_rate: 0 };
    }
    return data as unknown as AnalyticsOverview;
  }

  async getAdminDashboardStats() {
    log('RPC', 'analytics', 'get_admin_stats');
    const { data, error } = await (supabase.rpc as any)('get_admin_stats');
    if (error) throw error;
    return data as {
        revenue: number;
        orders: number;
        users: number;
        products: number;
        low_stock: number;
        pending_orders: number;
    };
  }

  async getAdminProductStats(productId: string) {
    log('SELECT', 'analytics', `product_stats for ${productId}`);
    const { data: orders, error } = await supabase
      .from('orders')
      .select('products, total, customer_name, customer_email, order_number, date, status, id, user_id, subtotal, discount_amount, shipping_cost')
      .contains('products', [{ productId: productId }] as any)
      .in('payment_status', ['paid'])
      .not('status', 'in', '("Cancelled", "Refunded")');

    if (error) throw error;

    let revenue = 0;
    let unitsSold = 0;
    
    (orders || []).forEach(order => {
        const itemsForThisProduct = ((order.products as any) || []).filter((p: any) => p.productId === productId);
        const quantityInOrder = itemsForThisProduct.reduce((sum: number, item: any) => sum + item.quantity, 0);
        const pricePerItem = itemsForThisProduct[0]?.price || 0;
        
        const orderItemSubtotal = ((order.products as any) || []).reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
        const productValueInOrder = quantityInOrder * pricePerItem;
        
        const subtotalAfterDiscount = (order.subtotal || orderItemSubtotal) - (order.discount_amount || 0);

        if (orderItemSubtotal > 0) {
            const proportionOfOrder = productValueInOrder / orderItemSubtotal;
            const attributedRevenue = (subtotalAfterDiscount * proportionOfOrder) + ((order.shipping_cost || 0) * proportionOfOrder);
            revenue += attributedRevenue;
        }

        unitsSold += quantityInOrder;
    });

    const stats = {
        revenue,
        unitsSold,
        orderCount: (orders || []).length
    };
    
    const recentOrders = (orders || [])
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
        .map(o => Mappers.toOrder(o as DbOrder));

    return { stats, recentOrders };
  }

  async getDailyAnalytics(days: number): Promise<DailyAnalytics[]> {
    log('RPC', 'analytics', 'get_daily_analytics (client fallback)');
    console.warn("Using client-side analytics aggregation. Performance may be impacted.");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: events, error } = await supabase
        .from('analytics_events')
        .select('created_at, event_type, session_id, metadata')
        .in('event_type', ['page_view', 'purchase'])
        .gte('created_at', startDate.toISOString());
    
    if (error) {
        console.error("Analytics Error", error);
        return [];
    }
    if (!events) return [];

    const groupedByDate: Record<string, any[]> = events.reduce((acc, event) => {
        const date = event.created_at.split('T')[0];
        if (!acc[date]) acc[date] = [];
        acc[date].push(event);
        return acc;
    }, {});
    
    const dailyStats: DailyAnalytics[] = Object.entries(groupedByDate).map(([date, dayEvents]) => {
        const pageViews = dayEvents.filter(e => e.event_type === 'page_view');
        const purchases = dayEvents.filter(e => e.event_type === 'purchase');

        const visitors = new Set(pageViews.map(e => e.session_id)).size;
        const revenue = purchases.reduce((sum, e) => sum + (e.metadata?.total || 0), 0);

        return {
            date,
            visitors,
            pageviews: pageViews.length,
            orders: purchases.length,
            revenue,
        };
    });

    return dailyStats.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async getProductAnalytics(days: number = 30): Promise<ProductPerformance[]> {
    log('RPC', 'analytics', 'get_product_analytics');
    const { data, error } = await (supabase.rpc as any)('get_product_analytics', { limit_count: 8, days_lookback: days });
    if (error) {
        console.error("Analytics Error", error);
        return [];
    }
    return data as unknown as ProductPerformance[];
  }

  async getTrafficSources(days: number): Promise<TrafficSource[]> {
    log('RPC', 'analytics', 'get_traffic_sources');
    const { data, error } = await (supabase.rpc as any)('get_traffic_sources', { days_lookback: days });
    if (error) {
      console.error("Analytics Error", error);
      return [];
    }
    return data as unknown as TrafficSource[];
  }

  async getGeoStats(days: number): Promise<GeoStat[]> {
    log('RPC', 'analytics', 'get_geo_stats');
    const { data, error } = await (supabase.rpc as any)('get_geo_stats', { days_lookback: days });
    if (error) { console.error("Analytics Error", error); return []; }
    return data as unknown as GeoStat[];
  }

  async getPagePerformance(days: number): Promise<PageStat[]> {
    log('RPC', 'analytics', 'get_page_analytics');
    const { data, error } = await (supabase.rpc as any)('get_page_analytics', { days_lookback: days });
    if (error) { console.error("Analytics Error", error); return []; }
    return data as unknown as PageStat[];
  }

  async getLiveVisitors(lookback_minutes: number = 5): Promise<LiveVisitor[]> {
    log('RPC', 'analytics', 'get_live_visitors');
    const { data, error } = await (supabase.rpc as any)('get_live_visitors', { lookback_minutes });
    if (error) { console.error("Analytics Error", error); return []; }
    return data as unknown as LiveVisitor[];
  }
  
  async persistSystemLogs(logs: any[]): Promise<void> {
    log('INSERT', 'system_logs');
    const { error } = await (supabase.from('system_logs') as any).insert(logs.map(l => ({
      operation: l.operation,
      context: l.context,
      level: l.level,
      details: l.details,
      timestamp: new Date(l.timestamp).toISOString()
    })));
    if (error) throw error;
  }
}
