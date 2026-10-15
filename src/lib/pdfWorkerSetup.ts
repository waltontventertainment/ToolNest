import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

let isWorkerConfigured = false;

export function initPdfWorker() {
  if (isWorkerConfigured || typeof window === 'undefined') return;

  try {
    if (pdfWorkerUrl) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
      isWorkerConfigured = true;
      return;
    }
  } catch (err) {
    console.warn('Local PDF worker URL resolution error, using CDN fallback:', err);
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
