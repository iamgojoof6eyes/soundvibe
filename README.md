# 🎵 SoundVibe — Social Music Discovery & Community Taste Hub

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/Vite-6.4-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Firebase-Firestore-FFCA28?logo=firebase&logoColor=black" alt="Firebase Firestore" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License MIT" />
  <img src="https://img.shields.io/badge/Deployment-Render-46E3B7?logo=render&logoColor=white" alt="Render Deployment" />
</p>

> **SoundVibe** is a social music taste discovery platform that enables music lovers to review tracks, compare sonic compatibility, preview songs in real time with interactive audio visualizers, and connect through deep taste-driven community discussions.

🔗 **Live Application**: [https://soundvibe-2pdf.onrender.com/](https://soundvibe-2pdf.onrender.com/)  
📂 **GitHub Repository**: [https://github.com/Jatin-nicon/soundvibe](https://github.com/Jatin-nicon/soundvibe)

---

## 📚 Documentation Index

- 📖 **[Project Specification & Architecture (`PROJECT.md`)](./PROJECT.md)** — In-depth architectural blueprint, schemas, and design philosophy.
- 📡 **[API & Endpoint Reference (`API.md`)](./API.md)** — Complete Express REST endpoints and Firestore interfaces.
- 🤝 **[Contribution Guidelines (`CONTRIBUTING.md`)](./CONTRIBUTING.md)** — Setup instructions, git workflow, and coding conventions.

---

## ✨ Key Features

1. **🔥 Social Vibe Feed**:
   - Share track reviews with 1–5 ⭐ ratings, mood tags, favorite lyric highlights, and `#vibeTags`.
   - 6 Interactive Emoji Reactions (`🔥 Fire`, `🌊 Vibe`, `❤️ Love`, `🔁 On Repeat`, `🧠 Mindblown`, `😴 Overrated`).
   - Real-time comment threads with inline editing and delete confirmation.
   - Filter feed by *All Vibes*, *Following*, *Trending*, or *Top Rated*.

2. **🎧 Global Persistent Audio Player & Sound Visualizer**:
   - Docked bottom player with timeline scrubbing, volume control, queue management, and preview streaming.
   - Real-time Canvas Audio Waveform Visualizer featuring a glowing spinning vinyl disc.

3. **🔍 Multi-Category Search & Discovery Hub**:
   - Dedicated search hub (`/search?q=...&type=...`) with category tabs for **All**, **Songs & Tracks**, **Curators & Users**, **Vibe Reviews**, and **Vibe Tags**.
   - Search by `@username` or display name to discover creators and follow them in 1 click.
   - Live autocomplete dropdown directly in the navigation bar.

4. **⚡ Music Taste Compatibility Matcher**:
   - 1-on-1 Sonic Frequency Analyzer comparing your musical taste against other community members.
   - Calculates a Vibe Compatibility percentage (e.g., *94% Sonic Soulmates*).

5. **👤 Taste Profiles & Community Network**:
   - Customize your Top 4 Heavy Rotation Desert Island discs.
   - Interactive Followers and Following network popup with direct profile navigation.

---

## 🚀 Quick Start & How to Run

### 1. Launch Server & Client (Unified)
```bash
npm install
npm start
```
Open your browser at **[http://localhost:5000](http://localhost:5000)**.

### 2. Development Mode (Hot Reload)
- **Backend API**:
  ```bash
  npm run dev:server
  ```
- **Frontend Vite Client**:
  ```bash
  npm run dev:client
  ```

---

## 🛠️ Tech Stack
- **Frontend**: React 18, Vite, React Router v6, Tailwind CSS, Lucide Icons, Web Audio API Canvas Visualizer.
- **Backend**: Node.js, Express, REST API, iTunes Search API proxy.
- **Database**: Google Cloud Firestore (`users`, `posts` collections) with local mock database fallback.

