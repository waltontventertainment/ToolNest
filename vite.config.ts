import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {viteSingleFile} from 'vite-plugin-singlefile';

export default defineConfig(() => {
  const isSingleFile = process.env.BUILD_SINGLEFILE === 'true';
  return {
    // Use root-relative '/' base for web & Cloudflare Pages so sub-routes/root-level tool refreshes
    // always load /assets/* from root instead of relative sub-paths (fixes White Screen on refresh).
    base: isSingleFile ? './' : '/',
    publicDir: 'public',
    plugins: [
      react(),
      tailwindcss(),
      ...(isSingleFile ? [viteSingleFile()] : []),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      copyPublicDir: true,
      rollupOptions: {
        input: isSingleFile
          ? { main: path.resolve(__dirname, 'index.html') }
          : {
              main: path.resolve(__dirname, 'index.html'),
              sabbir: path.resolve(__dirname, 'sabbir.html'),
            },
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
