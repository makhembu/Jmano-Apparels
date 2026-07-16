import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../../lib/db';
import { useToast } from '../../context/ToastContext';

// Lazy-load VideoTrimmer to defer @ffmpeg/ffmpeg import (causes TDZ in minified bundles)
const VideoTrimmer = React.lazy(() => import('./VideoTrimmer').then(m => ({ default: m.VideoTrimmer })));

// Lazy-load video compression to avoid TDZ issues with @ffmpeg/ffmpeg in minified bundles
let compressAndUploadLazy: typeof import('../../lib/video-compress').compressAndUpload | null = null;
const loadCompression = async () => {
  if (!compressAndUploadLazy) {
    const mod = await import('../../lib/video-compress');
    compressAndUploadLazy = mod.compressAndUpload;
  }
  return compressAndUploadLazy;
};
import { formatBytes } from '../../lib/utils';

interface MediaPickerProps {
  onSelect: (url: string) => void;
  onClose: () => void;
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
  const [storageLimit, setStorageLimit] = useState(1024 * 1024 * 1024); // default 1 GB
  const [deleting, setDeleting] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [compressionProgress, setCompressionProgress] = useState<number | null>(null);
  const [trimVideo, setTrimVideo] = useState<{ url: string; name: string } | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const dragCounterRef = useRef(0);
  const failedFilesRef = useRef<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Fetch storage limit from app_settings
  useEffect(() => {
    api.getAppSettings().then(settings => {
      if (settings?.storageLimitBytes) setStorageLimit(settings.storageLimitBytes);
    }).catch(() => {});
  }, []);

  useEffect(() => { loadVideos(); }, []);

  const confirmDelete = async (video: { name: string; bucket: string; path: string }) => {
    try {
      setDeleting(video.name);
      await api.deleteFile(video.bucket, video.path);
      setVideos(prev => prev.filter(v => v.path !== video.path || v.bucket !== video.bucket));
      const imagesUsage = await api.getStorageUsage('images').catch(() => ({ used: 0, files: 0 }));
      const videosUsage = await api.getStorageUsage('videos').catch(() => ({ used: 0, files: 0 }));
      setStorageUsed(imagesUsage.used + videosUsage.used);
      setStorageFiles(imagesUsage.files + videosUsage.files);
      showToast(`"${video.name}" deleted`, 'success');
    } catch (e) {
      showToast(`Failed to delete "${video.name}"`, 'error');
      console.error('Failed to delete video:', e);
    } finally {
      setDeleting(null);
    }
  };

  const handleDelete = (video: { name: string; bucket: string; path: string }) => {
    showToast(`Delete "${video.name}"?`, 'info', {
      label: 'Delete',
      onClick: () => confirmDelete(video),
    });
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

  const uploadFiles = useCallback(async (files: File[]) => {
    // Filter to video files only
    const videoFiles = files.filter(f => {
      const ext = '.' + f.name.split('.').pop()?.toLowerCase();
      return VIDEO_EXTENSIONS.includes(ext);
    });
    if (videoFiles.length === 0) {
      showToast('No video files selected', 'info');
      return;
    }

    const total = videoFiles.length;
    let current = 0;
    let uploaded = 0;
    let skipped = 0;
    const failed: File[] = [];

    setUploading(true);
    setUploadProgress({ current: 0, total });

    for (const file of videoFiles) {
      if (file.size > MAX_FILE_SIZE) {
        skipped++;
        current++;
        setUploadProgress({ current, total });
        continue;
      }
      try {
        const compressAndUpload = await loadCompression();
        await compressAndUpload(file, api.uploadVideo, showToast, setCompressionProgress);
        uploaded++;
      } catch (err) {
        console.error('Upload failed:', err);
        failed.push(file);
      }
      current++;
      setUploadProgress({ current, total });
    }

    setUploading(false);
    setUploadProgress({ current: 0, total: 0 });
    failedFilesRef.current = failed;
    await loadVideos();

    const parts: string[] = [];
    if (uploaded > 0) parts.push(`${uploaded} uploaded`);
    if (skipped > 0) parts.push(`${skipped} skipped (over 100 MB)`);
    if (failed.length > 0) parts.push(`${failed.length} failed`);

    if (parts.length > 0) {
      const msg = parts.join(', ');
      if (failed.length > 0 && uploaded === 0) {
        showToast(msg, 'error', { label: 'Retry', onClick: () => uploadFiles(failedFilesRef.current) });
      } else if (failed.length > 0) {
        showToast(msg, 'success', { label: 'Retry failed', onClick: () => uploadFiles(failedFilesRef.current) });
      } else {
        showToast(msg, 'success');
      }
    }
  }, [showToast]);

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

    await uploadFiles(videoFiles);
  }, [showToast, uploadFiles]);

  const videoKey = (v: { bucket: string; path: string }) => `${v.bucket}:${v.path}`;

  const filteredVideos = videos.filter(v =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredVideos.length / ITEMS_PER_PAGE);
  const paginatedVideos = filteredVideos.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const allVisibleSelected = paginatedVideos.length > 0 && paginatedVideos.every(v => selectedIds.has(videoKey(v)));

  const toggleSelect = (video: { bucket: string; path: string }) => {
    const key = videoKey(video);
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedVideos.map(v => videoKey(v))));
    }
  };

  const handleBulkDelete = () => {
    const count = selectedIds.size;
    showToast(`Delete ${count} video${count > 1 ? 's' : ''}?`, 'info', {
      label: `Delete ${count}`,
      onClick: async () => {
        setBulkDeleting(true);
        let deleted = 0;
        let failed = 0;
        for (const v of videos) {
          if (!selectedIds.has(videoKey(v))) continue;
          try {
            await api.deleteFile(v.bucket, v.path);
            deleted++;
          } catch {
            failed++;
          }
        }
        setSelectedIds(new Set());
        setSelectMode(false);
        setBulkDeleting(false);
        await loadVideos();
        const parts: string[] = [];
        if (deleted > 0) parts.push(`${deleted} deleted`);
        if (failed > 0) parts.push(`${failed} failed`);
        if (parts.length > 0) showToast(parts.join(', '), deleted > 0 ? 'success' : 'error');
      },
    });
  };

  const usagePercent = Math.min((storageUsed / storageLimit) * 100, 100);

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
            <div className="relative h-14 w-14 mb-3">
              <div className="absolute inset-0 animate-spin h-14 w-14 border-2 border-brand-green border-t-transparent rounded-full"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-brand-green">{uploadProgress.current}/{uploadProgress.total}</span>
              </div>
            </div>
            <p className="text-sm font-medium text-slate-600">
              {compressionProgress !== null
                ? `Compressing video... ${compressionProgress}%`
                : `Uploading ${uploadProgress.current} of ${uploadProgress.total}...`
              }
            </p>
            {(uploadProgress.total > 1 || compressionProgress !== null) && (
              <div className="w-48 mt-3">
                <div className="w-full bg-slate-200 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-brand-green transition-all duration-300"
                    style={{ width: `${compressionProgress !== null ? compressionProgress : (uploadProgress.current / uploadProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
        {/* Header */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold font-serif text-brand-dark">Media Library</h3>
            <div className="flex items-center gap-2">
              {selectMode && (
                <span className="text-[10px] font-bold text-brand-green bg-brand-green/10 px-2 py-1 rounded-lg">
                  {selectedIds.size} selected
                </span>
              )}
              <button
                onClick={() => { setSelectMode(!selectMode); setSelectedIds(new Set()); }}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-colors ${
                  selectMode
                    ? 'border-brand-green bg-brand-green/10 text-brand-green'
                    : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                {selectMode ? 'Cancel' : 'Select'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                multiple
                className="hidden"
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length > 0) await uploadFiles(files);
                  e.target.value = '';
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-brand-green bg-brand-green/10 text-brand-green hover:bg-brand-green hover:text-white transition-colors"
              >
                + Upload New
              </button>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-900 p-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>

          {/* Storage Usage Bar */}
          <div className="bg-slate-50 rounded-xl p-3 mb-3">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Storage</span>
              <span className="text-[10px] font-bold text-slate-600">
                {formatBytes(storageUsed)} / {formatBytes(storageLimit)}
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
                    className={`relative group aspect-video bg-slate-900 rounded-xl overflow-hidden border-2 transition-all ${
                      selectMode && selectedIds.has(videoKey(video))
                        ? 'border-brand-green ring-2 ring-brand-green/30'
                        : 'border-transparent hover:border-brand-green'
                    }`}
                  >
                    {/* Selection checkbox */}
                    {selectMode && (
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSelect(video); }}
                        className="absolute top-2 left-2 z-20 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shadow-lg"
                        style={{
                          borderColor: selectedIds.has(videoKey(video)) ? '#16a34a' : 'rgba(255,255,255,0.6)',
                          backgroundColor: selectedIds.has(videoKey(video)) ? '#16a34a' : 'rgba(0,0,0,0.4)',
                        }}
                      >
                        {selectedIds.has(videoKey(video)) && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => { if (selectMode) { toggleSelect(video); } else { onSelect(video.url); onClose(); } }}
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

                    {/* Trim Button */}
                    {!selectMode && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setTrimVideo({ url: video.url, name: video.name }); }}
                        className="absolute top-2 left-2 bg-brand-green/80 hover:bg-brand-green text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                        title="Trim video"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      </button>
                    )}

                    {/* Delete Button */}
                    {!selectMode && (
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
                    )}
                  </div>
                ))}
              </div>

              {/* Bulk Action Bar */}
              {selectMode && selectedIds.size > 0 && (
                <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-red-700">
                    {selectedIds.size} video{selectedIds.size > 1 ? 's' : ''} selected
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={toggleSelectAll}
                      className="px-3 py-1.5 text-[10px] font-bold text-slate-600 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      {allVisibleSelected ? 'Deselect page' : 'Select page'}
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      disabled={bulkDeleting}
                      className="px-3 py-1.5 text-[10px] font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      {bulkDeleting ? 'Deleting...' : `Delete ${selectedIds.size}`}
                    </button>
                  </div>
                </div>
              )}

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
      {/* Video Trimmer Modal */}
      {trimVideo && (
        <Suspense fallback={
          <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-2 border-brand-green border-t-transparent rounded-full" />
          </div>
        }>
          <VideoTrimmer
            videoUrl={trimVideo.url}
            videoName={trimVideo.name}
            onTrimmed={async (trimmedFile) => {
              try {
                setUploading(true);
                await api.uploadVideo(trimmedFile);
                showToast('Trimmed video uploaded', 'success');
                await loadVideos();
              } catch (err) {
                showToast('Failed to upload trimmed video', 'error');
              } finally {
                setUploading(false);
                setTrimVideo(null);
              }
            }}
            onClose={() => setTrimVideo(null)}
          />
        </Suspense>
      )}
    </div>
  );
};
