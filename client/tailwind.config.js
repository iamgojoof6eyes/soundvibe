/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#000000', // Pure Twitter True Black
          900: '#0b0f15', // Twitter Dark Surface
          850: '#121820', // Twitter Dim Panel
          800: '#1b232e', // Twitter Elevated Surface
          700: '#273340', // Twitter Border Line
          600: '#38444d', // Twitter Muted Text / Outline
        },
        brand: {
          blue: '#1d9bf0',    // Signature Twitter Blue
          sky: '#38bdf8',     // Electric Sky
          purple: '#1d9bf0',  // Mapped to Twitter Blue for primary actions
          violet: '#0284c7',  // Deep Ocean Blue gradient
          fuchsia: '#f91880', // Twitter Heart Pink
          pink: '#f91880',    // Twitter Like Pink
          cyan: '#00ba7c',    // Twitter Echo Green
          emerald: '#00ba7c', // Retweet / Spotify Green
          amber: '#ffd400',   // Verified Gold / Star Rating
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Space Grotesk', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
        'wave': 'wave 1.2s ease-in-out infinite',
      },
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%': { transform: 'scaleY(1)' },
        }
      }
    },
  },
  plugins: [],
}
