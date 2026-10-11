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
      target: 'es2020',
      cssCodeSplit: !isSingleFile,
      minify: 'esbuild',
      modulePreload: isSingleFile
        ? true
        : {
            polyfill: false,
            resolveDependencies: (_filename, deps) => {
              // Prevent preloading heavy optional tool & Firebase chunks on initial mobile page load
              return deps.filter(
                dep =>
                  !dep.includes('vendor-pdf') &&
                  !dep.includes('vendor-scanner') &&
                  !dep.includes('vendor-qr-barcode') &&
                  !dep.includes('vendor-firebase') &&
                  !dep.includes('AdminPage') &&
                  !dep.includes('ToolPage') &&
                  !dep.includes('BlogPostPage') &&
                  !dep.includes('BlogPage') &&
                  !dep.includes('CategoryPage') &&
                  !dep.includes('ToolsHubPage') &&
                  !dep.includes('StaticPages') &&
                  !dep.includes('PdfSuiteTools') &&
                  !dep.includes('ScannerTools')
              );
            },
          },
      rollupOptions: {
        input: isSingleFile
          ? { main: path.resolve(__dirname, 'index.html') }
          : {
              main: path.resolve(__dirname, 'index.html'),
              sabbir: path.resolve(__dirname, 'sabbir.html'),
            },
        output: isSingleFile
          ? undefined
          : {
              manualChunks(id) {
                if (id.includes('node_modules')) {
                  if (
                    id.includes('pdf-lib') ||
                    id.includes('pdfjs-dist') ||
                    id.includes('pako') ||
                    id.includes('@pdf-lib') ||
                    id.includes('fontkit') ||
                    id.includes('upng')
                  ) {
                    return 'vendor-pdf';
                  }
                  if (id.includes('html5-qrcode')) {
                    return 'vendor-scanner';
                  }
                  if (id.includes('qrcode.react') || id.includes('jsbarcode')) {
                    return 'vendor-qr-barcode';
                  }
                  if (id.includes('firebase') || id.includes('@firebase')) {
                    return 'vendor-firebase';
                  }
                  if (id.includes('lucide-react')) {
                    return 'vendor-icons';
                  }
                  if (
                    id.includes('react-dom') ||
                    id.includes('react-router') ||
                    id.includes('@remix-run') ||
                    id.includes('scheduler') ||
                    id.includes('react-helmet-async')
                  ) {
                    return 'vendor-react';
                  }
                }
                return undefined;
              },
            },
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
