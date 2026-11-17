import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build` gera um único dist/index.html, fácil de enviar aos sócios.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
});
