import { supabase } from '../supabaseClient';
import { Mappers } from '../mappers';
import { log } from '../logger';
import { DiscountCode } from '../../types';

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
