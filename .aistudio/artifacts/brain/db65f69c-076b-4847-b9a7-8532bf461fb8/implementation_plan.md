# Cloudflare D1 Blog Architecture & Firebase Auth Integration

A lightweight, high-performance edge architecture for Toolzaro that migrates blog storage from Firebase Firestore to a serverless Cloudflare D1 SQLite database, isolates all private keys (Firebase, ImgBB) into `.env`, and retains Firebase Authentication for admin dashboard access.

## User Review & Critical Decisions

> [!IMPORTANT]
> Based on your selections in Phase 1:
> - **Blog Storage**: Structured as an SQLite relational table in Cloudflare D1 with distinct columns for `slug`, `title`, `excerpt`, `content`, `cover_image`, `tags`, and timestamps.
> - **Admin Authentication**: Uses Firebase Authentication (`signInWithEmailAndPassword`) with your provided Firebase project configuration (`gen-lang-client-0662189944`).
> - **Secrets & Environment Isolation**: All personal credentials (`FIREBASE_API_KEY`, `IMGBB_API_KEY`, etc.) are removed from client bundles and stored in `.env` / Cloudflare Pages environment settings.
> - **Client-Side Google Drive**: Remains 100% functional and decoupled via Google Identity Services OAuth.

---

## 1. Overview & Core Concept

- **What It Does**: Moves blog publishing and reading from client-side Firestore to Cloudflare D1 edge database. Blog visitors receive pre-rendered/edge-cached responses directly from Cloudflare's nearest edge node in <50ms. Admin retains a clean management interface to write blog posts, upload images via ImgBB, and sync records into D1.
- **Target Audience**: Toolzaro administrators managing content, and global visitors reading developer and utility tutorials with zero lag.
- **Key Value**: Drastically reduces bundle size by removing bulky Firestore runtime code from public routes, eliminates Firebase read-quota limits, and protects private keys by injecting them exclusively through `.env` and Cloudflare variables.

---

## 2. User Experience & Visual Design

Following the **SaaS & Dashboard Guidelines** (`references/3_saas_dashboard.md`):

### Key User Flows
1. **Public Reader Flow**: Visitor navigates to `/blog` or `/blog/:slug`. The app fetches the post via edge-cached `/api/blog/posts` (served by D1) with 0ms flash, complete typography hierarchy, and reading time indicator.
2. **Admin Login Flow**: Admin navigates to `/admin`. A high-contrast, zero-slop login modal prompts for email/password. Authentication is verified via Firebase Auth SDK using credentials from environment variables.
3. **Blog Creation & ImgBB Upload Flow**: Authenticated admin drafts a post. Dropping an image triggers the direct ImgBB upload widget (`src/lib/imgbb.ts`), returning a permanent CDN image URL. Clicking "Publish" commits the post directly to the Cloudflare D1 database.

### Visual Identity & Theme
- **Color Hierarchy**:
  - Light mode: Clean editorial surface (`hsl(258, 8%, 98%)`), deep contrast text (`hsl(258, 8%, 14%)`), primary accent indigo (`hsl(258, 72%, 45%)`).
  - Dark mode: Ultra-low glare background (`hsl(258, 6%, 8%)`), card elevation (`hsl(258, 6%, 11%)`), glowing contrast typography.
- **Typography**: Display headlines in `Outfit`, body text in `Plus Jakarta Sans`, code/slugs/metrics in tabular `JetBrains Mono`.
- **Zero-Pill Discipline**: Metadata (tags, dates, author badges) formatted with clean unboxed text and dot separators (`April 2026 · 4 min read · Web Tools`).

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Cloudflare D1 SQLite vs. Firestore
- **Chosen Approach**: Cloudflare D1 SQLite with dedicated columns (`id`, `slug`, `title`, `content`, `cover_image`, `tags`, `author`, `created_at`, `status`).
- **Why**: 5,000,000 free reads/day, sub-50ms global latency, and native SQL querying (`SELECT * FROM posts WHERE slug = ?`).
- **Trade-off**: Requires Cloudflare Pages Functions or Worker binding, for which comprehensive setup instructions and fallback local stores are provided.

### Decision 2: Environment Variable Protection
- **Chosen Approach**: All API keys (`VITE_FIREBASE_API_KEY`, `VITE_IMGBB_API_KEY`, etc.) are externalized to `.env` and `.env.example`. Main source code references `import.meta.env.*` and server proxies.
- **Why**: Prevents secret leaks when pushing code to GitHub or sharing source files.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                              Toolzaro Client                           │
├────────────────────────┬───────────────────────────────────────────────┤
│   Public Blog Readers  │             Admin Dashboard (/admin)          │
│   • /blog              │   • Firebase Auth (Email & Password)          │
│   • /blog/:slug        │   • ImgBB Photo Uploader (API via .env)       │
│                        │   • D1 Blog Editor & Post Management          │
└───────────┬────────────┴───────────────────────┬───────────────────────┘
            │                                    │
            │ HTTP GET /api/blog/posts           │ HTTP POST /api/blog/posts
            ▼                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     Cloudflare Edge Layer (Pages / Functions)         │
│                                                                        │
│   GET  /api/blog/posts        -> SELECT * FROM posts WHERE status='pub'│
│   GET  /api/blog/posts/:slug  -> SELECT * FROM posts WHERE slug = ?    │
│   POST /api/blog/posts        -> INSERT/UPDATE INTO posts ...          │
│                                                                        │
│   [Cloudflare D1 Database Binding: DB (toolzaro-blog-d1)]              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Cloudflare D1 (SQLite)                          │
│                                                                        │
│   Table: posts                                                         │
│   ├── id TEXT PRIMARY KEY                                              │
│   ├── slug TEXT UNIQUE NOT NULL                                        │
│   ├── title TEXT NOT NULL                                              │
│   ├── excerpt TEXT                                                     │
│   ├── content TEXT NOT NULL                                            │
│   ├── cover_image TEXT                                                 │
│   ├── tags TEXT                                                        │
│   ├── author TEXT                                                      │
│   ├── created_at INTEGER                                               │
│   └── status TEXT DEFAULT 'published'                                  │
└────────────────────────────────────────────────────────────────────────┘
```

### Cloudflare D1 Binding & Setup Guide for Cloudflare Pages

When deploying to Cloudflare Pages, follow these exact steps:

#### Step 1: Create the D1 Database in Cloudflare
Run in your local terminal (or Cloudflare Dashboard under **Storage & Databases > D1**):
```bash
npx wrangler d1 create toolzaro-blog-d1
```
Cloudflare will output:
```json
{
  "binding": "DB",
  "database_name": "toolzaro-blog-d1",
  "database_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

#### Step 2: Initialize the Table Schema
Execute the initial SQL migration:
```sql
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  tags TEXT,
  author TEXT DEFAULT 'Toolzaro Team',
  created_at INTEGER,
  status TEXT DEFAULT 'published'
);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
```

#### Step 3: Bind D1 in Cloudflare Pages Dashboard
1. Go to **Cloudflare Dashboard** → **Workers & Pages**.
2. Select your project (e.g. `toolzaro`).
3. Go to **Settings** → **Functions** → **D1 database bindings**.
4. Click **Add binding**:
   - Variable name: `DB`
   - D1 database: select `toolzaro-blog-d1`
5. Go to **Settings** → **Environment variables**:
   - Add `VITE_FIREBASE_API_KEY` = your Firebase API Key
   - Add `VITE_IMGBB_API_KEY` = your ImgBB API Key
   - Add `FIREBASE_PROJECT_ID` = `gen-lang-client-0662189944`

---

## 5. Implementation Steps

1. **Environment Configuration**:
   - Update `.env.example` and local `.env` with variables for Firebase API credentials and ImgBB.
   - Refactor `src/lib/firebase.ts` to read keys from `import.meta.env` with fallback guards.
2. **Cloudflare D1 Service Layer**:
   - Create `functions/api/blog/[[route]].ts` for Cloudflare Pages Functions to serve D1 data.
   - Create client-side adapter `src/lib/d1BlogService.ts` that queries `/api/blog/posts` when on Cloudflare, and falls back seamlessly to offline local storage / static seed data during local dev.
3. **Admin Dashboard Alignment**:
   - Retain Firebase Auth in `/admin` using the user's provided Firebase config.
   - Integrate D1 blog publishing and ImgBB image uploading into the editor workflow.
4. **Verification & Build**:
   - Compile the applet with `compile_applet` and verify zero lint or type errors.
