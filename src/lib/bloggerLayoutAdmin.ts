// Blogger Layout Admin Panel Bridge
// Allows blog owners to edit inbuilt posts, categories, hero text, and site settings
// directly from the Blogger Dashboard -> Layout -> Widgets without editing code!

import { BlogPost, BUILTIN_BLOG_POSTS } from './blogData';

export interface BloggerHeroSettings {
  badge?: string;
  title?: string;
  subtitle?: string;
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
 * Reads Hero Banner configuration edited via Blogger Layout -> "Toolzaro: Hero Banner Settings"
 */
export function getBloggerHeroSettings(): BloggerHeroSettings | null {
  if (typeof document === 'undefined') return null;
  const el = document.getElementById('blogger-override-hero');
  if (!el || !el.textContent) return null;

  try {
    const raw = el.textContent.trim();
    if (raw.startsWith('{') && raw.endsWith('}')) {
      return JSON.parse(raw) as BloggerHeroSettings;
    }
  } catch (err) {
    console.warn('[Blogger Layout Admin] Failed to parse Hero settings:', err);
  }
  return null;
}

/**
 * Reads Inbuilt Posts overrides edited via Blogger Layout -> "Toolzaro: Inbuilt Posts Manager"
 * Allows changing title, category, excerpt, or adding new custom posts from Blogger Layout!
 */
export function applyBloggerPostOverrides(basePosts: BlogPost[]): BlogPost[] {
  if (typeof document === 'undefined') return basePosts;
  const el = document.getElementById('blogger-override-inbuilt-posts');
  if (!el || !el.textContent) return basePosts;

  try {
    const raw = el.textContent.trim();
    if (!raw) return basePosts;

    let overrides: BloggerPostOverride[] = [];
    if (raw.startsWith('[') && raw.endsWith(']')) {
      overrides = JSON.parse(raw);
    } else if (raw.startsWith('{') && raw.endsWith('}')) {
      overrides = [JSON.parse(raw)];
    }

    if (!Array.isArray(overrides) || overrides.length === 0) {
      return basePosts;
    }

    // Map overrides over the base posts
    const updated = basePosts.map(post => {
      const match = overrides.find(o => o.id === post.id || o.id === post.slug);
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
      if (o.id && !basePosts.some(p => p.id === o.id || p.slug === o.id)) {
        updated.push({
          id: o.id,
          slug: o.id.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          title: o.title || 'Untitled Post',
          excerpt: o.excerpt || 'Article published via Blogger Layout.',
          content: o.content || o.excerpt || '',
          category: o.category || 'General',
          author: {
            name: o.authorName || 'Toolzaro Editor',
            role: o.authorRole || 'Contributor',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          },
          publishedAt: o.publishedAt || new Date().toISOString().split('T')[0],
          readTimeMinutes: o.readTimeMinutes || 5,
          coverImage: o.coverImage || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
          tags: [o.category || 'General'],
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
