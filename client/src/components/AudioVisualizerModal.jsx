import React, { useEffect, useRef } from 'react';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { X, Play, Pause, SkipBack, SkipForward, Disc3, Volume2, Sparkles } from 'lucide-react';

export const AudioVisualizerModal = () => {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    playNext, 
    playPrevious, 
    currentTime, 
    duration, 
    seek, 
    isVisualizerOpen, 
    setIsVisualizerOpen,
    getFrequencyData
  } = useAudioPlayer();

  const canvasRef = useRef(null);

  useEffect(() => {
    if (!isVisualizerOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;

      const freqData = getFrequencyData();

      // Number of visualizer bars
      const numBars = 48;
      const barWidth = (width / numBars) - 3;

      for (let i = 0; i < numBars; i++) {
        let barHeight = 0;
        if (isPlaying) {
          if (freqData && freqData.length > 0) {
            const dataIndex = Math.floor((i / numBars) * freqData.length);
            barHeight = (freqData[dataIndex] / 255) * (height * 0.75);
          } else {
            // Procedural lively fallback wave
            const t = Date.now() / 300;
            const sine = Math.sin(i * 0.25 + t) * Math.cos(i * 0.1 - t);
            barHeight = Math.abs(sine) * (height * 0.6) + 15;
          }
        } else {
          barHeight = 4;
        }

        const x = i * (barWidth + 3);
        const y = height - barHeight;

        // Gradient color for bars (Purple -> Pink -> Cyan)
        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, '#8b5cf6');
        gradient.addColorStop(0.5, '#ec4899');
        gradient.addColorStop(1, '#06b6d4');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isVisualizerOpen, isPlaying, getFrequencyData]);

  if (!isVisualizerOpen || !currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-dark-950/90 backdrop-blur-2xl animate-in fade-in duration-200">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-purple/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-pink/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Close button */}
      <button
        onClick={() => setIsVisualizerOpen(false)}
        className="absolute top-6 right-6 p-3 text-slate-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all z-10"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="w-full max-w-2xl flex flex-col items-center text-center relative z-10">
        
        {/* Vinyl Record Player Artwork */}
        <div className="relative mb-8 group">
          {/* Vinyl Disc Body */}
          <div className={`w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-dark-900 border-4 border-dark-800 shadow-2xl flex items-center justify-center relative overflow-hidden ${
            isPlaying ? 'animate-spin-slow' : ''
          }`}>
            {/* Vinyl grooves */}
            <div className="absolute inset-2 rounded-full border border-white/5 pointer-events-none" />
            <div className="absolute inset-6 rounded-full border border-white/5 pointer-events-none" />
            <div className="absolute inset-10 rounded-full border border-white/5 pointer-events-none" />
            <div className="absolute inset-14 rounded-full border border-white/5 pointer-events-none" />
            
            {/* Center Album Art */}
            <img
              src={currentTrack.artwork}
              alt={currentTrack.title}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover shadow-inner ring-4 ring-dark-950"
            />
            {/* Spindle hole */}
            <div className="absolute w-4 h-4 rounded-full bg-dark-950 ring-2 ring-white/10" />
          </div>

          {/* Glow ring */}
          <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-brand-purple to-brand-pink opacity-20 blur-xl -z-10 group-hover:opacity-40 transition-opacity" />
        </div>

        {/* Track Details */}
        <div className="mb-6 space-y-1.5 max-w-md">
          <div className="flex items-center justify-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-purple/20 text-brand-purple border border-brand-purple/30">
              {currentTrack.genre || 'SoundVibe Spin'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white truncate px-4">
            {currentTrack.title}
          </h2>
          <p className="text-base text-slate-300 font-medium truncate">
            {currentTrack.artist}
          </p>
          {currentTrack.album && (
            <p className="text-xs text-slate-500 truncate">
              {currentTrack.album}
            </p>
          )}
        </div>

        {/* Real-time Frequency Visualizer Canvas */}
        <div className="w-full h-24 sm:h-28 max-w-lg mb-6 relative">
          <canvas
            ref={canvasRef}
            width={500}
            height={100}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Scrubber */}
        <div className="w-full max-w-md space-y-1.5 mb-6">
          <div 
            className="relative w-full h-2 bg-dark-800 rounded-full cursor-pointer overflow-hidden group"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              seek(pos * duration);
            }}
          >
            <div 
              className="h-full bg-gradient-to-r from-brand-violet via-brand-purple to-brand-pink rounded-full transition-all duration-75"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-6">
          <button
            onClick={playPrevious}
            className="p-3 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-all"
          >
            <SkipBack className="w-6 h-6" />
          </button>

          <button
            onClick={togglePlay}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-brand-violet via-brand-purple to-brand-pink text-white flex items-center justify-center shadow-xl shadow-brand-purple/40 hover:scale-105 active:scale-95 transition-all"
          >
            {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-0.5" />}
          </button>

          <button
            onClick={playNext}
            className="p-3 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-all"
          >
            <SkipForward className="w-6 h-6" />
          </button>
        </div>

      </div>
    </div>
  );
};
