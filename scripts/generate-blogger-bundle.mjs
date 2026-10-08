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

const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

// Detect repository from environment or default
const fullRepo = process.env.GITHUB_REPOSITORY || 'ToolNest/ToolNest';
const repoOwner = process.env.GITHUB_REPOSITORY_OWNER || fullRepo.split('/')[0] || 'ToolNest';
const repoName = fullRepo.includes('/') ? fullRepo.split('/')[1] : fullRepo;

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

// URL templates
// 1. GitHub Pages URL: https://<owner>.github.io/<repo>/assets/<file>
const ghPagesCssUrl = `https://${repoOwner}.github.io/${repoName}/assets/${mainCssFile}`;
const ghPagesJsUrl = `https://${repoOwner}.github.io/${repoName}/assets/${mainJsFile}`;

// 2. jsDelivr CDN URL (via gh-pages branch or releases):
const cdnCssUrl = `https://cdn.jsdelivr.net/gh/${repoOwner}/${repoName}@gh-pages/assets/${mainCssFile}`;
const cdnJsUrl = `https://cdn.jsdelivr.net/gh/${repoOwner}/${repoName}@gh-pages/assets/${mainJsFile}`;

console.log(`Repository: ${repoOwner}/${repoName}`);
console.log(`Detected CSS: ${mainCssFile}`);
console.log(`Detected JS:  ${mainJsFile}`);

// Generate blogger-embed.html (For Blogger Pages / Posts)
const bloggerEmbedHtml = `<!-- ================================================================= -->
<!-- TOOLZARO - PREMIUM SUITE FOR BLOGGER (PAGE / POST HTML EMBED)     -->
<!-- File Size: ~3.5 KB (Super Lightweight & Fast)                     -->
<!-- CSS & JS are loaded directly from GitHub Pages / jsDelivr CDN      -->
<!-- ================================================================= -->

<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Toolzaro - Premium Online Utility Suite</title>
<meta name="description" content="Premium Online Utility Suite - 160+ browser-based tools for developers, designers and creators. Fast, private, and 100% client-side." />

<!-- Google Fonts Preconnect & Stylesheets -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Hind+Siliguri:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">

<!-- Google AdSense Account Verification & Auto Ads -->
<meta name="google-adsense-account" content="ca-pub-8769496591745522">
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8769496591745522" crossorigin="anonymous"></script>

<!-- Toolzaro Core Stylesheet (Hosted on GitHub Pages / CDN) -->
<!-- Primary URL (GitHub Pages): -->
<link rel="stylesheet" crossorigin="anonymous" href="${ghPagesCssUrl}">
<!-- Alternative jsDelivr CDN (If GitHub Pages is not yet enabled, you can use this):
<link rel="stylesheet" crossorigin="anonymous" href="${cdnCssUrl}">
-->

<!-- Blogger Full-Screen & Theme Reset CSS -->
<style>
  /* Reset Blogger margins and containers so Toolzaro occupies full screen */
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
  /* Hide typical default Blogger widgets/headers if embedded in standard template */
  .post-title, .post-header, .post-footer, .blog-pager, .comments, #comments, .sidebar-wrapper, .navbar, .header-widget {
    display: none !important;
  }
  .main-inner, .content-inner, .post-body, .post {
    padding: 0 !important;
    margin: 0 !important;
    max-width: 100% !important;
    width: 100% !important;
  }
</style>

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

<!-- Toolzaro Root Mounting Container -->
<div id="root"></div>

<!-- Toolzaro Core JavaScript Bundle (Hosted on GitHub Pages / CDN) -->
<!-- Primary URL (GitHub Pages): -->
<script type="module" crossorigin="anonymous" src="${ghPagesJsUrl}"></script>
<!-- Alternative jsDelivr CDN (If GitHub Pages is not yet enabled, you can use this):
<script type="module" crossorigin="anonymous" src="${cdnJsUrl}"></script>
-->
`;

// Generate blogger-theme.xml (For Full Blogger Theme replacement)
const bloggerThemeXml = `<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE html>
<html b:css='false' b:responsive='true' b:version='2' class='scroll-smooth dark' lang='en' xmlns='http://www.w3.org/1999/xhtml' xmlns:b='http://www.google.com/2005/gml/b' xmlns:data='http://www.google.com/2005/gml/data' xmlns:expr='http://www.google.com/2005/gml/expr'>
<head>
  <meta charset='UTF-8'/>
  <meta content='width=device-width, initial-scale=1.0' name='viewport'/>
  <title><data:blog.pageTitle/></title>
  <meta content='Premium Online Utility Suite - 160+ browser-based tools for developers, designers and creators. Fast, private, and 100% client-side.' name='description'/>
  <meta content='Toolzaro - Premium Online Utility Suite' property='og:title'/>
  <meta content='160+ browser-based tools for developers, designers and creators.' property='og:description'/>

  <!-- Google Fonts -->
  <link href='https://fonts.googleapis.com' rel='preconnect'/>
  <link crossorigin='anonymous' href='https://fonts.gstatic.com' rel='preconnect'/>
  <link href='https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&amp;family=Hind+Siliguri:wght@400;500;600;700&amp;family=JetBrains+Mono:wght@400;500;600;700&amp;family=Outfit:wght@400;500;600;700;800;900&amp;family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;display=swap' rel='stylesheet'/>

  <!-- Google AdSense Account Verification &amp; Auto Ads -->
  <meta content='ca-pub-8769496591745522' name='google-adsense-account'/>
  <script async='async' crossorigin='anonymous' src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8769496591745522'></script>

  <!-- Required Blogger Minimal Skin -->
  <b:skin><![CDATA[
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      min-height: 100vh !important;
      background-color: #0b0f19 !important;
      color: #f8fafc !important;
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
    }
    #root {
      min-height: 100vh !important;
      width: 100% !important;
      display: flex !important;
      flex-direction: column !important;
    }
    .quickedit, .widget, .blogger-clickContent {
      display: none !important;
    }
  ]]></b:skin>

  <!-- Toolzaro Core Stylesheet from GitHub Pages / CDN -->
  <link crossorigin='anonymous' href='${ghPagesCssUrl}' rel='stylesheet'/>

  <!-- Instant Theme Bootstrap & Blogger Router Flag -->
  <script>
    window.__USE_HASH_ROUTER__ = true;
    (function() {
      try {
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
  <!-- Required Blogger Sections (Hidden to let React SPA take 100% control) -->
  <div style='display:none;'>
    <b:section id='header' maxwidgets='1' showaddelement='no'/>
    <b:section id='main' showaddelement='no'/>
    <b:section id='footer' maxwidgets='1' showaddelement='no'/>
  </div>

  <!-- React Single Page Application Root -->
  <div id='root'></div>

  <!-- Toolzaro Core JavaScript Bundle from GitHub Pages / CDN -->
  <script crossorigin='anonymous' src='${ghPagesJsUrl}' type='module'></script>
</body>
</html>
`;

// Generate LINKS.txt
const linksTxt = `TOOLZARO BLOGGER INTEGRATION LINKS
==================================
Repository: ${repoOwner}/${repoName}

1. GITHUB PAGES ASSET LINKS:
CSS Link: ${ghPagesCssUrl}
JS Link:  ${ghPagesJsUrl}

2. JSDELIVR CDN ASSET LINKS (Alternative):
CSS Link: ${cdnCssUrl}
JS Link:  ${cdnJsUrl}

HOW TO USE IN BLOGGER:
----------------------
Method 1: Blogger Full Website (Recommended)
1. Go to Blogger Dashboard -> Theme
2. Click the dropdown next to 'Customize' -> 'Edit HTML'
3. Delete everything and paste the entire content of 'blogger-theme.xml'
4. Click Save. Your entire Blogger site is now Toolzaro!

Method 2: Blogger Page (Embed in a single page)
1. Go to Blogger Dashboard -> Pages -> New Page
2. Switch to 'HTML view' (pencil icon -> HTML view)
3. Paste the entire content of 'blogger-embed.html'
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
