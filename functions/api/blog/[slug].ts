// Cloudflare Pages Functions - /api/blog/[slug]
// Handles GET (single post by slug) and DELETE (delete post by slug)

interface Env {
  DB?: any;
}

interface RequestContext {
  request: Request;
  env: Env;
  params: Record<string, string | string[]>;
}

export const onRequestGet = async (context: RequestContext): Promise<Response> => {
  const { env, params } = context;
  const rawSlug = params.slug;
  const slug = (Array.isArray(rawSlug) ? rawSlug[0] : rawSlug)?.trim().toLowerCase();

  if (!slug) {
    return new Response(JSON.stringify({ error: 'Missing slug parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!env.DB) {
    return new Response(
      JSON.stringify({ error: 'Cloudflare D1 database (DB) is not bound.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const row: any = await env.DB.prepare(
      `SELECT * FROM posts WHERE slug = ? OR id = ? LIMIT 1`
    ).bind(slug, slug).first();

    if (!row) {
      return new Response(JSON.stringify({ error: 'Blog post not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const post = {
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
    };

    return new Response(JSON.stringify(post), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60, s-maxage=300',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Database error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const onRequestDelete = async (context: RequestContext): Promise<Response> => {
  const { env, params } = context;
  const rawSlug = params.slug;
  const slug = (Array.isArray(rawSlug) ? rawSlug[0] : rawSlug)?.trim().toLowerCase();

  if (!slug) {
    return new Response(JSON.stringify({ error: 'Missing slug parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!env.DB) {
    return new Response(
      JSON.stringify({ error: 'Cloudflare D1 database (DB) is not bound.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    await env.DB.prepare('DELETE FROM posts WHERE slug = ? OR id = ?').bind(slug, slug).run();
    return new Response(JSON.stringify({ success: true, deletedSlug: slug }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Failed to delete post' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
