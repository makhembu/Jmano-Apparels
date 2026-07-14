import React, { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../../lib/db';
import { useToast } from '../../context/ToastContext';

interface MediaPickerProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const ITEMS_PER_PAGE = 12;

// Shared ref to track the currently hovered video across all thumbnails
let currentlyPlayingVideo: HTMLVideoElement | null = null;

const VideoThumbnail: React.FC<{ url: string; size: number }> = ({ url, size }) => {
  const [duration, setDuration] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    const video = videoRef.current;
    if (!video) return;
    // Pause any other currently playing video
    if (currentlyPlayingVideo && currentlyPlayingVideo !== video) {
      currentlyPlayingVideo.pause();
      currentlyPlayingVideo.currentTime = 0;
    }
    // Start playing after a short delay to avoid accidental triggers
    hoverTimeoutRef.current = setTimeout(() => {
      currentlyPlayingVideo = video;
      video.currentTime = 0;
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }, 300);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
      if (currentlyPlayingVideo === video) currentlyPlayingVideo = null;
    }
    setIsPlaying(false);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  return (
    <>
      <video
        ref={videoRef}
        src={url}
        className="w-full h-full object-cover"
        preload="metadata"
        muted
        playsInline
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-black/50 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {isPlaying ? (
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
      </div>
      <div className="absolute bottom-2 right-2 flex items-center gap-1">
        {duration !== null && duration > 0 && (
          <span className="bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-sm">
            {formatDuration(duration)}
          </span>
        )}
        {size > 0 && (
          <span className="bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-sm">
            {formatBytes(size)}
          </span>
        )}
      </div>
    </>
  );
};

const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export const MediaPicker: React.FC<MediaPickerProps> = ({ onSelect, onClose }) => {
  const [videos, setVideos] = useState<{ name: string; url: string; bucket: string; path: string; size: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [storageUsed, setStorageUsed] = useState(0);
  const [storageFiles, setStorageFiles] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const dragCounterRef = useRef(0);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const files = await api.listVideos();
      setVideos(files);

      const imagesUsage = await api.getStorageUsage('images').catch(() => ({ used: 0, files: 0 }));
      const videosUsage = await api.getStorageUsage('videos').catch(() => ({ used: 0, files: 0 }));
      setStorageUsed(imagesUsage.used + videosUsage.used);
      setStorageFiles(imagesUsage.files + videosUsage.files);
    } catch (e) {
      console.error('Failed to load videos:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadVideos(); }, []);

  const handleDelete = async (video: { name: string; bucket: string; path: string }) => {
    if (!window.confirm(`Delete "${video.name}"? This cannot be undone.`)) return;
    try {
      setDeleting(video.name);
      await api.deleteFile(video.bucket, video.path);
      setVideos(prev => prev.filter(v => v.path !== video.path || v.bucket !== video.bucket));
      const imagesUsage = await api.getStorageUsage('images').catch(() => ({ used: 0, files: 0 }));
      const videosUsage = await api.getStorageUsage('videos').catch(() => ({ used: 0, files: 0 }));
      setStorageUsed(imagesUsage.used + videosUsage.used);
      setStorageFiles(imagesUsage.files + videosUsage.files);
    } catch (e) {
      console.error('Failed to delete video:', e);
    } finally {
      setDeleting(null);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const { showToast } = useToast();

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const videoFiles = files.filter(f => {
      const ext = '.' + f.name.split('.').pop()?.toLowerCase();
      return VIDEO_EXTENSIONS.includes(ext);
    });

    if (videoFiles.length === 0) {
      if (files.length > 0) showToast('No video files found in drop', 'info');
      return;
    }

    setUploading(true);
    let uploaded = 0;
    let skipped = 0;
    let failed = 0;

    for (const file of videoFiles) {
      if (file.size > MAX_FILE_SIZE) {
        skipped++;
        continue;
      }
      try {
        await api.uploadVideo(file);
        uploaded++;
      } catch (err) {
        console.error('Upload failed:', err);
        failed++;
      }
    }

    setUploading(false);
    await loadVideos();

    const parts: string[] = [];
    if (uploaded > 0) parts.push(`${uploaded} uploaded`);
    if (skipped > 0) parts.push(`${skipped} skipped (over 100 MB)`);
    if (failed > 0) parts.push(`${failed} failed`);
    if (parts.length > 0) {
      showToast(parts.join(', '), uploaded > 0 ? 'success' : 'error');
    }
  }, [showToast]);

  const filteredVideos = videos.filter(v =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredVideos.length / ITEMS_PER_PAGE);
  const paginatedVideos = filteredVideos.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const STORAGE_LIMIT = 1024 * 1024 * 1024;
  const usagePercent = Math.min((storageUsed / STORAGE_LIMIT) * 100, 100);

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-xl relative" onClick={e => e.stopPropagation()}>
        {/* Drag-and-drop overlay */}
        {isDragOver && (
          <div className="absolute inset-0 z-50 bg-brand-green/10 border-2 border-dashed border-brand-green rounded-2xl flex flex-col items-center justify-center pointer-events-none">
            <svg className="w-16 h-16 text-brand-green mb-3 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-brand-green font-bold text-lg">Drop video files here</p>
            <p className="text-brand-green/70 text-sm mt-1">MP4, WebM, MOV, AVI, MKV — max 100 MB each</p>
          </div>
        )}
        {/* Uploading overlay */}
        {uploading && (
          <div className="absolute inset-0 z-50 bg-white/80 rounded-2xl flex flex-col items-center justify-center">
            <div className="animate-spin h-10 w-10 border-2 border-brand-green border-t-transparent rounded-full mb-3"></div>
            <p className="text-sm font-medium text-slate-600">Uploading...</p>
          </div>
        )}
        {/* Header */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold font-serif text-brand-dark">Media Library</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-900 p-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Storage Usage Bar */}
          <div className="bg-slate-50 rounded-xl p-3 mb-3">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Storage</span>
              <span className="text-[10px] font-bold text-slate-600">
                {formatBytes(storageUsed)} / 1 GB
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all ${usagePercent > 80 ? 'bg-red-500' : usagePercent > 60 ? 'bg-yellow-500' : 'bg-brand-green'}`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[9px] text-slate-400">{storageFiles} files</span>
              <span className="text-[9px] text-slate-400">{usagePercent.toFixed(0)}% used</span>
            </div>
          </div>

          <input
            type="text"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-sm focus:ring-2 focus:ring-brand-green/10 outline-none"
          />
        </div>

        {/* Video Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="py-12 text-center">
              <div className="animate-spin h-8 w-8 border-2 border-brand-green border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className="text-sm text-slate-400">Loading videos...</p>
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="py-12 text-center">
              <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              <p className="text-slate-400 font-medium">
                {searchQuery ? 'No matching videos found' : 'No videos uploaded yet'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {paginatedVideos.map((video) => (
                  <div
                    key={`${video.bucket}-${video.path}`}
                    className="relative group aspect-video bg-slate-900 rounded-xl overflow-hidden border-2 border-transparent hover:border-brand-green transition-all"
                  >
                    <button
                      onClick={() => { onSelect(video.url); onClose(); }}
                      className="w-full h-full"
                    >
                      <VideoThumbnail url={video.url} size={video.size} />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                        <p className="text-[9px] text-white font-medium truncate">{video.name}</p>
                      </div>
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(video); }}
                      disabled={deleting === video.name}
                      className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                      title="Delete video"
                    >
                      {deleting === video.name ? (
                        <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      )}
                    </button>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                  <p className="text-[10px] text-slate-400">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredVideos.length)} of {filteredVideos.length}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors"
                    >
                      Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-7 h-7 text-[10px] font-bold rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-brand-green text-white'
                            : 'text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
