import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'

// No need to import tailwindcss here anymore

export default defineConfig({
  plugins: [
    react(), tailwindcss(),

  ],

  server: {
    proxy: {
      '/api': 'http://localhost:5001',  // Proxy API requests to your backend
    },
  },

});
