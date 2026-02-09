import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'fs';

// Read version from package.json at build time
const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));

// Custom plugin to remove Tailwind CDN in production builds (Hybrid Approach)
const removeTailwindCDN = () => {
  return {
    name: 'remove-tailwind-cdn',
    transformIndexHtml(html, { command }) {
      if (command === 'build') {
        // In production (Vercel), remove the CDN script.
        // The build process will generate standard CSS via postcss.
        return html.replace(/<script id="tailwind-cdn".*?<\/script>/gs, '')
                   .replace(/<script id="tailwind-config".*?<\/script>/gs, '');
      }
      // In dev (Sandbox), keep it for immediate feedback.
      return html;
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    // Inject the version into the client environment
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(packageJson.version),
  },
  plugins: [
    react(),
    removeTailwindCDN()
  ],
  build: {
    target: 'esnext',
    minify: 'esbuild', // esbuild is faster and provides good minification
    cssCodeSplit: true,
    emptyOutDir: true, // Clean the output directory before building
    sourcemap: false,   // Disable source maps for production to reduce build size artifacts
    rollupOptions: {
      output: {
        // Force new filenames on each build to break cache
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`,
        manualChunks: {
          // Core React dependencies
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // UI Libraries
          'vendor-ui': ['recharts', 'react-lazy-load-image-component'],
          // Utilities
          'vendor-utils': ['uuid', 'dompurify', 'react-markdown', 'remark-gfm'],
          // Backend/API
          'supabase': ['@supabase/supabase-js'],
          // AI
          'ai-sdk': ['@google/genai']
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
});