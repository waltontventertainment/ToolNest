import JSZip from 'jszip';
import { toast } from 'sonner';

/**
 * Universal safe download utility that guarantees reliable file downloading
 * across mobile browsers (Safari/Chrome), desktop browsers, and iframe preview sandboxes.
 * Returns the object URL so the caller can provide a direct permanent download button in the UI.
 */
export function downloadBlob(blob: Blob, filename: string): string {
  if (!blob) return '';

  try {
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    a.setAttribute('download', filename);
    a.rel = 'noopener noreferrer';
    
    document.body.appendChild(a);
    a.click();

    // Clean up anchor tag shortly after click
    setTimeout(() => {
      if (a.parentNode) {
        document.body.removeChild(a);
      }
    }, 1500);

    // Provide a convenient notification with a direct download action in case browser blocked programmatic click
    toast.success(`"${filename}" ready!`, {
      description: 'Download started. You can also tap the button below anytime.',
      action: {
        label: 'Download Again',
        onClick: () => {
          const directLink = document.createElement('a');
          directLink.href = url;
          directLink.download = filename;
          directLink.rel = 'noopener noreferrer';
          document.body.appendChild(directLink);
          directLink.click();
          setTimeout(() => directLink.remove(), 1000);
        }
      },
      duration: 8000,
    });

    // Revoke object URL after 5 minutes so users have plenty of time to preview or re-download
    setTimeout(() => {
      try {
        URL.revokeObjectURL(url);
      } catch {}
    }, 300000);

    return url;
  } catch (err) {
    console.error('downloadBlob error:', err);
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const fallbackA = document.createElement('a');
        fallbackA.href = dataUrl;
        fallbackA.download = filename;
        document.body.appendChild(fallbackA);
        fallbackA.click();
        setTimeout(() => fallbackA.remove(), 1500);
      };
      reader.readAsDataURL(blob);
    } catch (e) {
      toast.error('Browser blocked download. Please retry.');
    }
    return '';
  }
}

export async function downloadDataUrl(dataUrl: string, filename: string): Promise<string> {
  if (!dataUrl) return '';

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
      return downloadBlob(blob, filename);
    }
  } catch (e) {
    console.warn('Base64 decode failed, trying fetch blob fallback:', e);
  }

  // Fallback: fetch dataUrl directly into Blob
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return downloadBlob(blob, filename);
  } catch (err) {
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (a.parentNode) document.body.removeChild(a);
    }, 2000);
    return dataUrl;
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
): Promise<string> {
  if (!files || files.length === 0) return '';
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

  const finalName = zipFilename.endsWith('.zip') ? zipFilename : `${zipFilename}.zip`;
  return downloadBlob(zipBlob, finalName);
}
