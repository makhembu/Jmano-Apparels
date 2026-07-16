import { supabase } from '../supabaseClient';
import { log } from '../logger';
import { SECRETS } from '../../secrets';

const getEnv = (key: string) => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    return (import.meta as any).env[key];
  }
  return undefined;
};

const R2_WORKER_URL = getEnv('VITE_R2_WORKER_URL') || SECRETS.R2_WORKER_URL || '';
const R2_PUBLIC_BASE = getEnv('VITE_R2_PUBLIC_URL') || 'https://pub-684383900d27443595e055fe01e09761.r2.dev';

function r2PublicUrl(key: string): string {
  return `${R2_PUBLIC_BASE}/${key}`;
}

export class StorageService {
  /**
   * Uploads a file to R2 via presigned URL.
   * Returns the public URL on success, null on failure.
   */
  private async uploadToR2(file: File, key: string): Promise<string | null> {
    if (!R2_WORKER_URL) {
      log('R2_SKIP', 'no worker url configured', key);
      return null;
    }

    try {
      const res = await fetch(`${R2_WORKER_URL}/presign-upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, contentType: file.type || 'application/octet-stream' }),
      });

      if (!res.ok) {
        log('R2_PRESIGN_FAIL', key, `status ${res.status}`);
        return null;
      }

      const { url } = await res.json<{ url: string; key: string }>();

      const putRes = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file,
      });

      if (!putRes.ok) {
        log('R2_UPLOAD_FAIL', key, `status ${putRes.status}`);
        return null;
      }

      log('R2_UPLOAD_OK', key);
      return r2PublicUrl(key);
    } catch (err: any) {
      log('R2_UPLOAD_ERROR', key, err.message);
      return null;
    }
  }

  /**
   * Lists files from R2 via the Worker.
   */
  async listR2Files(prefix: string = ''): Promise<{ name: string; url: string; key: string; size: number }[]> {
    if (!R2_WORKER_URL) return [];

    try {
      const res = await fetch(`${R2_WORKER_URL}/list?prefix=${encodeURIComponent(prefix)}&limit=100`);
      if (!res.ok) return [];

      const { objects } = await res.json<{ objects: { key: string; size: number }[] }>();

      return objects
        .filter(obj => {
          const ext = obj.key.split('.').pop()?.toLowerCase() || '';
          return ['mp4', 'webm', 'ogg', 'mov', 'avi', 'jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
        })
        .map(obj => ({
          name: obj.key.split('/').pop() || obj.key,
          url: r2PublicUrl(obj.key),
          key: obj.key,
          size: obj.size,
        }));
    } catch (err: any) {
      log('R2_LIST_ERROR', prefix, err.message);
      return [];
    }
  }

  /**
   * Uploads an image to R2 first, falling back to Supabase storage.
   */
  async uploadImage(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const r2Key = `images/${fileName}`;

    const r2Url = await this.uploadToR2(file, r2Key);
    if (r2Url) return r2Url;

    // Fallback to Supabase
    log('UPLOAD_FALLBACK', 'supabase', file.name);
    const primaryBucket = 'images';
    const fallbackBucket = 'product-images';

    try {
      const { data, error: uploadError } = await supabase.storage
        .from(primaryBucket)
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        if (uploadError.message.includes('not found') || (uploadError as any).status === 404) {
          const { data: fb, error: fbErr } = await supabase.storage
            .from(fallbackBucket)
            .upload(fileName, file, { cacheControl: '3600', upsert: false });
          if (fbErr) this.handleStorageError(fbErr, [primaryBucket, fallbackBucket]);
          const { data: urlData } = supabase.storage.from(fallbackBucket).getPublicUrl(fileName);
          return urlData.publicUrl;
        }
        this.handleStorageError(uploadError, [primaryBucket]);
      }

      const { data: urlData } = supabase.storage.from(primaryBucket).getPublicUrl(fileName);
      return urlData.publicUrl;
    } catch (err: any) {
      console.error('Storage Service Exception:', err);
      throw new Error(err.message || 'An unexpected error occurred during upload.');
    }
  }

  /**
   * Uploads a video to R2 first, falling back to Supabase storage.
   */
  async uploadVideo(file: File, fixedPath?: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = fixedPath || `video_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const r2Key = `videos/${fileName}`;

    const r2Url = await this.uploadToR2(file, r2Key);
    if (r2Url) return r2Url;

    // Fallback to Supabase
    log('VIDEO_UPLOAD_FALLBACK', 'supabase', file.name);
    const primaryBucket = 'videos';
    const fallbackBucket = 'images';

    try {
      const { data, error: uploadError } = await supabase.storage
        .from(primaryBucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: !!fixedPath,
          contentType: file.type || 'video/mp4',
        });

      if (uploadError) {
        if (uploadError.message.includes('not found') || (uploadError as any).status === 404) {
          const { data: fb, error: fbErr } = await supabase.storage
            .from(fallbackBucket)
            .upload(`videos/${fileName}`, file, {
              cacheControl: '3600',
              upsert: false,
              contentType: file.type || 'video/mp4',
            });
          if (fbErr) this.handleStorageError(fbErr, [primaryBucket, fallbackBucket]);
          const { data: urlData } = supabase.storage.from(fallbackBucket).getPublicUrl(`videos/${fileName}`);
          return urlData.publicUrl;
        }
        this.handleStorageError(uploadError, [primaryBucket]);
      }

      const { data: urlData } = supabase.storage.from(primaryBucket).getPublicUrl(fileName);
      return urlData.publicUrl;
    } catch (err: any) {
      console.error('Video Storage Service Exception:', err);
      throw new Error(err.message || 'An unexpected error occurred during video upload.');
    }
  }

  /**
   * Lists all media files (images + videos) from both R2 and Supabase storage.
   */
  async listAllMedia(): Promise<{ name: string; url: string; bucket: string; path: string; size: number }[]> {
    const allMedia: { name: string; url: string; bucket: string; path: string; size: number }[] = [];

    // R2 media
    try {
      const r2Files = await this.listR2Files('');
      allMedia.push(...r2Files.map(f => ({
        name: f.name,
        url: f.url,
        bucket: 'r2',
        path: f.key,
        size: f.size,
      })));
    } catch (e) {
      // R2 may not be configured
    }

    // Supabase media (legacy)
    for (const bucket of ['images', 'videos']) {
      try {
        const files = await this.listFilesAll(bucket);
        allMedia.push(...files);
      } catch (e) {
        // Bucket may not exist
      }
    }

    try {
      const subFiles = await this.listFilesAll('images', 'videos');
      allMedia.push(...subFiles);
    } catch (e) {
      // Subfolder may not exist
    }

    return allMedia;
  }

  /**
   * Lists video files from both R2 and Supabase storage.
   */
  async listAllVideos(): Promise<{ name: string; url: string; bucket: string; path: string; size: number }[]> {
    const allVideos: { name: string; url: string; bucket: string; path: string; size: number }[] = [];

    // R2 videos
    try {
      const r2Files = await this.listR2Files('videos/');
      allVideos.push(...r2Files.map(f => ({
        name: f.name,
        url: f.url,
        bucket: 'r2',
        path: f.key,
        size: f.size,
      })));
    } catch (e) {
      // R2 may not be configured
    }

    // Supabase videos (legacy)
    for (const bucket of ['videos', 'images']) {
      try {
        const files = await this.listFiles(bucket);
        allVideos.push(...files);
      } catch (e) {
        // Bucket may not exist
      }
    }

    try {
      const subFiles = await this.listFiles('images', 'videos');
      allVideos.push(...subFiles);
    } catch (e) {
      // Subfolder may not exist
    }

    return allVideos;
  }

  /**
   * Lists ALL files (images + videos) in a Supabase storage bucket.
   */
  async listFilesAll(bucket: string = 'images', folder: string = ''): Promise<{ name: string; url: string; bucket: string; path: string; size: number }[]> {
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
      return ['mp4', 'webm', 'ogg', 'mov', 'avi', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '');
    });
  }

  /**
   * Lists files in a Supabase storage bucket (videos only).
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
   * Gets R2 storage usage from the Worker.
   */
  async getR2StorageUsage(): Promise<{ used: number; files: number }> {
    if (!R2_WORKER_URL) return { used: 0, files: 0 };

    try {
      const res = await fetch(`${R2_WORKER_URL}/usage`);
      if (!res.ok) return { used: 0, files: 0 };
      return await res.json<{ used: number; files: number }>();
    } catch {
      return { used: 0, files: 0 };
    }
  }

  /**
   * Gets storage usage for a bucket.
   */
  async getStorageUsage(bucket: string = 'images'): Promise<{ used: number; files: number }> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list('', { limit: 1000, sortBy: { column: 'created_at', order: 'desc' } });

    if (error || !data) return { used: 0, files: 0 };

    const totalSize = data.reduce((sum: number, file: any) => sum + (file.metadata?.size || 0), 0);
    return { used: totalSize, files: data.length };
  }

  /**
   * Deletes a file from a Supabase storage bucket.
   */
  async deleteFile(bucket: string, filePath: string): Promise<void> {
    const { error } = await supabase.storage.from(bucket).remove([filePath]);
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
