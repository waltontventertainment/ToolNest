import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
const outDir = path.resolve('blogger-deploy');

if (!fs.existsSync(distDir)) {
  console.error('Error: dist directory does not exist! Please run "npm run build" first.');
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

// Read dist/index.html
const indexHtmlPath = path.join(distDir, 'index.html');
if (!fs.existsSync(indexHtmlPath)) {
  console.error('Error: dist/index.html not found!');
  process.exit(1);
}

// Detect repository from environment or default
const fullRepo = process.env.GITHUB_REPOSITORY || 'ToolNest/ToolNest';
const repoOwner = process.env.GITHUB_REPOSITORY_OWNER || fullRepo.split('/')[0] || 'ToolNest';
const repoName = fullRepo.includes('/') ? fullRepo.split('/')[1] : fullRepo;

// Cache buster: Git commit SHA or build timestamp
const cacheBuster = process.env.BUILD_COMMIT_SHA 
  ? process.env.BUILD_COMMIT_SHA.substring(0, 10) 
  : Date.now().toString(36);

// Find asset files in dist/assets
const assetsDir = path.join(distDir, 'assets');
let cssFiles = [];
let jsFiles = [];

if (fs.existsSync(assetsDir)) {
  const files = fs.readdirSync(assetsDir);
  cssFiles = files.filter(f => f.endsWith('.css'));
  jsFiles = files.filter(f => f.endsWith('.js'));
}

const mainCssFile = cssFiles.find(f => f.startsWith('index-')) || cssFiles[0] || 'index.css';
const mainJsFile = jsFiles.find(f => f.startsWith('index-')) || jsFiles[0] || 'index.js';

// Primary CDN URLs: jsDelivr CDN via gh-pages branch (Global Edge, Ultra-Fast Brotli Compression)
const cdnCssUrl = `https://cdn.jsdelivr.net/gh/${repoOwner}/${repoName}@gh-pages/assets/${mainCssFile}?v=${cacheBuster}`;
const cdnJsUrl = `https://cdn.jsdelivr.net/gh/${repoOwner}/${repoName}@gh-pages/assets/${mainJsFile}?v=${cacheBuster}`;

// Secondary Fallback URLs: GitHub Pages Direct
const ghPagesCssUrl = `https://${repoOwner}.github.io/${repoName}/assets/${mainCssFile}`;
const ghPagesJsUrl = `https://${repoOwner}.github.io/${repoName}/assets/${mainJsFile}`;

// Automatically detect live tool count from src/lib/registry.ts
let liveToolCount = 156;
const registryPath = path.resolve('src/lib/registry.ts');
if (fs.existsSync(registryPath)) {
  const regContent = fs.readFileSync(registryPath, 'utf-8');
  const toolMatches = regContent.match(/\{\s*slug:\s*["\x27]([^"\x27]+)["\x27]/g);
  if (toolMatches && toolMatches.length > 0) {
    liveToolCount = toolMatches.length;
  }
}

console.log(`Repository: ${repoOwner}/${repoName}`);
console.log(`Live Tool Count: ${liveToolCount}`);
console.log(`Build Cache-Buster: ${cacheBuster}`);
console.log(`Primary CDN CSS: ${cdnCssUrl}`);
console.log(`Primary CDN JS:  ${cdnJsUrl}`);

// =========================================================================
// 1. blogger-embed.html (For embedding in Blogger Pages / Posts)
// =========================================================================
const bloggerEmbedHtml = `<!-- ================================================================= -->
<!-- TOOLZARO - HIGH SPEED BLOGGER EMBED (PAGE / POST HTML VIEW)       -->
<!-- Global Ultra-Fast Delivery via jsDelivr CDN (Cache-Busted)        -->
<!-- Size: ~3.8 KB (Instant Rendering, Zero Blogger Bloat)             -->
<!-- ================================================================= -->

<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Toolzaro - Premium Online Utility Suite</title>
<meta name="description" content="Premium Online Utility Suite - ${liveToolCount} browser-based tools for developers, designers and creators. Fast, private, and 100% client-side." />

<!-- Google Fonts Preconnect & Stylesheets -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Hind+Siliguri:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">

<!-- Google AdSense Account Verification & Auto Ads -->
<meta name="google-adsense-account" content="ca-pub-8769496591745522">
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8769496591745522" crossorigin="anonymous"></script>

<!-- Toolzaro Primary Stylesheet (Ultra-Fast jsDelivr CDN) -->
<link rel="stylesheet" crossorigin="anonymous" href="${cdnCssUrl}">

<!-- Instant Dark/Light Theme Bootstrap & Blogger Router Flag (Zero Flash) -->
<script>
  window.__USE_HASH_ROUTER__ = true;
  (function() {
    try {
      var saved = localStorage.getItem('toolnest-theme');
      var isDark = saved === '"dark"' || saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {}
  })();
</script>

<!-- Blogger Full-Screen & Theme Reset CSS -->
<style>
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
    min-height: 100vh !important;
    background-color: #0b0f19 !important;
    color: #f8fafc !important;
  }
  #root {
    min-height: 100vh !important;
    width: 100% !important;
    display: flex !important;
    flex-direction: column !important;
  }
  /* Suppress default Blogger chrome when embedded */
  .quickedit, .post-footer, .comments, .sidebar-wrapper, .blog-pager, .feed-links {
    display: none !important;
  }
</style>

<!-- React Application Root Container -->
<div id="root">
  <!-- Minimalist Loading Screen during first-paint bundle download -->
  <div style="min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: #0b0f19; color: #94a3b8; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; gap: 16px;">
    <div style="width: 48px; height: 48px; border: 3px solid rgba(139, 92, 246, 0.2); border-top-color: #8b5cf6; border-radius: 50%; animation: tz-spin 0.8s linear infinite;"></div>
    <div style="font-size: 14px; font-weight: 600; letter-spacing: -0.01em; color: #e2e8f0;">Loading Toolzaro...</div>
    <style>@keyframes tz-spin { to { transform: rotate(360deg); } }</style>
  </div>
</div>

<!-- Toolzaro Primary JavaScript Bundle (Ultra-Fast jsDelivr CDN) -->
<script type="module" crossorigin="anonymous" src="${cdnJsUrl}"></script>
`;

// =========================================================================
// 2. blogger-theme.xml (Full Blogger XML Theme with Layout & Widgets)
// =========================================================================
const bloggerThemeXml = `<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE html>
<html b:css='false' b:layoutsVersion='3' b:responsive='true' b:version='2' class='scroll-smooth dark' lang='en' xmlns='http://www.w3.org/1999/xhtml' xmlns:b='http://www.google.com/2005/gml/b' xmlns:data='http://www.google.com/2005/gml/data' xmlns:expr='http://www.google.com/2005/gml/expr'>
<head>
  <meta charset='UTF-8'/>
  <meta content='width=device-width, initial-scale=1.0' name='viewport'/>
  <title><data:blog.pageTitle/></title>
  <meta content='Toolzaro - Premium Online Utility Suite. ${liveToolCount} browser-based tools for developers, designers and creators.' name='description'/>
  <meta content='Toolzaro - Premium Online Utility Suite' property='og:title'/>
  <meta content='${liveToolCount} browser-based tools for developers, designers and creators.' property='og:description'/>

  <!-- Google Fonts -->
  <link href='https://fonts.googleapis.com' rel='preconnect'/>
  <link crossorigin='anonymous' href='https://fonts.gstatic.com' rel='preconnect'/>
  <link href='https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&amp;family=Hind+Siliguri:wght@400;500;600;700&amp;family=JetBrains+Mono:wght@400;500;600;700&amp;family=Outfit:wght@400;500;600;700;800&amp;family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;display=swap' rel='stylesheet'/>

  <!-- Google AdSense -->
  <meta content='ca-pub-8769496591745522' name='google-adsense-account'/>
  <script async='async' crossorigin='anonymous' src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8769496591745522'></script>

  <!-- Blogger Theme Skin with Layout & Customizer Variables -->
  <b:skin><![CDATA[
  /*
  -----------------------------------------------
  Theme Name: Toolzaro - Next-Gen Online Utility Suite
  Theme URI: https://github.com/${repoOwner}/${repoName}
  Author: Toolzaro Core Team
  Version: 2.1.0 (jsDelivr CDN High Speed Edition)
  -----------------------------------------------
  */
  /* Variable definitions
     ====================
     <Variable name="body.background" description="Body Background Color" type="color" default="#0b0f19" value="#0b0f19"/>
     <Variable name="body.color" description="Text Color" type="color" default="#f8fafc" value="#f8fafc"/>
     <Variable name="primary.color" description="Primary Brand Accent Color" type="color" default="#8b5cf6" value="#8b5cf6"/>
     <Variable name="card.background" description="Card Background Color" type="color" default="#131b2e" value="#131b2e"/>
     <Variable name="body.font" description="Main Font" type="font" default="normal normal 15px 'Plus Jakarta Sans', system-ui, sans-serif" value="normal normal 15px 'Plus Jakarta Sans', system-ui, sans-serif"/>
  */

  html, body {
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
    min-height: 100vh !important;
    background-color: $(body.background) !important;
    color: $(body.color) !important;
    font-family: $(body.font) !important;
  }
  #root {
    min-height: 100vh !important;
    width: 100% !important;
    display: flex !important;
    flex-direction: column !important;
  }

  /* Live Frontend vs Blogger Layout Mode Styles */
  body:not(#layout) .blogger-sections-container {
    display: none !important;
  }
  body#layout #root {
    display: none !important;
  }
  body#layout .blogger-sections-container {
    display: block !important;
    max-width: 1000px !important;
    margin: 20px auto !important;
    padding: 10px !important;
  }

  /* Hide raw quickedit marks in production */
  .quickedit, .blogger-clickContent {
    display: none !important;
  }
  ]]></b:skin>

  <!-- Official Blogger Layout Editor Template Skin -->
  <b:template-skin><![CDATA[
    body#layout {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      background: #f1f5f9 !important;
      color: #0f172a !important;
      padding: 24px !important;
    }
    body#layout #root {
      display: none !important;
    }
    body#layout .blogger-sections-container {
      display: block !important;
      max-width: 1020px !important;
      margin: 0 auto !important;
    }
    body#layout div.section {
      margin-bottom: 24px !important;
      padding: 18px !important;
      background: #ffffff !important;
      border: 2px dashed #94a3b8 !important;
      border-radius: 10px !important;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06) !important;
    }
    body#layout div.section h4 {
      margin: 0 0 12px 0 !important;
      font-size: 14px !important;
      font-weight: 700 !important;
      color: #7c3aed !important;
      text-transform: uppercase !important;
      letter-spacing: 0.05em !important;
    }
    body#layout div.widget {
      background: #f8fafc !important;
      border: 1px solid #cbd5e1 !important;
      border-radius: 8px !important;
      margin: 10px 0 !important;
      padding: 14px !important;
    }
    body#layout .widget .edit, body#layout .widget .delete {
      color: #2563eb !important;
      font-weight: 600 !important;
    }
  ]]></b:template-skin>

  <!-- Toolzaro Primary Stylesheet from jsDelivr CDN -->
  <link crossorigin='anonymous' href='${cdnCssUrl}' rel='stylesheet'/>

  <link expr:href='data:blog.canonicalUrl' rel='canonical'/>

  <!-- Instant Theme Bootstrap & Blogger Clean Router Setup -->
  <script>
    window.__USE_HASH_ROUTER__ = false;
    window.__IS_BLOGGER__ = true;
    (function() {
      try {
        // Instant hash cleanup if accessed via legacy hash links (converts /#/path -> /path)
        if (window.location.hash &amp;&amp; window.location.hash.indexOf('#/') === 0) {
          var clean = window.location.hash.substring(2);
          var target = clean ? '/' + clean : '/';
          window.history.replaceState(null, '', target);
        }

        var saved = localStorage.getItem('toolnest-theme');
        var isDark = saved === '"dark"' || saved === 'dark' || (!saved &amp;&amp; window.matchMedia('(prefers-color-scheme: dark)').matches);
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (e) {}
    })();
  </script>
</head>

<body>
  <!-- Blogger Layout Sections for Dashboard Widget Management -->
  <!-- In Blogger -> Layout, you can add, configure, edit and rearrange all widgets below -->
  <div class='blogger-sections-container'>
    <!-- Header Section -->
    <b:section class='header' id='header' maxwidgets='2' name='Header' showaddelement='yes'>
      <b:widget id='Header1' locked='false' title='Toolzaro Header' type='Header'>
        <b:includable id='main'>
          <div id='blogger-header-widget' style='display:none;'>
            <h1><data:title/></h1>
            <p><data:description/></p>
          </div>
        </b:includable>
      </b:widget>
    </b:section>

    <!-- Navigation / Menus Section -->
    <b:section class='navbar' id='navbar' name='Top Navigation Menu' showaddelement='yes'>
      <b:widget id='LinkList1' locked='false' title='Top Navigation Menu' type='LinkList'>
        <b:includable id='main'>
          <div id='blogger-linklist-widget' style='display:none;'>
            <b:loop values='data:links' var='link'>
              <a expr:href='data:link.target'><data:link.name/></a>
            </b:loop>
          </div>
        </b:includable>
      </b:widget>
    </b:section>

    <!-- Website Admin Control Panel Section (Manage Inbuilt Posts, Hero & Banner from Blogger Dashboard -> Layout) -->
    <b:section class='admin-panel' id='admin_panel' name='Website Admin Control Panel' showaddelement='yes'>
      <b:widget id='HTML3' locked='false' title='Admin: Edit Inbuilt Posts (JSON or Key-Value)' type='HTML'>
        <b:includable id='main'>
          <div id='blogger-override-inbuilt-posts' style='display:none;'>
            <data:content/>
          </div>
        </b:includable>
      </b:widget>
      <b:widget id='HTML4' locked='false' title='Admin: Hero Banner (Title, Subtitle &amp; Badge)' type='HTML'>
        <b:includable id='main'>
          <div id='blogger-override-hero' style='display:none;'>
            <data:content/>
          </div>
        </b:includable>
      </b:widget>
      <b:widget id='HTML5' locked='false' title='Admin: Top Announcement Notice Bar' type='HTML'>
        <b:includable id='main'>
          <div id='blogger-override-announcement' style='display:none;'>
            <data:content/>
          </div>
        </b:includable>
      </b:widget>
    </b:section>

    <!-- Main Content & Blog Posts Section with Inbuilt Blogger Loop Bridge -->
    <b:section class='main' id='main' name='Main Blog Posts Feed' showaddelement='yes'>
      <b:widget id='Blog1' locked='false' title='Blog Posts' type='Blog'>
        <b:includable id='main' var='top'>
          <!-- Inbuilt Blogger Post Records (Read directly by React BlogPage) -->
          <div id='blogger-post-records' style='display:none;'>
            <b:loop values='data:posts' var='post'>
              <div class='blogger-post-record'
                   expr:data-id='data:post.id'
                   expr:data-title='data:post.title'
                   expr:data-url='data:post.url'
                   expr:data-snippet='data:post.snippet'
                   expr:data-date='data:post.dateHeader'
                   expr:data-timestamp='data:post.timestamp'
                   expr:data-author='data:post.author'
                   expr:data-thumbnail='data:post.firstImageUrl'>
                <b:if cond='data:post.authorPhoto.url'>
                  <span class='author-avatar-url' style='display:none;'><data:post.authorPhoto.url/></span>
                </b:if>
                <b:if cond='data:post.authorUrl'>
                  <span class='author-profile-url' style='display:none;'><data:post.authorUrl/></span>
                </b:if>
                <div class='blogger-post-labels'>
                  <b:loop values='data:post.labels' var='label'>
                    <span class='label-tag'><data:label.name/></span>
                  </b:loop>
                </div>
                <div class='blogger-post-content'><data:post.body/></div>
              </div>
            </b:loop>
          </div>

          <!-- Direct Inbuilt Data Bridge Script -->
          <script type='text/javascript'>
            //<![CDATA[
            (function() {
              try {
                var records = document.querySelectorAll('.blogger-post-record');
                var posts = [];
                Array.prototype.forEach.call(records, function(r, index) {
                  var labelTags = r.querySelectorAll('.label-tag');
                  var labels = [];
                  Array.prototype.forEach.call(labelTags, function(lt) {
                    if (lt.textContent) labels.push(lt.textContent.trim());
                  });
                  var contentEl = r.querySelector('.blogger-post-content');
                  var avatarEl = r.querySelector('.author-avatar-url');
                  var profileEl = r.querySelector('.author-profile-url');
                  posts.push({
                    id: r.getAttribute('data-id') || ('blogger-' + index),
                    title: r.getAttribute('data-title') || '',
                    url: r.getAttribute('data-url') || '',
                    snippet: r.getAttribute('data-snippet') || '',
                    date: r.getAttribute('data-date') || r.getAttribute('data-timestamp') || '',
                    author: r.getAttribute('data-author') || 'Toolzaro Author',
                    authorAvatar: avatarEl ? avatarEl.textContent.trim() : '',
                    authorProfile: profileEl ? profileEl.textContent.trim() : '',
                    thumbnail: r.getAttribute('data-thumbnail') || '',
                    labels: labels,
                    body: contentEl ? contentEl.innerHTML : ''
                  });
                });
                window.__BLOGGER_POSTS__ = posts;
              } catch (e) {}
            })();
            //]]>
          </script>

          <!-- Native SEO & Noscript Crawler Fallback -->
          <noscript>
            <div class='blogger-native-posts'>
              <b:loop values='data:posts' var='post'>
                <article class='blogger-post-item' expr:id='data:post.id'>
                  <h2 class='blogger-post-title'><a expr:href='data:post.url'><data:post.title/></a></h2>
                  <div class='blogger-post-body'><data:post.body/></div>
                </article>
              </b:loop>
            </div>
          </noscript>
        </b:includable>
      </b:widget>
    </b:section>

    <!-- Sidebar Section for Ads, Custom Gadgets, and Widgets -->
    <b:section class='sidebar' id='sidebar' name='Sidebar Gadgets &amp; Ads' showaddelement='yes'>
      <b:widget id='HTML1' locked='false' title='Custom HTML / AdSense Gadget' type='HTML'>
        <b:includable id='main'>
          <div id='blogger-sidebar-html' style='display:none;'>
            <data:content/>
          </div>
        </b:includable>
      </b:widget>
      <b:widget id='PopularPosts1' locked='false' title='Popular Articles' type='PopularPosts'>
        <b:includable id='main'>
          <div id='blogger-popular-posts' style='display:none;'>
            <b:loop values='data:posts' var='post'>
              <a expr:href='data:post.href'><data:post.title/></a>
            </b:loop>
          </div>
        </b:includable>
      </b:widget>
    </b:section>

    <!-- Footer Section -->
    <b:section class='footer' id='footer' maxwidgets='4' name='Footer Widgets' showaddelement='yes'>
      <b:widget id='HTML2' locked='false' title='Footer Links &amp; Copyright' type='HTML'>
        <b:includable id='main'>
          <div id='blogger-footer-html' style='display:none;'>
            <data:content/>
          </div>
        </b:includable>
      </b:widget>
    </b:section>
  </div>

  <!-- React Single Page Application Root Container -->
  <div id='root'>
    <div style='min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: #0b0f19; color: #94a3b8; font-family: "Plus Jakarta Sans", system-ui, sans-serif; gap: 16px;'>
      <div style='width: 48px; height: 48px; border: 3px solid rgba(139, 92, 246, 0.2); border-top-color: #8b5cf6; border-radius: 50%; animation: tz-spin 0.8s linear infinite;'></div>
      <div style='font-size: 14px; font-weight: 600; letter-spacing: -0.01em; color: #e2e8f0;'>Loading Toolzaro...</div>
      <style>@keyframes tz-spin { to { transform: rotate(360deg); } }</style>
    </div>
  </div>

  <!-- Toolzaro Primary JavaScript Bundle from jsDelivr CDN -->
  <script crossorigin='anonymous' src='${cdnJsUrl}' type='module'></script>
</body>
</html>
`;

// =========================================================================
// 3. LINKS.txt (Detailed Integration Instructions and URLs)
// =========================================================================
const linksTxt = `====================================================================
TOOLZARO BLOGGER INTEGRATION - JSDELIVR HIGH-SPEED CDN & THEME XML
====================================================================
Repository: ${repoOwner}/${repoName}
Cache-Buster: ${cacheBuster}

1. PRIMARY JSDELIVR GLOBAL CDN LINKS (Ultra-Fast Edge Delivery):
   CSS: ${cdnCssUrl}
   JS:  ${cdnJsUrl}

2. SECONDARY GITHUB PAGES DIRECT LINKS (Fallback):
   CSS: ${ghPagesCssUrl}
   JS:  ${ghPagesJsUrl}

HOW TO SET UP ON BLOGGER:
--------------------------------------------------------------------
Method 1: Full Blogger Theme XML with Full Layout Control (Recommended)
1. Go to Blogger Dashboard (https://www.blogger.com) -> Theme
2. Click the downward arrow next to 'Customize' -> Click 'Edit HTML'
3. Select and DELETE all existing code in the editor
4. Copy the entire contents of 'blogger-deploy/blogger-theme.xml' and paste it
5. Click Save (disk icon) in the top right.
6. Now go to Blogger -> 'Layout':
   You have a complete Website Admin Panel right in your Blogger Dashboard:
   - 'Admin: Edit Inbuilt Posts (JSON)' (Widget HTML3): Change titles, categories, excerpts, images of any inbuilt post or add new custom posts!
   - 'Admin: Hero Banner Settings' (Widget HTML4): Change the Hero title, subtitle, and badge!
   - 'Blog Posts' (Widget Blog1): Any post you write in Blogger (Posts -> New Post) automatically shows up inside 'Latest Publications' in the exact same card box format, and its Labels automatically become category filters!
   - 'Top Navigation Menu' (LinkList1): Add custom menu links!
   - 'Sidebar & AdSense' (HTML1): Add ads and custom widgets!
   - 'Footer' (HTML2): Add custom footer links and copyright!
7. Also go to Blogger -> 'Theme' -> 'Customize': You can customize theme colors
   and fonts via Blogger's built-in Theme Designer!

Method 2: Blogger Page (Embed inside a single page)
1. Go to Blogger Dashboard -> Pages -> New Page
2. Switch to 'HTML view' (pencil icon on top-left -> HTML view)
3. Copy the entire contents of 'blogger-deploy/blogger-embed.html' and paste it
4. Publish the page.
`;

// Write output files
fs.writeFileSync(path.join(outDir, 'blogger-embed.html'), bloggerEmbedHtml, 'utf8');
fs.writeFileSync(path.join(outDir, 'blogger-page.html'), bloggerEmbedHtml, 'utf8');
fs.writeFileSync(path.join(outDir, 'blogger-theme.xml'), bloggerThemeXml, 'utf8');
fs.writeFileSync(path.join(outDir, 'LINKS.txt'), linksTxt, 'utf8');

console.log('✅ Successfully generated Blogger deployment files:');
console.log(' - blogger-deploy/blogger-embed.html (Size: ~' + (bloggerEmbedHtml.length / 1024).toFixed(1) + ' KB)');
console.log(' - blogger-deploy/blogger-theme.xml (Size: ~' + (bloggerThemeXml.length / 1024).toFixed(1) + ' KB)');
console.log(' - blogger-deploy/LINKS.txt');
