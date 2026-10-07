import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { toast } from 'sonner';
import { 
  initAuthListener, 
  googleSignIn, 
  googleSignOut 
} from '../lib/googleAuthService';
import { 
  saveBackupToDrive, 
  loadBackupFromDrive, 
  uploadCustomFileToDrive, 
  listToolzaroDriveFiles, 
  DriveFileInfo, 
  ToolzaroBackupPayload 
} from '../lib/googleDriveService';
import { useFavorites } from './FavoritesContext';

interface GoogleDriveContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  syncing: boolean;
  lastSynced: string | null;
  autoSync: boolean;
  setAutoSync: (val: boolean) => void;
  driveFiles: DriveFileInfo[];
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  backupData: (customNotes?: string) => Promise<boolean>;
  restoreData: () => Promise<boolean>;
  uploadFile: (fileName: string, content: Blob | string, mimeType: string) => Promise<DriveFileInfo | null>;
  refreshFiles: () => Promise<void>;
}

const GoogleDriveContext = createContext<GoogleDriveContextType | undefined>(undefined);

export const GoogleDriveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [lastSynced, setLastSynced] = useState<string | null>(() => localStorage.getItem('toolnest_last_drive_sync'));
  const [autoSync, setAutoSync] = useState<boolean>(() => localStorage.getItem('toolnest_auto_drive_sync') === 'true');
  const [driveFiles, setDriveFiles] = useState<DriveFileInfo[]>([]);

  const { favorites, toggleFavorite } = useFavorites();

  // Handle Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = initAuthListener((currUser, token) => {
      setUser(currUser);
      setAccessToken(token);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Save autoSync setting
  useEffect(() => {
    localStorage.setItem('toolnest_auto_drive_sync', String(autoSync));
  }, [autoSync]);

  // Fetch Drive Files list when connected
  const refreshFiles = useCallback(async () => {
    if (!accessToken) return;
    try {
      const files = await listToolzaroDriveFiles(accessToken);
      setDriveFiles(files);
    } catch (err) {
      console.error('Error fetching drive files:', err);
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken) {
      refreshFiles();
    } else {
      setDriveFiles([]);
    }
  }, [accessToken, refreshFiles]);

  // Google Sign In
  const signIn = async () => {
    try {
      setLoading(true);
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
        toast.success(`Connected to Google Drive as ${res.user.displayName || res.user.email}`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect Google Drive.');
    } finally {
      setLoading(false);
    }
  };

  // Google Sign Out
  const signOut = async () => {
    try {
      await googleSignOut();
      setUser(null);
      setAccessToken(null);
      toast.info('Disconnected from Google Drive');
    } catch (error: any) {
      toast.error('Error signing out');
    }
  };

  // Build current local state snapshot
  const buildLocalSnapshot = (customNotes?: string): ToolzaroBackupPayload => {
    const currentTheme = (document.documentElement.classList.contains('dark') ? 'dark' : 'light') as 'light' | 'dark';
    const scratchpad = customNotes ?? localStorage.getItem('webtools_scratchpad') ?? '';
    const customBloggerUrl = localStorage.getItem('toolnest_custom_blogger_url') ?? '';
    
    let calcHistory = [];
    try {
      const rawCalc = localStorage.getItem('toolnest_calc_history');
      if (rawCalc) calcHistory = JSON.parse(rawCalc);
    } catch {}

    return {
      version: '1.0',
      timestamp: new Date().toISOString(),
      favorites: favorites,
      theme: currentTheme,
      scratchpadNotes: scratchpad,
      customBloggerUrl,
      calculatorHistory: calcHistory,
    };
  };

  // Backup Local Data -> Google Drive
  const backupData = async (customNotes?: string): Promise<boolean> => {
    if (!accessToken) {
      toast.error('Please connect Google Drive first.');
      return false;
    }

    try {
      setSyncing(true);
      const snapshot = buildLocalSnapshot(customNotes);
      const result = await saveBackupToDrive(accessToken, snapshot);
      
      const nowIso = new Date().toISOString();
      setLastSynced(nowIso);
      localStorage.setItem('toolnest_last_drive_sync', nowIso);
      
      toast.success(`Backed up to Google Drive (${result.name})`);
      await refreshFiles();
      return true;
    } catch (error: any) {
      console.error('Backup error:', error);
      toast.error(error.message || 'Backup to Google Drive failed.');
      return false;
    } finally {
      setSyncing(false);
    }
  };

  // Restore Data Google Drive -> Local
  const restoreData = async (): Promise<boolean> => {
    if (!accessToken) {
      toast.error('Please connect Google Drive first.');
      return false;
    }

    try {
      setSyncing(true);
      const backup = await loadBackupFromDrive(accessToken);
      if (!backup) {
        toast.info('No backup file found in Google Drive yet. Create a backup first!');
        return false;
      }

      const { payload, fileInfo } = backup;

      // Restore favorites
      if (Array.isArray(payload.favorites)) {
        // Clear and apply
        payload.favorites.forEach((slug) => {
          if (!favorites.includes(slug)) {
            toggleFavorite(slug);
          }
        });
      }

      // Restore Scratchpad
      if (payload.scratchpadNotes !== undefined) {
        localStorage.setItem('webtools_scratchpad', payload.scratchpadNotes);
      }

      // Restore Custom Blogger URL
      if (payload.customBloggerUrl !== undefined) {
        localStorage.setItem('toolnest_custom_blogger_url', payload.customBloggerUrl);
      }

      // Restore Theme
      if (payload.theme) {
        localStorage.setItem('toolnest-theme', payload.theme);
        if (payload.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }

      const nowIso = new Date().toISOString();
      setLastSynced(nowIso);
      localStorage.setItem('toolnest_last_drive_sync', nowIso);

      toast.success(`Data restored successfully from Google Drive! (Modified: ${new Date(fileInfo.modifiedTime).toLocaleTimeString()})`);
      return true;
    } catch (error: any) {
      console.error('Restore error:', error);
      toast.error(error.message || 'Failed to restore backup from Google Drive.');
      return false;
    } finally {
      setSyncing(false);
    }
  };

  // Upload custom output file to Drive
  const uploadFile = async (fileName: string, content: Blob | string, mimeType: string): Promise<DriveFileInfo | null> => {
    if (!accessToken) {
      toast.error('Please connect Google Drive first.');
      return null;
    }

    try {
      setSyncing(true);
      const fileInfo = await uploadCustomFileToDrive(accessToken, fileName, content, mimeType);
      toast.success(`Uploaded "${fileName}" to Google Drive!`);
      await refreshFiles();
      return fileInfo;
    } catch (error: any) {
      toast.error(error.message || 'File upload to Google Drive failed.');
      return null;
    } finally {
      setSyncing(false);
    }
  };

  return (
    <GoogleDriveContext.Provider
      value={{
        user,
        accessToken,
        loading,
        syncing,
        lastSynced,
        autoSync,
        setAutoSync,
        driveFiles,
        signIn,
        signOut,
        backupData,
        restoreData,
        uploadFile,
        refreshFiles,
      }}
    >
      {children}
    </GoogleDriveContext.Provider>
  );
};

export const useGoogleDrive = () => {
  const context = useContext(GoogleDriveContext);
  if (!context) {
    throw new Error('useGoogleDrive must be used within a GoogleDriveProvider');
  }
  return context;
};
