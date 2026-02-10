
import { supabase } from '../supabaseClient';
import { Mappers } from '../mappers';
import { log } from '../logger';
import { Order, ShippingAddress, DbOrder } from '../../types';
import { SettingsService } from './content';

const settingsService = new SettingsService();

export class OrderService {
  async getUserOrders(userId: string): Promise<Order[]> {
    log('SELECT', 'orders', { userId });
    const { data, error } = await supabase.from('orders').select('*').eq('user_id', userId).order('date', { ascending: false });
    if (error) throw error;
    return ((data || []) as DbOrder[]).map(Mappers.toOrder);
  }

  async getAll(limit: number = 50): Promise<Order[]> {
    log('SELECT', 'orders', `ALL LIMIT ${limit}`);
    const { data, error } = await supabase.from('orders').select('*').order('date', { ascending: false }).limit(limit);
    if (error) throw error;
    return ((data || []) as DbOrder[]).map(Mappers.toOrder);
  }

  async getById(id: string): Promise<Order | null> {
    log('SELECT', 'orders', id);
    const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
    if(error) return null;
    return Mappers.toOrder(data as DbOrder);
  }

  async getOrdersPaginated(page: number = 1, limit: number = 20, status: string = 'ALL'): Promise<{ data: Order[], total: number, page: number, totalPages: number }> {
    log('QUERY', 'orders', { page, status });
    
    let query = supabase.from('orders').select('*', { count: 'exact' });
    
    if (status && status !== 'ALL') {
      // Handle status filtering case-insensitively if needed, but DB usually stores Title Case or specific enums.
      // Based on seed data, status is Title Case (e.g. 'Delivered', 'Pending').
      query = query.eq('status', status);
    }
    
    query = query.order('date', { ascending: false })
                 .range((page - 1) * limit, page * limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    
    const orders = (data || []).map((o: any) => Mappers.toOrder(o));
    const total = count || 0;
    
    return {
      data: orders,
      total: total,
      page: page,
      totalPages: Math.ceil(total / limit) || 1
    };
  }

  async getAdminPaymentsPaginated(page: number, limit: number, status: string, method: string) {
    log('QUERY', 'orders', { page, status, method });

    // 1. Fetch Paginated Orders
    let query = supabase.from('orders').select('*', { count: 'exact' });

    if (status && status !== 'ALL') {
      // Payment status in DB is usually lowercase (paid, pending, failed, refunded) based on seed.sql checks
      query = query.eq('payment_status', status.toLowerCase());
    }

    if (method && method !== 'ALL') {
      if (method === 'PAYPAL') {
        query = query.not('payment_intent_id', 'is', null);
      } else if (method === 'MANUAL') {
        query = query.is('payment_intent_id', null);
      }
    }

    query = query.order('date', { ascending: false })
                 .range((page - 1) * limit, page * limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    const orders = (data || []).map((o: any) => Mappers.toOrder(o));

    // 2. Fetch Stats (Separate lightweight query for aggregation)
    // We fetch minimal data to calculate sums client-side since RPC might be unreliable/missing
    const { data: allStatsData } = await supabase.from('orders').select('total, payment_status');
    
    let totalRevenue = 0;
    let pendingRevenue = 0;
    let failedCount = 0;
    let paidCount = 0;

    if (allStatsData) {
      allStatsData.forEach((o: any) => {
        const s = (o.payment_status || '').toLowerCase();
        if (s === 'paid') {
          totalRevenue += o.total || 0;
          paidCount++;
        } else if (s === 'pending' || s === 'pending_payment') {
          pendingRevenue += o.total || 0;
        } else if (s === 'failed') {
          failedCount++;
        }
      });
    }

    return {
      data: orders,
      stats: {
        totalRevenue,
        pendingRevenue,
        failedCount,
        paidCount,
        ordersCount: count || 0
      },
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit) || 1
    };
  }

  async create(order: Partial<Order> & { shippingAddress: ShippingAddress }): Promise<Order> {
    log('RPC', 'create_order_secure', order);
    
    let targetUserId = order.userId;
    let generatedPassword = null;
    let isNewAccount = false;

    if (!targetUserId && order.customerEmail) {
        try {
            log('AUTH', 'Creating/Linking Guest Account', order.customerEmail);
            const authResponse = await fetch('/api/guest-auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: order.customerEmail, name: order.customerName || 'Guest' })
            });
            const authData = await authResponse.json();
            if (authResponse.ok && authData.success) {
                targetUserId = authData.userId;
                generatedPassword = authData.password;
                isNewAccount = authData.isNew;
            }
        } catch (e) {
            console.error("Guest auto-account creation failed:", e);
        }
    }

    const itemsPayload = (order.products || []).map((item: any) => ({
        product_id: item.productId, quantity: item.quantity, size: item.size,
        selected_color: item.selectedColor, title: item.title, price: item.price, image: item.image
    }));

    const { data, error } = await (supabase.rpc as any)('create_order_secure', {
      p_user_id: targetUserId || null, p_customer_email: order.customerEmail || null,
      p_customer_name: order.customerName || null, p_items: itemsPayload as any,
      p_shipping_address: order.shippingAddress as any, p_discount_code: order.discountCode || null,
      p_notes: order.notes || null, p_payment_status: order.paymentStatus || 'paid',
      p_payment_intent_id: order.paymentIntentId || null
    });

    if (error) throw error;
    
    const createdOrder = Mappers.toOrder(data as DbOrder);

    if (order.shippingCost && order.shippingCost > 0) {
        await supabase.from('orders').update({ shipping_cost: order.shippingCost }).eq('id', createdOrder.id);
        createdOrder.shippingCost = order.shippingCost;
    }

    try {
        const { customerName, customerEmail, orderNumber, total } = createdOrder;
        if (customerEmail) {
            if (isNewAccount && generatedPassword) {
                settingsService.sendTransactionalEmail('guest_order_account_created', customerEmail, {
                    '{{name}}': customerName || 'Customer', '{{order_number}}': orderNumber, '{{total}}': total.toFixed(2),
                    '{{email}}': customerEmail, '{{generated_password}}': generatedPassword,
                    '{{login_link}}': 'https://jamboapparels.com/login', '{{order_link}}': `https://jamboapparels.com/order/${createdOrder.id}`
                });
            } else {
                settingsService.sendTransactionalEmail('new_order_customer', customerEmail, {
                    '{{name}}': customerName || 'Customer', '{{order_number}}': orderNumber, '{{total}}': total.toFixed(2),
                    '{{order_link}}': `https://jamboapparels.com/order/${createdOrder.id}`
                });
            }
        }
        const settings = await settingsService.get();
        if (settings?.contactEmail) {
             settingsService.sendTransactionalEmail('admin_new_order', settings.contactEmail, {
                '{{customer_name}}': customerName || 'Customer', '{{order_number}}': orderNumber, '{{total}}': total.toFixed(2),
                '{{admin_link}}': `https://jamboapparels.com/admin/orders/${createdOrder.id}`
             });
        }
    } catch (emailError) {
        console.error("Failed to trigger order emails", emailError);
    }

    return createdOrder;
  }

  async update(id: string, updates: { status?: string; trackingNumber?: string; paymentStatus?: string; notes?: string }): Promise<void> {
    log('UPDATE', 'orders', { id, ...updates });
    const dbUpdates: any = {};
    if (updates.status) {
        dbUpdates.status = updates.status;
        if (updates.status === 'Shipped') dbUpdates.shipped_at = new Date().toISOString();
        if (updates.status === 'Delivered') dbUpdates.delivered_at = new Date().toISOString();
        if (updates.status === 'Cancelled') dbUpdates.cancelled_at = new Date().toISOString();
    }
    if (updates.trackingNumber) dbUpdates.tracking_number = updates.trackingNumber;
    if (updates.paymentStatus) dbUpdates.payment_status = updates.paymentStatus;
    if (updates.notes) dbUpdates.notes = updates.notes;

    const { error } = await supabase.from('orders').update(dbUpdates).eq('id', id);
    if (error) throw error;

    try {
        if (updates.status) {
            const [order, settings] = await Promise.all([this.getById(id), settingsService.get()]);
            if (order && settings) {
                if (settings.contactEmail) {
                     settingsService.sendTransactionalEmail('admin_order_status_update', settings.contactEmail, {
                        '{{order_number}}': order.orderNumber, '{{status}}': updates.status,
                        '{{customer_name}}': order.customerName || 'Guest', '{{admin_link}}': `https://jamboapparels.com/admin/orders/${id}`
                     });
                }
                if (order.customerEmail) {
                    let templateName = '';
                    const vars: any = {
                        '{{name}}': order.customerName || 'Customer', '{{order_number}}': order.orderNumber,
                        '{{status}}': updates.status, '{{order_link}}': `https://jamboapparels.com/order/${id}`
                    };
                    switch(updates.status) {
                        case 'Processing': templateName = 'order_processing'; break;
                        case 'Shipped':
                            templateName = 'order_shipped';
                            vars['{{tracking_number}}'] = updates.trackingNumber || order.trackingNumber || 'N/A';
                            break;
                        case 'Delivered':
                            templateName = 'order_delivered';
                            vars['{{product_id}}'] = order.products?.[0]?.productId || '';
                            break;
                        case 'Cancelled': templateName = 'order_cancelled'; break;
                    }
                    if (templateName) settingsService.sendTransactionalEmail(templateName, order.customerEmail, vars);
                }
            }
        }
    } catch (e) {
        console.error("Email trigger failed for status update", e);
    }
  }
  
  async cancelOrder(orderId: string, userId: string): Promise<void> {
    log('UPDATE', 'orders', { orderId, status: 'Cancelled' });
    const { data: order, error: fetchError } = await supabase.from('orders').select('*').match({ id: orderId, user_id: userId }).single();
    if (fetchError || !order) throw new Error("Order not found or permission denied.");
    if (!['Pending', 'Processing', 'Pending Payment'].includes((order as any).status)) throw new Error("This order can no longer be cancelled.");
    const { error } = await supabase.from('orders').update({ status: 'Cancelled', cancelled_at: new Date().toISOString(), total: (order as any).total } as any).match({ id: orderId, user_id: userId });
    if (error) throw error;

    try {
        const settings = await settingsService.get();
        const { order_number, customer_name, customer_email } = (order as any);
        if (customer_email) settingsService.sendTransactionalEmail('order_cancelled', customer_email, { '{{name}}': customer_name || 'Customer', '{{order_number}}': order_number });
        if (settings?.contactEmail) settingsService.sendTransactionalEmail('admin_order_status_update', settings.contactEmail, { '{{order_number}}': order_number, '{{status}}': 'Cancelled', '{{customer_name}}': customer_name || 'Customer', '{{admin_link}}': `https://jamboapparels.com/admin/orders/${orderId}` });
    } catch (e) {}
  }

  async cancelAndRestoreStock(orderId: string, userId: string): Promise<{ success: boolean }> {
      log('RPC', 'orders', 'cancel_and_restore_stock');
      const { data, error } = await (supabase.rpc as any)('cancel_and_restore_stock', { p_order_id: orderId, p_user_id: userId });
      if (error) throw error;
      if (data && (data as any).success === false) throw new Error((data as any).error || 'Restoration failed');
      return { success: true };
  }

  async requestReturn(orderId: string, userId: string, reason: string): Promise<{ success: boolean }> {
    log('UPDATE', 'orders', `request_return for ${orderId}`);
    const { error } = await (supabase.from('orders') as any).update({
        status: 'Return Requested', return_reason: reason,
        return_requested_at: new Date().toISOString(), return_status: 'requested'
    }).match({ id: orderId, user_id: userId });
    if (error) throw error;

    try {
      const order = await this.getById(orderId);
      const settings = await settingsService.get();
      if (order?.customerEmail) {
         settingsService.sendTransactionalEmail('return_requested', order.customerEmail, { '{{name}}': order.customerName || 'Customer', '{{order_number}}': order.orderNumber, '{{return_reason}}': reason });
         if (settings?.contactEmail) settingsService.sendTransactionalEmail('admin_return_alert', settings.contactEmail, { '{{customer_name}}': order.customerName || 'Customer', '{{order_number}}': order.orderNumber, '{{return_reason}}': reason, '{{admin_link}}': `https://jamboapparels.com/admin/orders/${orderId}` });
      }
    } catch (e) { console.error("Failed to send return email", e); }
    return { success: true };
  }

  async adminProcessReturn(orderId: string, returnStatus: any, notes?: string): Promise<{ success: boolean }> {
    log('UPDATE', 'orders', `process_return for ${orderId}`);
    const statusMap: Record<string, string> = { 'approved': 'Return Approved', 'rejected': 'Return Rejected', 'completed': 'Returned' };
    const updates: any = { return_status: returnStatus };
    if (statusMap[returnStatus]) updates.status = statusMap[returnStatus];
    if (notes) updates.notes = notes;

    const { error } = await (supabase.from('orders') as any).update(updates).eq('id', orderId);
    if (error) throw error;

    try {
      const order = await this.getById(orderId);
      if (order?.customerEmail) {
          if (returnStatus === 'approved') settingsService.sendTransactionalEmail('return_approved', order.customerEmail, { '{{name}}': order.customerName || 'Customer', '{{order_number}}': order.orderNumber });
          else if (returnStatus === 'rejected') settingsService.sendTransactionalEmail('return_rejected', order.customerEmail, { '{{name}}': order.customerName || 'Customer', '{{order_number}}': order.orderNumber, '{{rejection_reason}}': notes || 'Return criteria not met.' });
      }
    } catch (e) { console.error("Failed to send return decision email", e); }
    return { success: true };
  }

  async issueFullRefund(orderId: string) {
    log('API_CALL', 'paypal', `refund for ${orderId}`);
    const response = await fetch('/api/paypal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'refund', orderId }) });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || 'Refund failed');

    try {
      const order = await this.getById(orderId);
      if (order?.customerEmail) settingsService.sendTransactionalEmail('order_refunded', order.customerEmail, { '{{name}}': order.customerName || 'Customer', '{{order_number}}': order.orderNumber });
    } catch (e) { console.error("Failed to send refund email", e); }
    return data;
  }
}
