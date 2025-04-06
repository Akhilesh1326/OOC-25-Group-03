import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// DO NOT import any CSS or JSX here
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8000', // Adjust the port to match your Node.js backend
    },
  },
});
