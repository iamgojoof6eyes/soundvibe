import React from 'react';
import { X, ExternalLink, Play, Disc3, Radio } from 'lucide-react';

export const YouTubePlayerModal = ({ track, isOpen, onClose }) => {
  if (!isOpen || !track) return null;

  const searchQuery = encodeURIComponent(`${track.artist} - ${track.title} official audio`);
  const embedUrl = `https://www.youtube-nocookie.com/embed?listType=search&list=${searchQuery}&autoplay=1`;
  const ytMusicUrl = track.youtubeMusicUrl || `https://music.youtube.com/search?q=${encodeURIComponent(track.artist + ' ' + track.title)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl glass-panel rounded-3xl p-5 sm:p-6 border border-white/10 shadow-2xl overflow-hidden space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
              <Play className="w-5 h-5 fill-current" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 uppercase tracking-wider">
                  YouTube Music
                </span>
                <span className="text-xs text-slate-400">Full Track Stream</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white truncate">{track.title}</h3>
              <p className="text-xs text-slate-400 truncate">{track.artist} • {track.album}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={ytMusicUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-red-500/20"
              title="Open in YouTube Music app"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">YT Music</span>
            </a>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Embedded YouTube Player */}
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-dark-900 border border-white/5 shadow-inner">
          <iframe
            src={embedUrl}
            title={`${track.artist} - ${track.title}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <p>Playing full-length official stream via YouTube Music</p>
          <button
            onClick={onClose}
            className="text-xs text-brand-purple hover:underline"
          >
            Close player
          </button>
        </div>

      </div>
    </div>
  );
};
