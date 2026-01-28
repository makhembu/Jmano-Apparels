
import { FunctionDeclaration, Type } from '@google/genai';

export const functionDeclarations: FunctionDeclaration[] = [
  {
    name: 'navigate',
    description: 'Navigate to any page in the admin dashboard. Supports dynamic paths with IDs and specific tabs.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        path: {
          type: Type.STRING,
          description: 'The exact destination route (e.g., "/admin/orders", "/admin/users")',
        },
        tab: {
          type: Type.STRING,
          description: 'The specific tab to open on that page (e.g., "emails", "shipping", "categories")',
        }
      },
      required: ['path']
    }
  },
  {
    name: 'getLatestOrder',
    description: 'Get the most recent order details. Use this for questions about the "last sale" or "latest invoice".',
    parameters: {
      type: Type.OBJECT,
      properties: {}
    }
  },
  {
    name: 'getLatestUser',
    description: 'Get the most recently registered user name and email.',
    parameters: {
      type: Type.OBJECT,
      properties: {}
    }
  },
  {
    name: 'getDashboardStats',
    description: 'Retrieve a summary of store performance including total revenue and order count.',
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
            'btn-save-settings',
            'input-tracking-number',
            'select-order-status',
            'card-kpi-revenue',
            'user-list-top-row'
          ]
        }
      },
      required: ['elementId']
    }
  }
];

export const ELEMENT_ID_MAP = {
  'Create Order': 'btn-create-order',
  'Refresh Data': 'btn-refresh-data',
  'Print Invoice': 'btn-print-invoice',
  'Save Settings': 'btn-save-settings',
  'Tracking Input': 'input-tracking-number',
  'Status Select': 'select-order-status',
  'Revenue Card': 'card-kpi-revenue',
  'Latest User Row': 'user-list-top-row'
} as const;
