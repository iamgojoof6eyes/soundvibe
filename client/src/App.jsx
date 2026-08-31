import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AudioPlayerProvider } from './context/AudioPlayerContext';
import { Navbar } from './components/Navbar';
import { Feed } from './components/Feed';
import { ListeningLounge } from './components/ListeningLounge';
import { TasteMatcher } from './components/TasteMatcher';
import { TasteProfile } from './components/TasteProfile';
import { TrendingMusic } from './components/TrendingMusic';
import { PlayerBar } from './components/PlayerBar';
import { AudioVisualizerModal } from './components/AudioVisualizerModal';
import { CreatePostModal } from './components/CreatePostModal';
import { AuthModal } from './components/AuthModal';
import { EditProfileModal } from './components/EditProfileModal';

function MainApp() {
  const { user } = useAuth();
  
  // Navigation State
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'lounges' | 'taste-match' | 'trending' | 'profile'
  const [viewingProfileUserId, setViewingProfileUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [preSelectedTrack, setPreSelectedTrack] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  const handleOpenCreatePostWithTrack = (track) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    setPreSelectedTrack(track);
    setCreatePostOpen(true);
  };

  const handleOpenProfile = (userId) => {
    setViewingProfileUserId(userId);
    setActiveTab('profile');
  };

  const handleSearchFocus = (query) => {
    setSearchQuery(query);
    setActiveTab('trending');
  };

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col selection:bg-brand-purple/30 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'profile') setViewingProfileUserId(null);
        }}
        onOpenCreatePost={() => {
          if (!user) setAuthModalOpen(true);
          else {
            setPreSelectedTrack(null);
            setCreatePostOpen(true);
          }
        }}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenProfile={(uid) => handleOpenProfile(uid)}
        onSearchFocus={handleSearchFocus}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        {activeTab === 'feed' && (
          <Feed
            onOpenCreatePost={() => {
              if (!user) setAuthModalOpen(true);
              else {
                setPreSelectedTrack(null);
                setCreatePostOpen(true);
              }
            }}
            onOpenProfile={handleOpenProfile}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {activeTab === 'lounges' && (
          <ListeningLounge onOpenAuth={() => setAuthModalOpen(true)} />
        )}

        {activeTab === 'taste-match' && (
          <TasteMatcher
            onOpenAuth={() => setAuthModalOpen(true)}
            onOpenProfile={handleOpenProfile}
          />
        )}

        {activeTab === 'trending' && (
          <TrendingMusic
            initialSearchQuery={searchQuery}
            onShareTrack={handleOpenCreatePostWithTrack}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {activeTab === 'profile' && (
          <TasteProfile
            userId={viewingProfileUserId || user?.id}
            onBack={() => setActiveTab('feed')}
            onOpenAuth={() => setAuthModalOpen(true)}
            onOpenCreatePost={() => {
              setPreSelectedTrack(null);
              setCreatePostOpen(true);
            }}
            onOpenEditProfile={() => setEditProfileOpen(true)}
          />
        )}
      </main>

      {/* Modals & Persistent Overlays */}
      <PlayerBar />
      <AudioVisualizerModal />
      
      <CreatePostModal
        isOpen={createPostOpen}
        onClose={() => {
          setCreatePostOpen(false);
          setPreSelectedTrack(null);
        }}
        initialTrack={preSelectedTrack}
        onPostCreated={(newPost) => {
          setActiveTab('feed');
        }}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <EditProfileModal
        isOpen={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AudioPlayerProvider>
        <MainApp />
      </AudioPlayerProvider>
    </AuthProvider>
  );
}
