// Blogger Layout Admin Panel Bridge
// Allows blog owners to edit inbuilt posts, categories, hero text, and site settings
// directly from the Blogger Dashboard -> Layout -> Widgets without touching code!

import { BlogPost } from './blogData';

export interface BloggerHeroSettings {
  badge?: string;
  title?: string;
  subtitle?: string;
}

export interface BloggerAnnouncementSettings {
  enabled?: boolean;
  badge?: string;
  text?: string;
  linkText?: string;
  linkUrl?: string;
}

export interface BloggerPostOverride {
  id: string; // e.g. "guide-1" or custom ID
  title?: string;
  category?: string;
  excerpt?: string;
  coverImage?: string;
  content?: string;
  readTimeMinutes?: number;
  publishedAt?: string;
  authorName?: string;
  authorRole?: string;
}

/**
 * Helper to extract plain text from an element or HTML string
 */
function cleanElementContent(el: HTMLElement | null): string {
  if (!el) return '';
  // Check innerHTML or textContent
  const raw = (el.textContent || el.innerText || '').trim();
  return raw;
}

/**
 * Reads Hero Banner configuration edited via Blogger Layout -> "Admin: Hero Banner Settings"
 * Supports:
 * 1. JSON: {"title": "...", "subtitle": "...", "badge": "..."}
 * 2. Key-Value text:
 *    Title: Awesome Title
 *    Subtitle: Awesome Subtitle
 *    Badge: Trending
 * 3. Plain text: First line = Title, Second line = Subtitle
 */
export function getBloggerHeroSettings(): BloggerHeroSettings | null {
  if (typeof document === 'undefined') return null;
  const el = document.getElementById('blogger-override-hero');
  if (!el) return null;

  const raw = cleanElementContent(el);
  if (!raw) return null;

  try {
    // 1. JSON format
    if (raw.startsWith('{') && raw.endsWith('}')) {
      const parsed = JSON.parse(raw);
      return {
        badge: parsed.badge || parsed.tag,
        title: parsed.title || parsed.heading,
        subtitle: parsed.subtitle || parsed.description
      };
    }

    // 2. Key-Value format (case insensitive)
    const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const settings: BloggerHeroSettings = {};

    lines.forEach(line => {
      const matchBadge = line.match(/^(?:badge|tag)\s*[:=]\s*(.+)$/i);
      if (matchBadge) settings.badge = matchBadge[1].trim();

      const matchTitle = line.match(/^(?:title|heading)\s*[:=]\s*(.+)$/i);
      if (matchTitle) settings.title = matchTitle[1].trim();

      const matchSubtitle = line.match(/^(?:subtitle|desc|description)\s*[:=]\s*(.+)$/i);
      if (matchSubtitle) settings.subtitle = matchSubtitle[1].trim();
    });

    if (settings.title || settings.subtitle || settings.badge) {
      return settings;
    }

    // 3. Fallback: Line 1 is title, Line 2 is subtitle
    if (lines.length >= 1) {
      return {
        title: lines[0],
        subtitle: lines.length > 1 ? lines.slice(1).join(' ') : undefined
      };
    }
  } catch (err) {
    console.warn('[Blogger Layout Admin] Failed to parse Hero settings:', err);
  }
  return null;
}

/**
 * Reads Top Announcement Bar configuration from Blogger Layout -> "Admin: Top Announcement Bar"
 */
export function getBloggerAnnouncement(): BloggerAnnouncementSettings | null {
  if (typeof document === 'undefined') return null;
  const el = document.getElementById('blogger-override-announcement');
  if (!el) return null;

  const raw = cleanElementContent(el);
  if (!raw) return null;

  try {
    if (raw.startsWith('{') && raw.endsWith('}')) {
      return JSON.parse(raw);
    }

    const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const settings: BloggerAnnouncementSettings = { enabled: true };

    lines.forEach(line => {
      const mText = line.match(/^(?:text|message|notice)\s*[:=]\s*(.+)$/i);
      if (mText) settings.text = mText[1].trim();

      const mBadge = line.match(/^(?:badge|label)\s*[:=]\s*(.+)$/i);
      if (mBadge) settings.badge = mBadge[1].trim();

      const mLink = line.match(/^(?:link|url)\s*[:=]\s*(.+)$/i);
      if (mLink) settings.linkUrl = mLink[1].trim();

      const mLinkText = line.match(/^(?:button|action)\s*[:=]\s*(.+)$/i);
      if (mLinkText) settings.linkText = mLinkText[1].trim();
    });

    if (settings.text) return settings;

    // Plain message fallback
    return {
      enabled: true,
      text: raw
    };
  } catch {
    return null;
  }
}

/**
 * Reads Inbuilt Posts overrides edited via Blogger Layout -> "Admin: Edit Inbuilt Posts"
 * Supports:
 * - Hide all inbuilt posts (so ONLY Blogger posts show): "hide_builtin: true" or "only_blogger: true"
 * - JSON array: [{"id": "guide-1", "title": "...", "category": "..."}]
 * - Key-Value blocks for editing guide-1 through guide-5
 */
export function applyBloggerPostOverrides(basePosts: BlogPost[]): BlogPost[] {
  if (typeof document === 'undefined') return basePosts;
  const el = document.getElementById('blogger-override-inbuilt-posts');
  if (!el) return basePosts;

  const raw = cleanElementContent(el);
  if (!raw) return basePosts;

  try {
    // Check if admin wants to hide all inbuilt posts and show 100% Blogger posts only
    if (/^(?:hide_builtin|hide_inbuilt|only_blogger|disable_inbuilt)\s*[:=]\s*(?:true|yes|1)/i.test(raw)) {
      return [];
    }

    let overrides: BloggerPostOverride[] = [];

    if (raw.startsWith('[') && raw.endsWith(']')) {
      overrides = JSON.parse(raw);
    } else if (raw.startsWith('{') && raw.endsWith('}')) {
      overrides = [JSON.parse(raw)];
    } else {
      // Parse key-value block format:
      // [guide-1] or guide-1:
      // title: ...
      // category: ...
      overrides = parseKeyValueOverrides(raw);
    }

    if (!Array.isArray(overrides) || overrides.length === 0) {
      return basePosts;
    }

    // Map overrides over the base posts
    const updated = basePosts.map(post => {
      const match = overrides.find(o => 
        (o.id && (o.id === post.id || o.id === post.slug)) ||
        (o.id && post.id.includes(o.id))
      );
      if (!match) return post;

      return {
        ...post,
        title: match.title || post.title,
        category: match.category || post.category,
        excerpt: match.excerpt || post.excerpt,
        coverImage: match.coverImage || post.coverImage,
        content: match.content || post.content,
        readTimeMinutes: match.readTimeMinutes ?? post.readTimeMinutes,
        publishedAt: match.publishedAt || post.publishedAt,
        author: {
          ...post.author,
          name: match.authorName || post.author.name,
          role: match.authorRole || post.author.role,
        }
      };
    });

    // If there are custom posts in overrides that don't match existing IDs, append them!
    overrides.forEach(o => {
      if (o.id && !basePosts.some(p => p.id === o.id || p.slug === o.id || p.id.includes(o.id))) {
        updated.push({
          id: o.id,
          slug: o.id.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          title: o.title || 'Untitled Post',
          excerpt: o.excerpt || 'Article published via Blogger Layout Admin.',
          content: o.content || o.excerpt || '',
          category: o.category || 'Developer Workflows',
          author: {
            name: o.authorName || 'Toolzaro Editor',
            role: o.authorRole || 'Contributor',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          },
          publishedAt: o.publishedAt || new Date().toISOString().split('T')[0],
          readTimeMinutes: o.readTimeMinutes || 5,
          coverImage: o.coverImage || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
          tags: [o.category || 'Developer Workflows'],
          source: 'builtin'
        });
      }
    });

    return updated;
  } catch (err) {
    console.warn('[Blogger Layout Admin] Failed to parse post overrides:', err);
    return basePosts;
  }
}

/**
 * Parser for human-friendly multi-block key-value configuration
 * e.g.
 * guide-1:
 * title: New Title
 * category: Developer Workflows
 */
function parseKeyValueOverrides(raw: string): BloggerPostOverride[] {
  const result: BloggerPostOverride[] = [];
  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  let current: Partial<BloggerPostOverride> | null = null;

  for (const line of lines) {
    // Match section headers like: [guide-1] or guide-1:
    const headerMatch = line.match(/^\[?(guide-\d+|[a-zA-Z0-9-_]+)\]?:?$/i);
    if (headerMatch && !line.includes(' ')) {
      if (current && current.id) {
        result.push(current as BloggerPostOverride);
      }
      current = { id: headerMatch[1].trim() };
      continue;
    }

    if (!current) {
      // If no header yet, check if line specifies id:
      const idMatch = line.match(/^id\s*[:=]\s*(.+)$/i);
      if (idMatch) {
        current = { id: idMatch[1].trim() };
        continue;
      }
    }

    if (current) {
      const titleMatch = line.match(/^title\s*[:=]\s*(.+)$/i);
      if (titleMatch) { current.title = titleMatch[1].trim(); continue; }

      const catMatch = line.match(/^(?:category|cat)\s*[:=]\s*(.+)$/i);
      if (catMatch) { current.category = catMatch[1].trim(); continue; }

      const excerptMatch = line.match(/^(?:excerpt|desc)\s*[:=]\s*(.+)$/i);
      if (excerptMatch) { current.excerpt = excerptMatch[1].trim(); continue; }

      const imageMatch = line.match(/^(?:image|cover|thumbnail)\s*[:=]\s*(.+)$/i);
      if (imageMatch) { current.coverImage = imageMatch[1].trim(); continue; }
    }
  }

  if (current && current.id) {
    result.push(current as BloggerPostOverride);
  }

  return result;
}
