import React, { useState } from 'react';
import { 
  Cloud, 
  CloudUpload, 
  CloudDownload, 
  RefreshCw, 
  CheckCircle2, 
  LogOut, 
  X, 
  FileText, 
  ExternalLink, 
  FolderCheck,
  ShieldCheck,
  Database
} from 'lucide-react';
import { useGoogleDrive } from '../context/GoogleDriveContext';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({ isOpen, onClose }) => {
  const {
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
    refreshFiles,
  } = useGoogleDrive();

  const [confirmRestoreOpen, setConfirmRestoreOpen] = useState(false);

  if (!isOpen) return null;

  const handleConfirmRestore = async () => {
    setConfirmRestoreOpen(false);
    await restoreData();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in-0 duration-150">
      <div className="w-full max-w-lg bg-card border border-border/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-border/70 flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground leading-tight flex items-center gap-2">
                <span>Google Drive Cloud Sync</span>
                {accessToken && (
                  <span className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Connected
                  </span>
                )}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Sync preferences, saved tools, and notes across all your devices
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-border/60 shadow-2xs"
            title="Close modal"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {!user || !accessToken ? (
            /* Unauthenticated State - Sign in with Google */
            <div className="text-center py-6 px-4 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center shadow-inner">
                <Database className="w-8 h-8" />
              </div>
              <div className="max-w-sm mx-auto space-y-1.5">
                <h4 className="text-sm font-bold text-foreground">Connect Your Google Drive</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Sign in with your Google account to automatically back up and restore your Toolzaro preferences, bookmarked tools, scratchpad notes, and calculations.
                </p>
              </div>

              {/* Official Google Sign-In Button */}
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={signIn}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-3 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-semibold px-5 py-2.5 rounded-xl text-sm shadow-sm transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span>{loading ? 'Connecting...' : 'Sign in with Google'}</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground pt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>100% Private. Data is saved only in your private Google Drive folder.</span>
              </div>
            </div>
          ) : (
            /* Authenticated State */
            <div className="space-y-5">
              {/* Profile Card */}
              <div className="p-3.5 rounded-xl bg-secondary/50 border border-border/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'Google User'} className="w-10 h-10 rounded-full border border-border" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center">
                      {(user.displayName || user.email || 'G')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{user.displayName || 'Google Account'}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>

                <button
                  onClick={signOut}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                  title="Disconnect account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>

              {/* Sync Actions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Backup Button */}
                <button
                  onClick={() => backupData()}
                  disabled={syncing}
                  className="p-4 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all text-left group cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                      <CloudUpload className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">To Drive</span>
                  </div>
                  <h5 className="text-xs font-bold text-foreground">Backup to Drive</h5>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Upload current local settings & history</p>
                </button>

                {/* Restore Button */}
                <button
                  onClick={() => setConfirmRestoreOpen(true)}
                  disabled={syncing}
                  className="p-4 rounded-xl border border-border/80 bg-secondary/40 hover:bg-secondary/70 transition-all text-left group cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-500 flex items-center justify-center">
                      <CloudDownload className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">From Drive</span>
                  </div>
                  <h5 className="text-xs font-bold text-foreground">Sync / Restore</h5>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Pull data from Google Drive backup</p>
                </button>
              </div>

              {/* Sync Status Banner */}
              <div className="p-3 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <FolderCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Last Synced: {lastSynced ? new Date(lastSynced).toLocaleString() : 'Never'}</span>
                </span>
                <button
                  onClick={refreshFiles}
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title="Refresh files"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Google Drive Files Explorer */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs font-bold text-foreground">
                  <span>Your Toolzaro Drive Files ({driveFiles.length})</span>
                  <span className="text-[11px] text-muted-foreground font-normal">Folder: Toolzaro Utility Suite Data</span>
                </div>

                {driveFiles.length > 0 ? (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {driveFiles.map((f) => (
                      <div key={f.id} className="p-2.5 rounded-lg border border-border/60 bg-card hover:bg-muted/40 transition-colors flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate">{f.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {f.modifiedTime ? new Date(f.modifiedTime).toLocaleDateString() : ''}
                            </p>
                          </div>
                        </div>

                        {f.webViewLink && (
                          <a
                            href={f.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 text-[11px] font-bold"
                          >
                            <span>View</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border/80">
                    No files found in Google Drive yet. Click &ldquo;Backup to Drive&rdquo; above!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-border/70 bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Google Workspace Drive Sync Active</span>
          </span>
        </div>
      </div>

      {/* Explicit Confirmation Dialog before Restoring/Overwriting local data */}
      {confirmRestoreOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-card border border-border/90 rounded-2xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <CloudDownload className="w-4 h-4 text-amber-500" />
              <span>Confirm Data Sync / Restore?</span>
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This will pull your saved favorites, scratchpad notes, and preferences from Google Drive and sync them into your browser. Existing local data will be merged.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmRestoreOpen(false)}
                className="px-3.5 py-1.5 rounded-xl border border-border text-xs font-bold hover:bg-muted transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRestore}
                className="px-4 py-1.5 rounded-xl bg-amber-500 text-amber-950 font-bold text-xs hover:bg-amber-400 transition-colors cursor-pointer"
              >
                Yes, Restore Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
