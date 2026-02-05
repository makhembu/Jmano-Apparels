
import { supabase } from '../supabaseClient';
import { Mappers } from '../mappers';
import { log } from '../logger';
import { Order, OrderItem, ShippingAddress, DbOrder, CartItem, ShippingZone, DiscountCode } from '../../types';
import { SettingsService } from './content';

// Instantiate settings service for email logic
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

  async create(order: Partial<Order> & { shippingAddress: ShippingAddress }): Promise<Order> {
    log('RPC', 'create_order_secure', order);
    
    // Map products to ensure correct field names for the RPC
    const itemsPayload = (order.products || []).map((item: any) => ({
        product_id: item.productId,
        quantity: item.quantity,
        size: item.size,
        selected_color: item.selectedColor,
        title: item.title,
        price: item.price,
        image: item.image
    }));

    const { data, error } = await supabase.rpc('create_order_secure', {
      p_user_id: order.userId || null,
      p_customer_email: order.customerEmail || null,
      p_customer_name: order.customerName || null,
      p_items: itemsPayload,
      p_shipping_address: order.shippingAddress as any,
      p_discount_code: order.discountCode || null,
      p_notes: order.notes || null,
      p_payment_status: order.paymentStatus || 'paid',
      p_payment_intent_id: order.paymentIntentId || null
    });

    if (error) throw error;
    
    const createdOrder = Mappers.toOrder(data as DbOrder);

    // --- SEND EMAILS (Client-Side Logic) ---
    // Only send for successful orders (paid/pending).
    try {
        const customerName = createdOrder.customerName || 'Customer';
        const customerEmail = createdOrder.customerEmail || '';
        const orderNumber = createdOrder.orderNumber;
        const total = createdOrder.total.toFixed(2);

        // 1. Send Customer Confirmation
        if (customerEmail) {
            settingsService.sendTransactionalEmail('new_order_customer', customerEmail, {
                '{{name}}': customerName,
                '{{order_number}}': orderNumber,
                '{{total}}': total,
                '{{order_link}}': `https://jamboapparels.com/#/order/${createdOrder.id}`
            });
        }

        // 2. Send Admin Alert
        const settings = await settingsService.get();
        if (settings && settings.contactEmail) {
             settingsService.sendTransactionalEmail('admin_new_order', settings.contactEmail, {
                '{{customer_name}}': customerName,
                '{{order_number}}': orderNumber,
                '{{total}}': total,
                '{{admin_link}}': `https://jamboapparels.com/#/admin/orders/${createdOrder.id}`
             });
        }

    } catch (emailError) {
        console.error("Failed to trigger order emails", emailError);
        // Do not throw error, order was created successfully
    }

    return createdOrder;
  }

  async update(id: string, updates: { status?: string; trackingNumber?: string; paymentStatus?: string }): Promise<void> {
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

    const { error } = await supabase.from('orders').update(dbUpdates).eq('id', id);
    if (error) throw error;

    // --- SEND EMAILS (Status Updates) ---
    try {
        if (updates.status) {
            // Re-fetch order to get customer details & settings
            const [order, settings] = await Promise.all([
                this.getById(id),
                settingsService.get()
            ]);

            if (order && settings) {
                // 1. Admin Alert
                if (settings.contactEmail) {
                     settingsService.sendTransactionalEmail('admin_order_status_update', settings.contactEmail, {
                        '{{order_number}}': order.orderNumber,
                        '{{status}}': updates.status,
                        '{{customer_name}}': order.customerName || 'Guest',
                        '{{admin_link}}': `https://jamboapparels.com/#/admin/orders/${id}`
                     });
                }

                // 2. Customer Alert
                if (order.customerEmail) {
                    let templateName = '';
                    const vars: any = {
                        '{{name}}': order.customerName || 'Customer',
                        '{{order_number}}': order.orderNumber,
                        '{{status}}': updates.status
                    };

                    switch(updates.status) {
                        case 'Processing':
                            templateName = 'order_processing';
                            break;
                        case 'Shipped':
                            templateName = 'order_shipped';
                            vars['{{tracking_number}}'] = updates.trackingNumber || order.trackingNumber || 'N/A';
                            break;
                        case 'Delivered':
                            templateName = 'order_delivered';
                            // Link to first product for review
                            const firstProduct = order.products?.[0];
                            // Handle if productId is available
                            vars['{{product_id}}'] = firstProduct?.productId || '';
                            break;
                        case 'Cancelled':
                            templateName = 'order_cancelled';
                            break;
                    }

                    if (templateName) {
                        settingsService.sendTransactionalEmail(templateName, order.customerEmail, vars);
                    }
                }
            }
        }
    } catch (e) {
        console.error("Email trigger failed for status update", e);
    }
  }
  
  async cancelOrder(orderId: string, userId: string): Promise<void> {
    log('UPDATE', 'orders', { orderId, status: 'Cancelled' });
    
    // Check if order is in a cancellable state first
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .match({ id: orderId, user_id: userId })
      .single();

    if (fetchError || !order) throw new Error("Order not found or permission denied.");
    if (!['Pending', 'Processing', 'Pending Payment'].includes(order.status)) {
      throw new Error("This order can no longer be cancelled.");
    }

    const { error } = await supabase
      .from('orders')
      .update({ status: 'Cancelled', cancelled_at: new Date().toISOString(), total: order.total })
      .match({ id: orderId, user_id: userId });
    if (error) throw error;

    // Email Notification
    try {
        const settings = await settingsService.get();
        const orderNum = (order as any).order_number;
        const custName = (order as any).customer_name || 'Customer';
        const custEmail = (order as any).customer_email;

        // 1. Customer
        if (custEmail) {
            settingsService.sendTransactionalEmail('order_cancelled', custEmail, {
                '{{name}}': custName,
                '{{order_number}}': orderNum
            });
        }

        // 2. Admin
        if (settings?.contactEmail) {
             settingsService.sendTransactionalEmail('admin_order_status_update', settings.contactEmail, {
                '{{order_number}}': orderNum,
                '{{status}}': 'Cancelled',
                '{{customer_name}}': custName,
                '{{admin_link}}': `https://jamboapparels.com/#/admin/orders/${orderId}`
             });
        }

    } catch (e) {}
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
      await supabase.from('cart_items').insert(rows);
    }
  }

  async fetch(userId: string): Promise<CartItem[]> {
    log('FETCH', 'cart_items', userId);
    const { data, error } = await supabase.from('cart_items').select(`
      quantity, selected_size, selected_color, 
      product:products (*)
    `).eq('user_id', userId);
    
    if (error) throw error;
    // Safely map, filtering out any items where the joined product might be null (if product deleted)
    return (data || [])
        .filter((item: any) => item.product)
        .map(Mappers.toCartItem);
  }
}

export class ShippingService {
  async getZones(): Promise<ShippingZone[]> {
    log('SELECT', 'shipping_zones');
    const { data, error } = await supabase.from('shipping_zones').select('*').eq('is_active', true);
    if (error) throw error;
    return ((data || []) as any[]).map(Mappers.toShippingZone);
  }

  async createZone(zone: Partial<ShippingZone>): Promise<void> {
    log('INSERT', 'shipping_zones', zone);
    const { error } = await supabase.from('shipping_zones').insert({
      name: zone.name,
      countries: zone.countries,
      base_rate: zone.baseRate,
      per_kg_rate: zone.perKgRate,
      free_shipping_threshold: zone.freeShippingThreshold,
      estimated_days: zone.estimatedDays,
      is_active: true
    });
    if (error) throw error;
  }

  async updateZone(id: string, zone: Partial<ShippingZone>): Promise<void> {
    log('UPDATE', 'shipping_zones', id);
    const { error } = await supabase.from('shipping_zones').update({
      name: zone.name,
      countries: zone.countries,
      base_rate: zone.baseRate,
      per_kg_rate: zone.perKgRate,
      free_shipping_threshold: zone.freeShippingThreshold,
      estimated_days: zone.estimatedDays,
      is_active: zone.isActive
    }).eq('id', id);
    if (error) throw error;
  }

  async deleteZone(id: string): Promise<void> {
    log('DELETE', 'shipping_zones', id);
    const { error } = await supabase.from('shipping_zones').delete().eq('id', id);
    if (error) throw error;
  }
}

export class DiscountService {
  async validate(code: string, total: number): Promise<DiscountCode | null> {
    log('RPC', 'validate_discount_code', code);
    const { data, error } = await supabase.rpc('validate_discount_code', { code_input: code, order_total: total });
    
    if (!error && data) {
       return Mappers.toDiscountCode(data);
    }
    
    // Fallback: Client-side validation
    const { data: codeData, error: tableError } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single();

    if (tableError || !codeData) return null;

    const now = new Date();
    if (codeData.valid_from && new Date(codeData.valid_from) > now) return null;
    if (codeData.valid_until && new Date(codeData.valid_until) < now) return null;
    if (codeData.minimum_purchase && total < codeData.minimum_purchase) return null;

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
      code: code.code,
      discount_type: code.discountType,
      discount_value: code.discountValue,
      description: code.description,
      minimum_purchase: code.minimumPurchase,
      valid_from: code.validFrom || new Date().toISOString(),
      valid_until: code.validUntil,
      max_uses: code.maxUses,
      is_active: true
    });
    if (error) throw error;
  }

  async update(id: string, code: Partial<DiscountCode>): Promise<void> {
    log('UPDATE', 'discount_codes', id);
    const payload: any = {
      code: code.code,
      discount_type: code.discountType,
      discount_value: code.discountValue,
      description: code.description,
      minimum_purchase: code.minimumPurchase,
      valid_until: code.validUntil,
      max_uses: code.maxUses,
      is_active: code.isActive
    };
    
    // Clean payload
    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

    const { error } = await supabase.from('discount_codes').update(payload).eq('id', id);
    if (error) throw error;
  }

  async delete(id: string): Promise<void> {
    log('DELETE', 'discount_codes', id);
    const { error } = await supabase.from('discount_codes').delete().eq('id', id);
    if (error) throw error;
  }
}
