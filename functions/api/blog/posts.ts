// Cloudflare Pages Functions - /api/blog/posts
// Handles GET (list published posts) and POST (create/update post in D1)

interface Env {
  DB?: any;
  ADMIN_SECRET_KEY?: string;
}

interface RequestContext {
  request: Request;
  env: Env;
  params: Record<string, string | string[]>;
}

export const onRequestGet = async (context: RequestContext): Promise<Response> => {
  const { env } = context;

  if (!env.DB) {
    return new Response(
      JSON.stringify({
        error: 'Cloudflare D1 database (DB) is not bound. Bind your D1 database in Cloudflare Pages Settings -> Functions -> D1 Database Bindings.',
        d1Bound: false
      }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }

  try {
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

    const { results } = await env.DB.prepare(query).all();

    // Map SQLite flat columns to application blog format
    const posts = (results || []).map((row: any) => ({
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
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60, s-maxage=300',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to query posts from D1 database' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
};

export const onRequestPost = async (context: RequestContext): Promise<Response> => {
  const { request, env } = context;

  if (!env.DB) {
    return new Response(
      JSON.stringify({ error: 'Cloudflare D1 database (DB) is not bound.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const payload = await request.json();
    if (!payload.title || !payload.slug) {
      return new Response(
        JSON.stringify({ error: 'Missing required title or slug.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
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

    await env.DB.prepare(upsertSql)
      .bind(
        id, slug, title, excerpt, content, coverImage, category, tags,
        authorName, authorRole, authorAvatar, readTimeMinutes,
        status, contentType, customHtml, customCss, customJs,
        now, now
      )
      .run();

    return new Response(JSON.stringify({ success: true, slug, id }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Failed to save post' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const onRequestOptions = async (): Promise<Response> => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
};
