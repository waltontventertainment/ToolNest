// ToolNest Pulse & Insights - Dynamic Blog & Blogger Feed Integration
// 100% Client-Side Compatible for Blogger & Static Hosting

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // Full markdown / HTML content
  category: 'AI & Machine Learning' | 'Developer Workflows' | 'SEO & Growth' | 'Security & Privacy' | 'Design & UX';
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  publishedAt: string;
  readTimeMinutes: number;
  coverImage: string;
  tags: string[];
  relatedToolSlugs?: string[];
  source?: 'builtin' | 'blogger';
  bloggerUrl?: string;
}

export const BUILTIN_BLOG_POSTS: BlogPost[] = [
  {
    id: 'post-1',
    slug: 'how-to-use-free-ai-models-for-productivity-in-2026',
    title: 'How to Leverage 100% Free AI Models for Daily Workflows & Content Creation',
    excerpt: 'Discover how open-source and free AI models can automate article writing, code refactoring, SQL query building, and SEO optimization with zero subscription fees.',
    category: 'AI & Machine Learning',
    author: {
      name: 'ToolNest Team',
      role: 'ToolNest Official Editorial',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80'
    },
    publishedAt: '2026-10-04',
    readTimeMinutes: 6,
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    tags: ['AI Tools', 'Open Source AI', 'Productivity', 'Automation', 'Content Writing'],
    relatedToolSlugs: ['ai-article-writer', 'ai-code-explainer', 'ai-regex-sql-generator', 'ai-social-post-generator'],
    source: 'builtin',
    content: `
# How to Leverage 100% Free AI Models for Daily Workflows & Content Creation

Artificial intelligence has evolved from experimental research into the backbone of daily software development, copywriting, and digital marketing. However, commercial subscriptions for multiple AI tools quickly compound in cost.

In this guide, we explore how modern open-source models and free AI engines provide state-of-the-art results without subscription lock-in.

---

## 1. The Power of Dynamic Model Routing & Fallbacks

When relying on free AI services, individual models can occasionally experience traffic spikes or temporary rate-limiting. The key architectural secret is **dynamic auto-failover**:

- **Primary Free Engine**: Ultra-fast latency for real-time text processing.
- **Secondary Reasoning Models**: Used automatically for step-by-step logic, code compilation, and structured data tasks.
- **Client-Side Failover**: Switching models invisibly in the browser so users experience zero friction.

\`\`\`typescript
// Client-side failover concept
for (const model of FREE_MODELS) {
  try {
    const response = await fetchChatCompletion(model, prompt);
    if (response.ok) return response.data;
  } catch (err) {
    console.warn(\`Model \${model} unavailable, switching to next free model...\`);
  }
}
\`\`\`

---

## 2. Supercharging Content Production

Whether drafting long-form blog articles or crafting high-converting social copy, structured prompting yields 10x better outputs:

1. **Define the Target Persona**: Always specify tone (e.g., *authoritative and engaging* vs. *casual*).
2. **Set Rigid Markdown Boundaries**: Request clear H2/H3 subheadings, bullet lists, and summary takeaways.
3. **Embed Primary & Secondary SEO Keywords**: Ensure natural keyword placement without keyword stuffing.

> **Pro Tip:** Use the **AI Article & Blog Writer** in our suite to generate structured drafts with subheadings in seconds, then polish them using the **AI Grammar & Paraphraser**.

---

## 3. Developer Automation: From Natural Language to Regex & SQL

Writing complex regular expressions for email parsing or multi-table SQL joins with window functions often consumes unnecessary time. Free code-specialized AI models excel at translating plain English requirements into battle-tested syntax.

### Example: Natural Language to SQL
- **Input**: *"Find top 5 spending customers who purchased in the last 30 days with total order value."*
- **Generated SQL**:
\`\`\`sql
SELECT 
  u.id, 
  u.name, 
  SUM(o.total_amount) AS total_spent
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE o.created_at >= NOW() - INTERVAL '30 days'
GROUP BY u.id, u.name
ORDER BY total_spent DESC
LIMIT 5;
\`\`\`

---

## Conclusion

By adopting client-side, zero-backend toolchains powered by resilient free models, developers and creators can build completely sovereign, high-speed workflows that run anywhere—even on static Blogger sites.
    `
  },
  {
    id: 'post-2',
    slug: 'mastering-client-side-browser-utilities-privacy',
    title: 'Why Client-Side In-Browser Utilities Protect Your Sensitive Data',
    excerpt: 'Learn how WebAssembly, the Canvas API, and Web Cryptography allow full image resizing, PDF operations, and encryption to execute 100% locally on your device.',
    category: 'Security & Privacy',
    author: {
      name: 'ToolNest Team',
      role: 'ToolNest Security & Privacy Lab',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80'
    },
    publishedAt: '2026-10-02',
    readTimeMinutes: 5,
    coverImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80',
    tags: ['Privacy', 'Client-Side', 'Web Cryptography', 'Image Processing', 'Zero Trust'],
    relatedToolSlugs: ['image-compressor', 'password-generator', 'pdf-merger', 'file-hash-calculator'],
    source: 'builtin',
    content: `
# Why Client-Side In-Browser Utilities Protect Your Sensitive Data

Every day, millions of users upload confidential documents, personal photos, API keys, and business contracts to online converter websites. Unbeknownst to many, many conventional utility websites upload files to remote servers where they may be stored, logged, or analyzed.

ToolNest takes a fundamentally different architectural stance: **Zero Server Processing**.

---

## 1. What Does "Client-Side Only" Actually Mean?

When you compress an image or convert a PDF on ToolNest:
- The file **never leaves your device's memory (RAM)**.
- Calculations run directly within your browser using HTML5 Canvas, Web Audio, and the Web Cryptography API.
- Even if you disconnect your Wi-Fi, the utility continues functioning without interruption.

---

## 2. Comparing Traditional Cloud Tools vs. Client-Side Utilities

| Feature | Traditional Cloud Converters | ToolNest Client-Side Engine |
| :--- | :--- | :--- |
| **Data Transmission** | Sent over internet to cloud server | 0 bytes transmitted externally |
| **Server Logging** | Often logged & indexed | Impossible to log (never touches server) |
| **Execution Speed** | Dependent on network upload/download | Instantaneous hardware acceleration |
| **Offline Support** | Fails without active internet | Fully functional offline |

---

## 3. Cryptography Done Right

Using the native \`crypto.subtle\` browser API, hash generation (SHA-256, MD5, HMAC) and random password generation are cryptographically secure and resistant to entropy drainage.

\`\`\`javascript
// 100% Native Browser Cryptography
async function calculateFileHash(arrayBuffer) {
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
\`\`\`

---

## Key Takeaway

Always verify if an online utility requires a server upload. For sensitive company assets, code snippets, and IDs, client-side tools provide the highest privacy standard achievable on the modern web.
    `
  },
  {
    id: 'post-3',
    slug: 'modern-seo-strategies-meta-tags-rich-snippets',
    title: 'Essential SEO Checklist: Meta Tags, OpenGraph Cards, and Schema Markup in 2026',
    excerpt: 'A comprehensive technical audit guide for maximizing click-through rates on Google Search, X, LinkedIn, and Facebook with structured metadata.',
    category: 'SEO & Growth',
    author: {
      name: 'ToolNest Team',
      role: 'ToolNest Growth & SEO Desk',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80'
    },
    publishedAt: '2026-09-28',
    readTimeMinutes: 7,
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80',
    tags: ['SEO', 'OpenGraph', 'Schema.org', 'Meta Tags', 'Google SERP'],
    relatedToolSlugs: ['meta-tag-generator', 'opengraph-previewer', 'schema-markup-generator', 'sitemap-xml-generator'],
    source: 'builtin',
    content: `
# Essential SEO Checklist: Meta Tags, OpenGraph Cards, and Schema Markup in 2026

Achieving top organic search rankings is only half the battle. If your SERP snippet and social media share cards look truncated or unappealing, your click-through rate (CTR) will suffer significantly.

Here is the master technical checklist to ensure every page is properly indexed and shared across all platforms.

---

## 1. Title Tag & Meta Description Precision

Google frequently rewrites search snippets if your tags exceed character boundaries or lack contextual relevance:

- **Title Tag**: Keep between **50 - 60 characters** (approx. 580px width). Place your primary keyword at the beginning.
- **Meta Description**: Keep between **140 - 155 characters**. Include a compelling action verb and clear value proposition.

---

## 2. OpenGraph & Twitter Cards

When users paste your URL into WhatsApp, Telegram, Twitter/X, or LinkedIn, OpenGraph tags determine the rendered visual card:

\`\`\`html
<!-- Essential OpenGraph Metadata -->
<meta property="og:type" content="website" />
<meta property="og:url" content="https://example.com/page" />
<meta property="og:title" content="Punchy Title | Brand" />
<meta property="og:description" content="Engaging 150-character summary of page contents." />
<meta property="og:image" content="https://example.com/og-banner-1200x630.jpg" />
<meta name="twitter:card" content="summary_large_image" />
\`\`\`

---

## 3. Schema.org JSON-LD Structured Data

Adding structured data enables Google to display rich snippets, review stars, FAQ dropdowns, and breadcrumbs:

\`\`\`json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "ToolNest Online Suite",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}
\`\`\`

> **Action Step:** Use the **OpenGraph Previewer** and **Schema Markup Generator** in our toolkit to validate your URLs in real time before publishing.
    `
  },
  {
    id: 'post-4',
    slug: 'developer-cheat-sheet-regex-sql-conversions',
    title: 'Regex & SQL Mastery: 15 Practical Patterns Every Developer Needs',
    excerpt: 'Battle-tested regex expressions for email, phone, IP addresses, and UUIDs paired with high-performance SQL query snippets.',
    category: 'Developer Workflows',
    author: {
      name: 'ToolNest Team',
      role: 'ToolNest Developer Lab',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80'
    },
    publishedAt: '2026-09-24',
    readTimeMinutes: 6,
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
    tags: ['Regex', 'SQL', 'Development', 'Database', 'Cheat Sheet'],
    relatedToolSlugs: ['regex-tester', 'ai-regex-sql-generator', 'sql-minifier', 'json-to-typescript'],
    source: 'builtin',
    content: `
# Regex & SQL Mastery: 15 Practical Patterns Every Developer Needs

Regular expressions and SQL queries are two fundamental skills that frequently slow developers down when syntax nuances get in the way. Bookmark this practical cheat sheet of proven patterns.

---

## 1. Top 5 Regular Expression Patterns

### 1. Robust Email Validation
\`\`\`regex
^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$
\`\`\`

### 2. Strict Strong Password (Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)
\`\`\`regex
^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$
\`\`\`

### 3. IPv4 Address
\`\`\`regex
^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$
\`\`\`

### 4. ISO 8601 Date Format (YYYY-MM-DD)
\`\`\`regex
^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$
\`\`\`

---

## 2. Essential SQL Snippets for Web Apps

### Finding & Deleting Duplicate Records While Keeping Newest
\`\`\`sql
DELETE FROM contacts
WHERE id NOT IN (
  SELECT MAX(id)
  FROM contacts
  GROUP BY email
);
\`\`\`

### Calculating Month-over-Month Revenue Growth
\`\`\`sql
SELECT 
  DATE_TRUNC('month', created_at) AS month,
  SUM(amount) AS monthly_revenue,
  LAG(SUM(amount)) OVER (ORDER BY DATE_TRUNC('month', created_at)) AS prev_month_revenue,
  ROUND(
    (SUM(amount) - LAG(SUM(amount)) OVER (ORDER BY DATE_TRUNC('month', created_at))) / 
    LAG(SUM(amount)) OVER (ORDER BY DATE_TRUNC('month', created_at)) * 100, 2
  ) AS growth_percentage
FROM transactions
GROUP BY DATE_TRUNC('month', created_at);
\`\`\`

---

## Summary

Keep these patterns accessible or use the **AI Regex & SQL Generator** to create custom expressions tailored to your exact database schema.
    `
  },
  {
    id: 'post-5',
    slug: 'color-theory-contrast-accessibility-guide',
    title: 'Web Accessibility & Color Contrast: Ensuring WCAG 2.1 AAA Compliance',
    excerpt: 'A practical UI design guide on luminance calculations, accessible color palettes, and color blindness simulations for high-converting user experiences.',
    category: 'Design & UX',
    author: {
      name: 'ToolNest Team',
      role: 'ToolNest Design & UX System',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80'
    },
    publishedAt: '2026-09-19',
    readTimeMinutes: 5,
    coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80',
    tags: ['Accessibility', 'WCAG', 'Color Contrast', 'UI Design', 'Inclusive Design'],
    relatedToolSlugs: ['color-contrast-wcag-checker', 'color-blindness-simulator', 'color-palette-generator', 'css-gradient-generator'],
    source: 'builtin',
    content: `
# Web Accessibility & Color Contrast: Ensuring WCAG 2.1 AAA Compliance

Color contrast is one of the most frequently failed accessibility criteria on the web today. Poor contrast doesn't just alienate visually impaired users—it reduces reading speeds and conversions for all visitors, especially on mobile devices under sunlight.

---

## 1. Understanding WCAG Contrast Ratios

The Web Content Accessibility Guidelines (WCAG 2.1) define minimum contrast thresholds based on relative luminance calculations:

- **Level AA (Minimum Requirement)**:
  - Normal Text (< 18pt / 24px): **4.5:1** contrast ratio
  - Large Text (≥ 18pt / 24px or bold 14pt): **3:1** contrast ratio
  - UI Components & Graphical Objects: **3:1** contrast ratio
- **Level AAA (Enhanced Accessibility)**:
  - Normal Text: **7:1** contrast ratio
  - Large Text: **4.5:1** contrast ratio

---

## 2. Designing for Color Vision Deficiencies (CVD)

Approximately 8% of men and 0.5% of women have some form of color vision deficiency:

1. **Deuteranopia / Deuteranomaly**: Red-green color blindness (green weakness).
2. **Protanopia / Protanomaly**: Red weakness.
3. **Tritanopia**: Blue-yellow confusion (rare).

> **Crucial Rule:** Never rely on color alone to communicate state. Always pair color changes with icons, underline styles, or text labels (e.g. error alerts must include an icon and descriptive message).

---

## 3. Test Your Palette in ToolNest

Utilize the **Color Contrast WCAG Checker** and **Color Blindness Simulator** in ToolNest to audit your brand colors instantly and generate accessible variants.
    `
  },
  {
    id: 'post-6',
    slug: 'complete-guide-to-qr-code-and-barcode-standards',
    title: 'The Definitive Guide to QR Codes & Barcode Formats for Developers',
    excerpt: 'Everything you need to know about QR error correction levels, WiFi credentials encoding, EAN-13, UPC-A, and Code-128 barcode standards.',
    category: 'Developer Workflows',
    author: {
      name: 'ToolNest Team',
      role: 'ToolNest Hardware & Standards Desk',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80'
    },
    publishedAt: '2026-09-12',
    readTimeMinutes: 5,
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
    tags: ['QR Code', 'Barcode', 'EAN-13', 'Code 128', 'Hardware & IoT'],
    relatedToolSlugs: ['qr-generator', 'barcode-generator', 'qr-scanner', 'barcode-scanner'],
    source: 'builtin',
    content: `
# The Definitive Guide to QR Codes & Barcode Formats for Developers

QR codes and 1D linear barcodes connect the physical world to digital experiences. Selecting the proper format and error correction level ensures seamless scanning across retail scanners, smartphones, and low-light environments.

---

## 1. QR Code Error Correction Levels Explained

QR codes utilize Reed-Solomon error correction to restore data even when the code is partially damaged or covered by a brand logo:

- **Level L (Low)**: 7% recovery — Best for dense data where the code will be displayed on clean digital screens.
- **Level M (Medium)**: 15% recovery — The standard default for general web links.
- **Level Q (Quartile)**: 25% recovery — Recommended for outdoor posters and packaging.
- **Level H (High)**: 30% recovery — Essential when placing custom logos in the center of the QR code.

---

## 2. Choosing the Right 1D Barcode Standard

- **Code 128**: High-density alphanumeric barcode. Best for inventory, logistics, and internal tracking.
- **EAN-13 / UPC-A**: The global retail product standard recognized by POS supermarket barcode readers worldwide.
- **EAN-8**: Compact format for small products like cosmetics and confectionery.

---

## Generate Instantly

Use our **QR Code Generator** and **Barcode Generator** to produce scalable SVG and high-resolution PNG assets ready for print and packaging.
    `
  }
];

/**
 * Fetches and parses live posts from a Blogger blog using Blogger's public JSON feed.
 * 100% Client-Side compatible.
 */
export async function fetchBloggerPosts(bloggerUrl: string): Promise<BlogPost[]> {
  if (!bloggerUrl || !bloggerUrl.trim()) {
    return [];
  }

  // Normalize blog domain
  let cleanDomain = bloggerUrl.trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '');

  if (!cleanDomain.includes('.')) {
    cleanDomain = `${cleanDomain}.blogspot.com`;
  }

  const feedUrl = `https://${cleanDomain}/feeds/posts/default?alt=json&max-results=20`;

  try {
    // Attempt direct fetch first, fallback to CORS proxy if needed
    let data: any = null;
    try {
      const res = await fetch(feedUrl, { mode: 'cors' });
      if (res.ok) {
        data = await res.json();
      }
    } catch {}

    if (!data || !data.feed) {
      // Use client-side CORS proxy fallback
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`;
      const proxyRes = await fetch(proxyUrl);
      if (proxyRes.ok) {
        data = await proxyRes.json();
      }
    }

    if (!data?.feed?.entry || !Array.isArray(data.feed.entry)) {
      return [];
    }

    const posts: BlogPost[] = data.feed.entry.map((entry: any, index: number) => {
      const rawTitle = entry.title?.$t || 'Untitled Post';
      const rawContent = entry.content?.$t || entry.summary?.$t || '';
      const published = entry.published?.$t ? entry.published.$t.slice(0, 10) : new Date().toISOString().slice(0, 10);
      const authorName = entry.author?.[0]?.name?.$t || 'Blogger Author';
      const postUrl = entry.link?.find((l: any) => l.rel === 'alternate')?.href || '';
      
      // Auto-extract cover image from content or thumbnail
      let coverImage = entry.media$thumbnail?.url?.replace(/\/s72-c\//, '/s1600/') || '';
      if (!coverImage && rawContent) {
        const imgMatch = rawContent.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (imgMatch && imgMatch[1]) {
          coverImage = imgMatch[1];
        }
      }
      if (!coverImage) {
        coverImage = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&auto=format&fit=crop&q=80';
      }

      // Generate clean excerpt from HTML
      const plainText = rawContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      const excerpt = plainText.slice(0, 180) + (plainText.length > 180 ? '...' : '');

      // Calculate approximate read time
      const wordCount = plainText.split(/\s+/).filter(Boolean).length;
      const readTime = Math.max(1, Math.ceil(wordCount / 200));

      const slug = 'blogger-' + (rawTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `post-${index + 1}`);

      const categoriesList: any[] = ['AI & Machine Learning', 'Developer Workflows', 'SEO & Growth', 'Security & Privacy', 'Design & UX'];
      const rawCat = entry.category?.[0]?.term;
      const category = categoriesList.includes(rawCat) ? rawCat : 'Developer Workflows';

      return {
        id: `blogger-${entry.id?.$t || index}`,
        slug,
        title: rawTitle,
        excerpt,
        content: rawContent,
        category,
        author: {
          name: 'ToolNest Team',
          role: 'ToolNest Official Editorial',
          avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80'
        },
        publishedAt: published,
        readTimeMinutes: readTime,
        coverImage,
        tags: entry.category?.map((c: any) => c.term).filter(Boolean) || ['Blogger Post', 'Article'],
        source: 'blogger' as const,
        bloggerUrl: postUrl
      };
    });

    return posts;
  } catch (err) {
    console.warn('Could not load Blogger feed:', err);
    return [];
  }
}

/**
 * Gets all blog posts by merging built-in articles with live synced Blogger articles automatically in the background.
 * Seamlessly handles Blogger hosting (Blogspot / custom domain XML themes) with zero user configuration needed.
 */
export async function getMergedBlogPosts(): Promise<BlogPost[]> {
  if (typeof window === 'undefined') {
    return BUILTIN_BLOG_POSTS;
  }

  // 1. Check if Blogger posts were pre-injected by Blogger XML theme in window
  const injectedPosts = (window as any).BLOGGER_POSTS || (window as any).bloggerFeedData;
  if (Array.isArray(injectedPosts) && injectedPosts.length > 0) {
    return [...injectedPosts, ...BUILTIN_BLOG_POSTS];
  }

  // 2. Automatically try background fetch from Blogger standard relative feed or host domain
  try {
    const isBlogspot = window.location.hostname.includes('.blogspot.');
    const customBloggerUrl = localStorage.getItem('toolnest_custom_blogger_url') || '';
    const targetDomain = isBlogspot ? window.location.hostname : customBloggerUrl;

    if (targetDomain) {
      const bloggerPosts = await fetchBloggerPosts(targetDomain);
      if (bloggerPosts.length > 0) {
        return [...bloggerPosts, ...BUILTIN_BLOG_POSTS];
      }
    } else if (window.location.protocol.startsWith('http')) {
      // Try local relative feed if hosted on Blogger XML theme root
      try {
        const relativeRes = await fetch('/feeds/posts/default?alt=json&max-results=20', { cache: 'no-store' });
        if (relativeRes.ok) {
          const relativeData = await relativeRes.json();
          if (relativeData?.feed?.entry && Array.isArray(relativeData.feed.entry)) {
            const parsed = await fetchBloggerPosts(window.location.hostname);
            if (parsed.length > 0) return [...parsed, ...BUILTIN_BLOG_POSTS];
          }
        }
      } catch {}
    }
  } catch (err) {
    console.debug('Background Blogger auto-sync fallback to built-in articles:', err);
  }

  return BUILTIN_BLOG_POSTS;
}
