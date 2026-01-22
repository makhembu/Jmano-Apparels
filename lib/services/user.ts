import { supabase } from '../supabaseClient';
import { Mappers } from '../mappers';
import { log } from '../logger';
import { User, Product, DbProduct } from '../../types';

export class UserService {
  async getAll(): Promise<User[]> {
    log('SELECT', 'users', 'ALL');
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return ((data || []) as any[]).map(Mappers.toUser);
  }

  async getProfile(userId: string): Promise<User | null> {
    log('SELECT', 'users', { userId });
    const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
    if (error) return null;
    return Mappers.toUser(data);
  }

  async updateProfile(userId: string, updates: { name: string, email: string }): Promise<void> {
     log('UPDATE', 'users', userId);
     const { error } = await supabase.from('users').update({ name: updates.name, email: updates.email }).eq('id', userId);
     if (error) throw error;
  }

  async createProfile(user: Partial<User>): Promise<User> {
    log('INSERT', 'users', user);
    const { data, error } = await supabase.from('users').insert({
        id: user.id!,
        name: user.name!,
        email: user.email!,
        role: user.role || 'user'
      }).select().single();
    if (error) throw error;
    return Mappers.toUser(data);
  }
}

export class WishlistService {
  async getIds(userId: string): Promise<string[]> {
    log('SELECT', 'wishlists', userId);
    const { data, error } = await supabase.from('wishlists').select('product_id').eq('user_id', userId);
    if (error) throw error;
    return (data || []).map((d: any) => d.product_id);
  }

  async getProducts(userId: string): Promise<Product[]> {
    log('SELECT', 'wishlists_products', userId);
    const { data, error } = await supabase
      .from('wishlists')
      .select('product:products(*)')
      .eq('user_id', userId);
      
    if (error) throw error;
    return (data || [])
      .filter((row: any) => row.product)
      .map((row: any) => Mappers.toProduct(row.product as DbProduct));
  }

  async toggle(userId: string, productId: string): Promise<boolean> {
    log('TOGGLE', 'wishlists', { userId, productId });
    const { data } = await supabase.from('wishlists').select('id').match({ user_id: userId, product_id: productId }).single();
    if (data) {
      await supabase.from('wishlists').delete().eq('id', data.id);
      return false; // Removed
    } else {
      await supabase.from('wishlists').insert({ user_id: userId, product_id: productId });
      return true; // Added
    }
  }
}