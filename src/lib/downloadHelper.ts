import JSZip from 'jszip';

/**
 * Universal safe download utility that guarantees browser download prompt execution
 * across iframe previews, mobile Chrome/Safari, and desktop browsers.
 */
export function downloadBlob(blob: Blob, filename: string) {
  if (!blob) return;

  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    a.setAttribute('download', filename);
    a.target = '_blank'; // Critical for mobile webviews & iframe sandboxes
    a.rel = 'noopener noreferrer';
    
    document.body.appendChild(a);
    
    // Explicit MouseEvent dispatch for maximum browser & iframe compatibility
    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
    });
    a.dispatchEvent(clickEvent);

    // Keep object URL active for 60s so browser download manager finishes the stream
    setTimeout(() => {
      if (a.parentNode) {
        document.body.removeChild(a);
      }
      try {
        URL.revokeObjectURL(url);
      } catch {}
    }, 60000);
  } catch (err) {
    console.error('downloadBlob error:', err);
    // Fallback: direct window location
    try {
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch {}
  }
}

export async function downloadDataUrl(dataUrl: string, filename: string) {
  if (!dataUrl) return;

  try {
    const arr = dataUrl.split(',');
    if (arr.length >= 2) {
      const mimeMatch = arr[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'image/png';
      const cleanBase64 = arr[1].replace(/[\r\n\s]/g, '');
      const bstr = atob(cleanBase64);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      downloadBlob(blob, filename);
      return;
    }
  } catch (e) {
    console.warn('Base64 decode failed, trying fetch blob fallback:', e);
  }

  // Fallback: fetch dataUrl directly into Blob
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    downloadBlob(blob, filename);
  } catch (err) {
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = dataUrl;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (a.parentNode) document.body.removeChild(a);
    }, 2000);
  }
}

export async function copyDataUrlToClipboard(dataUrl: string): Promise<boolean> {
  if (!dataUrl) return false;
  try {
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const cleanBase64 = arr[1].replace(/[\r\n\s]/g, '');
    const bstr = atob(cleanBase64);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    let pngBlob = new Blob([u8arr], { type: mime });

    // ClipboardItem requires image/png
    if (mime !== 'image/png') {
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => { img.onload = resolve; });
      const c = document.createElement('canvas');
      c.width = img.width;
      c.height = img.height;
      const ctx = c.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      pngBlob = await new Promise<Blob>((resolve) => c.toBlob((b) => resolve(b!), 'image/png')) as Blob;
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof ClipboardItem !== 'undefined') {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': pngBlob })]);
      return true;
    }
    return false;
  } catch (err) {
    console.error('Clipboard copy error:', err);
    return false;
  }
}

export async function downloadFilesAsZip(
  files: Array<{ name: string; content: Blob | Uint8Array | string; isBase64?: boolean }>,
  zipFilename: string
) {
  if (!files || files.length === 0) return;
  const zip = new JSZip();
  
  for (const f of files) {
    if (f.isBase64 && typeof f.content === 'string') {
      const base64Data = f.content.includes(',') ? f.content.split(',')[1] : f.content;
      const cleanBase64 = base64Data.replace(/[\r\n\s]/g, '');
      zip.file(f.name, cleanBase64, { base64: true });
    } else {
      zip.file(f.name, f.content);
    }
  }

  const zipBlob = await zip.generateAsync({ 
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  downloadBlob(zipBlob, zipFilename.endsWith('.zip') ? zipFilename : `${zipFilename}.zip`);
}
