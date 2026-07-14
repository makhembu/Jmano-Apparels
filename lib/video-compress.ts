import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpegInstance: FFmpeg | null = null;
let ffmpegLoaded = false;
let ffmpegLoading = false;

const COMPRESS_THRESHOLD = 10 * 1024 * 1024; // 10MB — only compress files larger than this

/**
 * Dynamically loads ffmpeg.wasm (singleton, only loads once).
 * Returns null if loading fails (graceful fallback).
 */
async function getFFmpeg(): Promise<FFmpeg | null> {
  if (ffmpegInstance && ffmpegLoaded) return ffmpegInstance;
  if (ffmpegLoading) return null; // prevent concurrent loads

  ffmpegLoading = true;
  try {
    ffmpegInstance = new FFmpeg();
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
    await ffmpegInstance.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
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
 * Compresses a video file if it exceeds the size threshold.
 * Returns the original file if compression fails or is unnecessary.
 *
 * Strategy: re-encode with reduced bitrate (CRF 26) to shrink file size.
 */
export async function compressVideo(file: File): Promise<File> {
  // Skip files under the threshold
  if (file.size <= COMPRESS_THRESHOLD) return file;

  const ffmpeg = await getFFmpeg();
  if (!ffmpeg) return file; // graceful fallback — upload original

  const inputName = 'input.mp4';
  const outputName = 'output.mp4';

  try {
    await ffmpeg.writeFile(inputName, await fetchFile(file));

    await ffmpeg.exec([
      '-i', inputName,
      '-c:v', 'libx264',
      '-crf', '26',
      '-preset', 'fast',
      '-c:a', 'aac',
      '-b:a', '128k',
      outputName,
    ]);

    const data = await ffmpeg.readFile(outputName);

    // Clean up virtual filesystem
    await ffmpeg.deleteFile(inputName).catch(() => {});
    await ffmpeg.deleteFile(outputName).catch(() => {});

    const blob = new Blob([data.buffer], { type: 'video/mp4' });
    const compressed = new File([blob], file.name.replace(/\.[^.]+$/, '.mp4'), { type: 'video/mp4' });

    // Only use compressed if it's actually smaller (fallback if encoding made it bigger)
    if (compressed.size < file.size) {
      return compressed;
    }
    return file;
  } catch (err) {
    console.warn('Video compression failed, uploading original:', err);
    // Clean up on error
    await ffmpeg.deleteFile(inputName).catch(() => {});
    await ffmpeg.deleteFile(outputName).catch(() => {});
    return file; // graceful fallback
  }
}

/**
 * Returns true if the file is above the compression threshold.
 */
export function shouldCompress(file: File): boolean {
  return file.size > COMPRESS_THRESHOLD;
}

/**
 * Compresses a video if needed, then uploads it via the provided upload function.
 * Shows "Compressing..." toast during compression.
 * Returns the public URL of the uploaded file.
 */
export async function compressAndUpload(
  file: File,
  uploadFn: (f: File) => Promise<string>,
  showToast: (msg: string, type: 'info' | 'success' | 'error') => void,
): Promise<string> {
  let fileToUpload = file;
  if (shouldCompress(file)) {
    showToast('Compressing video...', 'info');
    fileToUpload = await compressVideo(file);
  }
  showToast('Uploading video...', 'info');
  return uploadFn(fileToUpload);
}
