import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const AudioPlayerContext = createContext();

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
};

export const AudioPlayerProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30); // iTunes previews are 30s
  const [volume, setVolumeState] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off' | 'all' | 'one'
  const [isShuffle, setIsShuffle] = useState(false);
  const [isVisualizerOpen, setIsVisualizerOpen] = useState(false);

  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audioRef.current = audio;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const onEnded = () => {
      handleTrackEnd();
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  // Web Audio Analyser setup
  const setupAudioContext = () => {
    if (!audioRef.current) return;
    if (!audioContextRef.current) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.8;

        const source = ctx.createMediaElementSource(audioRef.current);
        source.connect(analyser);
        analyser.connect(ctx.destination);

        audioContextRef.current = ctx;
        analyserRef.current = analyser;
        sourceRef.current = source;
      } catch (err) {
        // MediaElementAudioSourceNode may fail on cross-origin if headers are strict; visualizer fallback handles this gracefully
        console.log('Web Audio Analyser initialized with fallback');
      }
    } else if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  const playTrack = (track, newQueue = null) => {
    if (!track || !audioRef.current) return;

    setupAudioContext();

    if (newQueue) {
      setQueue(newQueue);
      const index = newQueue.findIndex(t => t.id === track.id || (t.title === track.title && t.artist === track.artist));
      setQueueIndex(index !== -1 ? index : 0);
    } else if (!queue.some(t => t.id === track.id)) {
      setQueue(prev => [...prev, track]);
      if (queueIndex === -1) setQueueIndex(queue.length);
    }

    if (currentTrack?.id === track.id && currentTrack?.previewUrl === track.previewUrl) {
      // Toggle play/pause if same track
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.log('Audio playback prevented:', e));
      }
      return;
    }

    setCurrentTrack(track);
    audioRef.current.src = track.previewUrl || '';
    audioRef.current.currentTime = 0;
    setCurrentTime(0);

    if (track.previewUrl) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => {
          console.warn('Autoplay error:', err);
          setIsPlaying(false);
        });
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return;
    setupAudioContext();

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.log('Playback error:', e));
    }
  };

  const seek = (time) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const setVolume = (val) => {
    if (!audioRef.current) return;
    const clamped = Math.max(0, Math.min(1, val));
    audioRef.current.volume = isMuted ? 0 : clamped;
    setVolumeState(clamped);
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const playNext = () => {
    if (queue.length === 0) return;
    if (repeatMode === 'one' && currentTrack) {
      seek(0);
      audioRef.current?.play();
      return;
    }

    let nextIndex = queueIndex + 1;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else if (nextIndex >= queue.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        setIsPlaying(false);
        return;
      }
    }

    setQueueIndex(nextIndex);
    const nextTrack = queue[nextIndex];
    if (nextTrack) {
      playTrack(nextTrack);
    }
  };

  const playPrevious = () => {
    if (!audioRef.current || queue.length === 0) return;
    if (audioRef.current.currentTime > 3) {
      seek(0);
      return;
    }

    let prevIndex = queueIndex - 1;
    if (prevIndex < 0) {
      prevIndex = queue.length - 1;
    }
    setQueueIndex(prevIndex);
    const prevTrack = queue[prevIndex];
    if (prevTrack) {
      playTrack(prevTrack);
    }
  };

  const handleTrackEnd = () => {
    if (repeatMode === 'one') {
      seek(0);
      audioRef.current?.play();
    } else {
      playNext();
    }
  };

  const addToQueue = (track) => {
    setQueue(prev => [...prev, track]);
  };

  const removeFromQueue = (index) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
    if (queueIndex > index) {
      setQueueIndex(prev => prev - 1);
    }
  };

  const clearQueue = () => {
    setQueue([]);
    setQueueIndex(-1);
  };

  const getFrequencyData = () => {
    if (!analyserRef.current) return null;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);
    return dataArray;
  };

  const value = {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    queue,
    queueIndex,
    repeatMode,
    isShuffle,
    isVisualizerOpen,
    setIsVisualizerOpen,
    playTrack,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    playNext,
    playPrevious,
    addToQueue,
    removeFromQueue,
    clearQueue,
    setRepeatMode,
    setIsShuffle,
    getFrequencyData
  };

  return <AudioPlayerContext.Provider value={value}>{children}</AudioPlayerContext.Provider>;
};
