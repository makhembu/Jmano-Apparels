import { useState, useCallback } from 'react';
import { api } from '../lib/db';
import { useToast } from '../context/ToastContext';
import { compressAndUpload } from '../lib/video-compress';

const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

/**
 * Shared hook for single-file video upload with compression.
 * Handles size validation, compression, upload, progress, and error toasts.
 *
 * Usage:
 *   const { uploadVideo, isUploading, compressionProgress } = useVideoUpload();
 *   const url = await uploadVideo(file);
 *   if (url) { /* use url *\/ }
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
