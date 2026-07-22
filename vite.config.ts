import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
      '@/components': path.resolve(process.cwd(), 'src/components'),
      '@/config': path.resolve(process.cwd(), 'src/config'),
      '@/constants': path.resolve(process.cwd(), 'src/constants'),
      '@/hooks': path.resolve(process.cwd(), 'src/hooks'),
      '@/layouts': path.resolve(process.cwd(), 'src/layouts'),
      '@/lib': path.resolve(process.cwd(), 'src/lib'),
      '@/pages': path.resolve(process.cwd(), 'src/pages'),
      '@/providers': path.resolve(process.cwd(), 'src/providers'),
      '@/routes': path.resolve(process.cwd(), 'src/routes'),
      '@/store': path.resolve(process.cwd(), 'src/store'),
      '@/styles': path.resolve(process.cwd(), 'src/styles'),
      '@/types': path.resolve(process.cwd(), 'src/types'),
      '@/utils': path.resolve(process.cwd(), 'src/utils'),
    },
  },
  server: {
    port: 5173,
  },
});
