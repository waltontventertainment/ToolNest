# Unified Blog Card Design & Dynamic Blogger Labels Integration

Eliminate all visual differences between Blogger posts and built-in articles, removing "Live Blogger" badges and disjointed buttons so all articles share the identical, elegant Toolzaro card styling and in-app reader experience.

---

### User Review Required
> [!IMPORTANT]
> - All posts (whether built-in or published via Blogger) will render in the **exact same uniform box styling** with matching thumbnail positions, clean category badges, author avatars, and subtle `Read ->` links.
> - No visitor will see background or sync indicators like **"LIVE BLOGGER"** or disparate button pills.
> - Blogger post **Labels** will dynamically populate the category filter bar at the top of the blog page and set each post's category badge.

---

### Proposed Changes

#### 1. Blog Post Normalization (`src/lib/bloggerSync.ts`)
- In `getNativeBloggerXmlPosts()` and `fetchBloggerPosts()`:
  - If a Blogger post has labels (e.g. `Web Tools`, `Tutorials`, `Tech Insights`), use the primary label directly as its `category` instead of forcing it into a fixed preset bucket.
  - Ensure fallback author name and role match the clean editorial format (`Toolzaro Editorial` or author's name).
  - Extract the cleanest high-resolution thumbnail so post images fill cards consistently without awkward distortion.

#### 2. Unified Card Layout & Dynamic Categories (`src/pages/BlogPage.tsx`)
- **Dynamic Category Filter Tabs**:
  - Dynamically compute category tabs from all active posts:
    ```ts
    const categories = useMemo(() => {
      const cats = new Set<string>(['All', 'Developer Workflows', 'SEO & Growth', 'Security & Privacy', 'Design & UX']);
      posts.forEach(p => {
        if (p.category && p.category !== 'All') cats.add(p.category);
        if (Array.isArray(p.tags)) {
          p.tags.forEach(t => {
            if (t && t.length < 24) cats.add(t);
          });
        }
      });
      return Array.from(cats);
    }, [posts]);
    ```
- **Remove All "Live Blogger" Indicators**:
  - Remove all amber/orange `Live Blogger` badges from featured and grid cards.
- **Harmonize Featured Card & Grid Cards**:
  - Unify the action button: replace the heavy blue `btn-signature-primary` button on the featured post with the clean `Read ->` link with subtle arrow hover animation, matching the rest of the publication.
  - On mobile, ensure the card layout flows harmoniously with image thumbnail and metadata consistent with user expectations.
  - Remove external Blogger icon links from card previews so everything feels like a single unified database.

#### 3. Seamless Reader View (`src/pages/BlogPostPage.tsx`)
- Ensure clicking any post seamlessly opens the in-app reading view (`/blog/:slug`).
- In `BlogPostPage.tsx`, format Blogger HTML content with standard Tailwind Typography styling (`prose prose-slate dark:prose-invert`), matching the native markdown guides.
- Display the post's dynamic category and tags seamlessly.

---

### Verification Plan
- **Visual Inspection**: Verify on mobile and desktop viewports that Blogger posts look 100% indistinguishable in quality, card structure, and button design from built-in articles.
- **Category Filter Test**: Ensure newly added Blogger labels appear in the category bar and filter correctly when clicked.
- **Reader Navigation**: Click `Read ->` on a Blogger post to confirm it opens the clean Toolzaro in-app reader.
- **Build & Lint Verification**: Run `compile_applet` and `lint_applet` to guarantee zero errors.
