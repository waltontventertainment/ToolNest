// Cloudflare Pages Functions - /api/blog/init
// Automatically runs table migration and creates posts table in Cloudflare D1

interface Env {
  DB?: any;
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

export const onRequestPost = async (context: RequestContext): Promise<Response> => {
  const { env } = context;

  if (!env.DB) {
    return new Response(
      JSON.stringify({
        error: 'Cloudflare D1 database (DB) is not bound. Please add the DB binding in Cloudflare Pages settings.',
        code: 'D1_NOT_BOUND',
        bindingName: 'DB'
      }),
      { status: 503, headers: CORS_HEADERS }
    );
  }

  try {
    const createTableSql = `
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
    `;

    const createIndex1 = `CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);`;
    const createIndex2 = `CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);`;

    await env.DB.exec(`${createTableSql} ${createIndex1} ${createIndex2}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Cloudflare D1 table `posts` and indexes initialized successfully.'
      }),
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Initialization failed' }), {
      status: 500,
      headers: CORS_HEADERS
    });
  }
};

export const onRequestGet = async (context: RequestContext): Promise<Response> => {
  return onRequestPost(context);
};

export const onRequestOptions = async (): Promise<Response> => {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS
  });
};
