import { supabase } from '../supabaseClient';
import { Mappers } from '../mappers';
import { log } from '../logger';
import { ShippingZone, ShippingOption } from '../../types';

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
