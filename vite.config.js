import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/device-api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8000',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/device-api/, ''),
        },
      },
    },
    build: { rollupOptions: { output: { manualChunks: { charts: ['recharts'], motion: ['gsap', 'framer-motion'] } } } },
  };
});
