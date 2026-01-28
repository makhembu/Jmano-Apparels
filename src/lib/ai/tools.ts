
import { FunctionDeclaration, Type } from '@google/genai';

export const functionDeclarations: FunctionDeclaration[] = [
  {
    name: 'navigate',
    description: 'Navigate to any page in the admin dashboard. Use this for both main sections and specific detail pages (e.g. /admin/orders/ID).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        path: {
          type: Type.STRING,
          description: 'The full destination path starting with /admin. For specific orders, use /admin/orders/[ID].'
        }
      },
      required: ['path']
    }
  },
  {
    name: 'getLatestOrder',
    description: 'Get the most recent order details including its unique ID. Essential for finding the "latest invoice".',
    parameters: {
      type: Type.OBJECT,
      properties: {}
    }
  },
  {
    name: 'highlightElement',
    description: 'Visually highlight a UI element with a pulsing gold ring.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        elementId: {
          type: Type.STRING,
          description: 'The DOM id of the element to highlight',
          enum: [
            'btn-create-order',
            'btn-refresh-data',
            'btn-print-invoice',
            'btn-save-changes',
            'input-tracking-number',
            'select-order-status',
            'select-payment-status',
            'card-kpi-revenue',
            'card-kpi-orders',
            'section-customer-info',
            'section-order-items'
          ]
        },
        duration: {
          type: Type.NUMBER,
          description: 'How long to highlight in milliseconds (default: 4500ms)',
        }
      },
      required: ['elementId']
    }
  },
  {
    name: 'findOrders',
    description: 'Search for orders in the database.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        status: {
          type: Type.STRING,
          description: 'Filter by status',
          enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
        },
        limit: {
          type: Type.NUMBER,
          description: 'Max results'
        }
      }
    }
  },
  {
    name: 'getProducts',
    description: 'Retrieve product information from inventory.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        lowStock: {
          type: Type.BOOLEAN,
          description: 'Only low stock items'
        }
      }
    }
  }
];

export const ELEMENT_ID_MAP = {
  'Create Order Button': 'btn-create-order',
  'Refresh Data Button': 'btn-refresh-data',
  'Print Invoice Button': 'btn-print-invoice',
  'Save Changes Button': 'btn-save-changes',
  'Tracking Number Input': 'input-tracking-number',
  'Order Status Select': 'select-order-status',
  'Payment Status Select': 'select-payment-status',
  'Revenue KPI Card': 'card-kpi-revenue',
  'Orders KPI Card': 'card-kpi-orders',
  'Customer Info Section': 'section-customer-info',
  'Order Items Section': 'section-order-items'
} as const;
