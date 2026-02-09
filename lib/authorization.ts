import { User, Order } from '../types';

/**
 * Checks if the current user has permission to view a specific order.
 * 
 * Rules:
 * 1. Admins can view everything.
 * 2. Registered users can view orders linked to their User ID.
 * 3. Registered users can view orders where the customer email matches their account email (Guest -> User link).
 * 
 * @param user The current authenticated user context
 * @param order The order object to check against
 * @returns boolean
 */
export const canViewOrder = (user: User | null, order: Order | null): boolean => {
  if (!order) return false;
  if (!user) return false;

  // Admin Override
  if (user.role === 'admin') return true;

  // Direct Ownership
  if (order.userId === user.id) return true;

  // Email Match (For guests who later registered)
  if (order.customerEmail && user.email && order.customerEmail.toLowerCase() === user.email.toLowerCase()) return true;

  return false;
};

/**
 * Checks if a user has permission to manage products/store settings.
 */
export const canManageStore = (user: User | null): boolean => {
  return user?.role === 'admin';
};
