import { supabase } from '../supabaseClient';
import { log } from '../logger';

export class StorageService {
  /**
   * Uploads an image to Supabase storage with fallback logic for bucket names.
   * Standard practice is to use a bucket named 'images'.
   */
  async uploadImage(file: File): Promise<string> {
    const primaryBucket = 'images';
    const fallbackBucket = 'product-images';
    
    log('UPLOAD_ATTEMPT', primaryBucket, file.name);
    
    // Create a unique file name to avoid collisions and CDN caching issues
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = fileName;

    try {
      // Attempt upload to primary bucket
      const { data, error: uploadError } = await supabase.storage
        .from(primaryBucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        // If primary bucket fails because it doesn't exist, try fallback
        if (uploadError.message.includes('not found') || (uploadError as any).status === 404) {
          log('UPLOAD_FALLBACK', fallbackBucket, 'Primary bucket not found');
          
          const { data: fallbackData, error: fallbackError } = await supabase.storage
            .from(fallbackBucket)
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (fallbackError) {
            this.handleStorageError(fallbackError, [primaryBucket, fallbackBucket]);
          }
          
          const { data: urlData } = supabase.storage.from(fallbackBucket).getPublicUrl(filePath);
          return urlData.publicUrl;
        }

        this.handleStorageError(uploadError, [primaryBucket]);
      }

      // Get public URL for successful primary upload
      const { data: urlData } = supabase.storage.from(primaryBucket).getPublicUrl(filePath);
      return urlData.publicUrl;
    } catch (err: any) {
      console.error('Storage Service Exception:', err);
      throw new Error(err.message || 'An unexpected error occurred during upload.');
    }
  }

  /**
   * Uploads a video to Supabase storage with fallback logic for bucket names.
   */
  async uploadVideo(file: File): Promise<string> {
    const primaryBucket = 'videos';
    const fallbackBucket = 'images';
    
    log('VIDEO_UPLOAD_ATTEMPT', primaryBucket, file.name);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `video_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = fileName;

    try {
      const { data, error: uploadError } = await supabase.storage
        .from(primaryBucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        if (uploadError.message.includes('not found') || (uploadError as any).status === 404) {
          log('VIDEO_UPLOAD_FALLBACK', fallbackBucket, 'Primary bucket not found');
          
          const { data: fallbackData, error: fallbackError } = await supabase.storage
            .from(fallbackBucket)
            .upload(`videos/${filePath}`, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (fallbackError) {
            this.handleStorageError(fallbackError, [primaryBucket, fallbackBucket]);
          }
          
          const { data: urlData } = supabase.storage.from(fallbackBucket).getPublicUrl(`videos/${filePath}`);
          return urlData.publicUrl;
        }

        this.handleStorageError(uploadError, [primaryBucket]);
      }

      const { data: urlData } = supabase.storage.from(primaryBucket).getPublicUrl(filePath);
      return urlData.publicUrl;
    } catch (err: any) {
      console.error('Video Storage Service Exception:', err);
      throw new Error(err.message || 'An unexpected error occurred during video upload.');
    }
  }

  /**
   * Lists files in a Supabase storage bucket.
   */
  async listFiles(bucket: string = 'images', folder: string = ''): Promise<{ name: string; url: string; bucket: string; path: string; size: number }[]> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder, {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      log('LIST_FILES_ERROR', bucket, error.message);
      return [];
    }

    return (data || []).map((file: any) => {
      const filePath = folder ? `${folder}/${file.name}` : file.name;
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return { name: file.name, url: urlData.publicUrl, bucket, path: filePath, size: file.metadata?.size || 0 };
    }).filter((f: any) => {
      const ext = f.name.split('.').pop()?.toLowerCase();
      return ['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(ext || '');
    });
  }

  /**
   * Lists video files from both 'videos' and 'images' buckets.
   */
  async listAllVideos(): Promise<{ name: string; url: string; bucket: string; path: string; size: number }[]> {
    const buckets = ['videos', 'images'];
    const allVideos: { name: string; url: string; bucket: string; path: string; size: number }[] = [];

    for (const bucket of buckets) {
      try {
        const files = await this.listFiles(bucket);
        allVideos.push(...files);
      } catch (e) {
        // Bucket may not exist, skip
      }
    }

    return allVideos;
  }

  /**
   * Gets storage usage for a bucket (total size of all files).
   * Supabase doesn't have a direct API, so we list all files and sum their metadata.
   */
  async getStorageUsage(bucket: string = 'images'): Promise<{ used: number; files: number }> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list('', { limit: 1000, sortBy: { column: 'created_at', order: 'desc' } });

    if (error || !data) {
      return { used: 0, files: 0 };
    }

    const totalSize = data.reduce((sum: number, file: any) => sum + (file.metadata?.size || 0), 0);
    return { used: totalSize, files: data.length };
  }

  /**
   * Deletes a file from a Supabase storage bucket.
   */
  async deleteFile(bucket: string, filePath: string): Promise<void> {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Delete file error:', error);
      throw new Error(error.message || 'Failed to delete file');
    }
  }

  private handleStorageError(error: any, attemptedBuckets: string[]) {
    console.error('Supabase Storage Error:', error);
    
    if (error.message?.includes('not found') || error.status === 404) {
      throw new Error(
        `Storage Bucket Not Found. Please go to your Supabase Dashboard > Storage and create a PUBLIC bucket named "${attemptedBuckets[0]}". Ensure you also add an RLS policy to allow "INSERT" and "SELECT" for anonymous or authenticated users.`
      );
    }
    
    if (error.message?.includes('row-level security') || error.status === 403) {
      throw new Error(
        `Permission Denied (RLS). Your bucket exists, but you need to add a Storage Policy in Supabase to allow uploads. Go to Storage > Policies and create a 'New Policy' for the "${attemptedBuckets[0]}" bucket.`
      );
    }

    throw new Error(`Upload failed: ${error.message}`);
  }
}