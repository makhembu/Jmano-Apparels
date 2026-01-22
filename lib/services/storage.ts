import { supabase } from '../supabaseClient';
import { log } from '../logger';

export class StorageService {
  async uploadImage(file: File, bucket: string = 'product-images'): Promise<string> {
    log('UPLOAD', bucket, file.name);
    
    // Create a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = fileName;

    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
       console.error('Storage Upload Error:', uploadError);
       // Handle bucket not found error or RLS error
       throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  }
}