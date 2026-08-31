import React, { useState } from 'react';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Repeat, 
  Repeat1, 
  Shuffle, 
  ListMusic, 
  Maximize2, 
  ExternalLink,
  Sparkles,
  X,
  Trash2
} from 'lucide-react';

export const PlayerBar = () => {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    currentTime, 
    duration, 
    seek, 
    volume, 
    setVolume, 
    isMuted, 
    toggleMute, 
    playNext, 
    playPrevious, 
    queue, 
    queueIndex,
    removeFromQueue,
    clearQueue,
    repeatMode,
    setRepeatMode,
    isShuffle,
    setIsShuffle,
    setIsVisualizerOpen
  } = useAudioPlayer();

  const [queueDrawerOpen, setQueueDrawerOpen] = useState(false);

  if (!currentTrack) return null;

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const toggleRepeat = () => {
    if (repeatMode === 'off') setRepeatMode('all');
    else if (repeatMode === 'all') setRepeatMode('one');
    else setRepeatMode('off');
  };

  return (
    <>
      {/* Persistent Bottom Bar */}
      <aside aria-label="Audio Player" className="fixed bottom-0 left-0 right-0 z-40 bg-dark-950/95 backdrop-blur-2xl border-t border-white/10 shadow-2xl transition-all">
        
        {/* Top Progress bar (Thin interactable line) */}
        <div 
          className="relative w-full h-1.5 bg-dark-800 cursor-pointer group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            seek(pos * duration);
          }}
        >
          <div 
            className="h-full bg-gradient-to-r from-brand-violet via-brand-purple to-brand-pink relative transition-all duration-75"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between gap-4">
          
          {/* Left: Track Information */}
          <div className="flex items-center gap-3.5 min-w-0 max-w-[280px] sm:max-w-xs">
            <div className="relative group shrink-0">
              <img
                src={currentTrack.artwork || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=120'}
                alt={currentTrack.title}
                className="w-12 h-12 rounded-xl object-cover ring-1 ring-white/10 shadow-md"
              />
              <button
                onClick={() => setIsVisualizerOpen(true)}
                title="Expand Full Visualizer"
                className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-white truncate hover:text-brand-purple transition-colors">
                  {currentTrack.title}
                </h4>
                {currentTrack.genre && (
                  <span className="hidden sm:inline-block px-1.5 py-0.2 text-[9px] font-medium bg-brand-purple/20 text-brand-purple rounded border border-brand-purple/30 shrink-0">
                    {currentTrack.genre}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">{currentTrack.artist}</p>
            </div>
          </div>

          {/* Center: Playback Controls & Time */}
          <div className="flex flex-col items-center gap-1 flex-1 max-w-md">
            <div className="flex items-center gap-3 sm:gap-4">
              
              {/* Shuffle */}
              <button
                onClick={() => setIsShuffle(!isShuffle)}
                className={`p-1.5 rounded-full transition-colors hidden sm:block ${
                  isShuffle ? 'text-brand-purple' : 'text-slate-400 hover:text-white'
                }`}
                title="Shuffle"
              >
                <Shuffle className="w-4 h-4" />
              </button>

              {/* Previous */}
              <button
                onClick={playPrevious}
                className="p-1.5 rounded-full text-slate-300 hover:text-white transition-colors"
                title="Previous (or restart)"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              {/* Play / Pause (Hero Button) */}
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-brand-violet to-brand-pink text-white flex items-center justify-center shadow-lg shadow-brand-purple/30 hover:scale-105 active:scale-95 transition-all"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              {/* Next */}
              <button
                onClick={playNext}
                className="p-1.5 rounded-full text-slate-300 hover:text-white transition-colors"
                title="Next"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              {/* Repeat */}
              <button
                onClick={toggleRepeat}
                className={`p-1.5 rounded-full transition-colors hidden sm:block ${
                  repeatMode !== 'off' ? 'text-brand-purple' : 'text-slate-400 hover:text-white'
                }`}
                title={`Repeat: ${repeatMode}`}
              >
                {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
              </button>
            </div>

            {/* Time Indicators */}
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 w-full justify-center">
              <span>{formatTime(currentTime)}</span>
              <span className="text-slate-600">/</span>
              <span>{formatTime(duration)}</span>
              <span className="text-[10px] text-slate-500 font-sans ml-1 bg-white/5 px-1.5 py-0.5 rounded">Preview</span>
            </div>
          </div>

          {/* Right: Volume & Extra Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Visualizer Trigger */}
            <button
              onClick={() => setIsVisualizerOpen(true)}
              className="p-2 rounded-xl text-slate-300 hover:text-brand-purple hover:bg-white/5 transition-all hidden md:flex items-center gap-1.5 text-xs font-medium"
              title="Full Screen Visualizer"
            >
              <Sparkles className="w-4 h-4 text-brand-pink" />
              <span>Visualizer</span>
            </button>

            {/* External YouTube Music Link */}
            <a
              href={currentTrack.youtubeMusicUrl || `https://music.youtube.com/search?q=${encodeURIComponent(currentTrack.artist + ' ' + currentTrack.title)}`}
              target="_blank"
              rel="noreferrer"
              title="Open in YouTube Music"
              className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors hidden sm:flex items-center gap-1 text-xs font-semibold border border-red-500/20"
            >
              <Play className="w-3 h-3 fill-current" />
              <span className="hidden lg:inline">YT Music</span>
            </a>

            {/* Volume Control */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="text-slate-400 hover:text-white transition-colors"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-16 sm:w-20 h-1 bg-dark-700 rounded-lg cursor-pointer appearance-none"
              />
            </div>

            {/* Queue Toggle */}
            <button
              onClick={() => setQueueDrawerOpen(!queueDrawerOpen)}
              className={`p-2 rounded-xl border transition-all relative ${
                queueDrawerOpen || queue.length > 1
                  ? 'bg-brand-purple/20 border-brand-purple/40 text-brand-purple'
                  : 'bg-dark-850 border-white/5 text-slate-400 hover:text-white'
              }`}
              title="Queue"
            >
              <ListMusic className="w-4 h-4" />
              {queue.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-pink text-[10px] font-bold text-white flex items-center justify-center">
                  {queue.length}
                </span>
              )}
            </button>

          </div>

        </div>
      </aside>

      {/* Slide-out Queue Drawer */}
      {queueDrawerOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs" onClick={() => setQueueDrawerOpen(false)} />
          <div className="fixed bottom-20 right-4 sm:right-8 z-50 w-80 sm:w-96 glass-dropdown rounded-3xl p-4 border border-white/10 shadow-2xl animate-in slide-in-from-bottom-5 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <ListMusic className="w-4 h-4 text-brand-purple" />
                <h4 className="text-sm font-bold text-white">Listening Queue ({queue.length})</h4>
              </div>
              <div className="flex items-center gap-1">
                {queue.length > 0 && (
                  <button
                    onClick={clearQueue}
                    title="Clear queue"
                    className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-white/5 transition-all text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setQueueDrawerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-3 space-y-2 max-h-72 overflow-y-auto pr-1">
              {queue.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">Your queue is empty. Click any song to start listening!</p>
              ) : (
                queue.map((t, idx) => {
                  const isCurrent = idx === queueIndex || (currentTrack?.id === t.id && currentTrack?.previewUrl === t.previewUrl);
                  return (
                    <div
                      key={`${t.id}-${idx}`}
                      className={`flex items-center justify-between gap-3 p-2 rounded-xl transition-all ${
                        isCurrent
                          ? 'bg-brand-purple/20 border border-brand-purple/40 text-white'
                          : 'bg-dark-850 hover:bg-dark-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <img src={t.artwork} alt={t.title} className="w-9 h-9 rounded-lg object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate">{t.title}</p>
                          <p className="text-[10px] text-slate-400 truncate">{t.artist}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {isCurrent && (
                          <span className="text-[10px] font-semibold text-brand-purple px-1.5 py-0.5 rounded bg-brand-purple/20 mr-1">
                            Playing
                          </span>
                        )}
                        <button
                          onClick={() => removeFromQueue(idx)}
                          className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};
