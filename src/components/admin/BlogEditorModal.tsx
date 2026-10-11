import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
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
  Play,
  Globe,
  User,
  CheckCircle2,
  Columns,
  FileText,
} from 'lucide-react';
import { FirestoreBlog, saveBlogToFirestore } from '../../lib/firestoreBlogService';
import { ImgBBUploader } from './ImgBBUploader';
import { uploadToImgBB, replaceBase64ImagesWithImgBB } from '../../lib/imgbb';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { CustomCodeRenderer } from '../CustomCodeRenderer';
import { BlogAuthorBadge, resolveBlogAuthorDisplay } from '../BlogAuthorBadge';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { toast } from 'sonner';

/**
 * Converts existing Markdown/Text blog content into clean Blogger-style HTML + customizable CSS <style> block
 * so any existing title-based blog post can be edited directly as HTML + CSS code.
 */
function convertBlogTextToStyledHtml(markdownText: string, postTitle: string): string {
  const raw = (markdownText || '').trim();
  if (!raw) {
    return `<style>
  .tz-article-body {
    font-family: inherit;
    line-height: 1.8;
    color: inherit;
  }
  .tz-article-body h2 {
    font-size: 1.45rem;
    font-weight: 800;
    color: #6366f1;
    margin: 1.75rem 0 0.75rem;
    padding-bottom: 0.4rem;
    border-bottom: 1px solid rgba(99, 102, 241, 0.25);
  }
  .tz-article-body p {
    margin-bottom: 1rem;
  }
</style>

<div class="tz-article-body">
  <h2>${postTitle || 'Article Heading'}</h2>
  <p>Write or customize your post HTML and CSS design here...</p>
</div>`;
  }

  // If it already starts with <style> or <div, return as-is
  if (/^\s*<(style|div|section|article)\b/i.test(raw)) {
    return raw;
  }

  const lines = raw.replace(/^\s*#\s+[^\n]+\n+/, '').split('\n');
  const htmlParts: string[] = [];
  let inList = false;
  let inCode = false;
  let codeBuffer: string[] = [];

  const closeList = () => {
    if (inList) {
      htmlParts.push('  </ul>');
      inList = false;
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('```')) {
      closeList();
      if (!inCode) {
        inCode = true;
        codeBuffer = [];
      } else {
        inCode = false;
        const escaped = codeBuffer
          .join('\n')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        htmlParts.push(`  <pre class="tz-code-block"><code>${escaped}</code></pre>`);
      }
      continue;
    }
    if (inCode) {
      codeBuffer.push(line);
      continue;
    }
    if (!trimmed) {
      closeList();
      continue;
    }
    if (trimmed === '---' || trimmed === '***') {
      closeList();
      htmlParts.push('  <hr class="tz-divider" />');
      continue;
    }
    const h3 = trimmed.match(/^###\s+(.*)$/);
    if (h3) {
      closeList();
      htmlParts.push(`  <h3>${h3[1]}</h3>`);
      continue;
    }
    const h2 = trimmed.match(/^##\s+(.*)$/);
    if (h2) {
      closeList();
      htmlParts.push(`  <h2>${h2[1]}</h2>`);
      continue;
    }
    const h1 = trimmed.match(/^#\s+(.*)$/);
    if (h1) {
      closeList();
      htmlParts.push(`  <h2>${h1[1]}</h2>`);
      continue;
    }
    if (/^[-*•]\s+/.test(trimmed)) {
      if (!inList) {
        htmlParts.push('  <ul>');
        inList = true;
      }
      const itemText = trimmed
        .replace(/^[-*•]\s+/, '')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+)`/g, '<code>$1</code>');
      htmlParts.push(`    <li>${itemText}</li>`);
      continue;
    }
    closeList();
    const formattedLine = trimmed
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
    htmlParts.push(`  <p>${formattedLine}</p>`);
  }
  closeList();

  return `<style>
  .tz-article-body {
    line-height: 1.8;
    font-size: 15px;
  }
  .tz-article-body h2 {
    font-size: 1.4rem;
    font-weight: 800;
    color: #6366f1;
    margin: 1.75rem 0 0.75rem;
    padding-bottom: 0.4rem;
    border-bottom: 1px solid rgba(99, 102, 241, 0.25);
  }
  .tz-article-body h3 {
    font-size: 1.15rem;
    font-weight: 700;
    margin: 1.25rem 0 0.5rem;
  }
  .tz-article-body p {
    margin-bottom: 1rem;
  }
  .tz-article-body ul {
    padding-left: 1.25rem;
    margin-bottom: 1rem;
    list-style: disc;
  }
  .tz-article-body li {
    margin-bottom: 0.4rem;
  }
  .tz-article-body .tz-code-block {
    background: #0f172a;
    color: #34d399;
    padding: 1rem;
    border-radius: 12px;
    overflow-x: auto;
    font-family: monospace;
    font-size: 12px;
    margin: 1rem 0;
  }
  .tz-article-body .tz-divider {
    margin: 1.5rem 0;
    border-color: rgba(148, 163, 184, 0.2);
  }
</style>

<div class="tz-article-body">
${htmlParts.join('\n')}
</div>`;
}

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
  'General News',
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
  max-width: 520px;
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
}`,
  },
  {
    name: 'Blogger Single-Box HTML + CSS + JS Template',
    html: `<style>
  .blogger-card {
    background: linear-gradient(135deg, #1e1b4b, #0f172a);
    border: 1px solid rgba(99, 102, 241, 0.4);
    border-radius: 18px;
    padding: 28px;
    color: #f8fafc;
    text-align: center;
    margin: 16px 0;
  }
  .blogger-card h3 { font-size: 22px; font-weight: 800; color: #818cf8; margin-bottom: 8px; }
  .blogger-card p { font-size: 14px; color: #cbd5e1; margin-bottom: 16px; }
  .blogger-btn { background: #6366f1; color: #fff; padding: 10px 20px; border-radius: 10px; font-weight: 700; border: none; cursor: pointer; }
</style>

<div class="blogger-card">
  <h3>🚀 Custom Blogger HTML/Code Block</h3>
  <p>Paste any HTML, &lt;style&gt;, or &lt;script&gt; code directly here just like Google Blogger!</p>
  <button class="blogger-btn" id="demo-alert-btn">Test Interactive Button</button>
  <div id="demo-msg" style="margin-top:12px; font-size:13px; color:#34d399; font-weight:700;"></div>
</div>

<script>
  const demoBtn = container.querySelector('#demo-alert-btn');
  const demoMsg = container.querySelector('#demo-msg');
  if (demoBtn && demoMsg) {
    demoBtn.addEventListener('click', () => {
      demoMsg.textContent = '✓ Interactive JavaScript executed inside the post!';
    });
  }
</script>`,
    css: '',
    js: '',
  },
];

export const BlogEditorModal: React.FC<BlogEditorModalProps> = ({
  post,
  isOpen,
  onClose,
  onSaved,
}) => {
  const { settings } = useSiteSettings();
  // Blogger-style editor mode: 'text' (Compose View) vs 'code' (<> HTML / Code View)
  const [contentType, setContentType] = useState<'text' | 'code'>('text');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');

  // Custom code fields (supports both Blogger single-box HTML/CSS/JS and split tabs)
  const [customHtml, setCustomHtml] = useState('');
  const [customCss, setCustomCss] = useState('');
  const [customJs, setCustomJs] = useState('');
  const [codeActiveTab, setCodeActiveTab] = useState<'blogger-all' | 'html' | 'css' | 'js'>('blogger-all');

  const [coverImage, setCoverImage] = useState('');
  const [category, setCategory] = useState('Developer Workflows');
  const [tags, setTags] = useState('');
  const [authorName, setAuthorName] = useState('Toolzaro');
  const [authorRole, setAuthorRole] = useState('Admin');
  const [authorAvatar, setAuthorAvatar] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [viewLayout, setViewLayout] = useState<'editor' | 'split' | 'preview'>('editor');
  const [saving, setSaving] = useState(false);
  const [showImgBBUploader, setShowImgBBUploader] = useState(false);

  const handleSwitchToCodeMode = () => {
    if (!customHtml.trim() && content.trim()) {
      const generatedHtmlWithCss = convertBlogTextToStyledHtml(content, title);
      setCustomHtml(generatedHtmlWithCss);
    }
    setContentType('code');
  };

  useEffect(() => {
    const defaultName = settings.branding?.blogAuthorName?.trim() || 'Toolzaro';
    const defaultRole =
      settings.branding?.blogAuthorRole !== undefined
        ? settings.branding.blogAuthorRole.trim()
        : 'Admin';
    const defaultAvatar = settings.branding?.blogAuthorAvatar?.trim() || '';

    if (post) {
      const targetMode = post.contentType || (post.customHtml ? 'code' : 'text');
      setContentType(targetMode);
      setTitle(post.title || '');
      setSlug(post.slug || '');
      setExcerpt(post.excerpt || '');
      setContent(post.content || '');
      setCustomHtml(
        post.customHtml?.trim()
          ? post.customHtml
          : targetMode === 'code' && post.content?.trim()
          ? convertBlogTextToStyledHtml(post.content, post.title || '')
          : ''
      );
      setCustomCss(post.customCss || '');
      setCustomJs(post.customJs || '');
      setCoverImage(post.coverImage || '');
      setCategory(post.category || 'Developer Workflows');
      setTags((post.tags || []).join(', '));
      const resolvedAuthor = resolveBlogAuthorDisplay(post.author, settings.branding);
      setAuthorName(resolvedAuthor.name || defaultName);
      setAuthorRole(resolvedAuthor.role || defaultRole);
      setAuthorAvatar(resolvedAuthor.customAvatar || '');
      setStatus(post.status === 'draft' ? 'draft' : 'published');
    } else {
      setContentType('text');
      setTitle('');
      setSlug('');
      setExcerpt('');
      setContent(
        '# New Article Title\n\nWrite your article content in Compose mode, or switch to **<> HTML / Code View** in the top bar to edit with custom HTML, `<style>` CSS design, or JavaScript widgets just like Blogger!\n\n## Key Highlights\n\n- Supports full Markdown, HTML & custom `<style>` CSS design\n- Switch seamlessly between Text and `<> HTML / Code View`\n- Instant ImgBB image hosting'
      );
      setCustomHtml('');
      setCustomCss('');
      setCustomJs('');
      setCoverImage('');
      setCategory('Developer Workflows');
      setTags('Tools, Productivity, Privacy');
      setAuthorName(defaultName);
      setAuthorRole(defaultRole);
      setAuthorAvatar(defaultAvatar);
      setStatus('published');
    }
    setViewLayout('editor');
  }, [post, isOpen, settings.branding]);

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

    const newContent =
      textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + (selected.length || 4)
      );
    }, 10);
  };

  const handleInsertUploadedImage = (url: string) => {
    if (!coverImage) {
      setCoverImage(url);
    }
    if (contentType === 'text') {
      const markdownImage = `\n\n![Article Image](${url})\n\n`;
      setContent((prev) => prev + markdownImage);
    } else {
      const htmlImg = `\n<img src="${url}" alt="Article Image" style="max-width:100%; border-radius:12px; margin: 16px 0;" />\n`;
      setCustomHtml((prev) => prev + htmlImg);
    }
    toast.success('Image uploaded to ImgBB and inserted into post!');
    setShowImgBBUploader(false);
  };

  // Automatically upload pasted or dropped image files to ImgBB CDN
  const handleEditorImagePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          const toastId = toast.loading('Uploading pasted image to ImgBB...');
          const res = await uploadToImgBB(file, undefined, file.name || 'pasted-image');
          toast.dismiss(toastId);
          if (res.success && res.url) {
            handleInsertUploadedImage(res.url);
          } else {
            toast.error(res.error || 'Failed to upload pasted image to ImgBB');
          }
          break;
        }
      }
    }
  };

  const handleEditorImageDrop = async (e: React.DragEvent<HTMLTextAreaElement>) => {
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      e.preventDefault();
      const toastId = toast.loading('Uploading dropped image to ImgBB...');
      const res = await uploadToImgBB(file, undefined, file.name);
      toast.dismiss(toastId);
      if (res.success && res.url) {
        handleInsertUploadedImage(res.url);
      } else {
        toast.error(res.error || 'Failed to upload dropped image to ImgBB');
      }
    }
  };

  const applyPreset = (preset: (typeof CODE_PRESETS)[0]) => {
    setContentType('code');
    setCustomHtml(preset.html);
    setCustomCss(preset.css);
    setCustomJs(preset.js);
    if (!title) handleTitleChange(preset.name);
    toast.success(`Loaded template: ${preset.name}`);
  };

  const handleSave = async (targetStatus?: 'published' | 'draft') => {
    if (!title.trim()) {
      toast.error('Please enter a post title before saving');
      return;
    }

    const effectiveStatus = targetStatus || status;
    const hasCustomCode = !!(customHtml.trim() || customCss.trim() || customJs.trim());
    const effectiveContentType: 'text' | 'code' =
      contentType === 'code' || hasCustomCode ? 'code' : 'text';

    setSaving(true);
    try {
      // Ensure any embedded base64 images are uploaded to ImgBB first so Firebase only stores clean text & ImgBB URLs
      const [cleanCover, cleanAvatar, cleanContent, cleanHtml] = await Promise.all([
        replaceBase64ImagesWithImgBB(coverImage.trim()),
        replaceBase64ImagesWithImgBB(authorAvatar.trim()),
        replaceBase64ImagesWithImgBB(content.trim()),
        replaceBase64ImagesWithImgBB(customHtml.trim()),
      ]);

      const wordCount = `${excerpt} ${cleanContent} ${cleanHtml}`
        .split(/\s+/)
        .filter(Boolean).length;
      const calculatedReadTime = Math.max(1, Math.round((wordCount || 200) / 200));

      const saved = await saveBlogToFirestore({
        id: post?.id,
        title: title.trim(),
        slug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        excerpt:
          excerpt.trim() ||
          title.trim() + ' — Read the complete guide and interactive walkthrough on Toolzaro.',
        content: cleanContent,
        contentType: effectiveContentType,
        customHtml: cleanHtml,
        customCss: customCss.trim(),
        customJs: customJs.trim(),
        coverImage:
          cleanCover ||
          'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80',
        category: category.trim(),
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        author: {
          name: authorName.trim() || 'Toolzaro',
          role: authorRole.trim(),
          avatar: cleanAvatar || '',
        },
        status: effectiveStatus,
        readTimeMinutes: calculatedReadTime,
        publishedAt: post?.publishedAt || new Date().toISOString().split('T')[0],
      });

      toast.success(
        post
          ? 'Post text saved to Firebase & images hosted on ImgBB!'
          : 'New post published to Firebase with ImgBB images!'
      );
      onSaved(saved);
      onClose();
    } catch (err: any) {
      toast.error('Failed to save: ' + (err?.message || 'Check Firestore permissions'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col">
      {/* ================= FULL-SCREEN BLOGGER STUDIO TOP HEADER ================= */}
      <header className="sticky top-0 z-40 bg-slate-900/95 border-b border-slate-800 backdrop-blur-md px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Posts</span>
          </button>

          <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-slate-800">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                contentType === 'code'
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {contentType === 'code' ? (
                <FileCode className="w-4 h-4" />
              ) : (
                <Edit3 className="w-4 h-4" />
              )}
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-white leading-tight">
                {post ? `Editing: ${post.title}` : 'Blogger Post Studio — New Post'}
              </h1>
              <p className="text-[11px] text-slate-400">
                Full-Screen Post Editor • Switch between Compose Text &amp; &lt;&gt; HTML/Code View
              </p>
            </div>
          </div>
        </div>

        {/* Center Blogger Mode Switcher: Compose (Content Text) vs <> HTML / Code View */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-xl border border-slate-700 p-1 bg-slate-950">
            <button
              type="button"
              onClick={() => setContentType('text')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                contentType === 'text'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Compose (Content Text)</span>
            </button>
            <button
              type="button"
              onClick={handleSwitchToCodeMode}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                contentType === 'code'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>&lt;&gt; HTML / Code View</span>
            </button>
          </div>

          {/* Layout Switcher: Editor / Split / Live Preview */}
          <div className="hidden md:inline-flex rounded-xl border border-slate-700 p-1 bg-slate-950">
            <button
              type="button"
              onClick={() => setViewLayout('editor')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                viewLayout === 'editor' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Editor
            </button>
            <button
              type="button"
              onClick={() => setViewLayout('split')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                viewLayout === 'split' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Split</span>
            </button>
            <button
              type="button"
              onClick={() => setViewLayout('preview')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                viewLayout === 'preview'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>
        </div>

        {/* Right Publish & Save Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave('draft')}
            className="px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave('published')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 hover:opacity-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Publishing...' : post ? 'Update Post' : 'Publish Post'}</span>
          </button>
        </div>
      </header>

      {/* ================= FULL-SCREEN BLOGGER WORKSPACE BODY ================= */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT / MAIN COLUMN (8 Cols): Post Title & Blogger Content / Code Editor */}
        <div className="lg:col-span-8 space-y-5">
          {/* Post Title Bar (Blogger Style) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Post Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Enter post title (e.g., How to Merge PDF Files Privately in Browser)..."
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-base sm:text-lg font-extrabold focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Quick Image Insert Bar */}
          {showImgBBUploader && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-indigo-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4" />
                  <span>Upload Image to ImgBB &amp; Insert Directly into Post</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowImgBBUploader(false)}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Close
                </button>
              </div>
              <ImgBBUploader
                buttonLabel="Choose Image to Upload & Insert"
                onImageUploaded={handleInsertUploadedImage}
              />
            </div>
          )}

          {/* MAIN EDITOR AREA: COMPOSE TEXT MODE vs <> HTML / CODE MODE */}
          {contentType === 'code' ? (
            <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl overflow-hidden shadow-xl">
              {/* Code Studio Toolbar */}
              <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setCodeActiveTab('blogger-all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      codeActiveTab === 'blogger-all'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white bg-slate-900'
                    }`}
                  >
                    &lt;&gt; Blogger Raw HTML/CSS/JS Box
                  </button>
                  <button
                    type="button"
                    onClick={() => setCodeActiveTab('html')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      codeActiveTab === 'html'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white bg-slate-900'
                    }`}
                  >
                    HTML Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setCodeActiveTab('css')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      codeActiveTab === 'css'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white bg-slate-900'
                    }`}
                  >
                    CSS (&lt;style&gt;)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCodeActiveTab('js')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      codeActiveTab === 'js'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white bg-slate-900'
                    }`}
                  >
                    JavaScript (&lt;script&gt;)
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {content.trim() && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomHtml(convertBlogTextToStyledHtml(content, title));
                        toast.success('Loaded post text into HTML + CSS Code Editor!');
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-xs font-bold text-emerald-300 flex items-center gap-1 cursor-pointer"
                      title="Convert the post's existing text into editable HTML + CSS code"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Load Post Text as HTML+CSS</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowImgBBUploader(!showImgBBUploader)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-indigo-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Insert Image</span>
                  </button>
                  {CODE_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-[11px] font-bold text-slate-300 cursor-pointer"
                    >
                      + {preset.name.split(' ')[0]} Template
                    </button>
                  ))}
                </div>
              </div>

              <div
                className={
                  viewLayout === 'split'
                    ? 'grid grid-cols-1 xl:grid-cols-2 divide-y xl:divide-y-0 xl:divide-x divide-slate-800'
                    : 'block'
                }
              >
                {viewLayout !== 'preview' && (
                  <div className="p-4 sm:p-5 space-y-4">
                    {(codeActiveTab === 'blogger-all' || codeActiveTab === 'html') && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs text-slate-400">
                          <span className="font-bold text-indigo-300">
                            {codeActiveTab === 'blogger-all'
                              ? 'Paste Full HTML, <style>, and <script> Code (Blogger HTML View):'
                              : 'HTML Markup:'}
                          </span>
                          <span className="font-mono text-[11px]">{customHtml.length} chars</span>
                        </div>
                        <textarea
                          rows={18}
                          value={customHtml}
                          onChange={(e) => setCustomHtml(e.target.value)}
                          onPaste={handleEditorImagePaste}
                          onDrop={handleEditorImageDrop}
                          placeholder={`<!-- Paste any HTML, <style>, or <script> code here just like Blogger -->\n<div class="my-post-box">\n  <h2>Custom Interactive Post</h2>\n  <p>Your custom HTML or widget goes here...</p>\n</div>`}
                          className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 text-xs sm:text-sm font-mono focus:outline-none focus:border-indigo-500 leading-relaxed"
                        />
                      </div>
                    )}

                    {codeActiveTab === 'css' && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs text-slate-400">
                          <span className="font-bold text-indigo-300">
                            Additional Scoped CSS (&lt;style&gt;):
                          </span>
                          <span className="font-mono text-[11px]">{customCss.length} chars</span>
                        </div>
                        <textarea
                          rows={18}
                          value={customCss}
                          onChange={(e) => setCustomCss(e.target.value)}
                          placeholder={`.my-post-box {\n  padding: 24px;\n  border-radius: 16px;\n  background: #1e1b4b;\n  color: #ffffff;\n}`}
                          className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-sky-300 text-xs sm:text-sm font-mono focus:outline-none focus:border-indigo-500 leading-relaxed"
                        />
                      </div>
                    )}

                    {codeActiveTab === 'js' && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs text-slate-400">
                          <span className="font-bold text-indigo-300">
                            Additional JavaScript Logic (&lt;script&gt;):
                          </span>
                          <span className="font-mono text-[11px]">{customJs.length} chars</span>
                        </div>
                        <textarea
                          rows={18}
                          value={customJs}
                          onChange={(e) => setCustomJs(e.target.value)}
                          placeholder={`// Access post elements via container.querySelector(...)\nconsole.log('Custom post script ready');`}
                          className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-amber-300 text-xs sm:text-sm font-mono focus:outline-none focus:border-indigo-500 leading-relaxed"
                        />
                      </div>
                    )}

                    {/* Optional Accompanying Article Text below Custom Code */}
                    <div className="pt-3 border-t border-slate-800 space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                        <span>
                          Additional Article Text / Explanation (Optional — renders below your code):
                        </span>
                        <span className="text-[11px] text-slate-500 font-normal">
                          Supports Markdown &amp; Text
                        </span>
                      </label>
                      <textarea
                        rows={6}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Optional: Add article text, instructions, or SEO paragraphs to display alongside your custom code..."
                        className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 leading-relaxed"
                      />
                    </div>
                  </div>
                )}

                {(viewLayout === 'preview' || viewLayout === 'split') && (
                  <div className="p-5 bg-slate-950/60 space-y-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5" />
                      <span>Live Post Preview</span>
                    </div>
                    <div className="p-5 rounded-2xl bg-card text-foreground border border-border space-y-6">
                      <CustomCodeRenderer html={customHtml} css={customCss} js={customJs} />
                      {content.trim() && (
                        <div className="pt-6 border-t border-border">
                          <MarkdownRenderer content={content} />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ================= BLOGGER COMPOSE (CONTENT TEXT) MODE ================= */
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              {/* Rich Formatting Toolbar */}
              <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => insertText('# ')}
                    className="p-2 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                    title="Heading 1"
                  >
                    <Heading1 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertText('## ')}
                    className="p-2 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                    title="Heading 2"
                  >
                    <Heading2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertText('**', '**')}
                    className="p-2 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                    title="Bold"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertText('*', '*')}
                    className="p-2 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                    title="Italic"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertText('> ')}
                    className="p-2 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                    title="Quote / Callout"
                  >
                    <Quote className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertText('```\n', '\n```')}
                    className="p-2 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                    title="Insert Code Snippet"
                  >
                    <Code className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertText('- ')}
                    className="p-2 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                    title="Bullet List"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertText('[Link Text](https://', ')')}
                    className="p-2 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                    title="Insert Link"
                  >
                    <LinkIcon className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowImgBBUploader(!showImgBBUploader)}
                    className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Insert Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSwitchToCodeMode}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Switch to &lt;&gt; HTML + CSS Code</span>
                  </button>
                </div>
              </div>

              <div
                className={
                  viewLayout === 'split'
                    ? 'grid grid-cols-1 xl:grid-cols-2 divide-y xl:divide-y-0 xl:divide-x divide-slate-800'
                    : 'block'
                }
              >
                {viewLayout !== 'preview' && (
                  <div className="p-4 sm:p-5">
                    <textarea
                      id="blog-content-textarea"
                      rows={22}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      onPaste={handleEditorImagePaste}
                      onDrop={handleEditorImageDrop}
                      placeholder="Write your full article content here... (Tip: You can also paste or drag-and-drop images directly here to auto-upload to ImgBB!)"
                      className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-sans focus:outline-none focus:border-indigo-500 leading-relaxed"
                    />
                  </div>
                )}

                {(viewLayout === 'preview' || viewLayout === 'split') && (
                  <div className="p-5 bg-slate-950/60 space-y-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Live Article Preview</span>
                    </div>
                    <div className="p-6 rounded-2xl bg-card text-foreground border border-border min-h-[420px]">
                      {customHtml.trim() && (
                        <div className="mb-6">
                          <CustomCodeRenderer html={customHtml} css={customCss} js={customJs} />
                        </div>
                      )}
                      <MarkdownRenderer content={content} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR (4 Cols): Blogger Post Settings Panel */}
        <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-20">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-400 border-b border-slate-800 pb-3 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>Blogger Post Settings</span>
            </h3>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Publication Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'published' | 'draft')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="published">Published (Live on Website)</option>
                <option value="draft">Draft (Saved Privately)</option>
              </select>
            </div>

            {/* Category / Label */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
              >
                {COMMON_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Permalink / Slug */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Permalink Slug (<code className="text-indigo-400">/{slug || 'post-slug'}</code>)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="custom-post-url-slug"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Search Description / Excerpt */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Search Description (SEO Meta Excerpt)
              </label>
              <textarea
                rows={3}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Brief summary for Google Search & blog cards..."
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>

            {/* Cover Image */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Featured Cover Image</span>
                <span className="text-[10px] text-indigo-400">ImgBB CDN</span>
              </label>
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://i.ibb.co/..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              {coverImage && (
                <div className="rounded-xl overflow-hidden border border-slate-800 aspect-video bg-slate-950">
                  <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                </div>
              )}
              <ImgBBUploader
                buttonLabel="Upload Cover Image to ImgBB"
                onImageUploaded={(url) => {
                  setCoverImage(url);
                  toast.success('Cover image uploaded!');
                }}
              />
            </div>

            {/* Labels / Tags */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-400" />
                <span>Labels / Tags (comma separated)</span>
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="PDF, Privacy, Tutorial"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Author Profile (Default: Toolzaro + Admin + Header 3D Wrench Logo) */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">
                  Blog Author Profile (Live Preview)
                </label>
                {authorAvatar && (
                  <button
                    type="button"
                    onClick={() => setAuthorAvatar('')}
                    className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                  >
                    Use Default Toolzaro Logo
                  </button>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <BlogAuthorBadge
                  author={{ name: authorName, role: authorRole, avatar: authorAvatar }}
                  size="md"
                />
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  {authorAvatar ? 'Custom Logo' : 'Header 3D Logo'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400">
                    Profile Name (Default: Toolzaro)
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Toolzaro"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400">
                    Subtitle Below Name (Default: Admin)
                  </label>
                  <input
                    type="text"
                    value={authorRole}
                    onChange={(e) => setAuthorRole(e.target.value)}
                    placeholder="Admin (leave blank to hide)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
