import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpegInstance: FFmpeg | null = null;
let ffmpegLoaded = false;

/**
 * Loads ffmpeg.wasm dynamically (only once).
 */
async function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpegInstance && ffmpegLoaded) return ffmpegInstance;

  ffmpegInstance = new FFmpeg();

  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
  await ffmpegInstance.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });

  ffmpegLoaded = true;
  return ffmpegInstance;
}

/**
 * Trims a video file from startTime to endTime.
 * Returns a new File object with the trimmed video.
 */
export async function trimVideo(
  source: File | string,
  startTime: number, // seconds
  endTime: number,   // seconds
  outputName: string = 'trimmed.mp4'
): Promise<File> {
  const ffmpeg = await getFFmpeg();

  const inputName = 'input.mp4';
  const duration = endTime - startTime;

  // Write input file to virtual filesystem
  if (source instanceof File) {
    await ffmpeg.writeFile(inputName, await fetchFile(source));
  } else {
    await ffmpeg.writeFile(inputName, await fetchFile(source));
  }

  // Run trim command: -ss start, -t duration, -c copy for fast stream copy
  await ffmpeg.exec([
    '-i', inputName,
    '-ss', String(startTime),
    '-t', String(duration),
    '-c', 'copy',
    outputName,
  ]);

  // Read output file
  const data = await ffmpeg.readFile(outputName);

  // Clean up virtual filesystem
  await ffmpeg.deleteFile(inputName);
  await ffmpeg.deleteFile(outputName);

  // Convert to File object
  const blob = new Blob([data.buffer], { type: 'video/mp4' });
  return new File([blob], outputName, { type: 'video/mp4' });
}

