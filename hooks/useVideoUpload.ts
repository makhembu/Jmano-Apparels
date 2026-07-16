import { useState, useCallback } from 'react';
import { api } from '../lib/db';
import { useToast } from '../context/ToastContext';

const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

// Lazy-load video-compress to avoid circular dependency with MediaPicker
let compressAndUploadFn: ((...args: any[]) => Promise<string>) | null = null;

async function getCompressAndUpload() {
  if (!compressAndUploadFn) {
    const mod = await import('../lib/video-compress');
    compressAndUploadFn = mod.compressAndUpload;
  }
  return compressAndUploadFn;
}

/**
 * Shared hook for single-file video upload with compression.
 * Handles size validation, compression, upload, progress, and error toasts.
 */
export function useVideoUpload() {
  const { showToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState<number | null>(null);

  const uploadVideo = useCallback(async (file: File): Promise<string | null> => {
    if (file.size > MAX_VIDEO_SIZE) {
      showToast('Video too large (max 100MB)', 'error');
      return null;
    }

    setIsUploading(true);
    try {
      const compressAndUpload = await getCompressAndUpload();
      const url = await compressAndUpload(
        file,
        api.uploadVideo,
        showToast,
        setCompressionProgress,
      );
      return url;
    } catch (err: any) {
      showToast(err.message || 'Upload failed', 'error');
      return null;
    } finally {
      setIsUploading(false);
      setCompressionProgress(null);
    }
  }, [showToast]);

  return { uploadVideo, isUploading, compressionProgress };
}
