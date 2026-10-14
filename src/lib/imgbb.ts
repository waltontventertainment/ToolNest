// Toolzaro ImgBB Image Hosting Integration
// Direct client-side image uploader via ImgBB API
import { getCachedSiteSettings } from './siteSettings';

export const IMGBB_API_KEY = (import.meta as any).env?.VITE_IMGBB_API_KEY || '';
export const IMGBB_UPLOAD_ENDPOINT = 'https://api.imgbb.com/1/upload';

export interface ImgBBUploadResponse {
  success: boolean;
  url?: string;
  displayUrl?: string;
  thumbUrl?: string;
  deleteUrl?: string;
  title?: string;
  error?: string;
}

/**
 * Resolves the active ImgBB API Key from environment variables, Admin Site Settings (Firestore/Cache),
 * or falls back to custom parameter.
 */
export function getActiveImgBBApiKey(customApiKey?: string): string {
  if (customApiKey && customApiKey.trim()) return customApiKey.trim();
  const envKey = (import.meta as any).env?.VITE_IMGBB_API_KEY?.trim();
  if (envKey) return envKey;
  try {
    const cachedKey = getCachedSiteSettings()?.admin?.imgbbApiKey?.trim();
    if (cachedKey) return cachedKey;
  } catch {
    // Ignore storage errors
  }
  return IMGBB_API_KEY;
}

/**
 * Uploads an image file or base64 data to ImgBB and returns the public CDN image URL.
 * @param imageFileOrBase64 File object or Base64 data URI
 * @param customApiKey Optional override API key
 * @param name Optional custom title/filename
 */
export async function uploadToImgBB(
  imageFileOrBase64: File | string,
  customApiKey?: string,
  name?: string
): Promise<ImgBBUploadResponse> {
  const apiKey = getActiveImgBBApiKey(customApiKey);
  if (!apiKey) {
    return {
      success: false,
      error: 'ImgBB API key is missing. Please enter a valid API key in Admin Settings.'
    };
  }

  try {
    const formData = new FormData();
    formData.append('key', apiKey);

    if (typeof imageFileOrBase64 === 'string') {
      // Strip data:image/...;base64, prefix if present
      const cleanBase64 = imageFileOrBase64.replace(/^data:image\/[a-zA-Z0-9.+_-]+;base64,/, '');
      formData.append('image', cleanBase64);
    } else {
      formData.append('image', imageFileOrBase64);
    }

    if (name) {
      formData.append('name', name);
    }

    const response = await fetch(IMGBB_UPLOAD_ENDPOINT, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (response.ok && data.success && data.data) {
      return {
        success: true,
        url: data.data.url,
        displayUrl: data.data.display_url || data.data.url,
        thumbUrl: data.data.thumb?.url || data.data.medium?.url || data.data.url,
        deleteUrl: data.data.delete_url,
        title: data.data.title
      };
    } else {
      const errMsg = data.error?.message || (typeof data.error === 'string' ? data.error : 'Failed to upload to ImgBB.');
      return {
        success: false,
        error: errMsg
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Network error while uploading image to ImgBB.'
    };
  }
}

/**
 * Scans text/HTML for any embedded base64 `data:image/...` strings, uploads them to ImgBB,
 * and replaces them with clean ImgBB CDN URLs so Firebase Firestore only stores lightweight text.
 */
export async function replaceBase64ImagesWithImgBB(input: string): Promise<string> {
  if (!input || !input.includes('data:image/')) return input;

  const base64Regex = /data:image\/[a-zA-Z0-9.+_-]+;base64,[A-Za-z0-9+/=]+/g;
  const matches = Array.from(new Set(input.match(base64Regex) || []));
  if (matches.length === 0) return input;

  let updated = input;
  for (const dataUri of matches) {
    const res = await uploadToImgBB(dataUri);
    if (res.success && res.url) {
      updated = updated.split(dataUri).join(res.url);
    }
  }
  return updated;
}
