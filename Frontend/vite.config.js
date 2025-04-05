import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// DO NOT import any CSS or JSX here
export default defineConfig({
  plugins: [react()],
});
