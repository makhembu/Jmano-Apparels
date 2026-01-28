
import { PageContext } from './types';

// ============================================================================
// ROUTE REGISTRY - Single Source of Truth
// ============================================================================

interface RouteMetadata {
  path: string;
  description: string;
  keywords: string[];
  tabs?: Record<string, string>;
  actions?: string[];
}

const ROUTE_REGISTRY: Record<string, RouteMetadata> = {
  // CONTENT MANAGEMENT
  'blog-list': {
    path: '/admin/blog',
    description: 'View and manage all blog posts',
    keywords: ['blog', 'posts', 'articles', 'content', 'journal'],
    tabs: {
      posts: 'All blog posts',
      categories: 'Blog categories and tags'
    },
    actions: ['create post', 'edit post', 'delete post', 'filter posts']
  },
  'blog-new': {
    path: '/admin/blog/new',
    description: 'Create a new blog post with rich text editor',
    keywords: ['new post', 'write', 'create article', 'blog editor'],
    actions: ['draft post', 'publish post', 'add media', 'set SEO']
  },

  // PRODUCT MANAGEMENT
  'products-list': {
    path: '/admin/products',
    description: 'Product catalog and inventory management',
    keywords: ['products', 'inventory', 'catalog', 'items', 'stock'],
    actions: ['add product', 'edit product', 'manage stock', 'bulk actions']
  },
  'product-new': {
    path: '/admin/products/new',
    description: 'Add a new product to the catalog',
    keywords: ['new product', 'add item', 'create product'],
    actions: ['set pricing', 'upload images', 'configure variants']
  },

  // ORDERS & COMMERCE
  'orders': {
    path: '/admin/orders',
    description: 'Order management and fulfillment',
    keywords: ['orders', 'sales', 'purchases', 'transactions'],
    actions: ['view orders', 'update status', 'print invoice', 'refund']
  },
  'order-details': {
    path: '/admin/orders/:id',
    description: 'Detailed view of a specific order',
    keywords: ['order details', 'invoice', 'customer order'],
    actions: ['update tracking', 'change status', 'print invoice', 'contact customer']
  },
  'payments': {
    path: '/admin/payments',
    description: 'Payment history and financial reports',
    keywords: ['payments', 'transactions', 'revenue', 'finance', 'money'],
    actions: ['view transactions', 'export reports', 'issue refunds']
  },

  // USER MANAGEMENT
  'users': {
    path: '/admin/users',
    description: 'User accounts and permissions',
    keywords: ['users', 'customers', 'accounts', 'members'],
    tabs: {
      all: 'All users',
      admin: 'Administrator accounts',
      user: 'Regular customers'
    },
    actions: ['add user', 'edit permissions', 'deactivate account']
  },
  'profile': {
    path: '/admin/profile',
    description: 'Your account settings and preferences',
    keywords: ['profile', 'account', 'my settings', 'password', 'security'],
    actions: ['change password', 'update email', 'edit profile']
  },

  // SETTINGS
  'app-settings': {
    path: '/admin/app-settings',
    description: 'Core application configuration',
    keywords: ['settings', 'configuration', 'preferences', 'admin settings'],
    tabs: {
      brand: 'Brand identity (logo, colors, name)',
      seo: 'SEO & meta tags',
      payments: 'Payment gateway configuration',
      emails: 'Email templates and SMTP',
      contact: 'Contact information',
      content: 'Legal policies (Terms, Privacy, Refunds)',
      system: 'System settings and maintenance'
    }
  },
  'shop-settings': {
    path: '/admin/shop-settings',
    description: 'E-commerce specific settings',
    keywords: ['shop', 'store settings', 'commerce'],
    tabs: {
      general: 'General shop settings',
      categories: 'Product categories',
      shipping: 'Shipping zones and rates',
      discounts: 'Coupon codes and promotions'
    }
  },

  // DASHBOARD
  'dashboard': {
    path: '/admin/dashboard',
    description: 'Overview of key metrics and recent activity',
    keywords: ['home', 'dashboard', 'overview', 'analytics'],
    actions: ['refresh data', 'view reports', 'quick actions']
  }
};

// ============================================================================
// LOGIC ENGINES
// ============================================================================

function generateContextualSuggestions(context: PageContext): string[] {
  const currentRoute = Object.values(ROUTE_REGISTRY).find(
    r => r.path === context.route || context.route.startsWith(r.path.replace(':id', '').replace(':slug', ''))
  );

  if (!currentRoute?.actions) return [];
  return currentRoute.actions.map(action => `"${action}"`);
}

// ============================================================================
// ENHANCED SYSTEM PROMPT
// ============================================================================

export function buildSystemPrompt(context: PageContext): string {
  const suggestions = generateContextualSuggestions(context);
  
  return `You are **Jambo Copilot**, the intelligent operations assistant for Jambo Apparels.

## CORE IDENTITY
- **Values**: Honesty, Excellence, Boldness.
- **Tone**: Professional, proactive, action-oriented.
- **Goal**: Don't just answer; execute the workflow.

## DASHBOARD ARCHITECTURE (Route Registry)
${Object.entries(ROUTE_REGISTRY)
  .map(([key, route]) => {
    let entry = `- **${route.path}**: ${route.description}`;
    if (route.tabs) {
      entry += `\n  - Tabs: ${Object.entries(route.tabs)
        .map(([k, v]) => `\`${k}\` (${v})`)
        .join(', ')}`;
    }
    return entry;
  })
  .join('\n')}

## NAVIGATION & ACTION PROTOCOLS
1. **Always Call \`navigate()\` First**: If a user's request relates to a page different from the current one, call navigate immediately.
2. **Combine with \`highlightElement()\`**: After navigating (or if already on the correct page), highlight the specific section.
   - **Password Change**: Navigate to \`/admin/profile\` -> Highlight \`section-change-password\`.
   - **Legal/Policies**: Navigate to \`/admin/app-settings?tab=content\`.
   - **SEO**: Navigate to \`/admin/app-settings?tab=seo\`.
3. **Trend Analysis**: Use \`getDetailedInventoryReport()\` to analyze performance when users ask "how is the shop doing?" or "what should I focus on?". Suggest restocking high-sellers or promoting stagnant inventory.

## CONTENT CREATION PROTOCOL
- **Writing Tasks**: You CAN help users write content. Never say you can't help with drafts.
- **Workflow**:
  1. Navigate to the relevant editor (\`/admin/blog/new\` or \`/admin/products/new\`).
  2. Provide a structured draft/outline directly in the chat based on Jambo's values.
  
Example:
User: "Help me write a post about courage."
Action: \`navigate({path: "/admin/blog/new"})\`
Response: "I've opened the blog editor! Here's an outline for 'Threading Boldness: A Call to Courageous Faith'..."

## CURRENT SESSION STATE
- **Current Route**: ${context.route}
- **Current Page**: ${context.pageName}
- **Available Page Actions**: ${suggestions.length > 0 ? suggestions.join(', ') : 'General Navigation'}
${context.pageData ? `- **Context Data**: ${JSON.stringify(context.pageData, null, 2)}` : ''}

## BEHAVIORAL CONSTRAINTS
- Use tool calls silently when possible to speed up the UX.
- If data is missing or a tool fails, explain exactly why and suggest an alternative.
- Reference current page data (like a specific Order ID) in your explanations.
`;
}
