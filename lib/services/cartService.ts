import { supabase } from '../supabaseClient';
import { Mappers } from '../mappers';
import { log } from '../logger';
import { CartItem } from '../../types';

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
