/**
 * Toolzaro Automated Auto-Indexing Engine (Cloudflare Worker)
 * Automatically scans and submits:
 *  - Existing unindexed links (Old URLs)
 *  - Newly published tools and blog posts (New URLs)
 *  - Future URLs on dynamic updates
 *
 * Search Engines Supported:
 *  1. Google (via Google Indexing API v3 using Service Account RS256 JWT)
 *  2. Bing, Yandex, Naver, Seznam (via IndexNow Protocol)
 */

const SITE_HOST = "toolzaro.cyou";
const SITEMAP_URL = `https://${SITE_HOST}/sitemap.xml`;
const INDEXNOW_KEY = "A27AB2145819FE7BD9BDA6BFF6D20F18";
const KEY_LOCATION = `https://${SITE_HOST}/A27AB2145819FE7BD9BDA6BFF6D20F18.txt`;

// Max Google Indexing API submissions per run (Google default quota is 200 requests/day)
const GOOGLE_MAX_PER_RUN = 50;
// Expiration in KV before re-submitting for freshness (30 days)
const KV_TTL_SECONDS = 60 * 60 * 24 * 30;

export default {
  // 1. Scheduled Cron Trigger (e.g. "0 */6 * * *")
  async scheduled(event, env, ctx) {
    ctx.waitUntil(handleAutoIndexing(env));
  },

  // 2. HTTP Requests & Webhooks
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // IndexNow Verification Key Fallback
    if (url.pathname === `/${INDEXNOW_KEY}.txt`) {
      return new Response(INDEXNOW_KEY, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "public, max-age=86400"
        }
      });
    }

    // Health check & Engine Configuration Status
    if (url.pathname === "/" || url.pathname === "/health") {
      const googleConfig = getGoogleCredentials(env);
      return new Response(
        JSON.stringify({
          status: "healthy",
          engine: "Toolzaro Auto-Indexing Cloudflare Worker",
          host: SITE_HOST,
          sitemap: SITEMAP_URL,
          indexNow: {
            enabled: true,
            keyLocation: KEY_LOCATION
          },
          googleIndexingApi: {
            enabled: !!googleConfig,
            serviceAccountEmail: googleConfig ? googleConfig.client_email : "NOT_CONFIGURED (set GOOGLE_SERVICE_ACCOUNT_JSON in Cloudflare Worker Variables)"
          }
        }, null, 2),
        { headers: { "Content-Type": "application/json; charset=utf-8" } }
      );
    }

    // Manual or Cron trigger via HTTP: GET /api/trigger-index
    if (url.pathname === "/api/trigger-index") {
      const result = await handleAutoIndexing(env);
      return new Response(JSON.stringify(result, null, 2), {
        status: 200,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      });
    }

    // Check Google URL Indexing metadata status: GET /api/google-status?url=https://...
    if (url.pathname === "/api/google-status") {
      const targetUrl = url.searchParams.get("url");
      if (!targetUrl) {
        return new Response(
          JSON.stringify({ error: "Missing 'url' query parameter" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const googleConfig = getGoogleCredentials(env);
      if (!googleConfig) {
        return new Response(
          JSON.stringify({ error: "Google Service Account not configured in Worker variables" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      try {
        const token = await getGoogleAccessToken(googleConfig.client_email, googleConfig.private_key);
        const metaRes = await fetch(`https://indexing.googleapis.com/v3/urlNotifications/metadata?url=${encodeURIComponent(targetUrl)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const metaData = await metaRes.json();
        return new Response(JSON.stringify(metaData, null, 2), {
          status: metaRes.status,
          headers: { "Content-Type": "application/json; charset=utf-8" }
        });
      } catch (err) {
        return new Response(
          JSON.stringify({ error: err.message }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Instant single or batch URL submission webhook: POST /api/submit
    if (url.pathname === "/api/submit" && request.method === "POST") {
      try {
        const body = await request.json();
        const urlsToSubmit = Array.isArray(body.urls)
          ? body.urls
          : body.url
          ? [body.url]
          : [];

        if (urlsToSubmit.length === 0) {
          return new Response(
            JSON.stringify({ error: "Missing 'url' or 'urls' array in JSON body" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        const targetEngine = body.target || "both"; // "both", "google", "indexnow"
        const results = {
          urls: urlsToSubmit,
          indexNow: null,
          google: null
        };

        // Submit to IndexNow (Bing, Yandex, etc.)
        if (targetEngine === "both" || targetEngine === "indexnow") {
          results.indexNow = await submitToIndexNow(urlsToSubmit);
          if (env.INDEXED_STORE) {
            for (const u of urlsToSubmit) {
              await env.INDEXED_STORE.put(`indexnow:${u}`, new Date().toISOString(), {
                expirationTtl: KV_TTL_SECONDS
              });
            }
          }
        }

        // Submit to Google Indexing API
        if (targetEngine === "both" || targetEngine === "google") {
          const googleConfig = getGoogleCredentials(env);
          if (googleConfig) {
            results.google = await submitBatchToGoogle(urlsToSubmit, googleConfig, env);
          } else {
            results.google = { skipped: true, reason: "Google credentials not configured" };
          }
        }

        return new Response(
          JSON.stringify({ success: true, count: urlsToSubmit.length, results }, null, 2),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ error: err.message }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // View indexing statistics: GET /api/stats
    if (url.pathname === "/api/stats") {
      let indexNowCount = 0;
      let googleCount = 0;
      let totalKeys = 0;

      if (env.INDEXED_STORE) {
        const list = await env.INDEXED_STORE.list({ limit: 1000 });
        totalKeys = list.keys.length;
        for (const k of list.keys) {
          if (k.name.startsWith("indexnow:")) indexNowCount++;
          if (k.name.startsWith("google:")) googleCount++;
        }
      }

      return new Response(
        JSON.stringify({
          site: SITE_HOST,
          kvConfigured: !!env.INDEXED_STORE,
          cachedTotalKeys: totalKeys,
          cachedIndexNowCount: indexNowCount,
          cachedGoogleCount: googleCount
        }, null, 2),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response("Not Found", { status: 404 });
  }
};

/**
 * Reads sitemaps recursively, checks against Cloudflare KV, and submits pending links
 * to both IndexNow (Bing/Yandex) and Google Indexing API.
 */
async function handleAutoIndexing(env) {
  try {
    const allUrls = await fetchAllUrlsFromSitemaps(SITEMAP_URL);

    if (allUrls.length === 0) {
      return { success: false, message: "No URLs found in sitemaps." };
    }

    const pendingIndexNow = [];
    const pendingGoogle = [];

    // Filter against KV store
    for (const pageUrl of allUrls) {
      if (env.INDEXED_STORE) {
        const [isIndexNow, isGoogle] = await Promise.all([
          env.INDEXED_STORE.get(`indexnow:${pageUrl}`),
          env.INDEXED_STORE.get(`google:${pageUrl}`)
        ]);

        if (!isIndexNow) pendingIndexNow.push(pageUrl);
        if (!isGoogle) pendingGoogle.push(pageUrl);
      } else {
        pendingIndexNow.push(pageUrl);
        pendingGoogle.push(pageUrl);
      }
    }

    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      totalFoundInSitemaps: allUrls.length,
      indexNow: {
        pendingCount: pendingIndexNow.length,
        submittedCount: 0,
        status: null
      },
      google: {
        pendingCount: pendingGoogle.length,
        submittedCount: 0,
        status: null
      }
    };

    // 1. Submit to IndexNow in batch (up to 500 URLs per run)
    if (pendingIndexNow.length > 0) {
      const batchIndexNow = pendingIndexNow.slice(0, 500);
      summary.indexNow.status = await submitToIndexNow(batchIndexNow);
      summary.indexNow.submittedCount = batchIndexNow.length;

      if (env.INDEXED_STORE) {
        for (const u of batchIndexNow) {
          await env.INDEXED_STORE.put(`indexnow:${u}`, new Date().toISOString(), {
            expirationTtl: KV_TTL_SECONDS
          });
        }
      }
    } else {
      summary.indexNow.status = "All sitemap links already indexed for IndexNow";
    }

    // 2. Submit to Google Indexing API (Rate-limited to GOOGLE_MAX_PER_RUN to safeguard quota)
    const googleConfig = getGoogleCredentials(env);
    if (googleConfig) {
      if (pendingGoogle.length > 0) {
        const batchGoogle = pendingGoogle.slice(0, GOOGLE_MAX_PER_RUN);
        summary.google.status = await submitBatchToGoogle(batchGoogle, googleConfig, env);
        summary.google.submittedCount = batchGoogle.length;
      } else {
        summary.google.status = "All sitemap links already submitted to Google Indexing API";
      }
    } else {
      summary.google.status = "Google Service Account key not configured (set GOOGLE_SERVICE_ACCOUNT_JSON in Worker variables)";
    }

    return summary;
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Submits URL list to IndexNow API (Bing, Yandex, Naver, Seznam)
 */
async function submitToIndexNow(urlList) {
  const payload = {
    host: SITE_HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: urlList
  };

  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify(payload)
  });

  return {
    statusCode: res.status,
    statusText: res.statusText
  };
}

/**
 * Submits URLs to Google Indexing API v3 using native Web Crypto JWT OAuth
 */
async function submitBatchToGoogle(urls, googleConfig, env) {
  try {
    const accessToken = await getGoogleAccessToken(
      googleConfig.client_email,
      googleConfig.private_key
    );

    const outcomes = [];
    for (const pageUrl of urls) {
      const res = await fetch("https://indexing.googleapis.com/v3/urlNotifications:publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          url: pageUrl,
          type: "URL_UPDATED"
        })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        if (env && env.INDEXED_STORE) {
          await env.INDEXED_STORE.put(`google:${pageUrl}`, new Date().toISOString(), {
            expirationTtl: KV_TTL_SECONDS
          });
        }
        outcomes.push({ url: pageUrl, status: res.status, ok: true });
      } else {
        outcomes.push({
          url: pageUrl,
          status: res.status,
          ok: false,
          error: data.error ? data.error.message : res.statusText
        });
      }
    }

    return {
      total: urls.length,
      successCount: outcomes.filter(o => o.ok).length,
      failedCount: outcomes.filter(o => !o.ok).length,
      details: outcomes
    };
  } catch (err) {
    return { error: err.message };
  }
}

/**
 * Generates Google OAuth 2.0 Access Token using Web Crypto RS256 JWT
 */
async function getGoogleAccessToken(clientEmail, privateKeyPem) {
  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: "RS256",
    typ: "JWT"
  };

  const claimSet = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/indexing",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedClaimSet = base64UrlEncode(JSON.stringify(claimSet));
  const signatureInput = `${encodedHeader}.${encodedClaimSet}`;

  const cryptoKey = await importPrivateKeyPkcs8(privateKeyPem);
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(signatureInput)
  );

  const jwt = `${signatureInput}.${base64UrlEncode(signature)}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt
    })
  });

  if (!tokenRes.ok) {
    const errorText = await tokenRes.text();
    throw new Error(`Google OAuth error (${tokenRes.status}): ${errorText}`);
  }

  const tokenJson = await tokenRes.json();
  return tokenJson.access_token;
}

/**
 * Imports PKCS#8 RSA private key into Web Crypto CryptoKey
 */
async function importPrivateKeyPkcs8(pem) {
  const cleanPem = pem
    .replace(/-----BEGIN [A-Z ]+-----/g, "")
    .replace(/-----END [A-Z ]+-----/g, "")
    .replace(/\\n/g, "")
    .replace(/\s+/g, "");

  const binaryDer = atob(cleanPem);
  const bytes = new Uint8Array(binaryDer.length);
  for (let i = 0; i < binaryDer.length; i++) {
    bytes[i] = binaryDer.charCodeAt(i);
  }

  return await crypto.subtle.importKey(
    "pkcs8",
    bytes.buffer,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: { name: "SHA-256" }
    },
    false,
    ["sign"]
  );
}

/**
 * Base64 URL safe encoder
 */
function base64UrlEncode(input) {
  let binary = "";
  if (typeof input === "string") {
    const utf8Bytes = new TextEncoder().encode(input);
    for (let i = 0; i < utf8Bytes.length; i++) {
      binary += String.fromCharCode(utf8Bytes[i]);
    }
  } else if (input instanceof ArrayBuffer || ArrayBuffer.isView(input)) {
    const bytes = new Uint8Array(input);
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Parses Google Service Account credentials from environment variables or secrets
 */
function getGoogleCredentials(env) {
  if (!env) return null;

  // 1. Full JSON secret: GOOGLE_SERVICE_ACCOUNT_JSON
  if (env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    try {
      const parsed = typeof env.GOOGLE_SERVICE_ACCOUNT_JSON === "string"
        ? JSON.parse(env.GOOGLE_SERVICE_ACCOUNT_JSON)
        : env.GOOGLE_SERVICE_ACCOUNT_JSON;
      if (parsed.client_email && parsed.private_key) {
        return {
          client_email: parsed.client_email,
          private_key: parsed.private_key
        };
      }
    } catch {
      // JSON parse failed
    }
  }

  // 2. Individual environment variables: GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY
  if (env.GOOGLE_CLIENT_EMAIL && env.GOOGLE_PRIVATE_KEY) {
    return {
      client_email: env.GOOGLE_CLIENT_EMAIL,
      private_key: env.GOOGLE_PRIVATE_KEY
    };
  }

  return null;
}

/**
 * Recursively parses sitemap index and sub-sitemaps (e.g. sitemap-tools.xml, sitemap-blog.xml)
 */
async function fetchAllUrlsFromSitemaps(initialSitemapUrl) {
  const visitedSitemaps = new Set();
  const collectedUrls = new Set();

  async function parseSitemap(sitemapUrl) {
    if (visitedSitemaps.has(sitemapUrl)) return;
    visitedSitemaps.add(sitemapUrl);

    try {
      const res = await fetch(sitemapUrl, {
        headers: { "User-Agent": "Toolzaro-Indexing-Bot/1.0" }
      });
      if (!res.ok) return;

      const xml = await res.text();

      // Check if it's a sitemapindex
      if (xml.includes("<sitemapindex")) {
        const sitemapMatches = xml.matchAll(/<loc>(https?:\/\/[^<]+)<\/loc>/g);
        for (const match of sitemapMatches) {
          const subSitemap = match[1].trim();
          await parseSitemap(subSitemap);
        }
      } else {
        // Standard urlset
        const urlMatches = xml.matchAll(/<loc>(https?:\/\/[^<]+)<\/loc>/g);
        for (const match of urlMatches) {
          collectedUrls.add(match[1].trim());
        }
      }
    } catch {
      // Ignore network errors on individual sitemaps
    }
  }

  await parseSitemap(initialSitemapUrl);
  return Array.from(collectedUrls);
}
