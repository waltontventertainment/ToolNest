import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Eye, 
  Edit3, 
  Upload, 
  Image as ImageIcon, 
  Tag, 
  Sparkles, 
  Link as LinkIcon, 
  Code, 
  List, 
  Quote, 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  FileCode,
  Layers,
  Play,
  RotateCcw
} from 'lucide-react';
import { FirestoreBlog, saveBlogToFirestore } from '../../lib/firestoreBlogService';
import { ImgBBUploader } from './ImgBBUploader';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { CustomCodeRenderer } from '../CustomCodeRenderer';
import { toast } from 'sonner';

interface BlogEditorModalProps {
  post: FirestoreBlog | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (savedPost: FirestoreBlog) => void;
}

const COMMON_CATEGORIES = [
  'Developer Workflows',
  'SEO & Growth',
  'Security & Privacy',
  'Design & UX',
  'Interactive Apps',
  'Tech Tutorials',
  'Cloud & Hosting',
  'General News'
];

const CODE_PRESETS = [
  {
    name: 'Interactive Calculator Widget',
    html: `<div class="interactive-calc-card">
  <h2>⚡ Quick Discount Calculator</h2>
  <p>Try out our live custom interactive widget built directly into this post!</p>
  <div class="calc-row">
    <label>Original Price ($):</label>
    <input type="number" id="calc-price" value="100" />
  </div>
  <div class="calc-row">
    <label>Discount (%):</label>
    <input type="number" id="calc-discount" value="20" />
  </div>
  <button id="calc-btn">Calculate Final Price</button>
  <div id="calc-result" class="calc-output">Result: $80.00 (You saved $20.00)</div>
</div>`,
    css: `.interactive-calc-card {
  background: linear-gradient(135deg, #0f172a, #1e1b4b);
  border: 1px solid #3b82f6;
  border-radius: 16px;
  padding: 24px;
  color: #fff;
  max-width: 500px;
  margin: 20px auto;
  box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.3);
}
.interactive-calc-card h2 { font-size: 20px; font-weight: 700; margin-bottom: 8px; color: #60a5fa; }
.interactive-calc-card p { font-size: 13px; color: #94a3b8; margin-bottom: 16px; }
.calc-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.calc-row label { font-size: 13px; font-weight: 600; }
.calc-row input { background: #1e293b; border: 1px solid #475569; color: #fff; padding: 6px 12px; border-radius: 8px; width: 120px; }
#calc-btn { width: 100%; background: #3b82f6; color: #fff; font-weight: 700; border: none; padding: 10px; border-radius: 8px; cursor: pointer; margin-top: 8px; }
#calc-btn:hover { background: #2563eb; }
.calc-output { margin-top: 14px; padding: 12px; background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; border-radius: 8px; color: #34d399; font-weight: 700; text-align: center; font-size: 14px; }`,
    js: `const btn = container.querySelector('#calc-btn');
const priceInput = container.querySelector('#calc-price');
const discountInput = container.querySelector('#calc-discount');
const resultEl = container.querySelector('#calc-result');

if (btn && priceInput && discountInput && resultEl) {
  btn.addEventListener('click', () => {
    const p = parseFloat(priceInput.value) || 0;
    const d = parseFloat(discountInput.value) || 0;
    const saved = (p * (d / 100));
    const final = (p - saved).toFixed(2);
    resultEl.textContent = 'Result: $' + final + ' (You saved $' + saved.toFixed(2) + ')';
  });
}`
  },
  {
    name: 'Modern Gradient Showcase Card',
    html: `<div class="showcase-banner">
  <div class="banner-badge">PRO SHOWCASE</div>
  <h1>Building Next-Gen Web Tools in 2026</h1>
  <p>Learn how modern client-side architectures eliminate server latency and provide 100% data privacy.</p>
  <div class="banner-actions">
    <a href="/tools/image-resizer" class="banner-cta">Try Demo Tool →</a>
  </div>
</div>`,
    css: `.showcase-banner {
  background: radial-gradient(circle at top left, #6366f1, #3b82f6, #0f172a);
  border-radius: 20px;
  padding: 36px 30px;
  color: #fff;
  text-align: center;
  box-shadow: 0 20px 40px -15px rgba(99, 102, 241, 0.4);
}
.banner-badge { display: inline-block; font-size: 11px; font-weight: 800; letter-spacing: 0.1em; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 9999px; margin-bottom: 14px; }
.showcase-banner h1 { font-size: 28px; font-weight: 800; margin-bottom: 12px; }
.showcase-banner p { font-size: 15px; color: #e0e7ff; max-width: 600px; margin: 0 auto 20px auto; line-height: 1.6; }
.banner-cta { display: inline-block; background: #fff; color: #3b82f6; font-weight: 700; padding: 10px 22px; border-radius: 12px; text-decoration: none; transition: transform 0.2s; }
.banner-cta:hover { transform: translateY(-2px); }`,
    js: `console.log('Showcase card loaded');`
  }
];

export const BlogEditorModal: React.FC<BlogEditorModalProps> = ({
  post,
  isOpen,
  onClose,
  onSaved
}) => {
  const [contentType, setContentType] = useState<'text' | 'code'>('text');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  
  // Custom code fields
  const [customHtml, setCustomHtml] = useState('');
  const [customCss, setCustomCss] = useState('');
  const [customJs, setCustomJs] = useState('');
  const [codeActiveTab, setCodeActiveTab] = useState<'html' | 'css' | 'js'>('html');

  const [coverImage, setCoverImage] = useState('');
  const [category, setCategory] = useState('Developer Workflows');
  const [tags, setTags] = useState('');
  const [authorName, setAuthorName] = useState('Admin');
  const [authorRole, setAuthorRole] = useState('Lead Editor');
  const [authorAvatar, setAuthorAvatar] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [readTimeMinutes, setReadTimeMinutes] = useState(5);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [saving, setSaving] = useState(false);
  const [showImgBBUploader, setShowImgBBUploader] = useState(false);

  useEffect(() => {
    if (post) {
      setContentType(post.contentType || (post.customHtml ? 'code' : 'text'));
      setTitle(post.title || '');
      setSlug(post.slug || '');
      setExcerpt(post.excerpt || '');
      setContent(post.content || '');
      setCustomHtml(post.customHtml || '');
      setCustomCss(post.customCss || '');
      setCustomJs(post.customJs || '');
      setCoverImage(post.coverImage || '');
      setCategory(post.category || 'Developer Workflows');
      setTags((post.tags || []).join(', '));
      setAuthorName(post.author?.name || 'Admin');
      setAuthorRole(post.author?.role || 'Lead Editor');
      setAuthorAvatar(post.author?.avatar || '');
      setStatus(post.status || 'published');
      setReadTimeMinutes(post.readTimeMinutes || 5);
    } else {
      // New post defaults
      setContentType('text');
      setTitle('');
      setSlug('');
      setExcerpt('');
      setContent('# New Article\n\nExplain key concepts clearly...\n\n## Key Features\n\n- Zero installation\n- 100% Client-side\n- Fast performance');
      setCustomHtml('');
      setCustomCss('');
      setCustomJs('');
      setCoverImage('');
      setCategory('Developer Workflows');
      setTags('Tools, Productivity, Privacy');
      setAuthorName('Toolzaro Editorial');
      setAuthorRole('Senior Tech Writer');
      setAuthorAvatar('https://ui-avatars.com/api/?name=Toolzaro&background=6366f1&color=ffffff&bold=true');
      setStatus('published');
      setReadTimeMinutes(4);
    }
  }, [post, isOpen]);

  if (!isOpen) return null;

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!post) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generated);
    }
  };

  const insertText = (before: string, after: string = '') => {
    const textarea = document.getElementById('blog-content-textarea') as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);
    const replacement = `${before}${selected || 'text'}${after}`;

    const newContent = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + (selected.length || 4));
    }, 10);
  };

  const handleInsertUploadedImage = (url: string) => {
    if (!coverImage) {
      setCoverImage(url);
    }
    if (contentType === 'text') {
      const markdownImage = `\n\n![Image description](${url})\n\n`;
      setContent(prev => prev + markdownImage);
    } else {
      const htmlImg = `<img src="${url}" alt="Article Image" class="custom-img" style="max-width:100%; border-radius:12px; margin: 16px 0;" />`;
      setCustomHtml(prev => prev + '\n' + htmlImg);
    }
    toast.success('Image inserted into content & set as cover!');
    setShowImgBBUploader(false);
  };

  const applyPreset = (preset: typeof CODE_PRESETS[0]) => {
    setCustomHtml(preset.html);
    setCustomCss(preset.css);
    setCustomJs(preset.js);
    if (!title) setTitle(preset.name);
    toast.success(`Applied template: ${preset.name}`);
  };

  const handleSave = async (targetStatus?: 'published' | 'draft') => {
    if (!title.trim()) {
      toast.error('Please enter a post title');
      return;
    }

    const effectiveStatus = targetStatus || status;
    const wordCount = (contentType === 'text' ? content : (excerpt + ' ' + customHtml))
      .split(/\s+/)
      .filter(Boolean).length;
    const calculatedReadTime = Math.max(1, Math.round((wordCount || 200) / 200));

    setSaving(true);
    try {
      const saved = await saveBlogToFirestore({
        id: post?.id,
        title: title.trim(),
        slug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        excerpt: excerpt.trim(),
        content: content.trim(),
        contentType,
        customHtml: contentType === 'code' ? customHtml.trim() : '',
        customCss: contentType === 'code' ? customCss.trim() : '',
        customJs: contentType === 'code' ? customJs.trim() : '',
        coverImage: coverImage.trim() || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80',
        category: category.trim(),
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        author: {
          name: authorName.trim() || 'Admin',
          role: authorRole.trim() || 'Editor',
          avatar: authorAvatar.trim() || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=6366f1&color=ffffff&bold=true`
        },
        status: effectiveStatus,
        readTimeMinutes: calculatedReadTime,
        publishedAt: post?.publishedAt || new Date().toISOString().split('T')[0]
      });

      toast.success(post ? 'Post updated in Firestore!' : 'New post published to Firestore!');
      onSaved(saved);
      onClose();
    } catch (err: any) {
      toast.error('Failed to save: ' + (err?.message || 'Check Firestore permissions'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-background border border-border w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              contentType === 'code' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-primary/10 text-primary'
            }`}>
              {contentType === 'code' ? <FileCode className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {post ? 'Edit Post' : 'Create New Post'}
              </h2>
              <p className="text-xs text-muted-foreground">
                Firestore Database • ImgBB Media • Dual Mode Editor
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg border border-border p-1 bg-muted/50">
              <button
                type="button"
                onClick={() => setContentType('text')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                  contentType === 'text'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Rich Text Article</span>
              </button>
              <button
                type="button"
                onClick={() => setContentType('code')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                  contentType === 'code'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Custom HTML / CSS / JS Mode</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Info (Title, Slug, Category) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Post Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={e => handleTitleChange(e.target.value)}
                placeholder="e.g. 10 Essential Tools Every Developer Needs"
                className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-foreground text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
              >
                {COMMON_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                URL Slug (/blog/{slug || 'post-slug'})
              </label>
              <input
                type="text"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                placeholder="url-slug"
                className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-foreground text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Short Summary / Meta Excerpt
              </label>
              <input
                type="text"
                value={excerpt}
                onChange={e => setExcerpt(e.target.value)}
                placeholder="A compelling 1-2 sentence description for SEO and cards"
                className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Cover Image & ImgBB Integration */}
          <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Cover Image (ImgBB Hosted)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowImgBBUploader(!showImgBBUploader)}
                className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
              >
                <Upload className="w-3.5 h-3.5" />
                {showImgBBUploader ? 'Hide ImgBB Uploader' : 'Upload to ImgBB'}
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="url"
                value={coverImage}
                onChange={e => setCoverImage(e.target.value)}
                placeholder="Paste ImgBB image URL (https://i.ibb.co/...)"
                className="flex-1 px-3.5 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
              />
              {coverImage && (
                <div className="w-12 h-10 rounded-lg overflow-hidden border border-border flex-shrink-0">
                  <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {showImgBBUploader && (
              <ImgBBUploader 
                buttonLabel="Select Image to Upload to ImgBB"
                onImageUploaded={url => {
                  setCoverImage(url);
                  toast.success('Cover image set from ImgBB!');
                }} 
              />
            )}
          </div>

          {/* CONTENT SECTION: DUAL MODE */}
          {contentType === 'code' ? (
            /* ================= CUSTOM CODE MODE ================= */
            <div className="space-y-4 border border-indigo-500/30 bg-indigo-500/5 p-4 rounded-xl">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-xs font-extrabold bg-indigo-600 text-white">
                    CUSTOM CODE & DESIGN
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Write interactive widgets, custom styled layouts with CSS & JS
                  </span>
                </div>

                {/* Preset Templates */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-muted-foreground">Presets:</span>
                  {CODE_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="px-2 py-1 bg-card hover:bg-muted border border-border rounded text-[11px] font-semibold text-foreground"
                    >
                      {preset.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Code Tabs: HTML / CSS / JS / Live Preview */}
              <div className="flex items-center justify-between border-b border-border">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setCodeActiveTab('html'); setActiveTab('edit'); }}
                    className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors ${
                      codeActiveTab === 'html' && activeTab === 'edit'
                        ? 'border-indigo-500 text-indigo-500'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    HTML Template
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCodeActiveTab('css'); setActiveTab('edit'); }}
                    className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors ${
                      codeActiveTab === 'css' && activeTab === 'edit'
                        ? 'border-indigo-500 text-indigo-500'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Custom CSS (&lt;style&gt;)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCodeActiveTab('js'); setActiveTab('edit'); }}
                    className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors ${
                      codeActiveTab === 'js' && activeTab === 'edit'
                        ? 'border-indigo-500 text-indigo-500'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    JavaScript Logic (&lt;script&gt;)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'preview' ? 'edit' : 'preview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all ${
                    activeTab === 'preview'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-card text-foreground border-border hover:bg-muted'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  {activeTab === 'preview' ? 'Back to Code Editor' : 'Live Interactive Preview'}
                </button>
              </div>

              {activeTab === 'preview' ? (
                /* LIVE INTERACTIVE CODE PREVIEW */
                <div className="p-6 rounded-xl border border-border bg-card min-h-[300px]">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5 text-emerald-500" />
                    Live Render Preview
                  </div>
                  <CustomCodeRenderer
                    html={customHtml}
                    css={customCss}
                    js={customJs}
                  />
                </div>
              ) : (
                /* CODE TEXTAREAS */
                <div>
                  {codeActiveTab === 'html' && (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
                        <span>HTML Markup (Use standard HTML tags, divs, buttons, inputs)</span>
                        <span className="font-mono text-[11px]">{customHtml.length} chars</span>
                      </div>
                      <textarea
                        rows={12}
                        value={customHtml}
                        onChange={e => setCustomHtml(e.target.value)}
                        placeholder="<div class='my-custom-box'>\n  <h2>Custom Post</h2>\n  <p>Design anything with full CSS and JS control.</p>\n</div>"
                        className="w-full p-4 rounded-xl border border-border bg-card text-foreground text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                      />
                    </div>
                  )}

                  {codeActiveTab === 'css' && (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
                        <span>Custom CSS Styles (Will be scoped to this post)</span>
                        <span className="font-mono text-[11px]">{customCss.length} chars</span>
                      </div>
                      <textarea
                        rows={12}
                        value={customCss}
                        onChange={e => setCustomCss(e.target.value)}
                        placeholder=".my-custom-box {\n  background: #1e1b4b;\n  color: #fff;\n  padding: 24px;\n  border-radius: 12px;\n}"
                        className="w-full p-4 rounded-xl border border-border bg-card text-foreground text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                      />
                    </div>
                  )}

                  {codeActiveTab === 'js' && (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
                        <span>JavaScript Logic (Has access to `container` DOM element)</span>
                        <span className="font-mono text-[11px]">{customJs.length} chars</span>
                      </div>
                      <textarea
                        rows={12}
                        value={customJs}
                        onChange={e => setCustomJs(e.target.value)}
                        placeholder="// container.querySelector('button').addEventListener('click', () => { ... });"
                        className="w-full p-4 rounded-xl border border-border bg-card text-foreground text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* ================= RICH TEXT EDITORIAL MODE ================= */
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-border">
                <div className="flex items-center gap-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => insertText('# ')}
                    className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded transition-colors"
                    title="Heading 1"
                  >
                    <Heading1 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertText('## ')}
                    className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded transition-colors"
                    title="Heading 2"
                  >
                    <Heading2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertText('**', '**')}
                    className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded transition-colors"
                    title="Bold"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertText('*', '*')}
                    className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded transition-colors"
                    title="Italic"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertText('> ')}
                    className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded transition-colors"
                    title="Quote"
                  >
                    <Quote className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertText('```\n', '\n```')}
                    className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded transition-colors"
                    title="Code Block"
                  >
                    <Code className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertText('- ')}
                    className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded transition-colors"
                    title="Bullet List"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertText('[Link Title](', ')')}
                    className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded transition-colors"
                    title="Insert Link"
                  >
                    <LinkIcon className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab(activeTab === 'preview' ? 'edit' : 'preview')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md border flex items-center gap-1 ${
                      activeTab === 'preview' ? 'bg-primary text-white border-primary' : 'bg-card text-foreground border-border'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {activeTab === 'preview' ? 'Edit Text' : 'Preview Article'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowImgBBUploader(true)}
                    className="px-2.5 py-1 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold rounded-md flex items-center gap-1 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" /> Insert ImgBB Image
                  </button>
                </div>
              </div>

              {activeTab === 'preview' ? (
                <div className="p-6 rounded-xl border border-border bg-card min-h-[300px] prose dark:prose-invert max-w-none">
                  <MarkdownRenderer content={content} />
                </div>
              ) : (
                <textarea
                  id="blog-content-textarea"
                  rows={13}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Write full article here in Markdown or HTML..."
                  className="w-full p-4 rounded-xl border border-border bg-card text-foreground text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-primary leading-relaxed"
                />
              )}
            </div>
          )}

          {/* Tags & Author Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-border">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="Productivity, Design, Web"
                className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Author Name
              </label>
              <input
                type="text"
                value={authorName}
                onChange={e => setAuthorName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Author Role
              </label>
              <input
                type="text"
                value={authorRole}
                onChange={e => setAuthorRole(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Status:</span>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as 'published' | 'draft')}
              className="px-2.5 py-1 text-xs font-bold rounded-lg border border-border bg-card text-foreground"
            >
              <option value="published">Published (Visible Publicly)</option>
              <option value="draft">Draft (Admin Only)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border text-xs font-bold text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave()}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving to Firestore...' : (post ? 'Update Post' : 'Publish Post')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
