// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // İstemci tarafında process.env üzerinden erişmek istiyorsanız
    'process.env': {
      VITE_BOT_TOKEN: JSON.stringify(process.env.VITE_BOT_TOKEN || 'default_token_if_not_defined')
    }
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
});
