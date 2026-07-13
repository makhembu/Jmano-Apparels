/**
 * Video URL utilities — detect, normalize, and convert video URLs to embed format.
 * Supports YouTube, Vimeo, and arbitrary iframe embed codes.
 */

/** Normalize a video URL or raw iframe string into a clean embed URL. */
export function getVideoEmbedUrl(input: string): string | null {
  if (!input || !input.trim()) return null;

  const trimmed = input.trim();

  // 1. Raw iframe — extract the src attribute
  const iframeSrcMatch = trimmed.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  if (iframeSrcMatch) {
    return iframeSrcMatch[1];
  }

  // 2. YouTube
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }

  // 3. Vimeo
  const vimeoMatch = trimmed.match(/(?:player\.)?vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  // 4. Already an embed URL or direct iframe src — pass through
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    return trimmed;
  }

  return null;
}

/** Detect if a string contains a video URL or iframe embed. */
export function isVideoUrl(input: string): boolean {
  return getVideoEmbedUrl(input) !== null;
}

/** Check if a URL is from a known video platform. */
export function isKnownVideoPlatform(url: string): boolean {
  return /youtube\.com|youtu\.be|vimeo\.com/.test(url);
}

/** Extract video title hint from a URL for accessibility. */
export function getVideoTitle(url: string): string {
  if (/youtube\.com|youtu\.be/.test(url)) return 'YouTube video';
  if (/vimeo\.com/.test(url)) return 'Vimeo video';
  return 'Embedded video';
}
