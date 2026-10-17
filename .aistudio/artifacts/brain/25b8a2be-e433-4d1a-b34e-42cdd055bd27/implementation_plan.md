# Admin Panel Image Gallery, Draft/Publish Storage & Post Management Fixes

## Overview & Core Concept
- **What It Does**: Fixes and enhances the admin panel blog/page post editor, media gallery (ImgBB + in-built images), interactive long-press/click popup menus for images (Insert, Delete, Copy), and reliable split storage (Firebase Firestore for drafts and scheduled posts, Cloudflare D1 JSON for published posts).
- **Target Audience / Persona**: Content creators and administrators managing the blog and static pages.
- **Key Value**: Flawless image insertion at caret, interactive media gallery popup actions, and robust separation between draft storage (Firebase) and production publishing (Cloudflare D1).

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Based on your clarification, drafts and scheduled posts will be stored securely in Firebase Firestore, while published posts will be saved as JSON to Cloudflare D1 storage. Clicking or long-pressing an image in the media gallery will display a floating popup menu with Insert, Delete, and Copy options.

- **Confirmed Decision 1**: Storage routing: Drafts & scheduled posts $\to$ Firebase Firestore; Published posts $\to$ Cloudflare D1 storage as JSON.
- **Confirmed Decision 2**: ImgBB & In-built Image Gallery: Interactive floating popup menu on image click/long-press with Insert, Delete, and Copy options.

---

## 1. Architecture & System Flow

```
┌───────────────────────────────┐
│ Admin Panel Post / Page Editor│
└──────────────┬────────────────┘
               │
       [ Save & Publish ]
       ├── If Draft / Scheduled ──► Firebase Firestore (Drafts collection)
       └── If Published ──────────► Cloudflare D1 Storage (JSON records)
               │
       [ Image Selection / Media Modal ]
       └── ImgBB & In-built Image Gallery
           └── Click / Long-press ──► Floating Popup Menu (Insert to Caret, Delete, Copy URL)
```

---

## 2. Key Components & Implementation Steps

### 1. ImgBB & In-built Media Gallery Popup & Actions
- Update the media modal in `RichContentEditor.tsx` / `AdminPage.tsx` to display both ImgBB uploaded images and in-built default images.
- When an image is clicked or long-pressed, open a floating popup menu anchored to the image with:
  - **Insert**: Inserts `![alt](url)` or `<img src="url" />` precisely at the current editor caret position.
  - **Copy URL**: Copies the image URL to the clipboard with a toast notification.
  - **Delete**: Removes the image from the gallery (and ImgBB/storage state if applicable).

### 2. Drafts in Firebase, Published in Cloudflare D1
- Refine `firestoreBlogService.ts` and `pagesService.ts` / API endpoints:
  - When a post or page has `status === 'draft'` or `status === 'scheduled'`, save it to Firebase Firestore (`blog_drafts` / `page_drafts` or status field in Firestore).
  - When `status === 'published'` and the user clicks **Publish**, push the complete JSON record to Cloudflare D1 storage (`/api/posts` / `/api/pages`) and update Firestore accordingly.
  - Ensure unpublishing or switching to draft removes or updates the status appropriately.

### 3. Editor & Preview Polish
- Ensure raw HTML code and text previews in admin lists are fully editable and clean.
- Auto-calculate reading time (`X min read`) and auto-display publish date/time.
- Include custom SEO Title and Meta Description fields in the post settings drawer.

---

## 3. Verification Plan

1. **Build & Compile**: Run `compile_applet` and `lint_applet` to verify clean TypeScript compilation.
2. **Interactive Testing**: Verify media gallery image click popup menu (Insert, Copy, Delete) and draft vs. published D1/Firebase storage routing.
