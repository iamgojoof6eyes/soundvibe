# 🤝 Contributing to SoundVibe

We welcome contributions from developers, designers, and music enthusiasts! Follow these steps to contribute to **SoundVibe**.

---

## 🛠️ Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Jatin-nicon/soundvibe.git
   cd soundvibe
   ```

2. **Install dependencies**:
   ```bash
   # Install root and server dependencies
   npm install

   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

3. **Start the development server**:
   ```bash
   # Runs backend on port 5000 and client on port 3000
   npm run dev
   ```

4. **Build the production bundle**:
   ```bash
   cd client
   npm run build
   ```

---

## 🌿 Branching & Git Workflow

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes and test locally at `http://localhost:5000`.
3. Commit with standard semantic messages:
   - `feat: Add user badge component`
   - `fix: Resolve comment timestamp format`
   - `docs: Update API documentation`
4. Push your branch and open a Pull Request against `main`.

---

## 🎨 Code Style Guidelines
- **React**: Functional components with hooks (`useState`, `useEffect`, `useContext`).
- **Tailwind CSS**: Use consistent utility classes and glassmorphism design tokens (`glass-panel`, `glass-dropdown`, `brand-blue`).
- **Icons**: Use `lucide-react` icons.
- **Firebase / Firestore**: Keep mutations safe with atomic operations (`arrayUnion`, `arrayRemove`).
