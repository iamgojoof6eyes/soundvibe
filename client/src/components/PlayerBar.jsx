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
      {/* Persistent Bottom Bar - Adaptive for Mobile & Desktop */}
      <aside 
        aria-label="Audio Player" 
        className="fixed bottom-[56px] md:bottom-0 left-2 right-2 md:left-0 md:right-0 z-40 bg-dark-900/95 md:bg-dark-950/95 backdrop-blur-2xl border border-white/15 md:border-t md:border-x-0 md:border-b-0 rounded-2xl md:rounded-none shadow-2xl transition-all"
      >
        
        {/* Top Progress bar (Thin interactable line) */}
        <div 
          className="relative w-full h-1 bg-dark-800 cursor-pointer group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            seek(pos * duration);
          }}
        >
          <div 
            className="h-full bg-brand-blue relative transition-all duration-75"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Track Information */}
          <div 
            className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1 sm:flex-initial sm:max-w-xs cursor-pointer"
            onClick={() => setIsVisualizerOpen(true)}
          >
            <div className="relative group shrink-0">
              <img
                src={currentTrack.artwork || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=120'}
                alt={currentTrack.title}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover ring-1 ring-white/10 shadow-md"
              />
              <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity hidden sm:flex">
                <Maximize2 className="w-4 h-4" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs sm:text-sm font-bold text-white truncate hover:text-brand-blue transition-colors">
                  {currentTrack.title}
                </h4>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">{currentTrack.artist}</p>
            </div>
          </div>

          {/* Center: Playback Controls & Time (Desktop) */}
          <div className="hidden md:flex flex-col items-center gap-0.5 flex-1 max-w-md">
            <div className="flex items-center gap-3 sm:gap-4">
              
              {/* Shuffle */}
              <button
                onClick={() => setIsShuffle(!isShuffle)}
                className={`p-1.5 rounded-full transition-colors ${
                  isShuffle ? 'text-brand-blue' : 'text-slate-400 hover:text-white'
                }`}
                title="Shuffle"
              >
                <Shuffle className="w-4 h-4" />
              </button>

              {/* Previous */}
              <button
                onClick={playPrevious}
                className="p-1.5 rounded-full text-slate-300 hover:text-white transition-colors"
                title="Previous"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              {/* Play / Pause */}
              <button
                onClick={togglePlay}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-brand-blue hover:bg-sky-400 text-white flex items-center justify-center shadow-lg shadow-brand-blue/30 hover:scale-105 active:scale-95 transition-all"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />}
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
                className={`p-1.5 rounded-full transition-colors ${
                  repeatMode !== 'off' ? 'text-brand-blue' : 'text-slate-400 hover:text-white'
                }`}
                title={`Repeat: ${repeatMode}`}
              >
                {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
              </button>
            </div>

            {/* Time Indicators */}
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 w-full justify-center">
              <span>{formatTime(currentTime)}</span>
              <span className="text-slate-600">/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Controls (Mobile Compact Controls & Desktop Audio Slider) */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            
            {/* Mobile Play / Pause Button */}
            <button
              onClick={togglePlay}
              className="md:hidden w-9 h-9 rounded-full bg-brand-blue text-white flex items-center justify-center shadow-md active:scale-90 transition-transform"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            {/* Mobile Next Button */}
            <button
              onClick={playNext}
              className="md:hidden p-2 text-slate-300 hover:text-white"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Visualizer Trigger */}
            <button
              onClick={() => setIsVisualizerOpen(true)}
              className="p-2 rounded-xl text-slate-300 hover:text-brand-blue hover:bg-white/5 transition-all hidden sm:flex items-center gap-1.5 text-xs font-medium"
              title="Full Screen Visualizer"
            >
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span className="hidden lg:inline">Visualizer</span>
            </button>

            {/* External YouTube Music Link */}
            <a
              href={currentTrack.youtubeMusicUrl || `https://music.youtube.com/search?q=${encodeURIComponent(currentTrack.artist + ' ' + currentTrack.title)}`}
              target="_blank"
              rel="noreferrer"
              title="Open in YouTube Music"
              className="p-1.5 sm:p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors hidden sm:flex items-center gap-1 text-xs font-semibold border border-red-500/20"
            >
              <Play className="w-3 h-3 fill-current" />
              <span className="hidden lg:inline">YT Music</span>
            </a>

            {/* Volume Control */}
            <div className="hidden lg:flex items-center gap-2">
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
                className="w-16 h-1 bg-dark-700 rounded-lg cursor-pointer appearance-none"
              />
            </div>

            {/* Queue Toggle */}
            <button
              onClick={() => setQueueDrawerOpen(!queueDrawerOpen)}
              className={`p-2 rounded-xl border transition-all relative hidden sm:flex ${
                queueDrawerOpen || queue.length > 1
                  ? 'bg-brand-blue/20 border-brand-blue/40 text-brand-blue'
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

      {/* Queue Drawer */}
      {queueDrawerOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setQueueDrawerOpen(false)} />
          <div className="fixed bottom-24 right-4 z-50 w-80 max-h-96 glass-dropdown rounded-3xl p-4 border border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
              <div className="flex items-center gap-2">
                <ListMusic className="w-4 h-4 text-brand-blue" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">Up Next Queue</h3>
              </div>
              <div className="flex items-center gap-1">
                {queue.length > 0 && (
                  <button onClick={clearQueue} className="p-1 text-slate-400 hover:text-red-400" title="Clear">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button onClick={() => setQueueDrawerOpen(false)} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
              {queue.map((t, idx) => (
                <div key={idx} className="p-2 rounded-xl bg-dark-900 border border-white/5 flex items-center justify-between gap-2">
                  <img src={t.artwork} alt={t.title} className="w-8 h-8 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white truncate">{t.title}</p>
                    <p className="text-[10px] text-slate-400 truncate">{t.artist}</p>
                  </div>
                  <button onClick={() => removeFromQueue(idx)} className="text-slate-500 hover:text-red-400">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
};
