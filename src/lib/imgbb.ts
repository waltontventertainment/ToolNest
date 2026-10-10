// Toolzaro ImgBB Image Hosting Integration
// Direct client-side image uploader via ImgBB API

export const IMGBB_API_KEY = '1ba7e3014ff726df236cef13ca1a79f3';
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
 * Uploads an image file or base64 data to ImgBB and returns the public CDN image URL.
 * @param imageFileOrBase64 File object or Base64 data URI
 * @param customApiKey Optional override API key
 * @param name Optional custom title/filename
 */
export async function uploadToImgBB(
  imageFileOrBase64: File | string,
  customApiKey: string = IMGBB_API_KEY,
  name?: string
): Promise<ImgBBUploadResponse> {
  const apiKey = (customApiKey || IMGBB_API_KEY).trim();
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
      const cleanBase64 = imageFileOrBase64.replace(/^data:image\/[a-z0-9.+]+;base64,/, '');
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
