import { supabase } from '../supabaseClient';
import { Mappers } from '../mappers';
import { log } from '../logger';
import { User, UserAddress, Product } from '../../types';

export class UserService {
  async getAll(): Promise<User[]> {
    log('SELECT', 'users', 'ALL');
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return ((data || []) as any[]).map(Mappers.toUser);
  }

  async getPublicProfiles(): Promise<Partial<User>[]> {
    log('RPC', 'get_public_user_profiles');
    const { data, error } = await supabase.rpc('get_public_user_profiles');
    if (error) throw error;
    return ((data || []) as any[]).map(u => ({ id: u.id, name: u.name, avatarUrl: u.avatar_url, bio: u.bio }));
  }

  async getProfile(userId: string): Promise<User | null> {
    log('SELECT', 'users', { userId });
    const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
    if (error) return null;
    return Mappers.toUser(data);
  }

  async updateProfile(userId: string, updates: Partial<User>): Promise<void> {
     log('UPDATE', 'users', userId);
     const dbUpdates: any = { name: updates.name, email: updates.email, role: updates.role, avatar_url: updates.avatarUrl, bio: updates.bio };
     Object.keys(dbUpdates).forEach(key => dbUpdates[key] === undefined && delete dbUpdates[key]);
     const { error } = await supabase.from('users').update(dbUpdates as any).eq('id', userId);
     if (error) throw error;
  }

  async createProfile(user: Partial<User> & { password?: string }): Promise<User> {
    log('CREATE', 'user_account', user.email);
    if (user.password) {
        try {
            const { data, error } = await supabase.functions.invoke('admin-create-user', { body: { email: user.email, password: user.password, name: user.name, role: user.role } });
            if (error) throw error;
            if (data?.error) throw new Error(data.error);
            if (!data?.user?.id) throw new Error("User creation succeeded but returned no ID.");
            const newProfile = await this.getProfile(data.user.id);
            if (!newProfile) return { id: data.user.id, name: user.name!, email: user.email!, role: (user.role as any) || 'user', createdAt: new Date().toISOString() };
            return newProfile;
        } catch (err: any) {
            throw new Error(`Failed to create account: ${err.message}`);
        }
    } 
    const { data, error } = await supabase.from('users').insert({ id: user.id || crypto.randomUUID(), name: user.name!, email: user.email!, role: user.role || 'user' } as any).select().single();
    if (error) throw error;
    return Mappers.toUser(data);
  }

  async deleteUser(userId: string): Promise<void> {
    log('DELETE', 'users', userId);
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) throw error;
  }

  async updateUserPassword(password: string): Promise<void> {
    const { error } = await (supabase.auth as any).updateUser({ password });
    if (error) throw error;
  }

  async requestPasswordReset(email: string, redirectUrl: string): Promise<void> {
    const { error } = await (supabase.auth as any).resetPasswordForEmail(email, { redirectTo: redirectUrl });
    if (error) throw error;
  }

  async adminSendPasswordReset(email: string): Promise<void> {
    const { error } = await (supabase.auth as any).resetPasswordForEmail(email);
    if (error) throw error;
  }
  
  async adminSendMagicLink(email: string): Promise<void> {
    const { error } = await (supabase.auth as any).signInWithOtp({ email });
    if (error) throw error;
  }

  async getPaginatedUsers(page: number = 1, limit: number = 20, search: string = ''): Promise<{ data: User[], total: number, page: number, totalPages: number }> {
    log('RPC', 'users', 'get_users_paginated');
    const { data, error } = await (supabase.rpc as any)('get_users_paginated', { page_num: page, page_size: limit, search_term: search || null });
    if (error) throw error;
    const responseData = data as any;
    const users = (responseData.data || []).map((u: any) => Mappers.toUser(u));
    return { data: users as User[], total: responseData.total || 0, page: responseData.page || 1, totalPages: responseData.totalPages || 1 };
  }

  async getUserActivity(userId: string, limit: number = 50) {
    log('SELECT', 'analytics_events', `for user ${userId}`);
    const { data, error } = await supabase.from('analytics_events').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit);
    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id, created_at: row.created_at, eventType: row.event_type, path: row.path,
      metadata: row.metadata, duration: row.duration, geo_country: row.geo_country, geo_city: row.geo_city,
    }));
  }

  async deleteUserAccount(userId: string) {
    log('RPC', 'users', `anonymize_and_delete_user ${userId}`);
    return await (supabase.rpc as any)('anonymize_and_delete_user', { target_user_id: userId });
  }

  async getUserAddresses(userId: string): Promise<UserAddress[]> {
    log('SELECT', 'user_addresses', userId);
    const { data, error } = await supabase.from('user_addresses').select('*').eq('user_id', userId).order('is_default', { ascending: false }).order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id, userId: row.user_id, label: row.label, address1: row.address1,
      address2: row.address2 || undefined, city: row.city, postcode: row.postcode,
      country: row.country, phone: row.phone || undefined, isDefault: row.is_default || false
    }));
  }

  async saveUserAddress(userId: string, address: Partial<UserAddress>): Promise<UserAddress> {
    log('UPSERT', 'user_addresses', address);
    const payload = {
      user_id: userId, label: address.label || 'Home', address1: address.address1, address2: address.address2,
      city: address.city, postcode: address.postcode, country: address.country || 'United Kingdom',
      phone: address.phone, is_default: address.isDefault ?? false
    };
    const { data, error } = await supabase.from('user_addresses').upsert(payload as any).select().single();
    if (error) throw error;
    const row = data as any;
    return {
      id: row.id, userId: row.user_id, label: row.label, address1: row.address1,
      address2: row.address2 || undefined, city: row.city, postcode: row.postcode,
      country: row.country, phone: row.phone || undefined, isDefault: row.is_default
    };
  }

  async deleteUserAddress(id: string): Promise<void> {
    log('DELETE', 'user_addresses', id);
    const { error } = await supabase.from('user_addresses').delete().eq('id', id);
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
    const { data, error } = await supabase.from('wishlists').select('product:products(*)').eq('user_id', userId);
    if (error) throw error;
    return (data || []).filter((row: any) => row.product).map((row: any) => Mappers.toProduct(row.product as any));
  }

  async toggle(userId: string, productId: string): Promise<boolean> {
    log('TOGGLE', 'wishlists', { userId, productId });
    const { data } = await supabase.from('wishlists').select('id').match({ user_id: userId, product_id: productId }).single();
    if (data) {
      await supabase.from('wishlists').delete().eq('id', (data as any).id);
      return false;
    } else {
      await supabase.from('wishlists').insert({ user_id: userId, product_id: productId } as any);
      return true;
    }
  }
}
