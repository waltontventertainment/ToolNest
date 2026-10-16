import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Save,
  Eye,
  Settings as SettingsIcon,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Video,
  Smile,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo2,
  Redo2,
  RemoveFormatting,
  ChevronDown,
  Calendar,
  Globe,
  Tag,
  Folder,
  FileText,
  Upload,
  Check,
  AlertCircle,
  HelpCircle,
  Maximize2,
  Minimize2,
  Sparkles,
  ExternalLink,
  Layers,
  Clock,
  Menu
} from 'lucide-react';
import { toast } from 'sonner';
import { uploadToImgBB } from '../../lib/imgbb';
import { extractFirstImageFromContent } from '../../lib/pagesService';

export interface RichContentEditorProps {
  type: 'post' | 'page';
  initialData?: any;
  imgbbApiKey?: string;
  onSave: (data: any, status: 'published' | 'draft' | 'scheduled') => Promise<void>;
  onClose: () => void;
}

export const RichContentEditor: React.FC<RichContentEditorProps> = ({
  type,
  initialData,
  imgbbApiKey,
  onSave,
  onClose,
}) => {
  const isPost = type === 'post';

  // Core Form State
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [isCustomSlug, setIsCustomSlug] = useState(Boolean(initialData?.slug));
  const [content, setContent] = useState(initialData?.content || '');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
  const [category, setCategory] = useState(initialData?.category || (isPost ? 'Technology' : 'General'));
  const [tagsInput, setTagsInput] = useState((initialData?.tags || []).join(', '));
  const [status, setStatus] = useState<'published' | 'draft' | 'scheduled'>(initialData?.status || 'published');
  const [publishedAt, setPublishedAt] = useState(
    initialData?.publishedAt
      ? new Date(initialData.publishedAt).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  );
  const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || initialData?.excerpt || '');
  const [placement, setPlacement] = useState<'header' | 'footer' | 'both' | 'custom'>(initialData?.placement || 'custom');
  
  // Thumbnail State
  const [manualThumbnail, setManualThumbnail] = useState(initialData?.coverImage || '');
  const [isManualThumbnail, setIsManualThumbnail] = useState(Boolean(initialData?.thumbnailManual));

  // View States
  const [viewMode, setViewMode] = useState<'compose' | 'html'>('compose');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');

  // Accordion active sections in Settings Drawer
  const [openAccordion, setOpenAccordion] = useState<string>('permalink');

  // Image upload modal state
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageAltInput, setImageAltInput] = useState('');
  const [imageUploading, setImageUploading] = useState(false);

  // Link modal state
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrlInput, setLinkUrlInput] = useState('');
  const [linkTextInput, setLinkTextInput] = useState('');

  // Video embed modal state
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoUrlInput, setVideoUrlInput] = useState('');

  // ContentEditable ref for Compose view
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derive Auto-Thumbnail from Content
  const autoThumbnail = extractFirstImageFromContent(content);
  const activeThumbnail = isManualThumbnail && manualThumbnail ? manualThumbnail : autoThumbnail;

  // Auto-generate slug from title if not custom
  useEffect(() => {
    if (!isCustomSlug && title) {
      const generated = title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
      setSlug(generated);
    }
  }, [title, isCustomSlug]);

  // Sync content into ContentEditable on view change
  useEffect(() => {
    if (viewMode === 'compose' && editorRef.current) {
      if (editorRef.current.innerHTML !== content) {
        editorRef.current.innerHTML = content;
      }
    }
  }, [viewMode]);

  // Handle compose input
  const handleEditorInput = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  // Execute formatting command in Compose view
  const execCmd = (command: string, value: string | undefined = undefined) => {
    if (viewMode !== 'compose') {
      toast.info('Switch to Compose view to use visual formatting');
      return;
    }
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    handleEditorInput();
  };

  // Image insertion
  const handleInsertImage = () => {
    if (!imageUrlInput.trim()) return;
    const imgHtml = `<p><img src="${imageUrlInput.trim()}" alt="${imageAltInput.trim() || title}" loading="lazy" class="rounded-xl max-w-full my-4 shadow-sm" /></p>`;
    
    if (viewMode === 'compose') {
      execCmd('insertHTML', imgHtml);
    } else {
      setContent(prev => prev + '\n' + imgHtml);
    }
    setImageUrlInput('');
    setImageAltInput('');
    setIsImageModalOpen(false);
    toast.success('Image inserted into content');
  };

  // Image upload via ImgBB
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!imgbbApiKey) {
      toast.error('ImgBB API key not configured in Settings');
      return;
    }

    setImageUploading(true);
    try {
      const result = await uploadToImgBB(file, imgbbApiKey);
      if (result && result.url) {
        setImageUrlInput(result.url);
        toast.success('Image uploaded to ImgBB successfully');
      } else {
        toast.error('Image upload failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Image upload failed');
    } finally {
      setImageUploading(false);
    }
  };

  // Link insertion
  const handleInsertLink = () => {
    if (!linkUrlInput.trim()) return;
    const url = linkUrlInput.trim().startsWith('http') ? linkUrlInput.trim() : `https://${linkUrlInput.trim()}`;
    const text = linkTextInput.trim() || url;
    const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-medium">${text}</a>`;

    if (viewMode === 'compose') {
      execCmd('insertHTML', linkHtml);
    } else {
      setContent(prev => prev + ' ' + linkHtml);
    }
    setLinkUrlInput('');
    setLinkTextInput('');
    setIsLinkModalOpen(false);
  };

  // Video insertion (YouTube / embed)
  const handleInsertVideo = () => {
    if (!videoUrlInput.trim()) return;
    let embedUrl = videoUrlInput.trim();
    if (embedUrl.includes('youtube.com/watch?v=')) {
      const videoId = embedUrl.split('v=')[1]?.split('&')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (embedUrl.includes('youtu.be/')) {
      const videoId = embedUrl.split('youtu.be/')[1]?.split('?')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }

    const videoHtml = `
      <div class="my-6 aspect-video rounded-xl overflow-hidden shadow-sm">
        <iframe src="${embedUrl}" class="w-full h-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>
    `;

    if (viewMode === 'compose') {
      execCmd('insertHTML', videoHtml);
    } else {
      setContent(prev => prev + '\n' + videoHtml);
    }
    setVideoUrlInput('');
    setIsVideoModalOpen(false);
    toast.success('Video embedded successfully');
  };

  // Auto-Save Draft Debounce
  useEffect(() => {
    if (!title.trim() && !content.trim()) return;

    const timer = setTimeout(() => {
      setAutoSaveStatus('saving');
      const draftPayload = {
        title,
        slug,
        content,
        excerpt,
        category,
        tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
        status: 'draft',
        publishedAt: new Date(publishedAt).toISOString(),
        coverImage: activeThumbnail || '',
        thumbnailManual: isManualThumbnail,
        metaTitle,
        metaDescription,
        placement,
      };

      try {
        localStorage.setItem(`toolzaro_autosave_${type}_${slug || 'draft'}`, JSON.stringify(draftPayload));
        setAutoSaveStatus('saved');
        setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } catch {}
    }, 2500);

    return () => clearTimeout(timer);
  }, [title, slug, content, excerpt, category, tagsInput, publishedAt, activeThumbnail, isManualThumbnail, metaTitle, metaDescription, placement, type]);

  // Save handler
  const handleSaveAction = async (targetStatus: 'published' | 'draft' | 'scheduled') => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!slug.trim()) {
      toast.error('Please enter a URL path');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...(initialData || {}),
        title: title.trim(),
        slug: slug.trim().toLowerCase(),
        content,
        excerpt: excerpt.trim() || content.replace(/<[^>]*>/g, '').slice(0, 160).trim(),
        category,
        tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
        status: targetStatus,
        publishedAt: new Date(publishedAt).toISOString(),
        coverImage: activeThumbnail || '',
        thumbnailManual: isManualThumbnail,
        metaTitle: metaTitle.trim() || title.trim(),
        metaDescription: metaDescription.trim() || excerpt.trim(),
        placement,
      };

      await onSave(payload, targetStatus);
      setStatus(targetStatus);
      toast.success(
        targetStatus === 'published'
          ? `${isPost ? 'Post' : 'Page'} published successfully!`
          : targetStatus === 'scheduled'
          ? `${isPost ? 'Post' : 'Page'} scheduled successfully!`
          : 'Draft saved successfully!'
      );
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col overflow-hidden">
      {/* Top Bar (Title + Actions) */}
      <header className="h-16 border-b border-border bg-card/95 backdrop-blur px-3 sm:px-6 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Back to list"
          >
            <X className="w-5 h-5" />
          </button>

          <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary shrink-0 hidden sm:inline-block">
            {isPost ? 'Post' : 'Page'}
          </span>

          <input
            type="text"
            placeholder={isPost ? 'Title of your post...' : 'Page Title (e.g. About, Contact)...'}
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="flex-1 text-base sm:text-lg font-semibold bg-transparent border-0 focus:outline-none focus:ring-0 text-foreground placeholder:text-muted-foreground/60 min-w-0"
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {autoSaveStatus === 'saved' && (
            <span className="text-xs text-muted-foreground hidden lg:inline-flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              Saved {lastSavedTime}
            </span>
          )}

          {/* Compose / HTML View Toggle */}
          <div className="flex items-center bg-muted/60 p-1 rounded-lg border border-border/80 text-xs font-medium">
            <button
              onClick={() => setViewMode('compose')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'compose' ? 'bg-card text-foreground shadow-2xs font-semibold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Compose
            </button>
            <button
              onClick={() => {
                if (viewMode === 'compose' && editorRef.current) {
                  setContent(editorRef.current.innerHTML);
                }
                setViewMode('html');
              }}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'html' ? 'bg-card text-foreground shadow-2xs font-semibold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              HTML
            </button>
          </div>

          {/* Preview Button */}
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg border border-border hover:bg-muted text-sm font-medium flex items-center gap-1.5 transition-colors"
            title="Preview"
          >
            <Eye className="w-4 h-4 text-muted-foreground" />
            <span className="hidden md:inline">Preview</span>
          </button>

          {/* Settings Drawer Toggle (Gear) */}
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`p-2 sm:px-3 sm:py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
              isSettingsOpen ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
            title="Post / Page Settings"
          >
            <SettingsIcon className="w-4 h-4" />
            <span className="hidden md:inline">Settings</span>
          </button>

          {/* Save / Publish Dropdown Button */}
          <div className="flex items-center">
            <button
              onClick={() => handleSaveAction('published')}
              disabled={saving}
              className="px-3 sm:px-4 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-l-lg shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Publishing...' : 'Publish'}</span>
            </button>
            <button
              onClick={() => handleSaveAction('draft')}
              disabled={saving}
              className="px-2 py-1.5 bg-primary/90 hover:bg-primary text-primary-foreground text-sm border-l border-white/20 rounded-r-lg transition-colors"
              title="Save as Draft"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Editor Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-background">
          {/* Rich Text Toolbar (Shown in Compose view) */}
          {viewMode === 'compose' ? (
            <div className="border-b border-border bg-card/60 px-2 sm:px-4 py-2 flex items-center gap-1 flex-wrap overflow-x-auto text-xs shrink-0 select-none">
              <button
                onClick={() => execCmd('undo')}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                title="Undo"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => execCmd('redo')}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                title="Redo"
              >
                <Redo2 className="w-4 h-4" />
              </button>

              <div className="w-px h-5 bg-border mx-1" />

              {/* Headings Dropdown */}
              <select
                onChange={e => {
                  const val = e.target.value;
                  if (val === 'p') execCmd('formatBlock', '<p>');
                  else if (val === 'h1') execCmd('formatBlock', '<h1>');
                  else if (val === 'h2') execCmd('formatBlock', '<h2>');
                  else if (val === 'h3') execCmd('formatBlock', '<h3>');
                }}
                className="bg-transparent border border-border/80 rounded px-2 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                defaultValue="p"
              >
                <option value="p">Paragraph</option>
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
              </select>

              <div className="w-px h-5 bg-border mx-1" />

              <button
                onClick={() => execCmd('bold')}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground font-bold"
                title="Bold (Ctrl+B)"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() => execCmd('italic')}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground italic"
                title="Italic (Ctrl+I)"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                onClick={() => execCmd('underline')}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground underline"
                title="Underline (Ctrl+U)"
              >
                <Underline className="w-4 h-4" />
              </button>
              <button
                onClick={() => execCmd('strikeThrough')}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground line-through"
                title="Strikethrough"
              >
                <Strikethrough className="w-4 h-4" />
              </button>

              <div className="w-px h-5 bg-border mx-1" />

              {/* Text Color Picker */}
              <label className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1" title="Text Color">
                <span className="font-bold underline text-xs">A</span>
                <input
                  type="color"
                  className="w-3.5 h-3.5 border-0 p-0 bg-transparent cursor-pointer"
                  onChange={e => execCmd('foreColor', e.target.value)}
                />
              </label>

              {/* Highlight Color Picker */}
              <label className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1" title="Highlight Color">
                <span className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded text-xs font-bold">H</span>
                <input
                  type="color"
                  className="w-3.5 h-3.5 border-0 p-0 bg-transparent cursor-pointer"
                  onChange={e => execCmd('hiliteColor', e.target.value)}
                />
              </label>

              <div className="w-px h-5 bg-border mx-1" />

              {/* Link, Image, Video */}
              <button
                onClick={() => setIsLinkModalOpen(true)}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                title="Insert Link"
              >
                <LinkIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsImageModalOpen(true)}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground flex items-center gap-1"
                title="Insert Image (Auto-Thumbnail)"
              >
                <ImageIcon className="w-4 h-4 text-primary" />
              </button>
              <button
                onClick={() => setIsVideoModalOpen(true)}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                title="Embed Video"
              >
                <Video className="w-4 h-4" />
              </button>

              <div className="w-px h-5 bg-border mx-1" />

              {/* Alignments */}
              <button
                onClick={() => execCmd('justifyLeft')}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                title="Align Left"
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => execCmd('justifyCenter')}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                title="Align Center"
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                onClick={() => execCmd('justifyRight')}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                title="Align Right"
              >
                <AlignRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => execCmd('justifyFull')}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                title="Justify"
              >
                <AlignJustify className="w-4 h-4" />
              </button>

              <div className="w-px h-5 bg-border mx-1" />

              {/* Lists & Quotes */}
              <button
                onClick={() => execCmd('insertUnorderedList')}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => execCmd('insertOrderedList')}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                title="Numbered List"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
              <button
                onClick={() => execCmd('formatBlock', '<blockquote>')}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                title="Blockquote"
              >
                <Quote className="w-4 h-4" />
              </button>
              <button
                onClick={() => execCmd('insertHorizontalRule')}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                title="Horizontal Divider"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="w-px h-5 bg-border mx-1" />

              <button
                onClick={() => execCmd('removeFormat')}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                title="Clear Formatting"
              >
                <RemoveFormatting className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="border-b border-border bg-muted/40 px-4 py-2 flex items-center justify-between text-xs text-muted-foreground font-mono">
              <span>Editing HTML Source Code</span>
              <span>Images placed here automatically retain their exact positions in the post</span>
            </div>
          )}

          {/* Editor Canvas */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center">
            <div className="w-full max-w-4xl min-h-full">
              {viewMode === 'compose' ? (
                <div
                  ref={editorRef}
                  contentEditable
                  onInput={handleEditorInput}
                  className="w-full min-h-[500px] bg-card rounded-2xl border border-border p-6 sm:p-10 shadow-2xs focus:outline-none prose dark:prose-invert max-w-none text-foreground leading-relaxed"
                  data-placeholder="Start writing your story or content here..."
                />
              ) : (
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full h-full min-h-[500px] p-6 font-mono text-sm bg-card rounded-2xl border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-y leading-relaxed"
                  placeholder="<p>Write your raw HTML here...</p>"
                />
              )}
            </div>
          </div>
        </div>

        {/* Slide-in Post / Page Settings Drawer (Accordion style) */}
        {isSettingsOpen && (
          <aside className="w-full sm:w-80 md:w-96 border-l border-border bg-card flex flex-col h-full shadow-lg z-20 absolute sm:static right-0 top-0 bottom-0 animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-2">
                <SettingsIcon className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm text-foreground">
                  {isPost ? 'Post settings' : 'Page settings'}
                </h3>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-border/60 text-sm">
              {/* Accordion 1: Permalink / URL Path */}
              <div className="p-4">
                <button
                  onClick={() => setOpenAccordion(openAccordion === 'permalink' ? '' : 'permalink')}
                  className="w-full flex items-center justify-between font-semibold text-foreground text-left"
                >
                  <span className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    Permalink (URL path)
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${openAccordion === 'permalink' ? 'rotate-180' : ''}`} />
                </button>

                {openAccordion === 'permalink' && (
                  <div className="mt-3 space-y-3 pt-2">
                    <div className="flex items-center gap-4 text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="slugType"
                          checked={!isCustomSlug}
                          onChange={() => setIsCustomSlug(false)}
                          className="text-primary focus:ring-primary"
                        />
                        <span>Automatic URL</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="slugType"
                          checked={isCustomSlug}
                          onChange={() => setIsCustomSlug(true)}
                          className="text-primary focus:ring-primary"
                        />
                        <span>Custom URL</span>
                      </label>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-mono">
                        <span className="text-muted-foreground select-none">domain.com/</span>
                        <input
                          type="text"
                          value={slug}
                          onChange={e => {
                            setIsCustomSlug(true);
                            setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                          }}
                          placeholder="url-path"
                          className="flex-1 bg-transparent border-0 focus:outline-none text-foreground ml-1"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Clean root-level SEO URL without hash fragments
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 2: Published on (Date & Schedule) */}
              <div className="p-4">
                <button
                  onClick={() => setOpenAccordion(openAccordion === 'published' ? '' : 'published')}
                  className="w-full flex items-center justify-between font-semibold text-foreground text-left"
                >
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    Published on
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${openAccordion === 'published' ? 'rotate-180' : ''}`} />
                </button>

                {openAccordion === 'published' && (
                  <div className="mt-3 space-y-3 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground font-medium">Date and time</label>
                      <input
                        type="datetime-local"
                        value={publishedAt}
                        onChange={e => setPublishedAt(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPublishedAt(new Date().toISOString().slice(0, 16))}
                        className="text-xs text-primary hover:underline"
                      >
                        Set to now
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 3: Thumbnail Management (Automatic Detection + Override) */}
              <div className="p-4">
                <button
                  onClick={() => setOpenAccordion(openAccordion === 'thumbnail' ? '' : 'thumbnail')}
                  className="w-full flex items-center justify-between font-semibold text-foreground text-left"
                >
                  <span className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-muted-foreground" />
                    Thumbnail
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${openAccordion === 'thumbnail' ? 'rotate-180' : ''}`} />
                </button>

                {openAccordion === 'thumbnail' && (
                  <div className="mt-3 space-y-3 pt-2">
                    <div className="p-3 bg-muted/40 rounded-xl border border-border flex items-center gap-3">
                      {activeThumbnail ? (
                        <img
                          src={activeThumbnail}
                          alt="Thumbnail preview"
                          className="w-14 h-14 rounded-lg object-cover border border-border/80 shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-primary/10 text-primary font-bold text-xl flex items-center justify-center border border-border/80 shrink-0">
                          {title ? title.charAt(0).toUpperCase() : 'T'}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {isManualThumbnail ? 'Manual Thumbnail' : autoThumbnail ? 'First Image in Content' : 'Title Initial Placeholder'}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {autoThumbnail
                            ? 'Automatically chosen from the first image placed in your content'
                            : 'No image found in content. Using initial placeholder'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground font-medium flex items-center justify-between">
                        <span>Change thumbnail (Optional override)</span>
                        {isManualThumbnail && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsManualThumbnail(false);
                              setManualThumbnail('');
                            }}
                            className="text-primary hover:underline text-[11px]"
                          >
                            Reset to Auto
                          </button>
                        )}
                      </label>
                      <input
                        type="text"
                        placeholder="Paste image URL..."
                        value={manualThumbnail}
                        onChange={e => {
                          setManualThumbnail(e.target.value);
                          setIsManualThumbnail(Boolean(e.target.value));
                        }}
                        className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 4 (Pages Only): Site Placement */}
              {!isPost && (
                <div className="p-4">
                  <button
                    onClick={() => setOpenAccordion(openAccordion === 'placement' ? '' : 'placement')}
                    className="w-full flex items-center justify-between font-semibold text-foreground text-left"
                  >
                    <span className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-muted-foreground" />
                      Page Placement
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${openAccordion === 'placement' ? 'rotate-180' : ''}`} />
                  </button>

                  {openAccordion === 'placement' && (
                    <div className="mt-3 space-y-2 pt-2">
                      <label className="text-xs text-muted-foreground font-medium block">
                        Select where this page link appears:
                      </label>
                      <div className="space-y-1.5">
                        {[
                          { id: 'footer', label: 'Footer Links (e.g. About, Terms)' },
                          { id: 'header', label: 'Header Navigation Menu' },
                          { id: 'both', label: 'Both Header & Footer' },
                          { id: 'custom', label: 'Custom URL only (Standalone link)' }
                        ].map(opt => (
                          <label key={opt.id} className="flex items-center gap-2 text-xs text-foreground cursor-pointer p-1.5 rounded hover:bg-muted/50">
                            <input
                              type="radio"
                              name="pagePlacement"
                              value={opt.id}
                              checked={placement === opt.id}
                              onChange={() => setPlacement(opt.id as any)}
                              className="text-primary focus:ring-primary"
                            />
                            <span>{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Accordion 5: Search Description & Meta Tags */}
              <div className="p-4">
                <button
                  onClick={() => setOpenAccordion(openAccordion === 'searchDesc' ? '' : 'searchDesc')}
                  className="w-full flex items-center justify-between font-semibold text-foreground text-left"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    Search Description
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${openAccordion === 'searchDesc' ? 'rotate-180' : ''}`} />
                </button>

                {openAccordion === 'searchDesc' && (
                  <div className="mt-3 space-y-3 pt-2">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground font-medium">Meta Description</label>
                      <textarea
                        rows={3}
                        value={metaDescription}
                        onChange={e => setMetaDescription(e.target.value)}
                        placeholder="Short summary for Google search snippets..."
                        className="w-full rounded-lg border border-border bg-background p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                      />
                      <p className="text-[11px] text-muted-foreground text-right">{metaDescription.length} / 160 characters</p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground font-medium">Meta Title (Optional)</label>
                      <input
                        type="text"
                        value={metaTitle}
                        onChange={e => setMetaTitle(e.target.value)}
                        placeholder={title || 'Custom SEO Title...'}
                        className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    {isPost && (
                      <>
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground font-medium">Category</label>
                          <input
                            type="text"
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                            placeholder="e.g. Technology, Tutorials"
                            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground font-medium">Labels / Tags (comma separated)</label>
                          <input
                            type="text"
                            value={tagsInput}
                            onChange={e => setTagsInput(e.target.value)}
                            placeholder="web, privacy, tools"
                            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Insert Image Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                Insert Image
              </h3>
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Images placed into your content remain in their exact position. The first image automatically serves as the post thumbnail!
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Image URL</label>
                <input
                  type="text"
                  placeholder="https://... image link"
                  value={imageUrlInput}
                  onChange={e => setImageUrlInput(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {imgbbApiKey && (
                <div className="pt-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={imageUploading}
                    className="w-full py-2 px-3 border border-dashed border-primary/40 rounded-xl bg-primary/5 hover:bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{imageUploading ? 'Uploading to ImgBB...' : 'Upload Image from Device (ImgBB)'}</span>
                  </button>
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Alt text (description)</label>
                <input
                  type="text"
                  placeholder="Describe image for SEO and screen readers..."
                  value={imageAltInput}
                  onChange={e => setImageAltInput(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleInsertImage}
                disabled={!imageUrlInput.trim()}
                className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium disabled:opacity-50"
              >
                Insert into Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insert Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-primary" />
                Insert Link
              </h3>
              <button onClick={() => setIsLinkModalOpen(false)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Web Address (URL)</label>
                <input
                  type="text"
                  placeholder="https://example.com"
                  value={linkUrlInput}
                  onChange={e => setLinkUrlInput(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Text to display (Optional)</label>
                <input
                  type="text"
                  placeholder="Link label..."
                  value={linkTextInput}
                  onChange={e => setLinkTextInput(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setIsLinkModalOpen(false)} className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-xs font-medium">
                Cancel
              </button>
              <button onClick={handleInsertLink} disabled={!linkUrlInput.trim()} className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium disabled:opacity-50">
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Embed Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" />
                Embed Video
              </h3>
              <button onClick={() => setIsVideoModalOpen(false)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">YouTube or Video URL</label>
              <input
                type="text"
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoUrlInput}
                onChange={e => setVideoUrlInput(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setIsVideoModalOpen(false)} className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-xs font-medium">
                Cancel
              </button>
              <button onClick={handleInsertVideo} disabled={!videoUrlInput.trim()} className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium disabled:opacity-50">
                Embed Video
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
          <div className="bg-card w-full max-w-3xl h-[90vh] rounded-3xl border border-border shadow-2xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/40 shrink-0">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                <span className="font-bold text-sm text-foreground">Reader Preview</span>
                <span className="text-xs text-muted-foreground">domain.com/{slug || 'preview'}</span>
              </div>
              <button onClick={() => setIsPreviewOpen(false)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 sm:p-12">
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="space-y-2 border-b border-border pb-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    {category}
                  </span>
                  <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-foreground tracking-tight leading-tight">
                    {title || 'Untitled Post'}
                  </h1>
                  <p className="text-xs text-muted-foreground font-mono">
                    {new Date(publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>

                <div
                  className="prose dark:prose-invert max-w-none text-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: content || '<p>No content yet...</p>' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
