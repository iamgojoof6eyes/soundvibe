import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AudioPlayerProvider } from './context/AudioPlayerContext';
import { Navbar } from './components/Navbar';
import { FeedPage } from './pages/FeedPage';
import { FollowingPage } from './pages/FollowingPage';
import { ProfilePage } from './pages/ProfilePage';
import { PostDetailPage } from './pages/PostDetailPage';
import { CreatePostPage } from './pages/CreatePostPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PlayerBar } from './components/PlayerBar';
import { AudioVisualizerModal } from './components/AudioVisualizerModal';

function AppContent() {
  useEffect(() => {
    try {
      localStorage.removeItem('soundvibe_cached_posts');
    } catch (e) {}
  }, []);

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col selection:bg-brand-purple/30 selection:text-white">
      {/* Persistent Multi-Page Navigation Header */}
      <Navbar />

      {/* Main Multi-Page Routed Views */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        <Routes>
          <Route path="/" element={<FeedPage />} />
          <Route path="/feed" element={<Navigate to="/" replace />} />
          <Route path="/following" element={<FollowingPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/post/:id" element={<PostDetailPage />} />
          <Route path="/vibe/:id" element={<PostDetailPage />} />
          <Route path="/drop-vibe" element={<CreatePostPage />} />
          <Route path="/create" element={<Navigate to="/drop-vibe" replace />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/edit-profile" element={<Navigate to="/settings" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Persistent Audio Player & Visualizer across page navigations */}
      <PlayerBar />
      <AudioVisualizerModal />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AudioPlayerProvider>
          <AppContent />
        </AudioPlayerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
