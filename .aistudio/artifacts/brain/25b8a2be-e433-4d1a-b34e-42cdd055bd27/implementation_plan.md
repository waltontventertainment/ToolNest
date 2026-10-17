# SEO Indexing Inspector & Canonical Auditor

## Overview & Core Concept
- **What It Does**: Adds an automated SEO Indexing Inspector and Canonical Auditor inside the Admin panel to diagnose Google Search Console indexing issues (such as "Alternative page with proper canonical tag", "Crawled - currently not indexed", missing metadata, or canonical mismatch).
- **Target Audience / Persona**: Content creators and administrators managing blog posts and dynamic pages.
- **Key Value**: Provides instant diagnostic checks, canonical validation, auto-fix recommendations, and structured data (JSON-LD) preview for every post and page.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Based on your clarification, we will build an automated SEO Indexing Inspector & Canonical Auditor in the admin panel to analyze posts and pages for GSC indexing health.

- **Confirmed Decision 1**: Interactive SEO Indexing Inspector tab/modal in Admin panel.
- **Confirmed Decision 2**: Automated detection and resolution of canonical tag duplication, missing descriptions, and crawl status.

---

## 1. Architecture & System Flow

```
┌─────────────────────────────────┐
│ Admin Panel: SEO Indexing Audit │
└──────────────┬──────────────────┘
               │
       [ Inspect Posts & Pages ]
       ├── Check Canonical URL validity
       ├── Check Meta title & description lengths
       ├── Diagnose "Crawled - currently not indexed" & "Alternative page"
       └── Generate Recommended Fixes / JSON-LD Schema
```

---

## 2. Key Components & Implementation Steps

### 1. SEO Indexing Auditor Tab in Admin Panel
- Add an **SEO Indexing & Canonical Inspector** section/tab inside `AdminPage.tsx`.
- Scans all loaded posts and pages for common GSC issues:
  - Missing or duplicate canonical tags.
  - Meta titles/descriptions too short or too long.
  - Orphaned or unindexed status detection.
- Displays a health score summary (e.g., 94% SEO Ready) and actionable fix buttons (e.g., "Auto-Fix Canonical", "Generate Meta Description").

### 2. Canonical Tag & Structured Data Enforcement
- Ensure every published post and page automatically outputs:
  - `<link rel="canonical" href="..." />` matching its exact slug/URL.
  - Schema.org JSON-LD structured data (`Article` / `WebPage`).
- Provide a preview modal for each post's SEO snippet and Google Search Console indexing health.

---

## 3. Verification Plan

1. **Build & Compile**: Run `compile_applet` and `lint_applet` to verify clean TypeScript compilation.
2. **Interactive Testing**: Verify the SEO Indexing Auditor tab in Admin panel correctly lists posts/pages, reports canonical status, and applies recommended fixes.
