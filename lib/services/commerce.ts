import { supabase } from '../supabaseClient';
import { Mappers } from '../mappers';
import { log } from '../logger';
import { Order, OrderItem, ShippingAddress, DbOrder, CartItem, ShippingZone, DiscountCode } from '../../types';

export class OrderService {
  async getUserOrders(userId: string): Promise<Order[]> {
    log('SELECT', 'orders', { userId });
    const { data, error } = await supabase.from('orders').select('*').eq('user_id', userId).order('date', { ascending: false });
    if (error) throw error;
    return ((data || []) as DbOrder[]).map(Mappers.toOrder);
  }

  async getAll(): Promise<Order[]> {
    log('SELECT', 'orders', 'ALL');
    const { data, error } = await supabase.from('orders').select('*').order('date', { ascending: false });
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
        selected_color: item.selectedColor
    }));

    const { data, error } = await supabase.rpc('create_order_secure', {
      p_user_id: order.userId,
      p_items: itemsPayload,
      p_shipping_address: order.shippingAddress as any,
      p_discount_code: order.discountCode || null,
      p_notes: order.notes || null
    });

    if (error) throw error;
    
    return Mappers.toOrder(data as DbOrder);
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

  async delete(id: string): Promise<void> {
    log('DELETE', 'discount_codes', id);
    const { error } = await supabase.from('discount_codes').delete().eq('id', id);
    if (error) throw error;
  }
}