import { fileURLToPath, URL } from 'url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import BackendConfig from "./backend.config";

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3301,
    proxy: {
      '/api': {
        target: BackendConfig.BASIC_URL,
        changeOrigin: true,
      }
    }
  }
})
