
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

    getLatestUser: async () => {
      try {
        const allUsers = await api.getAllUsers();
        if (!allUsers || allUsers.length === 0) return { error: "No users found." };
        const latest = allUsers[0];
        return {
          name: latest.name,
          email: latest.email,
          joined: latest.createdAt
        };
      } catch (e: any) {
        return { error: e.message };
      }
    },

    getDashboardStats: async () => {
        try {
            const orders = await api.getAllOrders();
            const revenue = orders
                .filter(o => !['Cancelled', 'Refunded'].includes(o.status))
                .reduce((acc, curr) => acc + (curr.total || 0), 0);
            
            return {
                totalRevenue: `£${revenue.toFixed(2)}`,
                orderCount: orders.length,
            };
        } catch (e: any) {
            return { error: e.message };
        }
    },

    highlightElement: async (args: HighlightTarget) => {
      const { elementId, duration = 4500 } = args;
      const element = document.getElementById(elementId);

      if (!element) return { success: false, error: `Element ${elementId} not found.` };

      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add(HIGHLIGHT_CLASS);

      setTimeout(() => {
        element.classList.remove(HIGHLIGHT_CLASS);
      }, duration);

      return { success: true };
    }
  };
}
