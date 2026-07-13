import React, { useMemo } from 'react';
import { getVideoEmbedUrl, getVideoTitle } from '../../lib/video-utils';

interface VideoEmbedProps {
  /** URL or raw iframe code to embed */
  url: string;
  /** Accessible title for the iframe */
  title?: string;
  /** Additional CSS classes */
  className?: string;
}

export const VideoEmbed: React.FC<VideoEmbedProps> = ({ url, title, className = '' }) => {
  const embedUrl = useMemo(() => getVideoEmbedUrl(url), [url]);

  if (!embedUrl) return null;

  const accessibleTitle = title || getVideoTitle(url);

  return (
    <div className={`video-responsive not-prose ${className}`}>
      <iframe
        src={embedUrl}
        title={accessibleTitle}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        frameBorder="0"
      />
    </div>
  );
};
