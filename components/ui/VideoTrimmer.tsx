import React, { useCallback, useEffect, useRef, useState } from 'react';
import { trimVideo } from '../../lib/video-trim';
import { useToast } from '../../context/ToastContext';

interface VideoTrimmerProps {
  videoUrl: string;
  videoName: string;
  onTrimmed: (trimmedFile: File) => void;
  onClose: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const VideoTrimmer: React.FC<VideoTrimmerProps> = ({ videoUrl, videoName, onTrimmed, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [trimming, setTrimming] = useState(false);
  const [trimProgress, setTrimProgress] = useState(0);
  const [loadingFFmpeg, setLoadingFFmpeg] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleLoaded = () => {
      setDuration(video.duration);
      setEndTime(video.duration);
    };
    video.addEventListener('loadedmetadata', handleLoaded);
    return () => video.removeEventListener('loadedmetadata', handleLoaded);
  }, []);

  const handleTrim = useCallback(async () => {
    if (duration === 0) return;      setTrimming(true);
      setTrimProgress(0);
      try {
        setLoadingFFmpeg(true);
        // Simulate progress (ffmpeg.wasm doesn't provide progress events easily)
        const progressInterval = setInterval(() => {
          setTrimProgress(prev => Math.min(prev + 5, 90));
        }, 200);

        const trimmedFile = await trimVideo(videoUrl, startTime, endTime, `trimmed_${videoName}`);
        clearInterval(progressInterval);
        setTrimProgress(100);
        setLoadingFFmpeg(false);

      showToast(`Trimmed to ${formatTime(endTime - startTime)}`, 'success');
      onTrimmed(trimmedFile);
    } catch (err) {
      console.error('Trim failed:', err);
      showToast('Failed to trim video', 'error');
    } finally {
      setTrimming(false);
      setTrimProgress(0);
      setLoadingFFmpeg(false);
    }
  }, [videoUrl, videoName, startTime, endTime, duration, onTrimmed, showToast]);

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setStartTime(val);
    if (val >= endTime) setEndTime(Math.min(val + 1, duration));
    if (videoRef.current) videoRef.current.currentTime = val;
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setEndTime(val);
    if (val <= startTime) setStartTime(Math.max(val - 1, 0));
    if (videoRef.current) videoRef.current.currentTime = val;
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h3 className="text-lg font-bold font-serif text-brand-dark">Trim Video</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Video Preview */}
        <div className="p-4">
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full rounded-xl bg-slate-900"
            controls
            preload="metadata"
          />
        </div>

        {/* Trim Controls */}
        <div className="px-4 pb-4">
          {/* Time displays */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600">
              Start: {formatTime(startTime)}
            </span>
            <span className="text-xs font-bold text-brand-green">
              Duration: {formatTime(endTime - startTime)}
            </span>
            <span className="text-xs font-bold text-slate-600">
              End: {formatTime(endTime)}
            </span>
          </div>

          {/* Range sliders */}
          <div className="relative h-12 mb-4">
            {/* Track background */}
            <div className="absolute top-5 left-0 right-0 h-2 bg-slate-200 rounded-full" />
            {/* Selected range */}
            <div
              className="absolute top-5 h-2 bg-brand-green rounded-full"
              style={{
                left: `${(startTime / duration) * 100}%`,
                width: `${((endTime - startTime) / duration) * 100}%`,
              }}
            />
            {/* Start slider */}
            <input
              type="range"
              min={0}
              max={duration}
              step={0.1}
              value={startTime}
              onChange={handleStartChange}
              className="absolute top-0 left-0 w-full h-12 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:bg-brand-green [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-ew-resize [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white"
            />
            {/* End slider */}
            <input
              type="range"
              min={0}
              max={duration}
              step={0.1}
              value={endTime}
              onChange={handleEndChange}
              className="absolute top-0 left-0 w-full h-12 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:bg-brand-green [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-ew-resize [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white"
            />
          </div>

          {/* Trim progress */}
          {trimming && (
            <div className="mb-4">
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-brand-green transition-all duration-300"
                  style={{ width: `${trimProgress}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1 text-center">{loadingFFmpeg ? 'Loading video engine...' : 'Trimming video...'}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleTrim}
              disabled={trimming || duration === 0}
              className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-brand-green rounded-xl hover:bg-brand-green/90 transition-colors disabled:opacity-50"
            >
              {trimming ? 'Trimming...' : `Trim (${formatTime(endTime - startTime)})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
