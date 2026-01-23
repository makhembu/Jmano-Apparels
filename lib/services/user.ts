import { supabase } from '../supabaseClient';
import { Mappers } from '../mappers';
import { log } from '../logger';
import { User, Product, DbProduct, UserAddress } from '../../types';

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

  async updateProfile(userId: string, updates: { name: string, email: string, role?: string }): Promise<void> {
     log('UPDATE', 'users', userId);
     const { error } = await supabase.from('users').update(updates).eq('id', userId);
     if (error) throw error;
  }

  async createProfile(user: Partial<User>): Promise<User> {
    log('INSERT', 'users', user);
    const { data, error } = await supabase.from('users').insert({
        id: user.id || crypto.randomUUID(),
        name: user.name!,
        email: user.email!,
        role: user.role || 'user'
      }).select().single();
    if (error) throw error;
    return Mappers.toUser(data);
  }

  async deleteUser(userId: string): Promise<void> {
    log('DELETE', 'users', userId);
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) throw error;
  }

  // --- ADDRESS MANAGEMENT ---

  async getUserAddresses(userId: string): Promise<UserAddress[]> {
    log('SELECT', 'user_addresses', userId);
    // FIX: Cast table name to `any` to bypass incorrect generated types where 'user_addresses' is missing.
    const { data, error } = await supabase
      .from('user_addresses' as any)
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      label: row.label,
      address1: row.address1,
      address2: row.address2 || undefined,
      city: row.city,
      postcode: row.postcode,
      country: row.country,
      phone: row.phone || undefined,
      isDefault: row.is_default || false
    }));
  }

  async saveUserAddress(userId: string, address: Partial<UserAddress>): Promise<UserAddress> {
    log('UPSERT', 'user_addresses', address);
    const payload = {
      user_id: userId,
      label: address.label || 'Home',
      address1: address.address1,
      address2: address.address2,
      city: address.city,
      postcode: address.postcode,
      country: address.country || 'United Kingdom',
      phone: address.phone,
      is_default: address.isDefault ?? false
    };

    // FIX: Cast table name to `any` to bypass incorrect generated types.
    const { data, error } = await supabase
      .from('user_addresses' as any)
      .upsert(payload)
      .select()
      .single();

    if (error) throw error;
    
    const row = data as any;

    return {
      id: row.id,
      userId: row.user_id,
      label: row.label,
      address1: row.address1,
      address2: row.address2 || undefined,
      city: row.city,
      postcode: row.postcode,
      country: row.country,
      phone: row.phone || undefined,
      isDefault: row.is_default
    };
  }

  async deleteUserAddress(id: string): Promise<void> {
    log('DELETE', 'user_addresses', id);
    // FIX: Cast table name to `any` to bypass incorrect generated types.
    const { error } = await supabase.from('user_addresses' as any).delete().eq('id', id);
    if (error) throw error;
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