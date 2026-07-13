import React, { useEffect, useState } from 'react';
import { api } from '../../lib/db';

interface MediaPickerProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

export const MediaPicker: React.FC<MediaPickerProps> = ({ onSelect, onClose }) => {
  const [videos, setVideos] = useState<{ name: string; url: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadVideos = async () => {
      try {
        setLoading(true);
        const files = await api.listVideos();
        setVideos(files);
      } catch (e) {
        console.error('Failed to load videos:', e);
      } finally {
        setLoading(false);
      }
    };
    loadVideos();
  }, []);

  const filteredVideos = videos.filter(v =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold font-serif text-brand-dark">Select Video</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-900 p-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <input
            type="text"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-sm focus:ring-2 focus:ring-brand-green/10 outline-none"
          />
        </div>
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
              <p className="text-xs text-slate-300 mt-1">Upload a video using the button below</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredVideos.map((video) => (
                <button
                  key={video.url}
                  onClick={() => { onSelect(video.url); onClose(); }}
                  className="relative group aspect-video bg-slate-900 rounded-xl overflow-hidden border-2 border-transparent hover:border-brand-green transition-all"
                >
                  <video
                    src={video.url}
                    className="w-full h-full object-cover"
                    preload="metadata"
                    muted
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <p className="text-[9px] text-white font-medium truncate">{video.name}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
