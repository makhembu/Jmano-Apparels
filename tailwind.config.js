import { createRequire } from 'module';
const require = createRequire(import.meta.url);

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#2E7D32', // Calm green
          light: '#E8F5E9',
          dark: '#1B5E20',
          hope: '#F1C40F',
          testament: '#B96AD9',
          triumph: 'rgb(241,196,15)',
          humility: '#2DC26B',
          patience: '#E03E2D',
          sainty: '#E03E2D'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      }
    }
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
}