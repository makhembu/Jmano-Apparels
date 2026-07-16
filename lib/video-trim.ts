// Lazy-loaded ffmpeg references (loaded on first use)
let ffmpegInstance: any = null;
let ffmpegLoaded = false;

/**
 * Loads ffmpeg.wasm dynamically (only once).
 * Uses dynamic imports to keep @ffmpeg/ffmpeg out of the initial bundle.
 */
async function getFFmpeg(): Promise<any> {
  if (ffmpegInstance && ffmpegLoaded) return ffmpegInstance;

  const { FFmpeg } = await import('@ffmpeg/ffmpeg');
  const { fetchFile, toBlobURL } = await import('@ffmpeg/util');

  ffmpegInstance = new FFmpeg();
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
  await ffmpegInstance.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });

  // Store fetchFile on the instance for use in trimVideo
  (ffmpegInstance as any)._fetchFile = fetchFile;
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
  const fetchFile = ffmpeg._fetchFile;

  const inputName = 'input.mp4';
  const duration = endTime - startTime;

  // Write input file to virtual filesystem
  await ffmpeg.writeFile(inputName, await fetchFile(source));

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
