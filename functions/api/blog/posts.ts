// Cloudflare Pages Functions - /api/blog/posts
// Handles GET (list published posts) and POST (create/update post in D1)
// Includes self-healing auto-table creation and comprehensive binding error diagnostics

interface Env {
  DB?: any;
  ADMIN_SECRET_KEY?: string;
}

interface RequestContext {
  request: Request;
  env: Env;
  params: Record<string, string | string[]>;
}

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

/**
 * Self-healing helper: Ensures the D1 `posts` table and indexes exist
 */
async function ensurePostsTable(db: any): Promise<void> {
  const schema = `
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      excerpt TEXT,
      content TEXT NOT NULL,
      cover_image TEXT,
      category TEXT DEFAULT 'General',
      tags TEXT,
      author_name TEXT DEFAULT 'Toolzaro Team',
      author_role TEXT DEFAULT 'Admin',
      author_avatar TEXT DEFAULT '',
      read_time_minutes INTEGER DEFAULT 5,
      status TEXT DEFAULT 'published',
      content_type TEXT DEFAULT 'text',
      custom_html TEXT,
      custom_css TEXT,
      custom_js TEXT,
      created_at INTEGER,
      updated_at INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
    CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
  `;
  await db.exec(schema);
}

export const onRequestGet = async (context: RequestContext): Promise<Response> => {
  const { env } = context;

  if (!env.DB) {
    return new Response(
      JSON.stringify({
        error: 'Cloudflare D1 database (DB) is not bound. Configure the D1 binding in Cloudflare Pages settings.',
        code: 'D1_NOT_BOUND',
        d1Bound: false,
        bindingName: 'DB',
        instructions: [
          '1. Log into your Cloudflare Dashboard (dash.cloudflare.com)',
          '2. Open Workers & Pages > Click your Toolzaro Pages project',
          '3. Navigate to Settings > Functions > Scroll down to D1 Database Bindings',
          '4. Click "Add binding" -> Variable name must be: DB',
          '5. Select your D1 database (e.g. toolzaro-blog or create one with "wrangler d1 create toolzaro-blog")',
          '6. Click Save and trigger a new deployment.'
        ]
      }),
      {
        status: 503,
        headers: CORS_HEADERS
      }
    );
  }

  const query = `
    SELECT 
      id, 
      slug, 
      title, 
      excerpt, 
      content,
      cover_image, 
      category, 
      tags, 
      author_name, 
      author_role, 
      author_avatar, 
      read_time_minutes, 
      status, 
      content_type, 
      custom_html, 
      custom_css, 
      custom_js, 
      created_at, 
      updated_at
    FROM posts 
    WHERE status = 'published' 
    ORDER BY created_at DESC 
    LIMIT 100
  `;

  try {
    let results: any[] = [];
    try {
      const res = await env.DB.prepare(query).all();
      results = res.results || [];
    } catch (queryErr: any) {
      if (queryErr.message?.toLowerCase().includes('no such table')) {
        // Table not created yet - auto heal and return empty list
        await ensurePostsTable(env.DB);
        return new Response(JSON.stringify([]), {
          status: 200,
          headers: CORS_HEADERS
        });
      }
      throw queryErr;
    }

    // Map SQLite flat columns to application blog format
    const posts = results.map((row: any) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt || '',
      content: row.content || '',
      coverImage: row.cover_image || '',
      category: row.category || 'General',
      tags: typeof row.tags === 'string' ? row.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : (row.tags || []),
      author: {
        name: row.author_name || 'Toolzaro Team',
        role: row.author_role || 'Admin',
        avatar: row.author_avatar || '',
      },
      readTimeMinutes: Number(row.read_time_minutes) || 5,
      status: row.status || 'published',
      contentType: row.content_type || 'text',
      customHtml: row.custom_html || '',
      customCss: row.custom_css || '',
      customJs: row.custom_js || '',
      createdAt: row.created_at ? new Date(Number(row.created_at)).toISOString() : new Date().toISOString(),
      updatedAt: row.updated_at ? new Date(Number(row.updated_at)).toISOString() : undefined,
    }));

    return new Response(JSON.stringify(posts), {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Cache-Control': 'public, max-age=60, s-maxage=300'
      }
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to query posts from D1 database' }),
      {
        status: 500,
        headers: CORS_HEADERS
      }
    );
  }
};

export const onRequestPost = async (context: RequestContext): Promise<Response> => {
  const { request, env } = context;

  if (!env.DB) {
    return new Response(
      JSON.stringify({
        error: 'Cloudflare D1 database (DB) is not bound in Cloudflare Pages.',
        code: 'D1_NOT_BOUND',
        bindingName: 'DB',
        instructions: [
          'Add D1 Database Binding in Cloudflare Pages Settings -> Functions -> D1 Database Bindings with variable name DB'
        ]
      }),
      { status: 503, headers: CORS_HEADERS }
    );
  }

  try {
    const payload = await request.json();
    if (!payload.title || !payload.slug) {
      return new Response(
        JSON.stringify({ error: 'Missing required title or slug.' }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const id = payload.id || `post-${Date.now()}`;
    const slug = String(payload.slug).trim().toLowerCase();
    const title = String(payload.title).trim();
    const excerpt = String(payload.excerpt || '').trim();
    const content = String(payload.content || '').trim();
    const coverImage = String(payload.coverImage || '').trim();
    const category = String(payload.category || 'General').trim();
    const tags = Array.isArray(payload.tags) ? payload.tags.join(',') : String(payload.tags || '');
    const authorName = String(payload.author?.name || 'Toolzaro Team').trim();
    const authorRole = String(payload.author?.role || 'Admin').trim();
    const authorAvatar = String(payload.author?.avatar || '').trim();
    const readTimeMinutes = Number(payload.readTimeMinutes) || 5;
    const status = payload.status || 'published';
    const contentType = payload.contentType || 'text';
    const customHtml = String(payload.customHtml || '');
    const customCss = String(payload.customCss || '');
    const customJs = String(payload.customJs || '');
    const now = Date.now();

    const upsertSql = `
      INSERT INTO posts (
        id, slug, title, excerpt, content, cover_image, category, tags,
        author_name, author_role, author_avatar, read_time_minutes,
        status, content_type, custom_html, custom_css, custom_js,
        created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?
      )
      ON CONFLICT(slug) DO UPDATE SET
        title = excluded.title,
        excerpt = excluded.excerpt,
        content = excluded.content,
        cover_image = excluded.cover_image,
        category = excluded.category,
        tags = excluded.tags,
        author_name = excluded.author_name,
        author_role = excluded.author_role,
        author_avatar = excluded.author_avatar,
        read_time_minutes = excluded.read_time_minutes,
        status = excluded.status,
        content_type = excluded.content_type,
        custom_html = excluded.custom_html,
        custom_css = excluded.custom_css,
        custom_js = excluded.custom_js,
        updated_at = excluded.updated_at
    `;

    const executeUpsert = async () => {
      await env.DB.prepare(upsertSql)
        .bind(
          id, slug, title, excerpt, content, coverImage, category, tags,
          authorName, authorRole, authorAvatar, readTimeMinutes,
          status, contentType, customHtml, customCss, customJs,
          now, now
        )
        .run();
    };

    try {
      await executeUpsert();
    } catch (upsertErr: any) {
      if (upsertErr.message?.toLowerCase().includes('no such table')) {
        // Self-heal table and retry upsert
        await ensurePostsTable(env.DB);
        await executeUpsert();
      } else {
        throw upsertErr;
      }
    }

    return new Response(JSON.stringify({ success: true, slug, id }), {
      status: 200,
      headers: CORS_HEADERS
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Failed to save post' }), {
      status: 500,
      headers: CORS_HEADERS
    });
  }
};

export const onRequestOptions = async (): Promise<Response> => {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS
  });
};
