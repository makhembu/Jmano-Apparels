export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export const ORDER_STATUS = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
  RETURN_REQUESTED: 'Return Requested',
  RETURN_APPROVED: 'Return Approved',
  RETURN_REJECTED: 'Return Rejected',
  RETURNED: 'Returned',
  PENDING_PAYMENT: 'Pending Payment',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

export const RETURN_STATUS = {
  NONE: 'none',
  REQUESTED: 'requested',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
} as const;

export const CACHE_TTL = {
  ANALYTICS: 300, // 5 minutes
  PRODUCTS: 600, // 10 minutes
};