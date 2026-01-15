import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Determine base path based on environment variable
// For local MAMP testing: VITE_BASE_PATH=/reactMocks/
// For production: VITE_BASE_PATH=/mocks/ (or leave unset, defaults to /mocks/)
const basePath = process.env.VITE_BASE_PATH || '/mocks/';

export default defineConfig({
  // Base path for assets and routing
  // Set via VITE_BASE_PATH env var, defaults to /mocks/ for production
  base: basePath,
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true
  }
});
