import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, 
  Lock, 
  Unlock, 
  Key, 
  LogOut, 
  FileText, 
  Megaphone, 
  Sparkles, 
  Globe, 
  DollarSign, 
  Settings as SettingsIcon, 
  Plus, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  Save, 
  Check, 
  AlertCircle, 
  Upload, 
  Database, 
  Image as ImageIcon, 
  RefreshCw,
  Search,
  CheckCircle2,
  Copy,
  Server,
  Wrench,
  Sliders,
  Filter,
  UserCheck,
  UserX,
  Code,
  Tag,
  Folder,
  Layers,
  ArrowRight,
  Sun,
  Moon,
  ChevronRight,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { getFirestoreSyncStatus, FirestoreSyncStatus, ToolOverride } from '../lib/siteSettings';
import { 
  FirestoreBlog, 
  getAllAdminBlogs, 
  deleteBlogFromFirestore, 
  seedStarterPostIfEmpty 
} from '../lib/firestoreBlogService';
import { BlogEditorModal } from '../components/admin/BlogEditorModal';
import { ToolEditorModal } from '../components/admin/ToolEditorModal';
import { ImgBBUploader } from '../components/admin/ImgBBUploader';
import { tools, categories } from '../lib/registry';
import { ToolDefinition, ToolCategory } from '../lib/types';
import { auth, db } from '../lib/firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';

const ADMIN_SESSION_KEY = 'toolzaro_admin_auth_user';

export const AdminPage: React.FC = () => {
  const { settings, updateSettings, refreshSettings } = useSiteSettings();
  const navigate = useNavigate();

  // Authentication state
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(ADMIN_SESSION_KEY) !== null;
  });
  const [adminEmail, setAdminEmail] = useState<string>(() => {
    return localStorage.getItem(ADMIN_SESSION_KEY) || '';
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [unauthorizedDomainError, setUnauthorizedDomainError] = useState(false);

  // Active admin tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'tools' | 'blogs' | 'announcement' | 'branding' | 'ads' | 'seo' | 'security'
  >('overview');

  // Tools management state
  const [toolSearch, setToolSearch] = useState('');
  const [toolCategoryFilter, setToolCategoryFilter] = useState<string>('All');
  const [toolStatusFilter, setToolStatusFilter] = useState<'all' | 'active' | 'disabled' | 'customized'>('all');
  const [editingTool, setEditingTool] = useState<ToolDefinition | null>(null);
  const [isToolEditorOpen, setIsToolEditorOpen] = useState(false);

  // Blog management state
  const [blogs, setBlogs] = useState<FirestoreBlog[]>([]);
  const [blogsLoading, setBlogsLoading] = useState(false);
  const [editingBlog, setEditingBlog] = useState<FirestoreBlog | null>(null);
  const [isBlogEditorOpen, setIsBlogEditorOpen] = useState(false);
  const [blogSearch, setBlogSearch] = useState('');

  // Form states for settings
  const [announcementForm, setAnnouncementForm] = useState(settings.announcement);
  const [brandingForm, setBrandingForm] = useState(settings.branding);
  const [adsForm, setAdsForm] = useState(settings.ads);
  const [seoForm, setSeoForm] = useState(settings.seo);
  const [imgbbKeyInput, setImgbbKeyInput] = useState(settings.admin.imgbbApiKey);
  const [newAllowedEmail, setNewAllowedEmail] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  // Firestore sync status
  const [syncStatus, setSyncStatus] = useState<FirestoreSyncStatus>(() => getFirestoreSyncStatus());
  const [showRulesInfo, setShowRulesInfo] = useState(false);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user && user.email) {
        verifyAndAuthorizeAdmin(user.email, user.uid);
      }
    });
    return () => unsubscribe();
  }, [settings.admin]);

  // Sync settings when loaded
  useEffect(() => {
    setAnnouncementForm(settings.announcement);
    setBrandingForm(settings.branding);
    setAdsForm(settings.ads);
    setSeoForm(settings.seo);
    setImgbbKeyInput(settings.admin.imgbbApiKey);
  }, [settings]);

  // Listen to sync status changes
  useEffect(() => {
    const handleStatusUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<FirestoreSyncStatus>;
      if (customEvent.detail) {
        setSyncStatus(customEvent.detail);
      }
    };
    window.addEventListener('toolzaro_sync_status', handleStatusUpdate);
    return () => window.removeEventListener('toolzaro_sync_status', handleStatusUpdate);
  }, []);

  // Load blogs when authenticated
  useEffect(() => {
    if (isAdminAuthenticated) {
      loadBlogs();
    }
  }, [isAdminAuthenticated]);

  const loadBlogs = async () => {
    setBlogsLoading(true);
    try {
      const list = await getAllAdminBlogs();
      if (list.length === 0) {
        const seeded = await seedStarterPostIfEmpty();
        setBlogs(seeded);
      } else {
        setBlogs(list);
      }
    } catch (err: any) {
      console.warn('Failed to fetch admin blogs, using cached copy:', err?.message || err);
      const cached = await getAllAdminBlogs();
      setBlogs(cached);
    } finally {
      setBlogsLoading(false);
    }
  };

  /**
   * Verify if email has admin privileges
   * Pure first-login claims the Master Admin: Whichever Gmail logs in first becomes the admin!
   */
  const verifyAndAuthorizeAdmin = async (email: string, uid?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const allowed = (settings.admin?.allowedEmails || []).map(e => e.trim().toLowerCase());
    const masterEmail = (settings.admin?.masterAdminEmail || '').trim().toLowerCase();

    // Check if user is the first user or already in allowed list
    const isFirstUser = !masterEmail && allowed.length === 0;
    const isAuthorized = 
      isFirstUser || 
      (masterEmail !== '' && cleanEmail === masterEmail) || 
      allowed.includes(cleanEmail);

    if (isAuthorized) {
      // Crown as master admin if first user
      if (isFirstUser || !masterEmail) {
        const updatedAllowed = Array.from(new Set([...allowed, cleanEmail]));
        await updateSettings({
          admin: {
            ...settings.admin,
            masterAdminEmail: cleanEmail,
            masterAdminUid: uid || settings.admin?.masterAdminUid || '',
            allowedEmails: updatedAllowed
          }
        });
      }

      setIsAdminAuthenticated(true);
      setAdminEmail(cleanEmail);
      localStorage.setItem(ADMIN_SESSION_KEY, cleanEmail);
      setLoginError('');
      toast.success(`Welcome, Admin (${cleanEmail})!`);
    } else {
      setIsAdminAuthenticated(false);
      setLoginError(`Access Denied: ${cleanEmail} is not authorized. The administrator role has already been claimed.`);
      toast.error('Unauthorized account. Only designated administrators can enter.');
    }
  };

  // Google Sign-In with Firebase Auth
  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setLoginError('');
    setUnauthorizedDomainError(false);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      if (result.user && result.user.email) {
        await verifyAndAuthorizeAdmin(result.user.email, result.user.uid);
      }
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      if (err?.code === 'auth/unauthorized-domain') {
        setUnauthorizedDomainError(true);
        setLoginError('Firebase: Error (auth/unauthorized-domain).');
      } else if (err?.code === 'auth/popup-blocked') {
        setLoginError('Google Sign-In popup was blocked by your browser. Please allow popups.');
      } else {
        setLoginError(err?.message || 'Google Sign-In failed.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Sign Out
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {}
    localStorage.removeItem(ADMIN_SESSION_KEY);
    setIsAdminAuthenticated(false);
    setCurrentUser(null);
    setAdminEmail('');
    toast.info('Signed out of Admin Portal successfully.');
  };

  // Tool Override Actions
  const handleSaveToolOverride = async (slug: string, override: ToolOverride | null) => {
    const currentOverrides = { ...(settings.toolOverrides || {}) };
    if (override === null) {
      delete currentOverrides[slug];
    } else {
      currentOverrides[slug] = override;
    }

    try {
      await updateSettings({ toolOverrides: currentOverrides });
      toast.success('Tool customization synced to Firestore!');
    } catch (err: any) {
      toast.error('Failed to sync tool change: ' + (err?.message || 'Check connection'));
    }
  };

  const handleToggleToolDisabled = async (tool: ToolDefinition) => {
    const current = settings.toolOverrides?.[tool.slug] || {};
    const willDisable = !current.disabled;
    
    await handleSaveToolOverride(tool.slug, {
      ...current,
      disabled: willDisable,
      updatedAt: new Date().toISOString()
    });

    toast.success(`${tool.name} is now ${willDisable ? 'DISABLED / HIDDEN' : 'ACTIVE & PUBLISHED'}!`);
  };

  // Delete Blog
  const handleDeleteBlog = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await deleteBlogFromFirestore(id);
      setBlogs(prev => prev.filter(b => b.id !== id));
      toast.success('Post deleted successfully');
    } catch (err: any) {
      toast.error('Failed to delete post: ' + (err?.message || 'Error'));
    }
  };

  // Add Allowed Admin Email
  const handleAddAdminEmail = async () => {
    if (!newAllowedEmail.trim() || !newAllowedEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    const current = settings.admin.allowedEmails || [];
    if (current.includes(newAllowedEmail.trim())) {
      toast.error('Email is already in the authorized list');
      return;
    }
    const updated = [...current, newAllowedEmail.trim()];
    try {
      await updateSettings({
        admin: {
          ...settings.admin,
          allowedEmails: updated
        }
      });
      setNewAllowedEmail('');
      toast.success(`Added ${newAllowedEmail.trim()} as authorized administrator!`);
    } catch (err: any) {
      toast.error('Failed to update admin list: ' + err?.message);
    }
  };

  // Remove Admin Email
  const handleRemoveAdminEmail = async (emailToRemove: string) => {
    const current = settings.admin.allowedEmails || [];
    if (current.length <= 1) {
      toast.error('Cannot remove the last remaining admin email');
      return;
    }
    const updated = current.filter(e => e !== emailToRemove);
    try {
      await updateSettings({
        admin: {
          ...settings.admin,
          allowedEmails: updated
        }
      });
      toast.success(`Removed ${emailToRemove} from administrators`);
    } catch (err: any) {
      toast.error('Failed to remove admin: ' + err?.message);
    }
  };

  // Filtered Tools Computation
  const filteredToolsList = useMemo(() => {
    return tools.filter(tool => {
      const override = settings.toolOverrides?.[tool.slug];
      const effectiveName = override?.customName || tool.name;
      const effectiveCategory = override?.customCategory || tool.category;
      const isDisabled = override?.disabled || false;
      const isCustomized = !!override && (
        !!override.customName || 
        !!override.customCategory || 
        !!override.customDescription || 
        !!override.customBadge || 
        override.disabled !== undefined || 
        !!override.customCode
      );

      // Search match
      const q = toolSearch.toLowerCase();
      const matchesSearch = !q || 
        effectiveName.toLowerCase().includes(q) || 
        tool.slug.toLowerCase().includes(q) ||
        tool.keywords.some(k => k.toLowerCase().includes(q));

      // Category match
      const matchesCat = toolCategoryFilter === 'All' || effectiveCategory === toolCategoryFilter;

      // Status match
      let matchesStatus = true;
      if (toolStatusFilter === 'active') matchesStatus = !isDisabled;
      if (toolStatusFilter === 'disabled') matchesStatus = isDisabled;
      if (toolStatusFilter === 'customized') matchesStatus = isCustomized;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [tools, settings.toolOverrides, toolSearch, toolCategoryFilter, toolStatusFilter]);

  // Tools stats
  const totalToolsCount = tools.length;
  const disabledToolsCount = useMemo(() => {
    return Object.values(settings.toolOverrides || {}).filter(o => o.disabled).length;
  }, [settings.toolOverrides]);
  const activeToolsCount = totalToolsCount - disabledToolsCount;
  const customizedToolsCount = useMemo(() => {
    return Object.keys(settings.toolOverrides || {}).length;
  }, [settings.toolOverrides]);

  // =========================================================================
  // LOGIN SCREEN (If not authenticated)
  // Fully isolated from site header and footer
  // =========================================================================
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-indigo-500 selection:text-white">
        {/* Background gradient ambient */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/20 via-sky-500/15 to-purple-600/20 blur-3xl rounded-full" />
        </div>

        <div className="relative w-full max-w-md">
          {/* Header Shield Logo */}
          <div className="text-center mb-6 space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white shadow-xl shadow-indigo-500/25 mb-1">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              Toolzaro Admin Portal
            </h1>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Lock className="w-3 h-3" /> Secret URL: /sabbir
            </div>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Secure administrative access for tool management, blog CMS, and site customization.
            </p>
          </div>

          {/* Main Login Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
            {loginError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Direct Google Sign-In with First Login Claim */}
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Google Administrator Verification
                </p>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {settings.admin?.masterAdminEmail ? (
                    <span>Sign in with your authorized Google account to access Toolzaro administration.</span>
                  ) : (
                    <span>Sign in with your Google account. Whichever Google account logs in first will automatically be registered as the Master Administrator.</span>
                  )}
                </p>
              </div>

              {/* Pure Google Sign-In Button */}
              <button
                type="button"
                disabled={authLoading}
                onClick={handleGoogleSignIn}
                className="w-full py-4 px-4 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-xl active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="text-slate-900 font-extrabold">
                  {authLoading ? 'Verifying Google Account...' : 'Sign in with Google'}
                </span>
              </button>

              {/* If unauthorized domain error occurred in preview, show explanation & domain copy */}
              {unauthorizedDomainError && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-amber-300">Firebase Authorized Domain Notice</p>
                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                        To sign in via Google on this preview or custom domain, add <code className="text-white bg-slate-950 px-1.5 py-0.5 rounded">{typeof window !== 'undefined' ? window.location.hostname : 'domain'}</code> to Firebase Console &gt; Authentication &gt; Settings &gt; Authorized domains.
                      </p>
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          navigator.clipboard.writeText(window.location.hostname);
                          toast.success('Domain copied to clipboard!');
                        }
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Domain for Firebase Console</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500">
              <Link to="/" className="hover:text-slate-300 flex items-center gap-1 transition-colors">
                ← Back to Toolzaro Home
              </Link>
              <span>Toolzaro CMS v2.4</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN ADMIN DASHBOARD WORKSPACE (ISOLATED FROM SITE LAYOUT)
  // No public header, no public announcement bar, no public footer
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* ================= ADMIN TOPBAR ================= */}
      <header className="sticky top-0 z-40 bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand & Secret Portal Badge */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white flex items-center justify-center font-extrabold shadow-md shadow-indigo-500/20">
            TZ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">
                Toolzaro Admin
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                /sabbir
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-none">
              Control Center & CMS
            </p>
          </div>
        </div>

        {/* Status Indicators & Admin Profile */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Firestore status badge */}
          <div className="hidden md:flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
              syncStatus.hasPermissionError 
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}>
              <Database className="w-3 h-3" />
              <span>{syncStatus.hasPermissionError ? 'Firestore Rules Alert' : 'Firestore Synced'}</span>
            </span>
          </div>

          {/* View Live Site link */}
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          {/* Admin User Chip */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center text-xs font-bold">
              {adminEmail ? adminEmail.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-white max-w-[150px] truncate leading-tight">
                {adminEmail || 'Master Admin'}
              </p>
              <p className="text-[10px] text-emerald-400 font-semibold">Active Session</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Sign Out of Admin Portal"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ================= FIRESTORE HELPER ALERT (IF NEEDED) ================= */}
      {syncStatus.hasPermissionError && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2.5 text-xs text-amber-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Firestore permissions notice: Data is safely caching locally. To enable cloud database sync, set Firestore rules to open in Firebase Console.
            </span>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} {\n      allow read, write: if true;\n    }\n  }\n}`);
              toast.success('Copied Firestore open rule to clipboard!');
            }}
            className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-bold shrink-0 transition-colors flex items-center gap-1"
          >
            <Copy className="w-3 h-3" /> Copy Open Rule
          </button>
        </div>
      )}

      {/* ================= MAIN WORKSPACE BODY ================= */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* ================= LEFT SIDEBAR NAVIGATION ================= */}
        <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex-shrink-0 p-4 space-y-6">
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
              Management Suite
            </p>

            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4" />
                <span>Overview & Metrics</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tools')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'tools'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Wrench className="w-4 h-4" />
                <span>Tools Manager</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'tools' ? 'bg-indigo-800 text-white' : 'bg-slate-800 text-slate-300'
              }`}>
                {totalToolsCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('blogs')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'blogs'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4" />
                <span>Blog & Posts CMS</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'blogs' ? 'bg-indigo-800 text-white' : 'bg-slate-800 text-slate-300'
              }`}>
                {blogs.length}
              </span>
            </button>
          </div>

          <div className="space-y-1 pt-4 border-t border-slate-800">
            <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
              Site Customization
            </p>

            <button
              type="button"
              onClick={() => setActiveTab('announcement')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'announcement'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span>Announcement Bar</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('branding')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'branding'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Site Branding</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ads')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'ads'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Ads & Monetization</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('seo')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'seo'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>SEO & Cloudflare</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'security'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Security & Admins</span>
            </button>
          </div>

          {/* Quick System Status Card */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
              <span>Database Provider</span>
              <span className="text-emerald-400">toolzaro-56fe1</span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
              <span>Auth Method</span>
              <span className="text-indigo-400">Firebase Auth</span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
              <span>ImgBB API</span>
              <span className="text-sky-400 font-mono">1ba7e...9f3</span>
            </div>
          </div>
        </aside>

        {/* ================= CONTENT MAIN VIEWPORT ================= */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* ================= TAB 1: OVERVIEW & METRICS ================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-6xl">
              <div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">
                  Welcome to Toolzaro Control Center
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Manage your browser utility suite, publish custom articles, customize all 156+ tools, and configure site branding.
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-slate-400">Total Tools</span>
                    <Wrench className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-white">{totalToolsCount}</div>
                  <p className="text-xs text-slate-400">Available in registry</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-slate-400">Active / Published</span>
                    <Eye className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-emerald-400">{activeToolsCount}</div>
                  <p className="text-xs text-slate-400">Visible to site visitors</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-slate-400">Customized Tools</span>
                    <Sliders className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-amber-400">{customizedToolsCount}</div>
                  <p className="text-xs text-slate-400">Custom title, badge, or code</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-slate-400">Blog Publications</span>
                    <FileText className="w-5 h-5 text-sky-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-sky-400">{blogs.length}</div>
                  <p className="text-xs text-slate-400">Firestore articles & code posts</p>
                </div>
              </div>

              {/* Quick Actions & Shortcuts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-indigo-400" /> Quick Administrative Tasks
                  </h3>
                  <div className="space-y-2.5">
                    <button
                      type="button"
                      onClick={() => { setActiveTab('tools'); }}
                      className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between text-xs font-semibold text-white transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Wrench className="w-4 h-4 text-indigo-400" />
                        <span>Customize Tool Names, Badges, or Code Snippets</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>

                    <button
                      type="button"
                      onClick={() => { setEditingBlog(null); setIsBlogEditorOpen(true); }}
                      className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between text-xs font-semibold text-white transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Plus className="w-4 h-4 text-emerald-400" />
                        <span>Publish New Article or Custom HTML/CSS/JS Post</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('announcement')}
                      className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between text-xs font-semibold text-white transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Megaphone className="w-4 h-4 text-amber-400" />
                        <span>Update Top Announcement Banner & Tool Count</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" /> Security & Auth Details
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400">Current Administrator:</span>
                      <span className="font-mono font-bold text-indigo-300">{adminEmail}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400">Admin Secret Path:</span>
                      <span className="font-mono font-bold text-emerald-400">domain.com/sabbir</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400">Public Layout Isolation:</span>
                      <span className="font-bold text-slate-200">100% Isolated (No Header/Footer)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: TOOLS MANAGER ================= */}
          {activeTab === 'tools' && (
            <div className="space-y-6 max-w-7xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                    <Wrench className="w-6 h-6 text-indigo-400" />
                    Tools Manager & Customization
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Edit title, category, description, badges, disabled status, and inject custom code for all 156+ tools.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300">
                    Showing {filteredToolsList.length} of {totalToolsCount} tools
                  </span>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={toolSearch}
                    onChange={e => setToolSearch(e.target.value)}
                    placeholder="Search tools by name, slug, or keywords..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={toolCategoryFilter}
                    onChange={e => setToolCategoryFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="All">All Categories ({categories.length})</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>

                  <select
                    value={toolStatusFilter}
                    onChange={e => setToolStatusFilter(e.target.value as any)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active Only ({activeToolsCount})</option>
                    <option value="disabled">Disabled Only ({disabledToolsCount})</option>
                    <option value="customized">Customized Only ({customizedToolsCount})</option>
                  </select>
                </div>
              </div>

              {/* Tools Table / List */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3.5 px-4">Tool</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Highlight Badge</th>
                        <th className="py-3.5 px-4">Custom Code</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredToolsList.map(tool => {
                        const override = settings.toolOverrides?.[tool.slug];
                        const displayName = override?.customName || tool.name;
                        const displayCategory = override?.customCategory || tool.category;
                        const badge = override?.customBadge;
                        const isDisabled = override?.disabled || false;
                        const hasCode = !!override?.customCode;
                        const isModified = !!override && (
                          !!override.customName || 
                          !!override.customCategory || 
                          !!override.customDescription || 
                          !!override.customBadge || 
                          override.disabled !== undefined || 
                          !!override.customCode
                        );

                        return (
                          <tr key={tool.slug} className="hover:bg-slate-800/40 transition-colors">
                            {/* Tool Name & Slug */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
                                  <tool.icon className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-white text-xs">
                                      {displayName}
                                    </span>
                                    {isModified && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                        MODIFIED
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[11px] font-mono text-slate-400">
                                    /{tool.slug}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="py-3 px-4">
                              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-950 border border-slate-800 text-slate-300">
                                {displayCategory}
                              </span>
                            </td>

                            {/* Badge */}
                            <td className="py-3 px-4">
                              {badge ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                  ★ {badge}
                                </span>
                              ) : (
                                <span className="text-slate-600 text-[11px]">—</span>
                              )}
                            </td>

                            {/* Custom Code */}
                            <td className="py-3 px-4">
                              {hasCode ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                                  <Code className="w-3 h-3" /> Injected
                                </span>
                              ) : (
                                <span className="text-slate-600 text-[11px]">None</span>
                              )}
                            </td>

                            {/* Status switch */}
                            <td className="py-3 px-4">
                              <button
                                type="button"
                                onClick={() => handleToggleToolDisabled(tool)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                                  isDisabled
                                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20'
                                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                                }`}
                              >
                                {isDisabled ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                <span>{isDisabled ? 'Hidden' : 'Active'}</span>
                              </button>
                            </td>

                            {/* Action Buttons */}
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Link
                                  to={`/${tool.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="View on site"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Link>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingTool(tool);
                                    setIsToolEditorOpen(true);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 font-bold text-[11px] flex items-center gap-1 transition-all"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>Customize</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: BLOG & POSTS CMS ================= */}
          {activeTab === 'blogs' && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                    <FileText className="w-6 h-6 text-sky-400" />
                    Blog & Publications CMS
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Write editorial articles or build custom interactive posts with HTML, CSS, and JS.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingBlog(null);
                    setIsBlogEditorOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/25 hover:opacity-95 transition-all self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Post (Rich Text or Code)</span>
                </button>
              </div>

              {/* ImgBB Quick Image Uploader Widget */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      ImgBB Fast Image Uploader
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    API Key: 1ba7e...9f3
                  </span>
                </div>
                <ImgBBUploader 
                  buttonLabel="Upload Image to ImgBB and Get Instant URL"
                  onImageUploaded={url => {
                    navigator.clipboard.writeText(url);
                    toast.success('Image uploaded to ImgBB and URL copied to clipboard!');
                  }}
                />
              </div>

              {/* Posts List */}
              <div className="space-y-3">
                {blogsLoading ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-400" />
                    <p className="text-xs font-bold">Loading Firestore publications...</p>
                  </div>
                ) : blogs.length === 0 ? (
                  <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 space-y-3">
                    <FileText className="w-10 h-10 mx-auto text-slate-600" />
                    <h3 className="text-base font-bold text-white">No posts published yet</h3>
                    <p className="text-xs max-w-sm mx-auto">
                      Click the "New Post" button above to publish your first article or custom code widget.
                    </p>
                  </div>
                ) : (
                  blogs.map(blog => (
                    <div
                      key={blog.id}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
                    >
                      <div className="flex items-start gap-4 min-w-0">
                        {blog.coverImage && (
                          <div className="w-16 h-14 rounded-xl overflow-hidden border border-slate-800 shrink-0 bg-slate-950">
                            <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              {blog.category}
                            </span>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              blog.status === 'published' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {blog.status}
                            </span>
                            {blog.contentType === 'code' ? (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1">
                                <Code className="w-3 h-3" /> HTML/CSS/JS Post
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300">
                                Rich Text
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-white truncate">
                            {blog.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 font-mono">
                            /blog/{blog.slug} • {blog.publishedAt}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        <Link
                          to={`/blog/${blog.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="View post on site"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingBlog(blog);
                            setIsBlogEditorOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBlog(blog.id, blog.title)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete post"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 4: ANNOUNCEMENT BAR ================= */}
          {activeTab === 'announcement' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <Megaphone className="w-6 h-6 text-amber-400" />
                  Top Announcement Bar
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Customize the headline banner that appears at the very top of all public pages.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <h4 className="text-sm font-bold text-white">Enable Announcement Bar</h4>
                    <p className="text-xs text-slate-400">Show or hide the banner across the website</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAnnouncementForm({ ...announcementForm, enabled: !announcementForm.enabled })}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      announcementForm.enabled
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {announcementForm.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Badge Label
                    </label>
                    <input
                      type="text"
                      value={announcementForm.badge}
                      onChange={e => setAnnouncementForm({ ...announcementForm, badge: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <label className="font-bold uppercase tracking-wider text-slate-400">
                        Announcement Text
                      </label>
                      <span className="text-indigo-400 text-[11px]">Tip: Use {'{count}'} for live tool count (currently {totalToolsCount})</span>
                    </div>
                    <textarea
                      rows={3}
                      value={announcementForm.text}
                      onChange={e => setAnnouncementForm({ ...announcementForm, text: e.target.value })}
                      className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-hidden focus:border-indigo-500 leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Action Button Label
                      </label>
                      <input
                        type="text"
                        value={announcementForm.linkText}
                        onChange={e => setAnnouncementForm({ ...announcementForm, linkText: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Action Button Link Target
                      </label>
                      <input
                        type="text"
                        value={announcementForm.linkUrl}
                        onChange={e => setAnnouncementForm({ ...announcementForm, linkUrl: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-hidden focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    type="button"
                    disabled={savingSettings}
                    onClick={async () => {
                      setSavingSettings(true);
                      try {
                        await updateSettings({ announcement: announcementForm });
                        toast.success('Announcement bar settings saved!');
                      } catch (err: any) {
                        toast.error('Failed to save: ' + err?.message);
                      } finally {
                        setSavingSettings(false);
                      }
                    }}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingSettings ? 'Saving...' : 'Save Announcement'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 5: SITE BRANDING ================= */}
          {activeTab === 'branding' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-indigo-400" />
                  Site Branding & Identity
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Customize the brand name, hero titles, tagline, contact email, and copyright.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Brand Name
                    </label>
                    <input
                      type="text"
                      value={brandingForm.siteName}
                      onChange={e => setBrandingForm({ ...brandingForm, siteName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Tagline
                    </label>
                    <input
                      type="text"
                      value={brandingForm.tagline}
                      onChange={e => setBrandingForm({ ...brandingForm, tagline: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Hero Headline
                  </label>
                  <input
                    type="text"
                    value={brandingForm.heroTitle}
                    onChange={e => setBrandingForm({ ...brandingForm, heroTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Hero Subtitle
                  </label>
                  <textarea
                    rows={3}
                    value={brandingForm.heroSubtitle}
                    onChange={e => setBrandingForm({ ...brandingForm, heroSubtitle: e.target.value })}
                    className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-hidden focus:border-indigo-500 leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={brandingForm.contactEmail}
                      onChange={e => setBrandingForm({ ...brandingForm, contactEmail: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Copyright Notice
                    </label>
                    <input
                      type="text"
                      value={brandingForm.copyrightText}
                      onChange={e => setBrandingForm({ ...brandingForm, copyrightText: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    type="button"
                    disabled={savingSettings}
                    onClick={async () => {
                      setSavingSettings(true);
                      try {
                        await updateSettings({ branding: brandingForm });
                        toast.success('Branding settings saved!');
                      } catch (err: any) {
                        toast.error('Failed to save: ' + err?.message);
                      } finally {
                        setSavingSettings(false);
                      }
                    }}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingSettings ? 'Saving...' : 'Save Branding'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 6: ADS & MONETIZATION ================= */}
          {activeTab === 'ads' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-emerald-400" />
                  Ads & Monetization
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Manage Google AdSense publisher ID, ad slot placement, and ads.txt verification.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <h4 className="text-sm font-bold text-white">Enable Advertisements</h4>
                    <p className="text-xs text-slate-400">Toggle live ad display across all tool and blog pages</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAdsForm({ ...adsForm, enabled: !adsForm.enabled })}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      adsForm.enabled
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {adsForm.enabled ? 'Ads Active' : 'Ads Paused'}
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      AdSense Publisher ID
                    </label>
                    <input
                      type="text"
                      value={adsForm.publisherId}
                      onChange={e => setAdsForm({ ...adsForm, publisherId: e.target.value })}
                      placeholder="ca-pub-8769496591745522"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-hidden focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        In-Content Ad Slot ID
                      </label>
                      <input
                        type="text"
                        value={adsForm.inContentSlotId}
                        onChange={e => setAdsForm({ ...adsForm, inContentSlotId: e.target.value })}
                        placeholder="1234567890"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-hidden focus:border-indigo-500 font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Sidebar / Sticky Ad Slot ID
                      </label>
                      <input
                        type="text"
                        value={adsForm.sidebarSlotId}
                        onChange={e => setAdsForm({ ...adsForm, sidebarSlotId: e.target.value })}
                        placeholder="9876543210"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-hidden focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Ads.txt helper */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white">Your ads.txt verification snippet</span>
                      <button
                        type="button"
                        onClick={() => {
                          const pubId = adsForm.publisherId.replace(/^ca-pub-/, 'pub-');
                          navigator.clipboard.writeText(`google.com, ${pubId}, DIRECT, f08c47fec0942fa0`);
                          toast.success('Copied ads.txt line to clipboard!');
                        }}
                        className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" /> Copy Snippet
                      </button>
                    </div>
                    <code className="block p-2 rounded bg-slate-900 text-xs font-mono text-slate-300">
                      google.com, {adsForm.publisherId.replace(/^ca-pub-/, 'pub-') || 'pub-8769496591745522'}, DIRECT, f08c47fec0942fa0
                    </code>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    type="button"
                    disabled={savingSettings}
                    onClick={async () => {
                      setSavingSettings(true);
                      try {
                        await updateSettings({ ads: adsForm });
                        toast.success('AdSense settings saved!');
                      } catch (err: any) {
                        toast.error('Failed to save: ' + err?.message);
                      } finally {
                        setSavingSettings(false);
                      }
                    }}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingSettings ? 'Saving...' : 'Save Ad Settings'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 7: SEO & CLOUDFLARE ================= */}
          {activeTab === 'seo' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <Globe className="w-6 h-6 text-sky-400" />
                  SEO & Cloudflare Hosting
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Configure default meta tags, canonical domain URL, OpenGraph social card, and Cloudflare indexing.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Canonical Site URL (Without trailing slash)
                  </label>
                  <input
                    type="url"
                    value={seoForm.canonicalBaseUrl}
                    onChange={e => setSeoForm({ ...seoForm, canonicalBaseUrl: e.target.value })}
                    placeholder="https://toolzaro.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-hidden focus:border-indigo-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Default Search Engine Title
                  </label>
                  <input
                    type="text"
                    value={seoForm.defaultTitle}
                    onChange={e => setSeoForm({ ...seoForm, defaultTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Default Meta Description
                  </label>
                  <textarea
                    rows={3}
                    value={seoForm.defaultDescription}
                    onChange={e => setSeoForm({ ...seoForm, defaultDescription: e.target.value })}
                    className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-hidden focus:border-indigo-500 leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Default OpenGraph Social Banner Image (1200x630)
                  </label>
                  <input
                    type="url"
                    value={seoForm.defaultOgImage}
                    onChange={e => setSeoForm({ ...seoForm, defaultOgImage: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-hidden focus:border-indigo-500 font-mono"
                  />
                </div>

                {/* Google Search Console & Webmaster Verification */}
                <div className="pt-4 border-t border-slate-800 space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Google Search Console & Webmaster Verification
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Verify ownership of <span className="text-indigo-400 font-mono font-bold">toolzaro.cyou</span> in Google Search Console to index tools fast and monitor search rankings.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex justify-between items-center">
                      <span>Google Search Console Verification Code / HTML Tag</span>
                      <span className="text-[10px] text-slate-500 lowercase">accepts raw token or full &lt;meta&gt; tag</span>
                    </label>
                    <input
                      type="text"
                      value={seoForm.googleVerificationCode || ''}
                      onChange={e => setSeoForm({ ...seoForm, googleVerificationCode: e.target.value })}
                      placeholder="e.g. 4XYZ1234abcdEFGH... or <meta name='google-site-verification' content='...' />"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-hidden focus:border-indigo-500 font-mono"
                    />
                    {seoForm.googleVerificationCode && (
                      <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>
                          Active Verification Tag: <code className="text-white font-mono">&lt;meta name="google-site-verification" content="{
                            seoForm.googleVerificationCode.includes('content=')
                              ? seoForm.googleVerificationCode.match(/content=["']([^"']+)["']/)?.[1] || seoForm.googleVerificationCode
                              : seoForm.googleVerificationCode.replace(/<[^>]*>/g, '').trim()
                          }" /&gt;</code>
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Bing Webmaster Tools Verification Code (Optional)
                    </label>
                    <input
                      type="text"
                      value={seoForm.bingVerificationCode || ''}
                      onChange={e => setSeoForm({ ...seoForm, bingVerificationCode: e.target.value })}
                      placeholder="e.g. 5D8A3F2C..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-hidden focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    type="button"
                    disabled={savingSettings}
                    onClick={async () => {
                      setSavingSettings(true);
                      try {
                        await updateSettings({ seo: seoForm });
                        toast.success('SEO & Search Console settings saved successfully!');
                      } catch (err: any) {
                        toast.error('Failed to save: ' + err?.message);
                      } finally {
                        setSavingSettings(false);
                      }
                    }}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingSettings ? 'Saving...' : 'Save SEO & Verification Settings'}</span>
                  </button>
                </div>
              </div>

              {/* Google Search Console & Cloudflare Step-by-Step Guide */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-sky-400" />
                    Google Search Console Verification & Fast Indexing Guide
                  </h3>
                  <a
                    href="https://search.google.com/search-console"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20"
                  >
                    Open Google Search Console <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Method 1 */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                    <div className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300">
                      Method 1: HTML Tag
                    </div>
                    <h4 className="font-bold text-white">Direct Meta Tag (Easiest)</h4>
                    <p className="text-slate-400 leading-relaxed text-[11px]">
                      1. In Google Search Console, select <strong>"URL prefix"</strong> and enter <code className="text-indigo-300">https://toolzaro.cyou</code>.
                    </p>
                    <p className="text-slate-400 leading-relaxed text-[11px]">
                      2. Choose <strong>"HTML tag"</strong> verification method.
                    </p>
                    <p className="text-slate-400 leading-relaxed text-[11px]">
                      3. Copy the code and paste it in the box above, then click <strong>"Save SEO Settings"</strong>. Done!
                    </p>
                  </div>

                  {/* Method 2 */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                    <div className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300">
                      Method 2: Cloudflare DNS (Best)
                    </div>
                    <h4 className="font-bold text-white">Domain-Level TXT Record</h4>
                    <p className="text-slate-400 leading-relaxed text-[11px]">
                      1. In GSC, choose <strong>"Domain"</strong> verification for <code className="text-emerald-300">toolzaro.cyou</code>.
                    </p>
                    <p className="text-slate-400 leading-relaxed text-[11px]">
                      2. In Cloudflare Dashboard, go to <strong>DNS &gt; Records &gt; Add record</strong>.
                    </p>
                    <p className="text-slate-400 leading-relaxed text-[11px]">
                      3. Type: <strong>TXT</strong>, Name: <strong>@</strong>, Content: <strong>google-site-verification=...</strong>. Verifies entire domain in seconds!
                    </p>
                  </div>

                  {/* Method 3 */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                    <div className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300">
                      Method 3: HTML File
                    </div>
                    <h4 className="font-bold text-white">Static File Upload</h4>
                    <p className="text-slate-400 leading-relaxed text-[11px]">
                      1. Download the <code className="text-sky-300">google*.html</code> verification file from GSC.
                    </p>
                    <p className="text-slate-400 leading-relaxed text-[11px]">
                      2. Place it in the project's <code className="text-white">/public</code> folder.
                    </p>
                    <p className="text-slate-400 leading-relaxed text-[11px]">
                      3. Cloudflare Pages serves it directly at <code className="text-slate-300">toolzaro.cyou/google*.html</code> with HTTP 200.
                    </p>
                  </div>
                </div>

                {/* Cloudflare Hosting & SEO File Status */}
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Live Hosting & Indexing Files (Ready for Cloudflare Upload)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white block">sitemap.xml</span>
                        <span className="text-[11px] text-slate-400">156+ tools & dynamic articles</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText('https://toolzaro.cyou/sitemap.xml');
                            toast.success('Copied sitemap.xml URL!');
                          }}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" /> Copy URL
                        </button>
                        <a
                          href="https://search.google.com/search-console/sitemaps"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-[11px] flex items-center gap-1"
                        >
                          Submit to GSC <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white block">robots.txt</span>
                        <span className="text-[11px] text-slate-400">Allows tools, shields /sabbir admin</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText('https://toolzaro.cyou/robots.txt');
                          toast.success('Copied robots.txt URL!');
                        }}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" /> Copy URL
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white block">wrangler.jsonc & _headers</span>
                        <span className="text-[11px] text-slate-400">Cloudflare SPA routing & root-level tool URLs</span>
                      </div>
                      <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold text-[11px]">
                        ✓ Configured
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white block">ads.txt</span>
                        <span className="text-[11px] text-slate-400">Google AdSense pub-8769496591745522</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText('https://toolzaro.cyou/ads.txt');
                          toast.success('Copied ads.txt URL!');
                        }}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" /> Copy URL
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 8: SECURITY & ADMIN USERS ================= */}
          {activeTab === 'security' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  Security & Administrator Access
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Manage authenticated Firebase admin users, emergency passcodes, and ImgBB integration.
                </p>
              </div>

              {/* Current Session Info */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" /> Current Authenticated Session
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Logged in as:</span>
                    <span className="font-bold text-white">{adminEmail || 'Master Admin'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Firebase UID:</span>
                    <span className="font-mono text-slate-300 truncate block">
                      {currentUser?.uid || 'local-master-session'}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out of Admin Portal</span>
                  </button>
                </div>
              </div>

              {/* Authorized Admin Emails */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-indigo-400" /> Authorized Admin Google Accounts
                </h3>
                <p className="text-xs text-slate-400">
                  Any Google account listed below can log into <code className="text-indigo-300">/sabbir</code>.
                </p>

                <div className="space-y-2">
                  {(settings.admin.allowedEmails || []).length === 0 ? (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-500">
                      No additional admin registered. The first user to log in via Google is recorded here as Master Admin.
                    </div>
                  ) : (
                    (settings.admin.allowedEmails || []).map(email => (
                      <div
                        key={email}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="font-mono font-semibold text-white">{email}</span>
                          {email === settings.admin.masterAdminEmail && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300">
                              MASTER
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAdminEmail(email)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Remove admin"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <input
                    type="email"
                    value={newAllowedEmail}
                    onChange={e => setNewAllowedEmail(e.target.value)}
                    placeholder="Add new admin email (e.g. user@gmail.com)..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddAdminEmail}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors shrink-0"
                  >
                    Add Admin
                  </button>
                </div>
              </div>

              {/* ImgBB API Key */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-sky-400" /> ImgBB API Key
                </h3>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={imgbbKeyInput}
                    onChange={e => setImgbbKeyInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-hidden focus:border-indigo-500 font-mono"
                  />
                  <span className="text-[11px] text-slate-500">
                    Used for instant blog image hosting via ImgBB API.
                  </span>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={async () => {
                      await updateSettings({
                        admin: {
                          ...settings.admin,
                          imgbbApiKey: imgbbKeyInput.trim()
                        }
                      });
                      toast.success('ImgBB API key updated!');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
                  >
                    Save API Key
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ================= MODALS ================= */}
      {/* 1. Tool Editor Modal */}
      {editingTool && (
        <ToolEditorModal
          tool={editingTool}
          currentOverride={settings.toolOverrides?.[editingTool.slug]}
          isOpen={isToolEditorOpen}
          onClose={() => {
            setIsToolEditorOpen(false);
            setEditingTool(null);
          }}
          onSave={handleSaveToolOverride}
        />
      )}

      {/* 2. Blog Editor Modal (Dual Mode) */}
      <BlogEditorModal
        post={editingBlog}
        isOpen={isBlogEditorOpen}
        onClose={() => {
          setIsBlogEditorOpen(false);
          setEditingBlog(null);
        }}
        onSaved={savedPost => {
          setBlogs(prev => {
            const exists = prev.some(p => p.id === savedPost.id);
            if (exists) {
              return prev.map(p => p.id === savedPost.id ? savedPost : p);
            }
            return [savedPost, ...prev];
          });
        }}
      />
    </div>
  );
};
