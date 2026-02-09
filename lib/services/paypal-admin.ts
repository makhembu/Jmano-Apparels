import { api } from '../db';

// Helper to call the serverless function
async function callAdminApi(action: 'list' | 'create' | 'delete' | 'simulate', payload: any = {}) {
    const response = await fetch('/api/paypal-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload })
    });
    
    const data = await response.json();
    if (!response.ok || !data.success) {
        throw new Error(data.error || 'PayPal Admin API failed');
    }
    return data.data;
}

export const PayPalAdminService = {
    listWebhooks: () => callAdminApi('list'),
    
    createWebhook: async (currentUrl: string) => {
        // Ensure we point to the webhook handler, not just the root
        const webhookEndpoint = `${currentUrl}/api/paypal-webhook`.replace(/([^:]\/)\/+/g, "$1");
        return callAdminApi('create', { url: webhookEndpoint });
    },

    deleteWebhook: (webhookId: string) => callAdminApi('delete', { webhookId }),

    simulateEvent: (webhookId: string) => callAdminApi('simulate', { webhookId })
};
