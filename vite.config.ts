import { defineConfig } from 'vite';
import typescript from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [typescript()],
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'EditorAIPlugin',
      fileName: (format) => `editor-ai-plugin.${format}.js`,
    },
    rollupOptions: {
      external: ['axios'],
      output: {
        globals: {
          axios: 'axios',
        },
      },
    },
  },
});
