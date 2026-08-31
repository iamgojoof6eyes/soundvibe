import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { 
  Headphones, 
  Users, 
  MessageSquare, 
  Play, 
  Pause, 
  Plus, 
  ThumbsUp, 
  Send, 
  Sparkles, 
  Radio, 
  Disc3,
  Search,
  Check
} from 'lucide-react';

export const ListeningLounge = ({ onOpenAuth }) => {
  const { user, token } = useAuth();
  const { currentTrack, isPlaying, playTrack } = useAudioPlayer();

  const [lounges, setLounges] = useState([]);
  const [activeLoungeId, setActiveLoungeId] = useState(null);
  const [loungeData, setLoungeData] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(true);

  // Track proposing modal state
  const [proposeModalOpen, setProposeModalOpen] = useState(false);
  const [trackSearchQuery, setTrackSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Fetch Lounges list
  const fetchLounges = async () => {
    try {
      const res = await fetch('/api/lounges');
      const data = await res.json();
      setLounges(data.lounges || []);
      if (data.lounges?.length > 0 && !activeLoungeId) {
        setActiveLoungeId(data.lounges[0].id);
      }
    } catch (err) {
      console.error('Error fetching lounges:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch active lounge data
  const fetchActiveLounge = async () => {
    if (!activeLoungeId) return;
    try {
      const res = await fetch(`/api/lounges/${activeLoungeId}`);
      const data = await res.json();
      setLoungeData(data.lounge);
    } catch (err) {
      console.error('Error fetching lounge:', err);
    }
  };

  useEffect(() => {
    fetchLounges();
  }, []);

  useEffect(() => {
    fetchActiveLounge();
    const interval = setInterval(fetchActiveLounge, 4000); // Polling for live chat updates
    return () => clearInterval(interval);
  }, [activeLoungeId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }
    if (!chatInput.trim()) return;

    try {
      const res = await fetch(`/api/lounges/${activeLoungeId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text: chatInput.trim() })
      });
      const data = await res.json();
      if (data.message) {
        setLoungeData(prev => ({
          ...prev,
          messages: [...(prev.messages || []), data.message]
        }));
        setChatInput('');
      }
    } catch (err) {
      console.error('Chat error:', err);
    }
  };

  const handleTrackSearch = async (e) => {
    e.preventDefault();
    if (!trackSearchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/music/search?q=${encodeURIComponent(trackSearchQuery.trim())}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleProposeTrack = async (track) => {
    if (!user) {
      onOpenAuth();
      return;
    }
    try {
      const res = await fetch(`/api/lounges/${activeLoungeId}/queue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ track })
      });
      const data = await res.json();
      if (data.queueItem) {
        setLoungeData(prev => ({
          ...prev,
          queue: [...(prev.queue || []), data.queueItem]
        }));
        setProposeModalOpen(false);
        setTrackSearchQuery('');
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Propose error:', err);
    }
  };

  const handleVoteTrack = async (queueId) => {
    if (!user) {
      onOpenAuth();
      return;
    }
    try {
      const res = await fetch(`/api/lounges/${activeLoungeId}/queue/${queueId}/vote`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.queue) {
        setLoungeData(prev => ({ ...prev, queue: data.queue }));
      }
    } catch (err) {
      console.error('Vote error:', err);
    }
  };

  const handleTuneIn = () => {
    if (loungeData?.currentTrack) {
      playTrack(loungeData.currentTrack);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <Headphones className="w-10 h-10 text-brand-cyan animate-pulse mx-auto" />
        <p className="text-xs text-slate-400">Connecting to live listening lounges...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-28 max-w-6xl mx-auto">
      
      {/* Lounge Selector Header */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-brand-cyan/20 via-brand-purple/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-cyan/20 border border-brand-cyan/30 text-brand-cyan text-xs font-semibold">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>Live Collaborative Listening</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
                Virtual Music Lounges
              </h1>
              <p className="text-xs sm:text-sm text-slate-300">
                Hang out in themed audio rooms, propose tracks to the shared queue, and chat in real-time.
              </p>
            </div>

            {/* Room Tabs */}
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {lounges.map((l) => {
                const isActive = activeLoungeId === l.id;
                return (
                  <button
                    key={l.id}
                    onClick={() => setActiveLoungeId(l.id)}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                      isActive
                        ? 'bg-gradient-to-r from-brand-cyan to-brand-purple text-white shadow-lg shadow-brand-cyan/20'
                        : 'bg-dark-900/90 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    <span>{l.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
                      {l.activeListeners} 🎧
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Lounge Arena: Split View (Now Playing + Shared Queue & Live Chat) */}
      {loungeData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Now Playing & Jukebox Queue (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Now Playing Banner */}
            <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-white/10 relative overflow-hidden">
              <div className="flex items-center justify-between gap-4 mb-4">
                <span className="text-xs font-bold text-brand-cyan uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-brand-cyan animate-ping" />
                  Currently Spinning in Lounge
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {loungeData.activeListeners} Listeners Tuned In
                </span>
              </div>

              {loungeData.currentTrack ? (
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="relative group shrink-0">
                    <img
                      src={loungeData.currentTrack.artwork}
                      alt={loungeData.currentTrack.title}
                      className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover ring-2 ring-brand-cyan/40 shadow-2xl"
                    />
                    <button
                      onClick={handleTuneIn}
                      className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center text-white opacity-90 group-hover:opacity-100 transition-opacity"
                    >
                      {currentTrack?.id === loungeData.currentTrack.id && isPlaying ? (
                        <Pause className="w-8 h-8 fill-current text-brand-cyan" />
                      ) : (
                        <Play className="w-8 h-8 fill-current text-brand-cyan ml-1" />
                      )}
                    </button>
                  </div>

                  <div className="space-y-1.5 text-center sm:text-left flex-1 min-w-0">
                    <h2 className="text-xl sm:text-2xl font-bold font-display text-white truncate">
                      {loungeData.currentTrack.title}
                    </h2>
                    <p className="text-sm text-slate-300 font-medium truncate">
                      {loungeData.currentTrack.artist}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {loungeData.currentTrack.album}
                    </p>
                    <p className="text-[11px] text-brand-purple pt-1">
                      Suggested by: <span className="font-semibold text-slate-200">{loungeData.currentTrack.suggestedBy || 'Community'}</span>
                    </p>
                  </div>

                  <button
                    onClick={handleTuneIn}
                    className="px-5 py-3 rounded-2xl bg-brand-cyan hover:bg-cyan-400 text-dark-950 font-bold text-xs shadow-lg shadow-brand-cyan/25 transition-all flex items-center gap-2 shrink-0"
                  >
                    <Headphones className="w-4 h-4" />
                    <span>{currentTrack?.id === loungeData.currentTrack.id && isPlaying ? 'Listening Live' : 'Tune In Sync'}</span>
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-4">No track playing. Propose one to start the party!</p>
              )}
            </div>

            {/* Jukebox Up-Next Queue */}
            <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Disc3 className="w-5 h-5 text-brand-purple" />
                  <h3 className="text-base font-bold font-display text-white">
                    Up Next in Shared Jukebox ({(loungeData.queue || []).length})
                  </h3>
                </div>
                <button
                  onClick={() => {
                    if (!user) onOpenAuth();
                    else setProposeModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-purple/20 text-brand-purple border border-brand-purple/30 hover:bg-brand-purple hover:text-white text-xs font-semibold transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Propose Track</span>
                </button>
              </div>

              {/* Queue List */}
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {(loungeData.queue || []).length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    The queue is open! Propose a song you want everyone in the room to hear.
                  </div>
                ) : (
                  loungeData.queue.map((item, idx) => {
                    const hasVoted = user && (item.voters || []).includes(user.id);
                    return (
                      <div
                        key={item.id || idx}
                        className="p-3 rounded-2xl bg-dark-900/80 border border-white/5 flex items-center justify-between gap-3 hover:border-white/15 transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="font-mono text-xs font-bold text-slate-500 w-4 text-center">
                            #{idx + 1}
                          </span>
                          <img src={item.artwork} alt={item.title} className="w-11 h-11 rounded-xl object-cover shadow" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-white truncate">{item.title}</p>
                            <p className="text-[11px] text-slate-400 truncate">{item.artist}</p>
                            <p className="text-[10px] text-slate-500">By {item.suggestedBy}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleVoteTrack(item.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              hasVoted
                                ? 'bg-brand-purple text-white shadow-md shadow-brand-purple/30'
                                : 'bg-white/5 text-slate-300 hover:bg-white/10'
                            }`}
                            title="Upvote track to play sooner"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span className="font-mono">{item.votes || 0}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Live Room Chat */}
          <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-white/10 flex flex-col h-[560px]">
            
            <div className="pb-3 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-brand-pink" />
                <h3 className="text-sm font-bold text-white font-display">Lounge Chat</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Live</span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
              {(loungeData.messages || []).map((msg) => (
                <div key={msg.id} className="flex items-start gap-2.5 text-xs">
                  <img src={msg.avatar} alt={msg.name} className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1 bg-dark-900/80 p-2.5 rounded-2xl border border-white/5">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-bold text-white truncate">{msg.name}</span>
                      <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed break-words">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="pt-3 border-t border-white/5 flex gap-2">
              <input
                type="text"
                placeholder={user ? "Send a thought in room..." : "Sign in to chat"}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={!user}
                className="flex-1 bg-dark-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan"
              />
              <button
                type="submit"
                disabled={!user || !chatInput.trim()}
                className="p-2.5 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple text-dark-950 font-bold shadow-md disabled:opacity-50 transition-all flex items-center justify-center"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </form>

          </div>

        </div>
      )}

      {/* Propose Track Modal */}
      {proposeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl">
            <h3 className="text-lg font-bold text-white font-display mb-1">Propose a Track to Queue</h3>
            <p className="text-xs text-slate-400 mb-4">Search any track to drop into the shared room jukebox</p>

            <form onSubmit={handleTrackSearch} className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Song or artist name..."
                value={trackSearchQuery}
                onChange={(e) => setTrackSearchQuery(e.target.value)}
                className="flex-1 bg-dark-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-purple"
              />
              <button
                type="submit"
                disabled={searching}
                className="px-4 py-2 rounded-xl bg-brand-purple text-white text-xs font-bold shadow"
              >
                {searching ? '...' : 'Search'}
              </button>
            </form>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1 mb-4">
              {searchResults.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-3 p-2 rounded-xl bg-dark-900 hover:bg-dark-850 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={t.artwork} alt={t.title} className="w-9 h-9 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <p className="font-bold text-white truncate">{t.title}</p>
                      <p className="text-[10px] text-slate-400 truncate">{t.artist}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleProposeTrack(t)}
                    className="px-3 py-1.5 rounded-lg bg-brand-cyan/20 text-brand-cyan hover:bg-brand-cyan hover:text-dark-950 font-bold transition-all text-xs shrink-0"
                  >
                    + Add to Queue
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setProposeModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-semibold transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
