/**
 * Service for interacting with Google Drive REST API v3 using user OAuth access token.
 */

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3';
const UPLOAD_API_URL = 'https://www.googleapis.com/upload/drive/v3';

export interface DriveFileInfo {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size?: string;
  webViewLink?: string;
}

export interface ToolzaroBackupPayload {
  version: string;
  timestamp: string;
  favorites: string[];
  theme: 'light' | 'dark';
  scratchpadNotes?: string;
  customBloggerUrl?: string;
  calculatorHistory?: any[];
  savedOutputs?: Record<string, any>;
  settings?: Record<string, any>;
}

/**
 * Searches for or creates a dedicated 'Toolzaro Utility Suite Data' folder in Google Drive.
 */
export async function getOrCreateAppFolder(accessToken: string): Promise<string> {
  const folderName = 'Toolzaro Utility Suite Data';
  const query = encodeURIComponent(`name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
  
  const searchRes = await fetch(`${DRIVE_API_URL}/files?q=${query}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!searchRes.ok) {
    const err = await searchRes.json().catch(() => ({}));
    throw new Error(err.error?.message || `Google Drive API error (${searchRes.status})`);
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // Create folder if not found
  const createRes = await fetch(`${DRIVE_API_URL}/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });

  if (!createRes.ok) {
    throw new Error('Failed to create Toolzaro folder on Google Drive');
  }

  const newFolder = await createRes.json();
  return newFolder.id;
}

/**
 * Uploads or updates the main Toolzaro_Data_Backup.json file in Google Drive.
 */
export async function saveBackupToDrive(
  accessToken: string,
  backupData: ToolzaroBackupPayload
): Promise<DriveFileInfo> {
  const folderId = await getOrCreateAppFolder(accessToken);
  const fileName = 'Toolzaro_Data_Backup.json';
  const query = encodeURIComponent(`name = '${fileName}' and '${folderId}' in parents and trashed = false`);

  // Check if file already exists
  const searchRes = await fetch(`${DRIVE_API_URL}/files?q=${query}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const searchData = await searchRes.json();
  const existingFile = searchData.files && searchData.files.length > 0 ? searchData.files[0] : null;

  const fileContent = JSON.stringify(backupData, null, 2);
  const blob = new Blob([fileContent], { type: 'application/json' });

  if (existingFile) {
    // Update existing file
    const updateRes = await fetch(`${UPLOAD_API_URL}/files/${existingFile.id}?uploadType=media`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: blob,
    });

    if (!updateRes.ok) {
      throw new Error('Failed to update existing backup on Google Drive.');
    }

    const updated = await updateRes.json();
    return {
      id: updated.id,
      name: updated.name || fileName,
      mimeType: 'application/json',
      modifiedTime: new Date().toISOString(),
    };
  } else {
    // Create new file with multipart upload
    const metadata = {
      name: fileName,
      mimeType: 'application/json',
      parents: [folderId],
    };

    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('file', blob);

    const createRes = await fetch(`${UPLOAD_API_URL}/files?uploadType=multipart&fields=id,name,mimeType,modifiedTime,size,webViewLink`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
    });

    if (!createRes.ok) {
      throw new Error('Failed to create backup file on Google Drive.');
    }

    return await createRes.json();
  }
}

/**
 * Downloads and parses Toolzaro_Data_Backup.json from Google Drive.
 */
export async function loadBackupFromDrive(
  accessToken: string
): Promise<{ payload: ToolzaroBackupPayload; fileInfo: DriveFileInfo } | null> {
  const folderId = await getOrCreateAppFolder(accessToken);
  const fileName = 'Toolzaro_Data_Backup.json';
  const query = encodeURIComponent(`name = '${fileName}' and '${folderId}' in parents and trashed = false`);

  const searchRes = await fetch(`${DRIVE_API_URL}/files?q=${query}&fields=files(id,name,modifiedTime,size,webViewLink)`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!searchRes.ok) {
    throw new Error('Could not search for backup file in Google Drive');
  }

  const searchData = await searchRes.json();
  if (!searchData.files || searchData.files.length === 0) {
    return null;
  }

  const fileInfo: DriveFileInfo = searchData.files[0];

  const downloadRes = await fetch(`${DRIVE_API_URL}/files/${fileInfo.id}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!downloadRes.ok) {
    throw new Error('Failed to download backup data from Google Drive');
  }

  const payload: ToolzaroBackupPayload = await downloadRes.json();
  return { payload, fileInfo };
}

/**
 * Uploads any output file (Image, PDF, Document, TXT) generated by Toolzaro to user's Google Drive.
 */
export async function uploadCustomFileToDrive(
  accessToken: string,
  fileName: string,
  fileContent: Blob | string,
  mimeType: string
): Promise<DriveFileInfo> {
  const folderId = await getOrCreateAppFolder(accessToken);

  const metadata = {
    name: fileName,
    mimeType: mimeType,
    parents: [folderId],
  };

  const blob = typeof fileContent === 'string' ? new Blob([fileContent], { type: mimeType }) : fileContent;

  const formData = new FormData();
  formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  formData.append('file', blob);

  const res = await fetch(`${UPLOAD_API_URL}/files?uploadType=multipart&fields=id,name,mimeType,modifiedTime,size,webViewLink`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to upload file to Google Drive');
  }

  return await res.json();
}

/**
 * Lists all Toolzaro files in the Google Drive folder.
 */
export async function listToolzaroDriveFiles(accessToken: string): Promise<DriveFileInfo[]> {
  try {
    const folderId = await getOrCreateAppFolder(accessToken);
    const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);

    const res = await fetch(
      `${DRIVE_API_URL}/files?q=${query}&orderBy=modifiedTime desc&fields=files(id,name,mimeType,modifiedTime,size,webViewLink)`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!res.ok) return [];

    const data = await res.json();
    return data.files || [];
  } catch (err) {
    console.error('Error listing Drive files:', err);
    return [];
  }
}
