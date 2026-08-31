# 🎵 SoundVibe - Social Music Taste & Community Discovery WebApp

**SoundVibe** is a social web application designed for music lovers to share their music taste, review tracks and albums, listen to audio previews with an interactive visualizer, and connect through discussions, taste compatibility matching, and live listening rooms.

---

## ✨ Key Features

1. **🔥 Social Vibe Feed**:
   - Share track & album reviews with custom star ratings (1-5 ⭐), mood selectors, standout lyric quotes, and clickable vibe tags (e.g. `#MidnightDrive`, `#HeavyRotation`, `#HiddenGem`).
   - 6 Interactive Emoji Reactions (`🔥 Fire`, `🌊 Vibe`, `❤️ Love`, `🔁 On Repeat`, `🧠 Mindblown`, `😴 Overrated`).
   - Deep discussion comment threads with replies and likes.
   - Filter feed by *All Vibes*, *Following*, *Trending*, *Top Rated*, or genre pills.

2. **🎧 Global Persistent Audio Player & Sound Visualizer**:
   - Docked bottom player with timeline scrubbing, volume, queue management, repeat/shuffle, and preview audio streaming.
   - Fullscreen / expanded Canvas Audio Waveform Visualizer featuring a glowing, spinning vinyl disc and real-time frequency bars.

3. **⚡ Music Taste Compatibility Matcher**:
   - 1-on-1 Sonic Frequency Analyzer comparing your musical taste against other community members.
   - Calculates a Vibe Compatibility percentage (e.g., *94% Sonic Soulmates*).
   - Highlights shared musical affinities and recommends tracks from the other person's favorite albums.

4. **📻 Live Collaborative Listening Lounges**:
   - Themed virtual rooms (*Midnight Lofi Sanctuary*, *Neon Synthwave Arcade*, *Indie Attic & Dreamland*).
   - Shared jukebox queue where listeners propose songs and vote on what plays next.
   - Real-time room chat to discuss songs live.

5. **🔍 Global Music Search & Discovery**:
   - Live integration with iTunes Search API to search millions of tracks worldwide.
   - Instant 30-second high-fidelity audio previews with single-click "Drop Review" trigger.
   - Direct streaming links to Spotify and YouTube.

6. **👤 Taste Profiles & Desert Island Discs**:
   - Customize your Top 4 Heavy Rotation albums/tracks of all time.
   - Music Bio, badges (*Crate Digger*, *Synth Wizard*, *Top Curator*), and genre breakdown.
   - Fast 1-click persona switcher (Aria, Marcus, Elena, Devon, Sora) or instant custom profile creation with zero friction!

---

## 🚀 Quick Start & How to Run

The app is located at:
`C:\Users\jatin\.gemini\antigravity\scratch\soundvibe`

### 1. Launch the Server (Frontend + API Backend)
```bash
cd C:\Users\jatin\.gemini\antigravity\scratch\soundvibe
npm start
```
Then open your browser at **http://localhost:5000**.

### 2. (Optional) Run with Live Hot-Reload Dev Servers
- **Backend API**:
  ```bash
  npm run dev:server
  ```
  Runs on `http://localhost:5000`.

- **Frontend Vite Client**:
  ```bash
  npm run dev:client
  ```
  Runs on `http://localhost:3000` (proxies API requests to port 5000).

---

## 🛠️ Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Canvas-Confetti, Web Audio API Canvas Visualizer.
- **Backend**: Node.js, Express, REST API, JSON/SQLite persistence with seed catalog, iTunes Search API proxy.
