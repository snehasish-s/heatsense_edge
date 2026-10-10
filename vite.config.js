import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { offlinePlugin } from './build/offlinePlugin';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  return {
    plugins: [react(), offlinePlugin()],
    server: {
      host: '127.0.0.1',
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: { rollupOptions: { output: { manualChunks: { charts: ['recharts'], motion: ['gsap', 'framer-motion'] } } } },
  };
});
