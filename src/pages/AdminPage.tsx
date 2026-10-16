import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FileText,
  Layers,
  Wrench,
  Sliders,
  Settings as SettingsIcon,
  ExternalLink,
  Plus,
  Search,
  MoreVertical,
  Edit3,
  Trash2,
  Copy,
  Eye,
  Check,
  AlertCircle,
  Save,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Moon,
  Sun,
  Shield,
  ShieldCheck,
  Upload,
  Download,
  Code,
  Globe,
  Share2,
  Sparkles,
  ArrowRight,
  Database,
  Image as ImageIcon,
  DollarSign,
  Tag,
  Folder,
  RefreshCw,
  Lock,
  Unlock,
  CheckCircle2,
  Calendar,
  Clock,
  EyeOff
} from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { tools, categories } from '../lib/registry';
import { ToolDefinition, ToolCategory } from '../lib/types';
import { 
  FirestoreBlog, 
  getAllAdminBlogs, 
  saveBlogToFirestore, 
  deleteBlogFromFirestore, 
  seedStarterPostIfEmpty 
} from '../lib/firestoreBlogService';
import { 
  DynamicPage, 
  getAllAdminPages, 
  savePageToFirestore, 
  deletePageFromFirestore 
} from '../lib/pagesService';
import { 
  CustomAdminTool, 
  getCustomTools, 
  saveCustomTool, 
  deleteCustomTool 
} from '../lib/customToolsService';
import { RichContentEditor } from '../components/admin/RichContentEditor';
import { CustomToolRunner } from '../components/admin/CustomToolRunner';
import { ToolOverride } from '../lib/siteSettings';
import { app } from '../lib/firebase';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';

const auth = getAuth(app);
const ADMIN_SESSION_KEY = 'toolzaro_admin_session_auth';

export const AdminPage: React.FC = () => {
  const { settings, updateSettings, refreshSettings } = useSiteSettings();
  const navigate = useNavigate();

  // Auth State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [unauthorizedError, setUnauthorizedError] = useState<string | null>(null);

  // Active Menu: 'posts' | 'pages' | 'tools' | 'layout' | 'settings'
  const [activeMenu, setActiveMenu] = useState<'posts' | 'pages' | 'tools' | 'layout' | 'settings'>('posts');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Theme toggle
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('toolnest-theme', '"dark"');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('toolnest-theme', '"light"');
    }
  };

  // ==========================================
  // 1. POSTS STATE
  // ==========================================
  const [posts, setPosts] = useState<FirestoreBlog[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postSearch, setPostSearch] = useState('');
  const [postStatusFilter, setPostStatusFilter] = useState<'all' | 'published' | 'draft' | 'scheduled'>('all');
  const [editingPost, setEditingPost] = useState<FirestoreBlog | null>(null);
  const [isPostEditorOpen, setIsPostEditorOpen] = useState(false);
  const [deleteConfirmPost, setDeleteConfirmPost] = useState<FirestoreBlog | null>(null);
  const [postDropdownOpen, setPostDropdownOpen] = useState<string | null>(null);

  // ==========================================
  // 2. PAGES STATE
  // ==========================================
  const [pages, setPages] = useState<DynamicPage[]>([]);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [pageSearch, setPageSearch] = useState('');
  const [pageStatusFilter, setPageStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [editingPage, setEditingPage] = useState<DynamicPage | null>(null);
  const [isPageEditorOpen, setIsPageEditorOpen] = useState(false);
  const [deleteConfirmPage, setDeleteConfirmPage] = useState<DynamicPage | null>(null);
  const [pageDropdownOpen, setPageDropdownOpen] = useState<string | null>(null);

  // ==========================================
  // 3. TOOLS STATE
  // ==========================================
  const [toolSearch, setToolSearch] = useState('');
  const [toolCategoryFilter, setToolCategoryFilter] = useState('All');
  const [editingTool, setEditingTool] = useState<ToolDefinition | null>(null);
  const [toolOverrideForm, setToolOverrideForm] = useState<ToolOverride>({});
  const [isToolModalOpen, setIsToolModalOpen] = useState(false);

  // Custom HTML Tools
  const [customToolsList, setCustomToolsList] = useState<CustomAdminTool[]>([]);
  const [isAddCustomToolOpen, setIsAddCustomToolOpen] = useState(false);
  const [customToolForm, setCustomToolForm] = useState<Partial<CustomAdminTool>>({
    name: '',
    slug: '',
    category: 'Utility',
    description: '',
    customHtml: '<div class="p-4 bg-white dark:bg-slate-800 rounded-xl shadow">\n  <h2 class="text-xl font-bold mb-2">My Custom Tool</h2>\n  <button onclick="alert(\'Hello Toolzaro!\')" class="px-4 py-2 bg-indigo-600 text-white rounded-lg">Click Me</button>\n</div>',
    enabled: true,
  });
  const [previewCustomTool, setPreviewCustomTool] = useState<CustomAdminTool | null>(null);

  // ==========================================
  // 4. LAYOUT STATE
  // ==========================================
  const [layoutSections, setLayoutSections] = useState<string[]>(
    settings.layout?.homepageSections || ['hero', 'categories', 'tech-digest', 'featured-tools', 'all-tools']
  );
  const [sectionVisibility, setSectionVisibility] = useState<Record<string, boolean>>(
    settings.layout?.sectionVisibility || {
      hero: true,
      categories: true,
      'tech-digest': true,
      'featured-tools': true,
      'all-tools': true,
    }
  );
  const [customHeadScripts, setCustomHeadScripts] = useState(settings.layout?.customHeadScripts || '');
  const [customBodyScripts, setCustomBodyScripts] = useState(settings.layout?.customBodyScripts || '');
  const [customFooterCode, setCustomFooterCode] = useState(settings.layout?.customFooterCode || '');
  const [savingLayout, setSavingLayout] = useState(false);

  // ==========================================
  // 5. SETTINGS STATE (Blogger-style order)
  // ==========================================
  const [activeSettingsAccordion, setActiveSettingsAccordion] = useState<string>('basic');
  const [settingsForm, setSettingsForm] = useState(settings);
  const [savingSettings, setSavingSettings] = useState(false);

  // ----------------------------------------------------
  // AUTHENTICATION EFFECT (Google Sign-In with Verified Admin)
  // ----------------------------------------------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      setCurrentUser(user);
      if (user && user.email) {
        verifyAdminAccess(user.email);
      } else {
        setIsAuthenticated(false);
        setAuthChecking(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const verifyAdminAccess = (email: string) => {
    const cleanEmail = email.toLowerCase().trim();
    const isMaster = cleanEmail === 'sabbirhasansh321@gmail.com';
    const allowed = (settings.admin.allowedEmails || []).map(e => e.toLowerCase().trim());
    const isTeamMember = allowed.includes(cleanEmail);

    if (isMaster || isTeamMember) {
      setIsAuthenticated(true);
      setUnauthorizedError(null);
    } else {
      setIsAuthenticated(false);
      setUnauthorizedError(`Access Denied: ${email} is not in the authorized administrator list.`);
    }
    setAuthChecking(false);
  };

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setUnauthorizedError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      if (result.user && result.user.email) {
        verifyAdminAccess(result.user.email);
        toast.success(`Signed in as ${result.user.email}`);
      }
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      toast.error(err.message || 'Google Sign-in failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setIsAuthenticated(false);
    toast.success('Signed out successfully');
  };

  // ----------------------------------------------------
  // DATA FETCHING (Posts, Pages, Custom Tools)
  // ----------------------------------------------------
  const loadPosts = async () => {
    setPostsLoading(true);
    try {
      const list = await getAllAdminBlogs();
      setPosts(list);
    } catch (err: any) {
      toast.error('Failed to load posts');
    } finally {
      setPostsLoading(false);
    }
  };

  const loadPages = async () => {
    setPagesLoading(true);
    try {
      const list = await getAllAdminPages();
      setPages(list);
    } catch (err: any) {
      toast.error('Failed to load pages');
    } finally {
      setPagesLoading(false);
    }
  };

  const loadCustomTools = async () => {
    try {
      const list = await getCustomTools();
      setCustomToolsList(list);
    } catch (err) {
      console.warn('Failed to load custom tools:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadPosts();
      loadPages();
      loadCustomTools();
    }
  }, [isAuthenticated]);

  // Keep settingsForm in sync
  useEffect(() => {
    setSettingsForm(settings);
    if (settings.layout) {
      setLayoutSections(settings.layout.homepageSections || ['hero', 'categories', 'tech-digest', 'featured-tools', 'all-tools']);
      setSectionVisibility(settings.layout.sectionVisibility || {});
      setCustomHeadScripts(settings.layout.customHeadScripts || '');
      setCustomBodyScripts(settings.layout.customBodyScripts || '');
      setCustomFooterCode(settings.layout.customFooterCode || '');
    }
  }, [settings]);

  // ----------------------------------------------------
  // POST ACTIONS (Save, Duplicate, Delete)
  // ----------------------------------------------------
  const handleSavePost = async (postData: any, targetStatus: 'published' | 'draft' | 'scheduled') => {
    await saveBlogToFirestore({
      ...postData,
      status: targetStatus,
    });
    await loadPosts();
    setIsPostEditorOpen(false);
    setEditingPost(null);
  };

  const handleDuplicatePost = async (post: FirestoreBlog) => {
    try {
      const duplicated: Partial<FirestoreBlog> = {
        ...post,
        id: `blog-${Date.now()}`,
        slug: `${post.slug}-copy`,
        title: `${post.title} (Copy)`,
        status: 'draft',
        publishedAt: new Date().toISOString(),
      };
      await saveBlogToFirestore(duplicated);
      toast.success('Post duplicated as draft');
      await loadPosts();
    } catch (err: any) {
      toast.error('Duplicate failed: ' + err.message);
    }
  };

  const handleDeletePost = async (post: FirestoreBlog) => {
    try {
      await deleteBlogFromFirestore(post.id);
      toast.success('Post deleted successfully');
      setDeleteConfirmPost(null);
      await loadPosts();
    } catch (err: any) {
      toast.error('Delete failed: ' + err.message);
    }
  };

  // ----------------------------------------------------
  // PAGE ACTIONS (Save, Duplicate, Delete)
  // ----------------------------------------------------
  const handleSavePage = async (pageData: any, targetStatus: 'published' | 'draft' | 'scheduled') => {
    await savePageToFirestore({
      ...pageData,
      status: targetStatus,
    });
    await loadPages();
    setIsPageEditorOpen(false);
    setEditingPage(null);
  };

  const handleDuplicatePage = async (page: DynamicPage) => {
    try {
      const duplicated: Partial<DynamicPage> = {
        ...page,
        id: `page-${Date.now()}`,
        slug: `${page.slug}-copy`,
        title: `${page.title} (Copy)`,
        status: 'draft',
        publishedAt: new Date().toISOString(),
      };
      await savePageToFirestore(duplicated);
      toast.success('Page duplicated as draft');
      await loadPages();
    } catch (err: any) {
      toast.error('Duplicate failed: ' + err.message);
    }
  };

  const handleDeletePage = async (page: DynamicPage) => {
    try {
      await deletePageFromFirestore(page.id);
      toast.success('Page deleted successfully');
      setDeleteConfirmPage(null);
      await loadPages();
    } catch (err: any) {
      toast.error('Delete failed: ' + err.message);
    }
  };

  // ----------------------------------------------------
  // TOOLS ACTIONS (Toggle, Override, Add Custom Tool)
  // ----------------------------------------------------
  const handleToggleToolState = async (toolSlug: string, currentDisabled: boolean) => {
    const existing = settings.toolOverrides[toolSlug] || {};
    const updated = {
      ...existing,
      disabled: !currentDisabled,
      updatedAt: new Date().toISOString(),
    };
    await updateSettings({
      toolOverrides: {
        ...settings.toolOverrides,
        [toolSlug]: updated,
      },
    });
    toast.success(`${toolSlug} ${!currentDisabled ? 'disabled' : 'enabled'} successfully`);
  };

  const handleSaveToolOverride = async () => {
    if (!editingTool) return;
    await updateSettings({
      toolOverrides: {
        ...settings.toolOverrides,
        [editingTool.slug]: {
          ...toolOverrideForm,
          updatedAt: new Date().toISOString(),
        },
      },
    });
    setIsToolModalOpen(false);
    toast.success(`Tool overrides saved for ${editingTool.name}`);
  };

  const handleSaveCustomToolAction = async () => {
    if (!customToolForm.name || !customToolForm.slug || !customToolForm.customHtml) {
      toast.error('Please fill in name, slug and HTML code');
      return;
    }
    await saveCustomTool(customToolForm);
    setIsAddCustomToolOpen(false);
    setCustomToolForm({
      name: '',
      slug: '',
      category: 'Utility',
      description: '',
      customHtml: '',
      enabled: true,
    });
    await loadCustomTools();
    toast.success('Custom tool created successfully');
  };

  const handleDeleteCustomToolAction = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this custom tool?')) return;
    await deleteCustomTool(id);
    await loadCustomTools();
    toast.success('Custom tool deleted');
  };

  // ----------------------------------------------------
  // LAYOUT ACTIONS (Reorder, Save)
  // ----------------------------------------------------
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= layoutSections.length) return;
    const copy = [...layoutSections];
    const [moved] = copy.splice(index, 1);
    copy.splice(target, 0, moved);
    setLayoutSections(copy);
  };

  const toggleSectionVis = (key: string) => {
    setSectionVisibility(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSaveLayoutAction = async () => {
    setSavingLayout(true);
    try {
      await updateSettings({
        layout: {
          homepageSections: layoutSections,
          sectionVisibility,
          customHeadScripts,
          customBodyScripts,
          customFooterCode,
        },
      });
      toast.success('Layout saved successfully');
    } catch (err: any) {
      toast.error('Failed to save layout: ' + err.message);
    } finally {
      setSavingLayout(false);
    }
  };

  // ----------------------------------------------------
  // SETTINGS SAVE ACTION
  // ----------------------------------------------------
  const handleSaveSettingsAction = async () => {
    setSavingSettings(true);
    try {
      await updateSettings(settingsForm);
      toast.success('Saved successfully');
    } catch (err: any) {
      toast.error('Failed to save settings: ' + err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  // Export Backup JSON
  const handleExportBackup = () => {
    const backupData = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      siteName: settings.branding.siteName,
      settings: settingsForm,
      posts,
      pages,
      customTools: customToolsList,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Toolzaro_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Content backup exported successfully');
  };

  // Import Backup JSON
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async event => {
      try {
        const raw = event.target?.result as string;
        const parsed = JSON.parse(raw);
        if (parsed.settings) {
          await updateSettings(parsed.settings);
        }
        if (Array.isArray(parsed.posts)) {
          for (const p of parsed.posts) {
            await saveBlogToFirestore(p);
          }
        }
        if (Array.isArray(parsed.pages)) {
          for (const page of parsed.pages) {
            await savePageToFirestore(page);
          }
        }
        await loadPosts();
        await loadPages();
        toast.success('Backup imported successfully!');
      } catch (err: any) {
        toast.error('Failed to parse backup JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  // Filtered lists
  const filteredPosts = useMemo(() => {
    return posts.filter(p => {
      const matchSearch =
        !postSearch ||
        p.title.toLowerCase().includes(postSearch.toLowerCase()) ||
        p.slug.toLowerCase().includes(postSearch.toLowerCase());
      const matchStatus =
        postStatusFilter === 'all' || p.status === postStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [posts, postSearch, postStatusFilter]);

  const filteredPages = useMemo(() => {
    return pages.filter(p => {
      const matchSearch =
        !pageSearch ||
        p.title.toLowerCase().includes(pageSearch.toLowerCase()) ||
        p.slug.toLowerCase().includes(pageSearch.toLowerCase());
      const matchStatus =
        pageStatusFilter === 'all' || p.status === pageStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [pages, pageSearch, pageStatusFilter]);

  const filteredTools = useMemo(() => {
    return tools.filter(t => {
      const matchSearch =
        !toolSearch ||
        t.name.toLowerCase().includes(toolSearch.toLowerCase()) ||
        t.slug.toLowerCase().includes(toolSearch.toLowerCase()) ||
        t.intro.toLowerCase().includes(toolSearch.toLowerCase());
      const matchCat =
        toolCategoryFilter === 'All' || t.category === toolCategoryFilter;
      return matchSearch && matchCat;
    });
  }, [toolSearch, toolCategoryFilter]);

  // ----------------------------------------------------
  // RENDER: Auth Checking / Login View
  // ----------------------------------------------------
  if (authChecking) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <RefreshCw className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-sm font-medium text-muted-foreground">Checking Administrator Credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
            <Shield className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-display font-extrabold text-foreground">Toolzaro Admin</h1>
            <p className="text-xs text-muted-foreground">
              Sign in with your verified administrator Google account
            </p>
          </div>

          {unauthorizedError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-xs text-destructive text-left flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{unauthorizedError}</span>
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            disabled={authLoading}
            className="w-full py-3 px-4 rounded-xl bg-card border border-border hover:bg-muted font-medium text-sm text-foreground flex items-center justify-center gap-3 transition-colors shadow-2xs hover:shadow-sm"
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
            <span>{authLoading ? 'Verifying with Google...' : 'Sign in with Google'}</span>
          </button>

          <div className="pt-2">
            <Link to="/" className="text-xs text-primary hover:underline">
              ← Return to Toolzaro Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // MAIN ADMIN DASHBOARD (Blogger style layout)
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-background flex flex-col text-foreground font-sans">
      {/* Top Header */}
      <header className="h-16 border-b border-border bg-card/90 backdrop-blur px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground lg:hidden"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center gap-2 group">
            <span className="font-display font-extrabold text-lg text-foreground tracking-tight">
              Toolzaro
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              Admin
            </span>
          </Link>
        </div>

        {/* Right header controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg border border-border hover:bg-muted text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="hidden sm:inline">View Blog</span>
          </a>

          <div className="flex items-center gap-2 pl-2 border-l border-border">
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt="Admin"
                className="w-7 h-7 rounded-full border border-border object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                {currentUser?.email?.charAt(0).toUpperCase()}
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar (Blogger-style) */}
        <aside className="w-64 border-r border-border bg-card/60 shrink-0 hidden lg:flex flex-col justify-between p-4">
          <nav className="space-y-1">
            {[
              { id: 'posts', label: 'Posts', icon: FileText, count: posts.length },
              { id: 'pages', label: 'Pages', icon: Layers, count: pages.length },
              { id: 'tools', label: 'Tools', icon: Wrench, count: tools.length + customToolsList.length },
              { id: 'layout', label: 'Layout', icon: Sliders },
              { id: 'settings', label: 'Settings', icon: SettingsIcon },
            ].map(item => {
              const Icon = item.icon;
              const active = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id as any)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                    active
                      ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        active ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer Link to public site */}
          <div className="pt-4 border-t border-border/80">
            <a
              href="/"
              className="flex items-center justify-between text-xs text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <span>View live website</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </aside>

        {/* Mobile Slide-in Sidebar Drawer */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="relative w-72 max-w-[80vw] bg-card h-full p-4 flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-200">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
                  <span className="font-display font-extrabold text-base text-foreground">
                    Menu
                  </span>
                  <button
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {[
                    { id: 'posts', label: 'Posts', icon: FileText, count: posts.length },
                    { id: 'pages', label: 'Pages', icon: Layers, count: pages.length },
                    { id: 'tools', label: 'Tools', icon: Wrench, count: tools.length + customToolsList.length },
                    { id: 'layout', label: 'Layout', icon: Sliders },
                    { id: 'settings', label: 'Settings', icon: SettingsIcon },
                  ].map(item => {
                    const Icon = item.icon;
                    const active = activeMenu === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveMenu(item.id as any);
                          setIsMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                          active
                            ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                        {item.count !== undefined && (
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              active ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {item.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-border">
                <a
                  href="/"
                  className="flex items-center justify-between text-xs text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-muted"
                >
                  <span>View live website</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pb-24 lg:pb-8">
          {/* ========================================================= */}
          {/* 1. POSTS VIEW */}
          {/* ========================================================= */}
          {activeMenu === 'posts' && (
            <div className="max-w-6xl mx-auto space-y-5">
              {/* Filter Tabs & Search Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Status filter tabs */}
                <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-xl border border-border/80 text-xs font-medium overflow-x-auto">
                  {(['all', 'published', 'draft', 'scheduled'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => setPostStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg capitalize transition-colors whitespace-nowrap ${
                        postStatusFilter === st
                          ? 'bg-card text-foreground font-semibold shadow-2xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {st} ({posts.filter(p => st === 'all' || p.status === st).length})
                    </button>
                  ))}
                </div>

                {/* Search input */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={postSearch}
                    onChange={e => setPostSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Posts Card List */}
              {postsLoading ? (
                <div className="py-20 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-primary" />
                  Loading posts...
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="py-20 text-center bg-card rounded-2xl border border-border p-8 space-y-3">
                  <FileText className="w-10 h-10 text-muted-foreground/60 mx-auto" />
                  <h3 className="font-bold text-base text-foreground">No posts found</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    {postSearch ? 'No posts match your search query.' : 'Click the "+" button below to publish your first post.'}
                  </p>
                  <button
                    onClick={() => {
                      setEditingPost(null);
                      setIsPostEditorOpen(true);
                    }}
                    className="px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl inline-flex items-center gap-2 hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Post</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredPosts.map(post => {
                    const isDropdownOpen = postDropdownOpen === post.id;
                    return (
                      <div
                        key={post.id}
                        className="p-3 sm:p-4 bg-card rounded-2xl border border-border hover:border-primary/40 transition-all flex items-center gap-3 sm:gap-4 group relative"
                      >
                        {/* Auto Thumbnail / Initial placeholder */}
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-muted/60 overflow-hidden shrink-0 border border-border/80 flex items-center justify-center">
                          {post.coverImage ? (
                            <img
                              src={post.coverImage}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="font-bold text-xl text-primary font-display">
                              {post.title.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* Title and metadata */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span
                              className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded ${
                                post.status === 'published'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                  : post.status === 'scheduled'
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {post.status}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {post.category || 'General'}
                            </span>
                            <span className="text-xs text-muted-foreground/60 hidden sm:inline">•</span>
                            <span className="text-xs text-muted-foreground/80 hidden sm:inline">
                              {new Date(post.publishedAt || post.createdAt || Date.now()).toLocaleDateString()}
                            </span>
                          </div>

                          <h3
                            onClick={() => {
                              setEditingPost(post);
                              setIsPostEditorOpen(true);
                            }}
                            className="text-sm sm:text-base font-bold text-foreground hover:text-primary transition-colors cursor-pointer truncate"
                          >
                            {post.title}
                          </h3>

                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {post.excerpt || post.content.replace(/<[^>]*>/g, '').slice(0, 120)}
                          </p>
                        </div>

                        {/* 3-Dot Action Menu */}
                        <div className="relative">
                          <button
                            onClick={() => setPostDropdownOpen(isDropdownOpen ? null : post.id)}
                            className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {isDropdownOpen && (
                            <div className="absolute right-0 top-full mt-1 w-36 bg-card rounded-xl border border-border shadow-xl py-1 z-20 text-xs font-medium">
                              <button
                                onClick={() => {
                                  setEditingPost(post);
                                  setIsPostEditorOpen(true);
                                  setPostDropdownOpen(null);
                                }}
                                className="w-full px-3 py-2 text-left hover:bg-muted flex items-center gap-2 text-foreground"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                Edit
                              </button>
                              <a
                                href={`/blog/${post.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full px-3 py-2 text-left hover:bg-muted flex items-center gap-2 text-foreground"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                View
                              </a>
                              <button
                                onClick={() => {
                                  handleDuplicatePost(post);
                                  setPostDropdownOpen(null);
                                }}
                                className="w-full px-3 py-2 text-left hover:bg-muted flex items-center gap-2 text-foreground"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                Duplicate
                              </button>
                              <div className="h-px bg-border my-1" />
                              <button
                                onClick={() => {
                                  setDeleteConfirmPost(post);
                                  setPostDropdownOpen(null);
                                }}
                                className="w-full px-3 py-2 text-left hover:bg-destructive/10 text-destructive flex items-center gap-2"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Floating Action Button (FAB) for New Post */}
              <button
                onClick={() => {
                  setEditingPost(null);
                  setIsPostEditorOpen(true);
                }}
                className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg flex items-center justify-center transition-transform hover:scale-105 focus:outline-none"
                title="Create New Post"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. PAGES VIEW */}
          {/* ========================================================= */}
          {activeMenu === 'pages' && (
            <div className="max-w-6xl mx-auto space-y-5">
              {/* Header Filters & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-xl border border-border/80 text-xs font-medium">
                  {(['all', 'published', 'draft'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => setPageStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                        pageStatusFilter === st
                          ? 'bg-card text-foreground font-semibold shadow-2xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {st} ({pages.filter(p => st === 'all' || p.status === st).length})
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search pages..."
                    value={pageSearch}
                    onChange={e => setPageSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Pages Card List */}
              {pagesLoading ? (
                <div className="py-20 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-primary" />
                  Loading pages...
                </div>
              ) : filteredPages.length === 0 ? (
                <div className="py-20 text-center bg-card rounded-2xl border border-border p-8 space-y-3">
                  <Layers className="w-10 h-10 text-muted-foreground/60 mx-auto" />
                  <h3 className="font-bold text-base text-foreground">No pages created yet</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Create standalone pages like About, Contact, or custom landing pages that integrate directly into your site header and footer.
                  </p>
                  <button
                    onClick={() => {
                      setEditingPage(null);
                      setIsPageEditorOpen(true);
                    }}
                    className="px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl inline-flex items-center gap-2 hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Page</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredPages.map(page => {
                    const isDropdownOpen = pageDropdownOpen === page.id;
                    return (
                      <div
                        key={page.id}
                        className="p-3 sm:p-4 bg-card rounded-2xl border border-border hover:border-primary/40 transition-all flex items-center gap-3 sm:gap-4 group relative"
                      >
                        {/* Auto Thumbnail / Initial placeholder */}
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-muted/60 overflow-hidden shrink-0 border border-border/80 flex items-center justify-center">
                          {page.coverImage ? (
                            <img src={page.coverImage} alt={page.title} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-bold text-xl text-primary font-display">
                              {page.title.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* Title & Placement */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span
                              className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded ${
                                page.status === 'published'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {page.status}
                            </span>
                            <span className="text-xs font-medium px-2 py-0.5 rounded bg-primary/10 text-primary">
                              Placement: {page.placement || 'custom'}
                            </span>
                            <span className="text-xs text-muted-foreground/60 hidden sm:inline">•</span>
                            <span className="text-xs text-muted-foreground/80 font-mono hidden sm:inline">
                              /{page.slug}
                            </span>
                          </div>

                          <h3
                            onClick={() => {
                              setEditingPage(page);
                              setIsPageEditorOpen(true);
                            }}
                            className="text-sm sm:text-base font-bold text-foreground hover:text-primary transition-colors cursor-pointer truncate"
                          >
                            {page.title}
                          </h3>

                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {page.excerpt || page.content.replace(/<[^>]*>/g, '').slice(0, 120)}
                          </p>
                        </div>

                        {/* 3-Dot Dropdown Menu */}
                        <div className="relative">
                          <button
                            onClick={() => setPageDropdownOpen(isDropdownOpen ? null : page.id)}
                            className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {isDropdownOpen && (
                            <div className="absolute right-0 top-full mt-1 w-36 bg-card rounded-xl border border-border shadow-xl py-1 z-20 text-xs font-medium">
                              <button
                                onClick={() => {
                                  setEditingPage(page);
                                  setIsPageEditorOpen(true);
                                  setPageDropdownOpen(null);
                                }}
                                className="w-full px-3 py-2 text-left hover:bg-muted flex items-center gap-2 text-foreground"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                Edit
                              </button>
                              <a
                                href={`/${page.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full px-3 py-2 text-left hover:bg-muted flex items-center gap-2 text-foreground"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                View
                              </a>
                              <button
                                onClick={() => {
                                  handleDuplicatePage(page);
                                  setPageDropdownOpen(null);
                                }}
                                className="w-full px-3 py-2 text-left hover:bg-muted flex items-center gap-2 text-foreground"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                Duplicate
                              </button>
                              <div className="h-px bg-border my-1" />
                              <button
                                onClick={() => {
                                  setDeleteConfirmPage(page);
                                  setPageDropdownOpen(null);
                                }}
                                className="w-full px-3 py-2 text-left hover:bg-destructive/10 text-destructive flex items-center gap-2"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Floating Action Button (FAB) for New Page */}
              <button
                onClick={() => {
                  setEditingPage(null);
                  setIsPageEditorOpen(true);
                }}
                className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg flex items-center justify-center transition-transform hover:scale-105 focus:outline-none"
                title="Create New Page"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. TOOLS VIEW */}
          {/* ========================================================= */}
          {activeMenu === 'tools' && (
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Header with Search, Category Filter, and Add Tool button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search 189+ tools..."
                      value={toolSearch}
                      onChange={e => setToolSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-border bg-card text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <select
                    value={toolCategoryFilter}
                    onChange={e => setToolCategoryFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-border bg-card text-xs text-foreground focus:outline-none"
                  >
                    <option value="All">All Categories ({tools.length})</option>
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => setIsAddCustomToolOpen(true)}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors self-start sm:self-auto"
                >
                  <Code className="w-4 h-4" />
                  <span>Add Tool (HTML Code)</span>
                </button>
              </div>

              {/* Custom HTML Tools Section (If any) */}
              {customToolsList.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Custom Admin Tools ({customToolsList.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {customToolsList.map(ct => (
                      <div
                        key={ct.id}
                        className="p-4 bg-card rounded-2xl border border-primary/30 flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-foreground truncate">{ct.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">
                              Custom HTML
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{ct.description || `/${ct.slug}`}</p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setPreviewCustomTool(ct)}
                            className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                            title="Preview Tool"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCustomToolAction(ct.id)}
                            className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"
                            title="Delete Custom Tool"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Built-in 189+ Tools List */}
              <div className="space-y-2">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-muted-foreground" />
                  Built-in Tools Directory ({filteredTools.length})
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {filteredTools.map(tool => {
                    const override = settings.toolOverrides[tool.slug];
                    const isDisabled = override?.disabled ?? false;
                    const Icon = tool.icon;

                    return (
                      <div
                        key={tool.slug}
                        className={`p-3.5 bg-card rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          isDisabled ? 'opacity-50 border-border bg-muted/20' : 'border-border hover:border-border/80 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <Icon className="w-5 h-5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-foreground truncate">
                                {override?.customName || tool.name}
                              </span>
                              {override?.customBadge && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 font-bold">
                                  {override.customBadge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {override?.customDescription || tool.intro}
                            </p>
                          </div>
                        </div>

                        {/* Actions (Toggle Switch & Edit) */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* ON/OFF Toggle Switch */}
                          <button
                            onClick={() => handleToggleToolState(tool.slug, isDisabled)}
                            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                              !isDisabled ? 'bg-emerald-500' : 'bg-muted'
                            }`}
                            title={!isDisabled ? 'Active (Click to Disable)' : 'Disabled (Click to Enable)'}
                          >
                            <div
                              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                !isDisabled ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>

                          <button
                            onClick={() => {
                              setEditingTool(tool);
                              setToolOverrideForm(override || {});
                              setIsToolModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground text-xs"
                            title="Edit Tool"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 4. LAYOUT VIEW */}
          {/* ========================================================= */}
          {activeMenu === 'layout' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div>
                  <h2 className="text-xl font-display font-extrabold text-foreground">Layout Customizer</h2>
                  <p className="text-xs text-muted-foreground">
                    Reorder homepage sections, toggle visibility, and inject custom HTML/CSS scripts.
                  </p>
                </div>

                <button
                  onClick={handleSaveLayoutAction}
                  disabled={savingLayout}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingLayout ? 'Saving...' : 'Save Layout'}</span>
                </button>
              </div>

              {/* Homepage Sections Reordering */}
              <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-primary" />
                  Homepage Section Order & Visibility
                </h3>
                <p className="text-xs text-muted-foreground">
                  Use the arrows to reorder sections. Toggle the switch to hide or display sections on the homepage.
                </p>

                <div className="space-y-2">
                  {layoutSections.map((secKey, idx) => {
                    const isVisible = sectionVisibility[secKey] ?? true;
                    const labels: Record<string, string> = {
                      hero: 'Hero Showcase & Search Bar',
                      categories: 'Category Quick-Filter Strip',
                      'tech-digest': 'Daily Tech Digest Reader Card',
                      'featured-tools': 'Trending & Featured Utility Cards',
                      'all-tools': 'Full 189+ Tool Directory Grid',
                    };

                    return (
                      <div
                        key={secKey}
                        className="p-3 bg-muted/40 rounded-xl border border-border flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-md bg-card border border-border flex items-center justify-center font-mono text-xs font-bold text-muted-foreground">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="font-semibold text-xs text-foreground">{labels[secKey] || secKey}</p>
                            <span className="text-[11px] text-muted-foreground font-mono">id: {secKey}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => moveSection(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 rounded hover:bg-muted text-muted-foreground disabled:opacity-30"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => moveSection(idx, 'down')}
                            disabled={idx === layoutSections.length - 1}
                            className="p-1 rounded hover:bg-muted text-muted-foreground disabled:opacity-30"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>

                          {/* Visibility Toggle */}
                          <button
                            onClick={() => toggleSectionVis(secKey)}
                            className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                              isVisible ? 'bg-emerald-500' : 'bg-muted'
                            }`}
                          >
                            <div
                              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                isVisible ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom HTML/CSS/JS Scripts Injection */}
              <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Code className="w-4 h-4 text-primary" />
                  Custom Code & Scripts Injection
                </h3>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="font-medium text-muted-foreground block mb-1">
                      Header Code (Injected into &lt;head&gt;)
                    </label>
                    <textarea
                      rows={3}
                      value={customHeadScripts}
                      onChange={e => setCustomHeadScripts(e.target.value)}
                      placeholder="<!-- Google Analytics, Custom Fonts, Meta tags -->"
                      className="w-full rounded-xl border border-border bg-background p-3 font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-muted-foreground block mb-1">
                      Footer Custom HTML / Code (Injected before &lt;/body&gt;)
                    </label>
                    <textarea
                      rows={3}
                      value={customFooterCode}
                      onChange={e => setCustomFooterCode(e.target.value)}
                      placeholder="<!-- Custom chat widget, promotional banner, tracking pixels -->"
                      className="w-full rounded-xl border border-border bg-background p-3 font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 5. SETTINGS VIEW (Blogger order) */}
          {/* ========================================================= */}
          {activeMenu === 'settings' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div>
                  <h2 className="text-xl font-display font-extrabold text-foreground">Settings</h2>
                  <p className="text-xs text-muted-foreground">
                    Comprehensive site settings configured in Blogger dashboard order.
                  </p>
                </div>

                <button
                  onClick={handleSaveSettingsAction}
                  disabled={savingSettings}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingSettings ? 'Saving...' : 'Save Settings'}</span>
                </button>
              </div>

              {/* Blogger-Ordered Accordions */}
              <div className="bg-card rounded-2xl border border-border divide-y divide-border/60 overflow-hidden text-sm">
                {/* 1. Basic */}
                <div className="p-4 sm:p-5">
                  <button
                    onClick={() => setActiveSettingsAccordion(activeSettingsAccordion === 'basic' ? '' : 'basic')}
                    className="w-full flex items-center justify-between font-bold text-foreground text-left"
                  >
                    <span>1. Basic</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${activeSettingsAccordion === 'basic' ? 'rotate-180' : ''}`} />
                  </button>

                  {activeSettingsAccordion === 'basic' && (
                    <div className="mt-4 space-y-3 pt-2 text-xs">
                      <div>
                        <label className="font-medium text-muted-foreground block mb-1">Title</label>
                        <input
                          type="text"
                          value={settingsForm.branding.siteName}
                          onChange={e => setSettingsForm({
                            ...settingsForm,
                            branding: { ...settingsForm.branding, siteName: e.target.value }
                          })}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                        />
                      </div>
                      <div>
                        <label className="font-medium text-muted-foreground block mb-1">Description</label>
                        <textarea
                          rows={2}
                          value={settingsForm.branding.tagline}
                          onChange={e => setSettingsForm({
                            ...settingsForm,
                            branding: { ...settingsForm.branding, tagline: e.target.value }
                          })}
                          className="w-full rounded-lg border border-border bg-background p-2.5 text-foreground resize-none"
                        />
                      </div>
                      <div>
                        <label className="font-medium text-muted-foreground block mb-1">Contact Email</label>
                        <input
                          type="email"
                          value={settingsForm.branding.contactEmail}
                          onChange={e => setSettingsForm({
                            ...settingsForm,
                            branding: { ...settingsForm.branding, contactEmail: e.target.value }
                          })}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Posts */}
                <div className="p-4 sm:p-5">
                  <button
                    onClick={() => setActiveSettingsAccordion(activeSettingsAccordion === 'posts' ? '' : 'posts')}
                    className="w-full flex items-center justify-between font-bold text-foreground text-left"
                  >
                    <span>2. Posts</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${activeSettingsAccordion === 'posts' ? 'rotate-180' : ''}`} />
                  </button>

                  {activeSettingsAccordion === 'posts' && (
                    <div className="mt-4 space-y-3 pt-2 text-xs">
                      <div>
                        <label className="font-medium text-muted-foreground block mb-1">Max posts per page</label>
                        <input
                          type="number"
                          value={settingsForm.bloggerSettings?.postsPerPage || 10}
                          onChange={e => setSettingsForm({
                            ...settingsForm,
                            bloggerSettings: { ...settingsForm.bloggerSettings, postsPerPage: Number(e.target.value) }
                          })}
                          className="w-32 rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                        />
                      </div>

                      <div className="space-y-2 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settingsForm.bloggerSettings?.lightboxEnabled ?? true}
                            onChange={e => setSettingsForm({
                              ...settingsForm,
                              bloggerSettings: { ...settingsForm.bloggerSettings, lightboxEnabled: e.target.checked }
                            })}
                            className="rounded text-primary focus:ring-primary"
                          />
                          <span>Image Lightbox popup for readers</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settingsForm.bloggerSettings?.lazyLoadImages ?? true}
                            onChange={e => setSettingsForm({
                              ...settingsForm,
                              bloggerSettings: { ...settingsForm.bloggerSettings, lazyLoadImages: e.target.checked }
                            })}
                            className="rounded text-primary focus:ring-primary"
                          />
                          <span>Lazy load images for high-speed mobile performance</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settingsForm.bloggerSettings?.webpServing ?? true}
                            onChange={e => setSettingsForm({
                              ...settingsForm,
                              bloggerSettings: { ...settingsForm.bloggerSettings, webpServing: e.target.checked }
                            })}
                            className="rounded text-primary focus:ring-primary"
                          />
                          <span>Serve WebP responsive image formats</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Formatting */}
                <div className="p-4 sm:p-5">
                  <button
                    onClick={() => setActiveSettingsAccordion(activeSettingsAccordion === 'formatting' ? '' : 'formatting')}
                    className="w-full flex items-center justify-between font-bold text-foreground text-left"
                  >
                    <span>3. Formatting</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${activeSettingsAccordion === 'formatting' ? 'rotate-180' : ''}`} />
                  </button>

                  {activeSettingsAccordion === 'formatting' && (
                    <div className="mt-4 space-y-3 pt-2 text-xs">
                      <div>
                        <label className="font-medium text-muted-foreground block mb-1">Time zone</label>
                        <input
                          type="text"
                          value={settingsForm.bloggerSettings?.timezone || 'UTC+06:00'}
                          onChange={e => setSettingsForm({
                            ...settingsForm,
                            bloggerSettings: { ...settingsForm.bloggerSettings, timezone: e.target.value }
                          })}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground font-mono"
                        />
                      </div>
                      <div>
                        <label className="font-medium text-muted-foreground block mb-1">Date header format</label>
                        <input
                          type="text"
                          value={settingsForm.bloggerSettings?.dateFormat || 'MMMM D, YYYY'}
                          onChange={e => setSettingsForm({
                            ...settingsForm,
                            bloggerSettings: { ...settingsForm.bloggerSettings, dateFormat: e.target.value }
                          })}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Meta tags */}
                <div className="p-4 sm:p-5">
                  <button
                    onClick={() => setActiveSettingsAccordion(activeSettingsAccordion === 'meta' ? '' : 'meta')}
                    className="w-full flex items-center justify-between font-bold text-foreground text-left"
                  >
                    <span>4. Meta tags</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${activeSettingsAccordion === 'meta' ? 'rotate-180' : ''}`} />
                  </button>

                  {activeSettingsAccordion === 'meta' && (
                    <div className="mt-4 space-y-3 pt-2 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsForm.bloggerSettings?.searchDescriptionEnabled ?? true}
                          onChange={e => setSettingsForm({
                            ...settingsForm,
                            bloggerSettings: { ...settingsForm.bloggerSettings, searchDescriptionEnabled: e.target.checked }
                          })}
                          className="rounded text-primary focus:ring-primary"
                        />
                        <span>Enable search description</span>
                      </label>
                      <div>
                        <label className="font-medium text-muted-foreground block mb-1">Search description</label>
                        <textarea
                          rows={3}
                          value={settingsForm.seo.defaultDescription}
                          onChange={e => setSettingsForm({
                            ...settingsForm,
                            seo: { ...settingsForm.seo, defaultDescription: e.target.value }
                          })}
                          className="w-full rounded-lg border border-border bg-background p-2.5 text-foreground resize-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. Errors and redirects */}
                <div className="p-4 sm:p-5">
                  <button
                    onClick={() => setActiveSettingsAccordion(activeSettingsAccordion === 'errors' ? '' : 'errors')}
                    className="w-full flex items-center justify-between font-bold text-foreground text-left"
                  >
                    <span>5. Errors and redirects</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${activeSettingsAccordion === 'errors' ? 'rotate-180' : ''}`} />
                  </button>

                  {activeSettingsAccordion === 'errors' && (
                    <div className="mt-4 space-y-3 pt-2 text-xs">
                      <div>
                        <label className="font-medium text-muted-foreground block mb-1">Custom 404 page message (HTML)</label>
                        <textarea
                          rows={2}
                          placeholder="Page not found. Explore our 189+ free tools below!"
                          value={settingsForm.bloggerSettings?.custom404Html || ''}
                          onChange={e => setSettingsForm({
                            ...settingsForm,
                            bloggerSettings: { ...settingsForm.bloggerSettings, custom404Html: e.target.value }
                          })}
                          className="w-full rounded-lg border border-border bg-background p-2.5 text-foreground font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 6. Crawlers and indexing */}
                <div className="p-4 sm:p-5">
                  <button
                    onClick={() => setActiveSettingsAccordion(activeSettingsAccordion === 'crawlers' ? '' : 'crawlers')}
                    className="w-full flex items-center justify-between font-bold text-foreground text-left"
                  >
                    <span>6. Crawlers and indexing</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${activeSettingsAccordion === 'crawlers' ? 'rotate-180' : ''}`} />
                  </button>

                  {activeSettingsAccordion === 'crawlers' && (
                    <div className="mt-4 space-y-3 pt-2 text-xs">
                      <div>
                        <label className="font-medium text-muted-foreground block mb-1">Custom robots.txt</label>
                        <textarea
                          rows={4}
                          value={settingsForm.bloggerSettings?.customRobotsTxt || 'User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: https://toolzaro.cyou/sitemap-index.xml'}
                          onChange={e => setSettingsForm({
                            ...settingsForm,
                            bloggerSettings: { ...settingsForm.bloggerSettings, customRobotsTxt: e.target.value }
                          })}
                          className="w-full rounded-lg border border-border bg-background p-2.5 text-foreground font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 7. Monetisation */}
                <div className="p-4 sm:p-5">
                  <button
                    onClick={() => setActiveSettingsAccordion(activeSettingsAccordion === 'monetisation' ? '' : 'monetisation')}
                    className="w-full flex items-center justify-between font-bold text-foreground text-left"
                  >
                    <span>7. Monetisation</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${activeSettingsAccordion === 'monetisation' ? 'rotate-180' : ''}`} />
                  </button>

                  {activeSettingsAccordion === 'monetisation' && (
                    <div className="mt-4 space-y-3 pt-2 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsForm.ads.enabled}
                          onChange={e => setSettingsForm({
                            ...settingsForm,
                            ads: { ...settingsForm.ads, enabled: e.target.checked }
                          })}
                          className="rounded text-primary focus:ring-primary"
                        />
                        <span>Enable Google AdSense ads</span>
                      </label>

                      <div>
                        <label className="font-medium text-muted-foreground block mb-1">AdSense Publisher ID</label>
                        <input
                          type="text"
                          value={settingsForm.ads.publisherId}
                          onChange={e => setSettingsForm({
                            ...settingsForm,
                            ads: { ...settingsForm.ads, publisherId: e.target.value }
                          })}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground font-mono"
                        />
                      </div>

                      <div>
                        <label className="font-medium text-muted-foreground block mb-1">Custom ads.txt</label>
                        <textarea
                          rows={2}
                          value={settingsForm.bloggerSettings?.adsTxtContent || 'google.com, pub-8769496591745522, DIRECT, f08c47fec0942fa0'}
                          onChange={e => setSettingsForm({
                            ...settingsForm,
                            bloggerSettings: { ...settingsForm.bloggerSettings, adsTxtContent: e.target.value }
                          })}
                          className="w-full rounded-lg border border-border bg-background p-2.5 text-foreground font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 8. Manage */}
                <div className="p-4 sm:p-5">
                  <button
                    onClick={() => setActiveSettingsAccordion(activeSettingsAccordion === 'manage' ? '' : 'manage')}
                    className="w-full flex items-center justify-between font-bold text-foreground text-left"
                  >
                    <span>8. Manage</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${activeSettingsAccordion === 'manage' ? 'rotate-180' : ''}`} />
                  </button>

                  {activeSettingsAccordion === 'manage' && (
                    <div className="mt-4 space-y-4 pt-2 text-xs">
                      <div className="p-3 bg-muted/40 rounded-xl border border-border flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-foreground">Back up content</p>
                          <p className="text-[11px] text-muted-foreground">Export all posts, pages, tools, and settings as a JSON file</p>
                        </div>
                        <button
                          onClick={handleExportBackup}
                          className="px-3 py-1.5 bg-card border border-border hover:bg-muted rounded-lg font-medium flex items-center gap-1.5 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5 text-primary" />
                          <span>Export</span>
                        </button>
                      </div>

                      <div className="p-3 bg-muted/40 rounded-xl border border-border flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-foreground">Import content</p>
                          <p className="text-[11px] text-muted-foreground">Restore posts, pages, and layout from a backup JSON file</p>
                        </div>
                        <label className="px-3 py-1.5 bg-card border border-border hover:bg-muted rounded-lg font-medium flex items-center gap-1.5 transition-colors cursor-pointer">
                          <Upload className="w-3.5 h-3.5 text-primary" />
                          <span>Import</span>
                          <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* 9. Site feed */}
                <div className="p-4 sm:p-5">
                  <button
                    onClick={() => setActiveSettingsAccordion(activeSettingsAccordion === 'feed' ? '' : 'feed')}
                    className="w-full flex items-center justify-between font-bold text-foreground text-left"
                  >
                    <span>9. Site feed</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${activeSettingsAccordion === 'feed' ? 'rotate-180' : ''}`} />
                  </button>

                  {activeSettingsAccordion === 'feed' && (
                    <div className="mt-4 space-y-3 pt-2 text-xs">
                      <div>
                        <label className="font-medium text-muted-foreground block mb-1">Allow blog feed</label>
                        <select
                          value={settingsForm.bloggerSettings?.rssFeedType || 'full'}
                          onChange={e => setSettingsForm({
                            ...settingsForm,
                            bloggerSettings: { ...settingsForm.bloggerSettings, rssFeedType: e.target.value as any }
                          })}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                        >
                          <option value="full">Full (Entire post content)</option>
                          <option value="short">Short (Excerpt only)</option>
                          <option value="none">None (Disabled)</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* 10. Permissions */}
                <div className="p-4 sm:p-5">
                  <button
                    onClick={() => setActiveSettingsAccordion(activeSettingsAccordion === 'permissions' ? '' : 'permissions')}
                    className="w-full flex items-center justify-between font-bold text-foreground text-left"
                  >
                    <span>10. Permissions</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${activeSettingsAccordion === 'permissions' ? 'rotate-180' : ''}`} />
                  </button>

                  {activeSettingsAccordion === 'permissions' && (
                    <div className="mt-4 space-y-4 pt-2 text-xs">
                      <div>
                        <label className="font-medium text-muted-foreground block mb-1">Reader access</label>
                        <select
                          value={settingsForm.bloggerSettings?.readerAccess || 'public'}
                          onChange={e => setSettingsForm({
                            ...settingsForm,
                            bloggerSettings: { ...settingsForm.bloggerSettings, readerAccess: e.target.value as any }
                          })}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                        >
                          <option value="public">Public (Open to everyone worldwide)</option>
                          <option value="private">Private (Admin only)</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-medium text-muted-foreground block mb-1">ImgBB API Key (Image Uploads)</label>
                        <input
                          type="text"
                          value={settingsForm.admin.imgbbApiKey}
                          onChange={e => setSettingsForm({
                            ...settingsForm,
                            admin: { ...settingsForm.admin, imgbbApiKey: e.target.value }
                          })}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground font-mono"
                        />
                      </div>

                      <div>
                        <label className="font-medium text-muted-foreground block mb-1">Blog Authors & Team Emails</label>
                        <div className="space-y-1">
                          {(settingsForm.admin.allowedEmails || []).map(em => (
                            <div key={em} className="p-2 rounded-lg bg-muted/40 border border-border flex items-center justify-between">
                              <span className="font-mono text-xs">{em}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">Admin</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================= */}
      {/* MOBILE BOTTOM NAVIGATION BAR */}
      {/* ========================================================= */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card/95 backdrop-blur border-t border-border flex items-center justify-around px-2 z-30 lg:hidden">
        {[
          { id: 'posts', label: 'Posts', icon: FileText },
          { id: 'pages', label: 'Pages', icon: Layers },
          { id: 'tools', label: 'Tools', icon: Wrench },
          { id: 'layout', label: 'Layout', icon: Sliders },
          { id: 'settings', label: 'Settings', icon: SettingsIcon },
        ].map(item => {
          const Icon = item.icon;
          const active = activeMenu === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id as any)}
              className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-colors ${
                active ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ========================================================= */}
      {/* UNIFIED RICH CONTENT EDITOR MODAL (For Posts & Pages) */}
      {/* ========================================================= */}
      {isPostEditorOpen && (
        <RichContentEditor
          type="post"
          initialData={editingPost}
          imgbbApiKey={settings.admin.imgbbApiKey}
          onSave={handleSavePost}
          onClose={() => {
            setIsPostEditorOpen(false);
            setEditingPost(null);
          }}
        />
      )}

      {isPageEditorOpen && (
        <RichContentEditor
          type="page"
          initialData={editingPage}
          imgbbApiKey={settings.admin.imgbbApiKey}
          onSave={handleSavePage}
          onClose={() => {
            setIsPageEditorOpen(false);
            setEditingPage(null);
          }}
        />
      )}

      {/* ========================================================= */}
      {/* DELETE CONFIRMATION DIALOG (Posts) */}
      {/* ========================================================= */}
      {deleteConfirmPost && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-sm rounded-2xl border border-border shadow-xl p-5 space-y-4">
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              Delete Post?
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to permanently delete "{deleteConfirmPost.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmPost(null)}
                className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePost(deleteConfirmPost)}
                className="px-4 py-1.5 rounded-lg bg-destructive hover:bg-destructive/90 text-white text-xs font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DELETE CONFIRMATION DIALOG (Pages) */}
      {/* ========================================================= */}
      {deleteConfirmPage && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-sm rounded-2xl border border-border shadow-xl p-5 space-y-4">
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              Delete Page?
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to delete page "{deleteConfirmPage.title}"? The URL /{deleteConfirmPage.slug} will become inactive.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmPage(null)}
                className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePage(deleteConfirmPage)}
                className="px-4 py-1.5 rounded-lg bg-destructive hover:bg-destructive/90 text-white text-xs font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* EDIT BUILT-IN TOOL MODAL */}
      {/* ========================================================= */}
      {isToolModalOpen && editingTool && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-primary" />
                Edit Tool: {editingTool.name}
              </h3>
              <button onClick={() => setIsToolModalOpen(false)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-muted-foreground block mb-1">Custom Display Name</label>
                <input
                  type="text"
                  value={toolOverrideForm.customName || ''}
                  placeholder={editingTool.name}
                  onChange={e => setToolOverrideForm({ ...toolOverrideForm, customName: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                />
              </div>

              <div>
                <label className="font-medium text-muted-foreground block mb-1">Custom Description</label>
                <textarea
                  rows={2}
                  value={toolOverrideForm.customDescription || ''}
                  placeholder={editingTool.intro}
                  onChange={e => setToolOverrideForm({ ...toolOverrideForm, customDescription: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background p-2.5 text-foreground resize-none"
                />
              </div>

              <div>
                <label className="font-medium text-muted-foreground block mb-1">Badge (Optional)</label>
                <select
                  value={toolOverrideForm.customBadge || ''}
                  onChange={e => setToolOverrideForm({ ...toolOverrideForm, customBadge: e.target.value as any })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                >
                  <option value="">None</option>
                  <option value="Popular">Popular</option>
                  <option value="New">New</option>
                  <option value="Pro">Pro</option>
                  <option value="Featured">Featured</option>
                  <option value="Updated">Updated</option>
                </select>
              </div>

              <div>
                <label className="font-medium text-muted-foreground block mb-1">Custom HTML/CSS snippet</label>
                <textarea
                  rows={2}
                  value={toolOverrideForm.customCode || ''}
                  placeholder="<!-- Extra banner or instructions inside tool page -->"
                  onChange={e => setToolOverrideForm({ ...toolOverrideForm, customCode: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background p-2 font-mono text-[11px] text-foreground"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setIsToolModalOpen(false)} className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-xs font-medium">
                Cancel
              </button>
              <button onClick={handleSaveToolOverride} className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ADD CUSTOM HTML TOOL MODAL */}
      {/* ========================================================= */}
      {isAddCustomToolOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-2xl max-h-[90vh] rounded-3xl border border-border shadow-2xl p-6 flex flex-col space-y-4 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-border shrink-0">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Code className="w-5 h-5 text-primary" />
                Add New Tool (HTML Code)
              </h3>
              <button onClick={() => setIsAddCustomToolOpen(false)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 text-xs pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-muted-foreground block mb-1">Tool Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Markdown Table Builder"
                    value={customToolForm.name || ''}
                    onChange={e => {
                      const name = e.target.value;
                      const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
                      setCustomToolForm({ ...customToolForm, name, slug: customToolForm.slug || slug });
                    }}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                  />
                </div>

                <div>
                  <label className="font-medium text-muted-foreground block mb-1">URL Slug</label>
                  <input
                    type="text"
                    placeholder="markdown-table-builder"
                    value={customToolForm.slug || ''}
                    onChange={e => setCustomToolForm({ ...customToolForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-muted-foreground block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Short description of what the tool does..."
                  value={customToolForm.description || ''}
                  onChange={e => setCustomToolForm({ ...customToolForm, description: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                />
              </div>

              <div>
                <label className="font-medium text-muted-foreground block mb-1">Custom Tool HTML/CSS/JS Code</label>
                <textarea
                  rows={8}
                  placeholder="<div id='app'>...</div><script>...</script><style>...</style>"
                  value={customToolForm.customHtml || ''}
                  onChange={e => setCustomToolForm({ ...customToolForm, customHtml: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background p-3 font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Runs inside an isolated, responsive sandbox frame with full-screen toggle support.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border shrink-0">
              <button onClick={() => setIsAddCustomToolOpen(false)} className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-xs font-medium">
                Cancel
              </button>
              <button onClick={handleSaveCustomToolAction} className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold">
                Create Tool
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PREVIEW CUSTOM TOOL MODAL */}
      {/* ========================================================= */}
      {previewCustomTool && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-4xl h-[85vh] rounded-3xl border border-border shadow-2xl flex flex-col overflow-hidden">
            <div className="h-14 border-b border-border px-4 flex items-center justify-between bg-muted/40 shrink-0">
              <span className="font-bold text-sm text-foreground">Preview: {previewCustomTool.name}</span>
              <button onClick={() => setPreviewCustomTool(null)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-hidden">
              <CustomToolRunner
                customHtml={previewCustomTool.customHtml}
                name={previewCustomTool.name}
                description={previewCustomTool.description}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
