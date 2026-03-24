import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const envDir = '../';
  const env = loadEnv(mode, envDir, '');

  return {
    plugins: [react()],
    envDir,
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET || 'http://localhost:4000',
          changeOrigin: true
        }
      }
    },
    preview: {
      host: '0.0.0.0',
      port: 4173
    }
  };
});
