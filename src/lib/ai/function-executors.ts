
import { HighlightTarget } from './types';
import { api } from '../db';

const DRAWER_ID = 'copilot-drawer';
const HIGHLIGHT_CLASS = 'copilot-highlight-active';

interface ExecutionContext {
  navigate: (path: string) => void;
}

export function createFunctionExecutors(context: ExecutionContext) {
  return {
    navigate: async (args: { path: string }) => {
      context.navigate(args.path);
      return { success: true, message: `Navigated to ${args.path}` };
    },

    getLatestOrder: async () => {
      try {
        const allOrders = await api.getAllOrders();
        if (!allOrders || allOrders.length === 0) return { error: "No orders found." };
        
        const latest = allOrders[0]; // Already sorted by date in api.getAllOrders
        return {
          id: latest.id,
          orderNumber: latest.orderNumber,
          total: latest.total,
          status: latest.status,
          customer: latest.customerName || 'Guest',
          date: latest.createdAt
        };
      } catch (e: any) {
        return { error: e.message };
      }
    },

    highlightElement: async (args: HighlightTarget) => {
      const { elementId, duration = 4500, scrollIntoView = true } = args;
      const element = document.getElementById(elementId);

      if (!element) {
        return {
          success: false,
          error: `Element with id "${elementId}" not found on current page.`
        };
      }

      if (scrollIntoView) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
        });
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Reset animation if already active
      element.classList.remove(HIGHLIGHT_CLASS);
      void element.offsetWidth; // Trigger reflow
      element.classList.add(HIGHLIGHT_CLASS);

      setTimeout(() => {
        element.classList.remove(HIGHLIGHT_CLASS);
      }, duration);

      return {
        success: true,
        message: `Highlighted element ${elementId}`
      };
    },

    findOrders: async (args: { status?: string; limit?: number }) => {
      try {
        const allOrders = await api.getAllOrders();
        let filtered = allOrders;
        if (args.status) {
            filtered = filtered.filter(o => o.status?.toLowerCase() === args.status?.toLowerCase());
        }
        const limit = args.limit || 5;
        const result = filtered.slice(0, limit).map(o => ({
            id: o.id,
            number: o.orderNumber,
            total: o.total,
            status: o.status,
            customer: o.customerName || 'Guest'
        }));
        return { count: filtered.length, orders: result };
      } catch (e: any) {
        return { error: e.message };
      }
    },

    getProducts: async (args: { lowStock?: boolean }) => {
        try {
            const allProducts = await api.getProducts();
            let filtered = allProducts;
            if (args.lowStock) {
                filtered = filtered.filter(p => (p.stockQuantity || 0) <= (p.lowStockThreshold || 5));
            }
            return { 
                count: filtered.length, 
                products: filtered.map(p => ({ title: p.title, stock: p.stockQuantity })) 
            };
        } catch (e: any) {
            return { error: e.message };
        }
    }
  };
}
