# Toolzaro Custom Admin Panel (Blogger-Style Mobile-First Dashboard)

A tailored, mobile-first administrative management dashboard built directly into Toolzaro, mirroring Blogger's streamlined card-and-drawer workflow while preserving existing Google authentication security, Cloudflare edge caching, and site design tokens.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following parameters are locked based on your requirements:
> - **Authentication**: Keeps the existing verified **Google / Gmail Sign-In** security model without extra passcode prompts.
> - **Hosting & Caching**: Designed for **Cloudflare** edge distribution across global regions, paired with Cloud Firestore and instant local storage hydration.
> - **Unified Editor**: A single `RichContentEditor` component powers both **Posts** and **Pages** (dual Compose/HTML mode, auto-thumbnail from the first image in content, slide-in settings accordion, auto-save).
> - **Zero Disruption**: Existing frontend routes, 189+ utility tools, and public pages remain 100% functional and untouched.

---

### 1. Overview & Core Concept

- **What It Does**: Provides a dedicated, responsive Blogger-style admin workspace (`/admin` and `/sabbir`) to publish and manage blog posts, create standalone pages with custom site placement, manage existing tools, inject custom HTML tools, visually reorder layout sections, and configure Blogger-ordered site settings.
- **Target Audience / Persona**: Site administrator operating frequently from mobile devices as well as desktop browsers.
- **Key Value**: Delivers the tactile ease of Blogger's CMS (card lists, slide-in drawers, floating action buttons, snackbar toasts) while running on high-performance React + TypeScript with zero external server dependencies.

---

### 2. User Experience & Visual Design

- **Navigation & Mobile Drawer**:
  - Slide-in sidebar on mobile / collapsible desktop navigation with 6 core destinations:
    - 📝 **Posts**: Filterable card list (`All`, `Published`, `Draft`, `Scheduled`), search bar, 3-dot action menu (`Edit`, `View`, `Duplicate`, `Delete`), floating `+` button.
    - 📄 **Pages**: Card list with same shared editor and site placement selector (`Header Menu`, `Footer Links`, `Custom / Standalone`).
    - 🛠️ **Tools**: Search & toggle active states for all 189+ built-in tools, edit SEO/metadata, and add new tools via custom HTML/CSS/JS.
    - 🗂️ **Layout**: Visual reordering of Header navigation items, Homepage sections, and Footer links; custom HTML/CSS script injection.
    - ⚙️ **Settings**: Accordion-based Blogger-ordered settings (Basic, Posts, Formatting, Meta tags, Redirects, Crawlers, Monetization, Backup/Export, Feeds, Permissions).
    - 🌐 **View Site**: Quick launch button back to the public homepage.

- **Shared Post & Page Editor (`RichContentEditor`)**:
  - Top bar with Title field, Preview button, and Publish / Save draft dropdown.
  - Complete Rich Text Toolbar:
    - Compose vs HTML raw view toggle
    - Undo / Redo
    - Paragraph & Headings (H1, H2, H3)
    - Bold, Italic, Underline, Strikethrough
    - Text color & background highlight
    - Insert Link, Image (with ImgBB helper), Video, Code block, Emoji
    - Alignment (Left, Center, Right, Justify), Indent / Outdent
    - Bullet & Numbered lists, Blockquote, Horizontal divider
    - Text direction (LTR / RTL), Clear formatting
  - Slide-in **Settings Panel** (Accordion drawer via gear icon):
    - **Permalink**: Automatic (slugified from title) or Custom URL path.
    - **Published On**: Date & time picker with future scheduling support.
    - **Search Description**: Custom meta description for Google indexing.
    - **Meta Title & Tags**: Dedicated SEO overrides.
    - **Thumbnail Override**: Automatic preview of the first image detected in content, with an optional manual replacement selector.
    - *(Pages only)* **Site Placement**: Choose whether the page shows in Header, Footer, or Custom route.
  - **Auto-Save**: Debounced draft saving with discreet "Draft saved" indicator and toast feedback.

- **Theme & Responsiveness**:
  - Full support for Light and Dark modes matching site variables (`--background`, `--card`, `--primary`, `--foreground`).
  - Mobile touch targets $\ge 44\text{px}$, floating action button (FAB) comfortably positioned for thumb navigation, smooth drawer transitions.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Preserve Google Sign-In & Security Rules**
  - *Chosen Approach*: Maintain Google Sign-In with verified administrator email verification (`sabbirhasansh321@gmail.com` and allowed team members list) as already established in `firestore.rules`.
  - *Why*: Provides enterprise-grade cryptographic security through Google OAuth without requiring fragile passcodes.

- **Decision 2: Automatic First-Image Thumbnail Detection**
  - *Chosen Approach*: When saving or previewing a post/page, the editor extracts the first `<img src="...">` in the HTML body to automatically set `coverImage`. If no image is present, it generates a clean placeholder with the title's first letter.
  - *Why*: Mimics Blogger's beloved automatic thumbnail feature while leaving the flexibility to pick a custom thumbnail in Post Settings.

- **Decision 3: Isolated Preview Sandbox for Custom HTML Tools**
  - *Chosen Approach*: Custom tools created by the admin render in a responsive, sandboxed iframe container with full-screen expansion.
  - *Why*: Prevents custom JavaScript or CSS from colliding with the main application bundle while enabling full interactive utility functionality.

---

### 4. Technical Architecture & Component Hierarchy

#### Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                      Admin Layout & Routing Shell                      │
│ ┌──────────────────────┐  ┌──────────────────────────────────────────┐ │
│ │ Slide-in Navigation  │  │ Top Bar: Breadcrumb + Theme + Profile    │ │
│ │ ├─ Posts             │  ├──────────────────────────────────────────┤ │
│ │ ├─ Pages             │  │ Active Module Screen:                    │ │
│ │ ├─ Tools             │  │  ├─ PostsTab (Card list + Filter + FAB)  │ │
│ │ ├─ Layout            │  │  ├─ PagesTab (Placement selector + FAB)  │ │
│ │ ├─ Tools             │  │  ├─ ToolsTab (189+ registry + Add HTML)  │ │
│ │ ├─ Settings          │  │  ├─ LayoutTab (Drag/Reorder + Scripts)   │ │
│ │ └─ View Site         │  │  └─ SettingsTab (10 Blogger Accordions)  │ │
│ └──────────────────────┘  └──────────────────────────────────────────┘ │
│                                      │                                 │
│                                      ▼                                 │
│                  ┌────────────────────────────────────────┐            │
│                  │        Shared RichContentEditor        │            │
│                  │ ├─ Dual View: Compose / HTML Raw       │            │
│                  │ ├─ Rich Toolbar (Formatting, Media)    │            │
│                  │ ├─ Slide-in Post/Page Settings Drawer  │            │
│                  │ ├─ Auto-Thumbnail Parser & Alt Text    │            │
│                  │ └─ Auto-Save Debouncer & Toast Alerts  │            │
│                  └────────────────────────────────────────┘            │
└──────────────────────────────────────┬─────────────────────────────────┘
                                       │
                      ┌────────────────┴────────────────┐
                      ▼                                 ▼
        ┌───────────────────────────┐     ┌───────────────────────────┐
        │  Cloudflare Global Edge   │     │  Cloud Firestore Database │
        │  & Browser Local Storage  │     │   ├─ /blogs/{blogId}      │
        │  (Instant 0ms retrieval)  │     │   ├─ /pages/{pageId}      │
        │                           │     │   ├─ /site_settings/      │
        │                           │     │   │   ├─ general          │
        │                           │     │   │   └─ layout           │
        │                           │     │   └─ /custom_tools/{id}   │
        └───────────────────────────┘     └───────────────────────────┘
```

#### Module Breakdown for Iterative Execution

- **Module 1: Admin Shell & Navigation**:
  - Integrate Blogger-style mobile slide-in sidebar, top header, module switcher, and mobile bottom bar.
  - Retain existing verified Google Sign-In state and session validation.
- **Module 2: Shared RichContentEditor Component**:
  - Full Compose/HTML mode toggle, rich formatting toolbar, image uploader helper (ImgBB), automatic first-image thumbnail extraction, slide-in settings accordion (URL permalink, schedule date/time, search description, meta tags), and auto-save draft.
- **Module 3: Posts & Pages Modules**:
  - Posts management card list, status filter tabs (`All`, `Published`, `Draft`, `Scheduled`), search input, 3-dot dropdown (`Edit`, `View`, `Duplicate`, `Delete` with confirm modal), and floating `+` button.
  - Pages management view reusing the shared editor with site placement selector (`Header Menu`, `Footer Links`, `Custom URL`) and dynamic routing in `App.tsx`.
- **Module 4: Tools Management & Custom HTML Tools**:
  - Inbuilt tools list reading from `registry.ts` with instant search, category filtering, ON/OFF toggle, and metadata editor.
  - "Add Tool" modal supporting custom HTML/CSS/JS code rendered in an isolated sandboxed iframe with full-screen expansion.
- **Module 5: Layout & Settings (Blogger Order)**:
  - Visual reordering for Header items, Footer links, and Homepage sections + custom HTML/CSS script injection.
  - 10-accordion Blogger-ordered settings (Basic, Posts, Formatting, Meta tags, Errors & redirects, Crawlers & indexing, Monetisation, Manage backup/import, Feeds, Permissions).
  - Firestore security rules update and deployment.
