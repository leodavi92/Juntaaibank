import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173, // Porta alternativa comum para Vite
    strictPort: true,
    open: true // Abre automaticamente no navegador
  }
});