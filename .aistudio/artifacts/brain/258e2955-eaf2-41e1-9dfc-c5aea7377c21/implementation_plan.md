# Implementation Plan: Cloudflare Pages Optimization & Rapid SEO Indexing Suite

Prepare Toolzaro for seamless GitHub-to-Cloudflare Pages deployment and rapid Google search engine indexing under the production domain **`https://toolzaro.cyou`**. This suite includes all static web standards, security headers, AdSense verification, and automated build verification.

---

## 1. Cloudflare Pages & Web Standard Files

### A. `public/robots.txt`
- Canonical domain configuration for `https://toolzaro.cyou`
- Allow crawling across all public tools, categories, and blog articles
- **Explicitly disallow** `/sabbir` and `/sabbir.html` to keep the secret admin dashboard unindexed by Googlebot
- Include sitemap reference: `Sitemap: https://toolzaro.cyou/sitemap.xml`

### B. `public/sitemap.xml`
- Complete XML sitemap mapping the canonical domain `https://toolzaro.cyou`:
  - Homepage (`1.0` priority, daily changefreq)
  - Blog Index (`0.9` priority)
  - All 156+ individual tool permalinks (`0.8` priority)
  - Category archives (`0.7` priority)
  - Legal & Info pages (About, Privacy, Terms, Disclaimer, Contact)

### C. `public/ads.txt`
- Official Google AdSense verification line:
  `google.com, pub-8769496591745522, DIRECT, f08c47fec0942fa0`
- Compliant format according to IAB Tech Lab standards

### D. `public/_headers` (Cloudflare Pages HTTP Header Directives)
- **Global Security Headers (`/*`)**:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: SAMEORIGIN`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(self), microphone=(), geolocation=()`
  - `X-XSS-Protection: 1; mode=block`
- **Aggressive Caching for Hashed Assets (`/assets/*`)**:
  - `Cache-Control: public, max-age=31536000, immutable` (boosts Google Core Web Vitals score)
- **Static Assets & Manifests (`*.json`, `*.svg`, `*.png`, `*.jpg`, `*.ico`)**:
  - `Cache-Control: public, max-age=604800, stale-while-revalidate=86400`
- **Dynamic HTML & Service Workers (`/index.html`, `/sw.js`)**:
  - `Cache-Control: public, max-age=0, must-revalidate`

### E. `public/_redirects` (Cloudflare Pages SPA Routing)
- Universal SPA fallback rule:
  `/*    /index.html   200`
- Supports direct access to deep URLs (`/tools/:slug`, `/category/:slug`, `/blog/:slug`, `/sabbir`) without 404s

### F. `public/.well-known/security.txt` & `public/security.txt`
- Conforms to RFC 9116 security policy:
  - Contact: `mailto:support@toolzaro.cyou` & `mailto:ppp3103m@gmail.com`
  - Canonical: `https://toolzaro.cyou/.well-known/security.txt`
  - Policy & Preferred Languages: `en, bn`

---

## 2. Metadata & SEO Synchronization

### A. `index.html` Entry Point
- Update `<title>`, `<meta name="description">`, `og:url`, `og:image`, and `twitter:*` tags with `https://toolzaro.cyou`
- Set `<link rel="canonical" href="https://toolzaro.cyou/" />`

### B. `src/lib/siteSettings.ts`
- Update default SEO canonical URL to `https://toolzaro.cyou`
- Keep publisher ID `ca-pub-8769496591745522` synchronized across admin defaults

---

## 3. Build & Compilation Verification
1. Run `npm run build` to verify that all public files copy seamlessly into the final `dist/` directory
2. Execute `lint_applet` and `compile_applet` to ensure zero TypeScript errors or missing imports
3. Verify that the production build output is ready to push directly to GitHub for Cloudflare Pages automatic deployment
