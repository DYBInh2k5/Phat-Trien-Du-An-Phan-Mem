/**
 * Cấu hình Vite & Vitest cho Frontend ứng dụng Quản lý Lớp học THPT.
 * Vị trí: members/member2_Frontend/vite.config.js
 * Mục đích: Thiết lập môi trường bundle React và cấu hình runner kiểm thử jsdom.
 */
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {                // áp dụng cho `vite` / `npm run dev`
    port: 5173,
    strictPort: true,
  },
  preview: {               // áp dụng cho `vite preview` / `npm start`
    port: 5173,
    strictPort: true,
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/xlsx')) {
            return 'vendor-xlsx';
          }
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'vendor-react';
          }
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.js'],
  },
});
