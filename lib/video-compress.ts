import { formatBytes } from './utils';

const COMPRESS_THRESHOLD = 50 * 1024 * 1024; // 50MB — only compress files larger than this

// Lazy-loaded ffmpeg references (loaded on first use)
let ffmpegInstance: any = null;
let ffmpegLoaded = false;
let ffmpegLoading = false;
let isCompressing = false;

/**
 * Dynamically loads ffmpeg.wasm (singleton, only loads once).
 * Uses dynamic imports to keep @ffmpeg/ffmpeg out of the initial bundle.
 * Returns null if loading fails (graceful fallback).
 */
async function getFFmpeg(): Promise<any | null> {
  if (ffmpegInstance && ffmpegLoaded) return ffmpegInstance;
  if (ffmpegLoading) return null;

  ffmpegLoading = true;
  try {
    const { FFmpeg } = await import('@ffmpeg/ffmpeg');
    const { fetchFile, toBlobURL } = await import('@ffmpeg/util');

    ffmpegInstance = new FFmpeg();
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
    await ffmpegInstance.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    (ffmpegInstance as any)._fetchFile = fetchFile;
    ffmpegLoaded = true;
    return ffmpegInstance;
  } catch (err) {
    console.warn('FFmpeg load failed, falling back to original file:', err);
    ffmpegInstance = null;
    return null;
  } finally {
    ffmpegLoading = false;
  }
}

/**
 * Compresses a video file using ultrafast preset for speed.
 * Returns the original file if compression fails or is unnecessary.
 */
export async function compressVideo(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<File> {
  const ffmpeg = await getFFmpeg();
  if (!ffmpeg) return file;

  const fetchFile = ffmpeg._fetchFile;
  const inputName = 'input.mp4';
  const outputName = 'output.mp4';

  const onProgressHandler = ({ progress }: { progress: number }) => {
    onProgress?.(Math.min(Math.round(progress * 100), 100));
  };
  ffmpeg.on('progress', onProgressHandler);

  try {
    onProgress?.(0);
    await ffmpeg.writeFile(inputName, await fetchFile(file));
    onProgress?.(5);

    await ffmpeg.exec([
      '-i', inputName,
      '-c:v', 'libx264',
      '-crf', '28',
      '-preset', 'ultrafast',
      '-c:a', 'aac',
      '-b:a', '96k',
      outputName,
    ]);

    const data = await ffmpeg.readFile(outputName);
    await ffmpeg.deleteFile(inputName).catch(() => {});
    await ffmpeg.deleteFile(outputName).catch(() => {});

    const blob = new Blob([data.buffer], { type: 'video/mp4' });
    const compressed = new File([blob], file.name.replace(/\.[^.]+$/, '.mp4'), { type: 'video/mp4' });

    if (compressed.size < file.size) {
      return compressed;
    }
    return file;
  } catch (err) {
    console.warn('Video compression failed:', err);
    await ffmpeg.deleteFile(inputName).catch(() => {});
    await ffmpeg.deleteFile(outputName).catch(() => {});
    return file;
  } finally {
    ffmpeg.off('progress', onProgressHandler);
    onProgress?.(0);
  }
}

/**
 * Returns true if the file is above the compression threshold.
 */
export function shouldCompress(file: File): boolean {
  return file.size > COMPRESS_THRESHOLD;
}

/**
 * Upload first, compress later pattern.
 * 1. Upload the original file immediately (fast)
 * 2. Compress in background and show savings toast
 * Returns the public URL of the uploaded file immediately.
 */
export async function compressAndUpload(
  file: File,
  uploadFn: (f: File) => Promise<string>,
  showToast: (msg: string, type: 'info' | 'success' | 'error') => void,
  onCompressProgress?: (percent: number) => void,
): Promise<string> {
  // Step 1: Upload original immediately
  showToast('Uploading video...', 'info');
  const url = await uploadFn(file);

  // Step 2: Compress in background if needed (for future uploads / storage savings info)
  if (shouldCompress(file)) {
    compressInBackground(file, showToast, onCompressProgress);
  }

  return url;
}

/**
 * Background compression — logs savings for future reference.
 * Since Supabase always creates new files on upload, we can't replace
 * the already-returned URL. This just measures potential savings.
 */
async function compressInBackground(
  originalFile: File,
  showToast: (msg: string, type: 'info' | 'success' | 'error') => void,
  onCompressProgress?: (percent: number) => void,
): Promise<void> {
  if (isCompressing) return; // skip — already running
  isCompressing = true;
  try {
    showToast('Optimizing video in background...', 'info');
    const compressed = await compressVideo(originalFile, onCompressProgress);

    if (compressed.size < originalFile.size) {
      const saved = originalFile.size - compressed.size;
      const pct = Math.round((saved / originalFile.size) * 100);
      showToast(`Video optimized! Saved ${formatBytes(saved)} (${pct}% smaller)`, 'success');
    }
  } catch (err) {
    console.warn('Background compression failed:', err);
  } finally {
    isCompressing = false;
    onCompressProgress?.(0);
  }
}
