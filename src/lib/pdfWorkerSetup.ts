import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

let isWorkerConfigured = false;

export function initPdfWorker() {
  if (isWorkerConfigured || typeof window === 'undefined') return;

  try {
    // 1. Use the standalone polyfilled worker in public/ (served at /pdf.worker.mjs)
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
    isWorkerConfigured = true;
    return;
  } catch (err) {
    console.warn('Local /pdf.worker.mjs configuration error, checking fallback:', err);
  }

  try {
    if (pdfWorkerUrl) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
      isWorkerConfigured = true;
      return;
    }
  } catch (err) {
    console.warn('Bundled PDF worker URL resolution error, using CDN fallback:', err);
  }

  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '6.4.299'}/build/pdf.worker.min.mjs`;
    isWorkerConfigured = true;
  } catch (fallbackErr) {
    console.error('All PDF worker setup methods failed:', fallbackErr);
  }
}

// Initialize on module load
if (typeof window !== 'undefined') {
  initPdfWorker();
}
