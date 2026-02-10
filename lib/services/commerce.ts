import { supabase } from '../supabaseClient';
import { Mappers } from '../mappers';
import { log } from '../logger';
import { Order, ShippingAddress, DbOrder, CartItem, ShippingZone, DiscountCode, ShippingOption } from '../../types';
import { SettingsService } from './content';

const settingsService = new SettingsService();

export class OrderService {
  async getUserOrders(userId: string): Promise<Order[]> {
    log('SELECT', 'orders', { userId });
    // FIX: Using 'date' column instead of 'created_at'
    const { data, error } = await supabase.from('orders').select('*').eq('user_id', userId).order('date', { ascending: false });
    if (error) throw error;
    return ((data || []) as DbOrder[]).map(Mappers.toOrder);
  }

  async getAll(limit: number = 50): Promise<Order[]> {
    log('SELECT', 'orders', `ALL LIMIT ${limit}`);
    // FIX: Using 'date' column instead of 'created_at'
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
    log('RPC', 'orders', 'get_orders_paginated');
    const { data, error } = await (supabase.rpc as any)('get_orders_paginated', {
      page_num: Number(page),
      page_size: Number(limit),
      status_filter: (status === 'ALL' || !status) ? null : status
    });
    if (error) throw error;
    
    const responseData = data as any;
    const orders = (responseData.data || []).map((o: any) => Mappers.toOrder(o));
    
    return {
      data: orders as Order[],
      total: responseData.total || 0,
      page: responseData.page || 1,
      totalPages: responseData.totalPages || 1
    };
  }

  async getAdminPaymentsPaginated(page: number, limit: number, status: string, method: string) {
    log('RPC', 'orders', 'get_admin_payments_paginated');
    const { data, error } = await (supabase.rpc as any)('get_admin_payments_paginated', {
      p_page: page,
      p_page_size: limit,
      p_status: status,
      p_method: method
    });
    if (error) throw error;
    
    const responseData = data as any;
    const orders = (responseData.data || []).map((o: any) => Mappers.toOrder(o));
    
    return {
      data: orders as Order[],
      stats: responseData.stats,
      total: responseData.total || 0,
      totalPages: responseData.totalPages || 1
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

export class CartService {
  async sync(userId: string, cartItems: CartItem[]): Promise<void> {
    log('SYNC', 'cart_items', userId);
    await supabase.from('cart_items').delete().eq('user_id', userId);
    if (cartItems.length > 0) {
      const rows = cartItems.map(item => ({
        user_id: userId,
        product_id: item.id,
        quantity: item.quantity,
        selected_size: item.selectedSize,
        selected_color: item.selectedColor
      }));
      await supabase.from('cart_items').insert(rows as any);
    }
  }

  async fetch(userId: string): Promise<CartItem[]> {
    log('FETCH', 'cart_items', userId);
    const { data, error } = await supabase.from('cart_items').select(`
      quantity, selected_size, selected_color, 
      product:products (*)
    `).eq('user_id', userId);
    
    if (error) throw error;
    return (data || []).filter((item: any) => item.product).map(Mappers.toCartItem);
  }
}

export class ShippingService {
  async getZones(): Promise<ShippingZone[]> {
    log('SELECT', 'shipping_zones & shipping_options');
    const { data: zonesData, error: zonesError } = await supabase.from('shipping_zones').select('*').eq('is_active', true);
    if (zonesError) throw zonesError;
    const { data: optionsData, error: optionsError } = await supabase.from('shipping_options').select('*');
    if (optionsError) throw optionsError;

    const zones = (zonesData || []).map(z => Mappers.toShippingZone(z));
    const optionsByZone = (optionsData || []).reduce((acc, option) => {
        const zoneId = (option as any).zone_id;
        if (!acc[zoneId]) acc[zoneId] = [];
        acc[zoneId].push({ id: (option as any).id, name: (option as any).name, rate: (option as any).rate, description: (option as any).description });
        return acc;
    }, {} as Record<string, ShippingOption[]>);

    zones.forEach(zone => { zone.options = optionsByZone[zone.id] || []; });
    return zones;
  }

  async createZone(zone: Partial<ShippingZone>): Promise<ShippingZone> {
    log('INSERT', 'shipping_zones', zone);
    const { data, error } = await supabase.from('shipping_zones').insert({
      name: zone.name, countries: zone.countries, base_rate: zone.baseRate,
      free_shipping_threshold: zone.freeShippingThreshold, is_active: true
    } as any).select().single();
    if (error) throw error;
    return Mappers.toShippingZone(data);
  }

  async updateZone(id: string, zone: Partial<ShippingZone>): Promise<void> {
    log('UPDATE', 'shipping_zones', id);
    const { error } = await supabase.from('shipping_zones').update({
      name: zone.name, countries: zone.countries, base_rate: zone.baseRate,
      free_shipping_threshold: zone.freeShippingThreshold, is_active: zone.isActive
    } as any).eq('id', id);
    if (error) throw error;
  }

  async deleteZone(id: string): Promise<void> {
    log('DELETE', 'shipping_zones', id);
    const { error } = await supabase.from('shipping_zones').delete().eq('id', id);
    if (error) throw error;
  }

  async addOption(zoneId: string, option: Partial<ShippingOption>): Promise<void> {
      log('INSERT', 'shipping_options', { zoneId, option });
      const { error } = await supabase.from('shipping_options').insert({
          zone_id: zoneId, name: option.name, rate: option.rate, description: option.description
      } as any);
      if (error) throw error;
  }

  async deleteOption(optionId: string): Promise<void> {
      log('DELETE', 'shipping_options', optionId);
      const { error } = await supabase.from('shipping_options').delete().eq('id', optionId);
      if (error) throw error;
  }
}

export class DiscountService {
  async validate(code: string, total: number): Promise<DiscountCode | null> {
    log('RPC', 'validate_discount_code', code);
    const { data, error } = await (supabase.rpc as any)('validate_discount_code', { code_input: code, order_total: total });
    if (!error && data) return Mappers.toDiscountCode(data);
    
    const { data: codeData, error: tableError } = await supabase.from('discount_codes').select('*').eq('code', code).eq('is_active', true).single();
    if (tableError || !codeData) return null;
    const now = new Date();
    if ((codeData as any).valid_from && new Date((codeData as any).valid_from) > now) return null;
    if ((codeData as any).valid_until && new Date((codeData as any).valid_until) < now) return null;
    if ((codeData as any).minimum_purchase && total < (codeData as any).minimum_purchase) return null;
    return Mappers.toDiscountCode(codeData);
  }

  async getAll(): Promise<DiscountCode[]> {
    log('SELECT', 'discount_codes');
    const { data, error } = await supabase.from('discount_codes').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return ((data || []) as any[]).map(Mappers.toDiscountCode);
  }

  async create(code: Partial<DiscountCode>): Promise<void> {
    log('INSERT', 'discount_codes', code.code);
    const { error } = await supabase.from('discount_codes').insert({
      code: code.code, discount_type: code.discountType, discount_value: code.discountValue,
      description: code.description, minimum_purchase: code.minimumPurchase,
      valid_from: code.validFrom || new Date().toISOString(), valid_until: code.validUntil,
      max_uses: code.maxUses, is_active: true
    } as any);
    if (error) throw error;
  }

  async update(id: string, code: Partial<DiscountCode>): Promise<void> {
    log('UPDATE', 'discount_codes', id);
    const payload: any = {
      code: code.code, discount_type: code.discountType, discount_value: code.discountValue,
      description: code.description, minimum_purchase: code.minimumPurchase,
      valid_until: code.validUntil, max_uses: code.maxUses, is_active: code.isActive
    };
    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
    const { error } = await supabase.from('discount_codes').update(payload as any).eq('id', id);
    if (error) throw error;
  }

  async delete(id: string): Promise<void> {
    log('DELETE', 'discount_codes', id);
    const { error } = await supabase.from('discount_codes').delete().eq('id', id);
    if (error) throw error;
  }
}