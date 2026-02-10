import { HighlightTarget } from './types';
import { api } from '../db';

const HIGHLIGHT_CLASS = 'copilot-highlight-active';

interface ExecutionContext {
  navigate: (path: string) => void;
}

export function createFunctionExecutors(context: ExecutionContext) {
  return {
    navigate: async (args: { path: string; tab?: string }) => {
      let finalPath = args.path;
      if (args.tab) {
        const separator = finalPath.includes('?') ? '&' : '?';
        finalPath = `${finalPath}${separator}tab=${encodeURIComponent(args.tab)}`;
      }
      context.navigate(finalPath);
      return { success: true, message: `Navigated to ${finalPath}` };
    },

    getLatestOrder: async () => {
      try {
        const allOrders = await api.getAllOrders();
        if (!allOrders || allOrders.length === 0) return { error: "No orders found." };
        const latest = allOrders[0]; 
        return {
          id: latest.id,
          orderNumber: latest.orderNumber,
          total: latest.total,
          status: latest.status,
          customer: latest.customerName || 'Guest'
        };
      } catch (e: any) {
        return { error: e.message };
      }
    },

    getDetailedInventoryReport: async () => {
        try {
            const [products, categories] = await Promise.all([
                api.getProducts(),
                api.getCategories()
            ]);
            
            return {
                summary: {
                    totalProducts: products.length,
                    lowStockCount: products.filter(p => (p.stockQuantity || 0) <= (p.lowStockThreshold || 5)).length,
                    outOfStockCount: products.filter(p => (p.stockQuantity || 0) === 0).length,
                },
                categories: categories.map(c => {
                    const catProducts = products.filter(p => p.categoryKey === c.key);
                    const sales = catProducts.reduce((acc, p) => acc + (p.totalSales || 0), 0);
                    return {
                        name: c.label,
                        productCount: catProducts.length,
                        totalSales: sales,
                        popularityRank: 0
                    };
                }),
                topPerformers: [...products]
                    .sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0))
                    .slice(0, 3)
                    .map(p => ({ title: p.title, sold: p.totalSales, revenue: (p.totalSales || 0) * p.price })),
            };
        } catch (e: any) {
            return { error: e.message };
        }
    },

    getDashboardStats: async () => {
        try {
            const stats = await api.getAdminDashboardStats();
            return {
                totalRevenue: `£${stats.revenue.toFixed(2)}`,
                orderCount: stats.orders,
                customerCount: stats.users,
                pendingOrders: stats.pending_orders,
            };
        } catch (e: any) {
            return { error: e.message };
        }
    },

    getLiveTraffic: async () => {
        try {
            const visitors = await api.getLiveVisitors();
            return {
                count: visitors.length,
                active_users: visitors.slice(0, 5).map(v => ({
                    page: v.path,
                    location: v.geo_country === 'Unknown' ? 'Anonymous Location' : `${v.geo_city}, ${v.geo_country}`,
                    user: v.user_email || 'Guest'
                }))
            };
        } catch (e: any) {
            return { error: e.message };
        }
    },

    highlightElement: async (args: HighlightTarget) => {
      const { elementId, duration = 5000 } = args;
      
      const findElement = (): HTMLElement | null => {
          let el = document.getElementById(elementId);
          if (!el) el = document.querySelector(`[data-copilot-id="${elementId}"]`);
          return el;
      };
      
      let element = findElement();
      
      // Polling mechanism to wait for element after navigation
      if (!element) {
          for (let i = 0; i < 20; i++) { // Try for 5 seconds
              await new Promise(r => setTimeout(r, 250));
              element = findElement();
              if (element) break;
          }
      }

      if (!element) return { 
        success: false, 
        error: `Target "${elementId}" not found. You might need to navigate to the specific page first.` 
      };

      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      element.classList.remove(HIGHLIGHT_CLASS);
      void element.offsetWidth; 
      element.classList.add(HIGHLIGHT_CLASS);

      setTimeout(() => {
        element?.classList.remove(HIGHLIGHT_CLASS);
      }, duration);

      return { success: true };
    }
  };
}