import { FunctionDeclaration, Type } from '@google/genai';

export const functionDeclarations: FunctionDeclaration[] = [
  {
    name: 'navigate',
    description: 'Navigate to a specific page or record. For detail pages, the path must include the ID (e.g., "/admin/orders/123").',
    parameters: {
      type: Type.OBJECT,
      properties: {
        path: {
          type: Type.STRING,
          description: 'The full destination route starting with /admin.',
        },
        tab: {
          type: Type.STRING,
          description: 'The specific tab ID to open on that page (if applicable).',
        }
      },
      required: ['path']
    }
  },
  {
    name: 'getDetailedInventoryReport',
    description: 'Get a full breakdown of products, stock levels, and historical sales performance for trend analysis.',
    parameters: {
      type: Type.OBJECT,
      properties: {}
    }
  },
  {
    name: 'getLatestOrder',
    description: 'Fetches the most recent order record.',
    parameters: {
      type: Type.OBJECT,
      properties: {}
    }
  },
  {
    name: 'getDashboardStats',
    description: 'Retrieve store performance KPIs.',
    parameters: {
      type: Type.OBJECT,
      properties: {}
    }
  },
  {
    name: 'getLiveTraffic',
    description: 'Get real-time data about who is currently on the website.',
    parameters: {
      type: Type.OBJECT,
      properties: {}
    }
  },
  {
    name: 'highlightElement',
    description: 'Visually pulse a gold ring around a specific UI element to guide the user.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        elementId: {
          type: Type.STRING,
          description: 'The DOM ID of the target element.',
          enum: [
            'btn-create-order',
            'btn-refresh-data',
            'btn-print-invoice',
            'btn-save-settings',
            'input-tracking-number',
            'select-order-status',
            'card-kpi-revenue',
            'user-list-top-row',
            'section-change-password',
            'input-new-password',
            'tab-brand',
            'tab-seo',
            'tab-payments',
            'tab-emails',
            'tab-contact',
            'tab-content',
            'tab-system',
            'live-traffic-card'
          ]
        }
      },
      required: ['elementId']
    }
  }
];

export const ELEMENT_ID_MAP = {
  'Password Section': 'section-change-password',
  'New Password Input': 'input-new-password',
  'Save Button': 'btn-save-settings',
  'Revenue Card': 'card-kpi-revenue',
  'Brand Tab': 'tab-brand',
  'SEO Tab': 'tab-seo',
  'Payments Tab': 'tab-payments',
  'Live Traffic': 'live-traffic-card'
} as const;