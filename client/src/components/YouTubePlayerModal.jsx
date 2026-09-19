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
              href={track.spotifyUrl || `https://open.spotify.com/search/${encodeURIComponent(track.artist + ' ' + track.title)}`}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-emerald-500/20 active:scale-95"
              title="Open in Spotify"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 5.524 4.477 10 10 10s10-4.476 10-10c0-5.523-4.477-10-10-10zm4.586 14.424c-.18.295-.563.387-.857.207-2.35-1.436-5.308-1.76-8.793-.964-.335.077-.67-.13-.746-.465-.077-.336.13-.67.466-.747 3.816-.872 7.09-.5 9.723 1.11.294.18.387.564.207.859zm1.224-2.718c-.226.368-.707.484-1.076.258-2.69-1.654-6.79-2.133-9.972-1.166-.418.127-.864-.108-.991-.527-.127-.418.108-.864.527-.991 3.633-1.103 8.147-.568 11.254 1.349.369.227.485.708.258 1.077zm.106-2.834C14.692 8.95 8.7 8.752 5.24 9.803c-.499.152-1.028-.13-1.18-.629-.152-.499.13-1.028.629-1.18 3.99-1.21 10.597-.98 14.498 1.336.449.266.595.85.328 1.299-.266.449-.85.595-1.299.329z"/>
              </svg>
              <span className="text-[11px] sm:text-xs">Spotify</span>
            </a>
            <a
              href={ytMusicUrl}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-red-500/20 active:scale-95"
              title="Open in YouTube Music app"
            >
              <ExternalLink className="w-4 h-4 shrink-0" />
              <span className="text-[11px] sm:text-xs">YT Music</span>
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
