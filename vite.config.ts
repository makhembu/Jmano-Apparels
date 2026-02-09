import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'fs';

// Read version from package.json at build time
const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));

// Custom plugin to remove Dev-only scripts (Tailwind CDN, Importmaps) in production
const removeDevScripts = () => {
  return {
    name: 'remove-dev-scripts',
    transformIndexHtml(html, { command }) {
      if (command === 'build') {
        // 1. Remove Tailwind CDN (We use the build step for CSS)
        html = html.replace(/<script id="tailwind-cdn"[\s\S]*?<\/script>/gi, '')
                   .replace(/<script id="tailwind-config"[\s\S]*?<\/script>/gi, '');
        
        // 2. Remove Importmap (We use bundled node_modules in production)
        // This prevents version conflicts (e.g. React 19 vs 18) and double-loading.
        html = html.replace(/<script type="importmap"[\s\S]*?<\/script>/gi, '');
        
        return html;
      }
      // In dev (Sandbox), keep them for immediate feedback if node_modules aren't fully utilized by the environment.
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
    removeDevScripts()
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
          // Core React dependencies - Keep these together for efficient caching
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Utilities - Lightweight enough to keep global
          // REMOVED 'clsx' and 'tailwind-merge' as they are not in package.json dependencies
          'vendor-utils': ['uuid', 'dompurify'],
          // Database - Core app requirement
          'supabase': ['@supabase/supabase-js'],
          
          // NOTE: 'recharts', '@google/genai', 'react-markdown', and editors 
          // are intentionally removed from manualChunks. 
          // Vite will now automatically split them into the lazy-loaded chunks 
          // (AdminDashboard, Copilot, etc.) where they are actually imported.
          // This massively reduces the Homepage FCP/LCP.
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
});