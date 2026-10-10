import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { tools, categories } from '../src/lib/registry';
import { BUILTIN_BLOG_POSTS } from '../src/lib/blogData';

const BASE_URL = (process.env.SITE_URL || 'https://toolzaro.cyou').replace(/\/+$/, '');
const PUBLIC_DIR = path.resolve(process.cwd(), 'public');
const ASSETS_IMG_DIR = path.resolve(process.cwd(), 'src/assets/images');
const TODAY = new Date().toISOString().split('T')[0];
const NOW_RFC822 = new Date().toUTCString();
const MAX_URLS_PER_SITEMAP = 40000; // Google limit is 50,000; 40,000 ensures safe unlimited chunking

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: string;
}

function buildUrlsetXml(entries: SitemapEntry[]): string {
  const urlsXml = entries
    .map(
      u => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${u.lastmod || TODAY}</lastmod>
    <changefreq>${u.changefreq || 'weekly'}</changefreq>
    <priority>${u.priority || '0.8'}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urlsXml}
</urlset>
`;
}

function buildSitemapIndexXml(sitemapUrls: string[]): string {
  const itemsXml = sitemapUrls
    .map(
      loc => `  <sitemap>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${TODAY}</lastmod>
  </sitemap>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${itemsXml}
</sitemapindex>
`;
}

function ensureFaviconsInPublic() {
  const faviconSrc = path.join(ASSETS_IMG_DIR, 'toolzaro_favicon_1791427479017.jpg');
  const iconLogoSrc = path.join(ASSETS_IMG_DIR, 'toolzaro_icon_logo_1791427467156.jpg');
  const fullLogoSrc = path.join(ASSETS_IMG_DIR, 'toolzaro_full_logo_1791427489081.jpg');
  const heroBannerSrc = path.join(ASSETS_IMG_DIR, 'premium_hero_banner_1791390453868.jpg');

  const requiredFiles = [
    'favicon.ico',
    'favicon.png',
    'favicon-16x16.png',
    'favicon-32x32.png',
    'favicon-48x48.png',
    'favicon-96x96.png',
    'apple-touch-icon.png',
    'android-chrome-192x192.png',
    'android-chrome-512x512.png',
    'logo.png',
    'og-banner.jpg',
  ];

  const allExist = requiredFiles.every(f => fs.existsSync(path.join(PUBLIC_DIR, f)));
  if (allExist) {
    console.log('[SEO & Favicons] All root domain favicons & OG images verified in public/.');
    return;
  }

  try {
    if (fs.existsSync(faviconSrc) && fs.existsSync(iconLogoSrc)) {
      execSync(
        `convert "${faviconSrc}" -resize 16x16 "${path.join(PUBLIC_DIR, 'favicon-16x16.png')}" && ` +
          `convert "${faviconSrc}" -resize 32x32 "${path.join(PUBLIC_DIR, 'favicon-32x32.png')}" && ` +
          `convert "${faviconSrc}" -resize 48x48 "${path.join(PUBLIC_DIR, 'favicon-48x48.png')}" && ` +
          `convert "${faviconSrc}" -resize 96x96 "${path.join(PUBLIC_DIR, 'favicon-96x96.png')}" && ` +
          `convert "${faviconSrc}" -resize 96x96 "${path.join(PUBLIC_DIR, 'favicon.png')}" && ` +
          `convert "${path.join(PUBLIC_DIR, 'favicon-16x16.png')}" "${path.join(PUBLIC_DIR, 'favicon-32x32.png')}" "${path.join(PUBLIC_DIR, 'favicon-48x48.png')}" "${path.join(PUBLIC_DIR, 'favicon.ico')}" && ` +
          `convert "${iconLogoSrc}" -resize 180x180 "${path.join(PUBLIC_DIR, 'apple-touch-icon.png')}" && ` +
          `convert "${iconLogoSrc}" -resize 192x192 "${path.join(PUBLIC_DIR, 'android-chrome-192x192.png')}" && ` +
          `convert "${iconLogoSrc}" -resize 512x512 "${path.join(PUBLIC_DIR, 'android-chrome-512x512.png')}"`,
        { stdio: 'pipe' }
      );
    }
    if (fs.existsSync(fullLogoSrc) && !fs.existsSync(path.join(PUBLIC_DIR, 'logo.png'))) {
      execSync(`convert "${fullLogoSrc}" -resize 600x402 "${path.join(PUBLIC_DIR, 'logo.png')}"`, { stdio: 'pipe' });
    }
    if (fs.existsSync(heroBannerSrc) && !fs.existsSync(path.join(PUBLIC_DIR, 'og-banner.jpg'))) {
      execSync(
        `convert "${heroBannerSrc}" -gravity center -crop 1200x630+0+0 +repage -quality 88 "${path.join(PUBLIC_DIR, 'og-banner.jpg')}"`,
        { stdio: 'pipe' }
      );
    }
  } catch {
    // Fallback if ImageMagick is not installed in a container environment
    if (fs.existsSync(faviconSrc)) {
      for (const f of ['favicon.ico', 'favicon.png', 'favicon-16x16.png', 'favicon-32x32.png', 'favicon-48x48.png', 'favicon-96x96.png']) {
        const dest = path.join(PUBLIC_DIR, f);
        if (!fs.existsSync(dest)) fs.copyFileSync(faviconSrc, dest);
      }
    }
    if (fs.existsSync(iconLogoSrc)) {
      for (const f of ['apple-touch-icon.png', 'android-chrome-192x192.png', 'android-chrome-512x512.png']) {
        const dest = path.join(PUBLIC_DIR, f);
        if (!fs.existsSync(dest)) fs.copyFileSync(iconLogoSrc, dest);
      }
    }
    if (fs.existsSync(heroBannerSrc) && !fs.existsSync(path.join(PUBLIC_DIR, 'og-banner.jpg'))) {
      fs.copyFileSync(heroBannerSrc, path.join(PUBLIC_DIR, 'og-banner.jpg'));
    }
  }
}

function generateAllSitemapsAndSeoFiles() {
  ensureFaviconsInPublic();

  // 1. Core & Static Pages (Flat Root-Level)
  const pageEntries: SitemapEntry[] = [
    { loc: `${BASE_URL}/`, changefreq: 'daily', priority: '1.0' },
    { loc: `${BASE_URL}/tools`, changefreq: 'daily', priority: '0.95' },
    { loc: `${BASE_URL}/bookmarks`, changefreq: 'weekly', priority: '0.85' },
    { loc: `${BASE_URL}/blog`, changefreq: 'daily', priority: '0.9' },
    { loc: `${BASE_URL}/sitemap`, changefreq: 'weekly', priority: '0.85' },
    { loc: `${BASE_URL}/about`, changefreq: 'monthly', priority: '0.7' },
    { loc: `${BASE_URL}/contact`, changefreq: 'monthly', priority: '0.7' },
    { loc: `${BASE_URL}/privacy-policy`, changefreq: 'monthly', priority: '0.6' },
    { loc: `${BASE_URL}/terms`, changefreq: 'monthly', priority: '0.6' },
    { loc: `${BASE_URL}/disclaimer`, changefreq: 'monthly', priority: '0.6' },
  ];

  // 2. Category Pages (Flat Root-Level: https://toolzaro.cyou/category-slug)
  const categoryEntries: SitemapEntry[] = categories.map(cat => {
    const catSlug = cat.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
    return {
      loc: `${BASE_URL}/${catSlug}`,
      changefreq: 'weekly',
      priority: '0.85',
    };
  });

  // 3. Unlimited Tool Pages (Flat Root-Level: https://toolzaro.cyou/tool-slug)
  const uniqueToolSlugs = new Set<string>();
  const toolEntries: SitemapEntry[] = [];
  for (const tool of tools) {
    if (!tool.slug || uniqueToolSlugs.has(tool.slug)) continue;
    uniqueToolSlugs.add(tool.slug);
    toolEntries.push({
      loc: `${BASE_URL}/${tool.slug}`,
      changefreq: 'weekly',
      priority: '0.9',
    });
  }

  // 4. Blog Post Pages (Flat Root-Level: https://toolzaro.cyou/post-slug)
  const blogEntries: SitemapEntry[] = BUILTIN_BLOG_POSTS.map(post => ({
    loc: `${BASE_URL}/${post.slug}`,
    lastmod: post.publishedAt || TODAY,
    changefreq: 'monthly',
    priority: '0.8',
  }));

  // Write dedicated sub-sitemaps
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap-pages.xml'), buildUrlsetXml(pageEntries), 'utf8');
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap-categories.xml'), buildUrlsetXml(categoryEntries), 'utf8');
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap-blog.xml'), buildUrlsetXml(blogEntries), 'utf8');

  // Unlimited Tools Sitemap Chunking Support
  const childSitemapUrls: string[] = [
    `${BASE_URL}/sitemap-pages.xml`,
    `${BASE_URL}/sitemap-categories.xml`,
  ];

  if (toolEntries.length <= MAX_URLS_PER_SITEMAP) {
    fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap-tools.xml'), buildUrlsetXml(toolEntries), 'utf8');
    childSitemapUrls.push(`${BASE_URL}/sitemap-tools.xml`);
  } else {
    // Automatically split into multiple sitemap-tools-1.xml, sitemap-tools-2.xml, etc. if >40,000 tools
    fs.writeFileSync(
      path.join(PUBLIC_DIR, 'sitemap-tools.xml'),
      buildUrlsetXml(toolEntries.slice(0, MAX_URLS_PER_SITEMAP)),
      'utf8'
    );
    childSitemapUrls.push(`${BASE_URL}/sitemap-tools.xml`);
    let chunkIndex = 1;
    for (let i = 0; i < toolEntries.length; i += MAX_URLS_PER_SITEMAP) {
      const chunk = toolEntries.slice(i, i + MAX_URLS_PER_SITEMAP);
      const fileName = `sitemap-tools-${chunkIndex}.xml`;
      fs.writeFileSync(path.join(PUBLIC_DIR, fileName), buildUrlsetXml(chunk), 'utf8');
      childSitemapUrls.push(`${BASE_URL}/${fileName}`);
      chunkIndex++;
    }
  }

  childSitemapUrls.push(`${BASE_URL}/sitemap-blog.xml`);

  // Write Sitemap Index (sitemap-index.xml)
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap-index.xml'), buildSitemapIndexXml(childSitemapUrls), 'utf8');

  // Write Complete Master Sitemap (sitemap.xml) containing all entries
  const allEntries: SitemapEntry[] = [
    ...pageEntries,
    ...categoryEntries,
    ...toolEntries,
    ...blogEntries,
  ];
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), buildUrlsetXml(allEntries), 'utf8');

  // 5. Generate RSS 2.0 Feed (rss.xml & feed.xml) for Google Search Console / Discover / Feed Readers
  const rssItemsXml = [
    ...BUILTIN_BLOG_POSTS.map(
      post => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(`${BASE_URL}/${post.slug}`)}</link>
      <guid isPermaLink="true">${escapeXml(`${BASE_URL}/${post.slug}`)}</guid>
      <description>${escapeXml(post.excerpt)}</description>
      <category>${escapeXml(post.category)}</category>
      <pubDate>${new Date(post.publishedAt || TODAY).toUTCString()}</pubDate>
    </item>`
    ),
    ...tools.map(
      tool => `    <item>
      <title>${escapeXml(`${tool.name} - ${tool.metaTitle} | Toolzaro`)}</title>
      <link>${escapeXml(`${BASE_URL}/${tool.slug}`)}</link>
      <guid isPermaLink="true">${escapeXml(`${BASE_URL}/${tool.slug}`)}</guid>
      <description>${escapeXml(`${tool.metaDescription} Free online ${tool.category.toLowerCase()} utility on Toolzaro.`)}</description>
      <category>${escapeXml(tool.category)}</category>
      <pubDate>${NOW_RFC822}</pubDate>
    </item>`
    ),
  ].join('\n');

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Toolzaro - ${tools.length}+ Free Online Developer, PDF &amp; Utility Tools</title>
    <link>${BASE_URL}/</link>
    <description>Complete suite of ${tools.length}+ fast, privacy-first browser utilities for developers, designers, and creators. 100% client-side execution.</description>
    <language>en-us</language>
    <lastBuildDate>${NOW_RFC822}</lastBuildDate>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${rssItemsXml}
  </channel>
</rss>
`;
  fs.writeFileSync(path.join(PUBLIC_DIR, 'rss.xml'), rssXml, 'utf8');
  fs.writeFileSync(path.join(PUBLIC_DIR, 'feed.xml'), rssXml, 'utf8');

  // 6. Generate llms.txt for AI Search Engines (ChatGPT Search, Perplexity, Google AI Overviews, Claude)
  const llmsLines: string[] = [
    `# Toolzaro - Free Online Developer, PDF, Image & Utility Suite`,
    `> Toolzaro (${BASE_URL}) is a privacy-first online utility platform offering ${tools.length}+ browser-native tools across ${categories.length} categories. All tools run 100% client-side with zero cloud uploads and flat root-level URLs.`,
    ``,
    `## Core Pages`,
    `- [Home](${BASE_URL}/): Main hub with instant search across ${tools.length}+ utilities.`,
    `- [All Tools Directory](${BASE_URL}/tools): Complete A-Z categorized directory of all ${tools.length} tools.`,
    `- [HTML Sitemap](${BASE_URL}/sitemap): Full index of all tools, categories, and guides.`,
    `- [Engineering Blog](${BASE_URL}/blog): Technical tutorials, privacy architecture guides, and developer articles.`,
    `- [About Us](${BASE_URL}/about): Client-first engineering standards and privacy commitment.`,
    `- [Contact Support](${BASE_URL}/contact): Direct email and WhatsApp engineering desk.`,
    `- [Privacy Policy](${BASE_URL}/privacy-policy): Zero-knowledge local processing, GDPR, CCPA, and Google AdSense disclosures.`,
    `- [Terms of Service](${BASE_URL}/terms): Fair use terms and conditions.`,
    `- [Disclaimer](${BASE_URL}/disclaimer): Accuracy and verification disclosures.`,
    ``,
    `## Tool Categories (${categories.length})`,
    ...categories.map(cat => {
      const catSlug = cat.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
      const count = tools.filter(t => t.category === cat).length;
      return `- [${cat} Tools (${count})](${BASE_URL}/${catSlug})`;
    }),
    ``,
    `## Complete Directory of ${tools.length} Tools (Flat Root-Level URLs)`,
    ...tools.map(t => `- [${t.name}](${BASE_URL}/${t.slug}): ${t.metaDescription} (Category: ${t.category})`),
    ``,
    `## Technical Guides & Articles (${BUILTIN_BLOG_POSTS.length})`,
    ...BUILTIN_BLOG_POSTS.map(p => `- [${p.title}](${BASE_URL}/${p.slug}): ${p.excerpt}`),
    ``,
  ];
  fs.writeFileSync(path.join(PUBLIC_DIR, 'llms.txt'), llmsLines.join('\n'), 'utf8');

  // 7. Update robots.txt with AdSense Mediapartners-Google & all sitemaps
  const robotsTxt = `# Toolzaro Official Robots.txt (${BASE_URL})
# 100% Google AdSense, Googlebot, Bingbot & AI Search Friendly

User-agent: Mediapartners-Google
Allow: /

User-agent: Googlebot
Allow: /
Disallow: /sabbir
Disallow: /sabbir.html

User-agent: Bingbot
Allow: /
Disallow: /sabbir
Disallow: /sabbir.html

User-agent: *
Allow: /
Disallow: /sabbir
Disallow: /sabbir.html

# Sitemaps for Google Search Console & Bing Webmaster Tools
Sitemap: ${BASE_URL}/sitemap-index.xml
Sitemap: ${BASE_URL}/sitemap.xml
Sitemap: ${BASE_URL}/sitemap-tools.xml
Sitemap: ${BASE_URL}/sitemap-categories.xml
Sitemap: ${BASE_URL}/sitemap-pages.xml
Sitemap: ${BASE_URL}/sitemap-blog.xml
Sitemap: ${BASE_URL}/rss.xml
`;
  fs.writeFileSync(path.join(PUBLIC_DIR, 'robots.txt'), robotsTxt, 'utf8');

  console.log(
    `[SEO Generator] Successfully generated:\n` +
      `  - sitemap-index.xml (${childSitemapUrls.length} child sitemaps)\n` +
      `  - sitemap.xml (${allEntries.length} total URLs)\n` +
      `  - sitemap-tools.xml (${toolEntries.length} flat root-level tool URLs)\n` +
      `  - sitemap-categories.xml (${categoryEntries.length} category URLs)\n` +
      `  - sitemap-pages.xml (${pageEntries.length} core/static page URLs)\n` +
      `  - sitemap-blog.xml (${blogEntries.length} blog post URLs)\n` +
      `  - rss.xml & feed.xml (${tools.length + BUILTIN_BLOG_POSTS.length} feed items)\n` +
      `  - llms.txt & robots.txt`
  );
}

generateAllSitemapsAndSeoFiles();
