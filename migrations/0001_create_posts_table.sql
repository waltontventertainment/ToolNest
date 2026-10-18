-- Migration 0001: Create posts table for Toolzaro Cloudflare D1 Blog
-- Applied to database: toolzaro-blog

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  coverImage TEXT,
  author TEXT,
  category TEXT,
  tags TEXT,
  publishedAt TEXT,
  updatedAt TEXT,
  status TEXT DEFAULT 'published',
  featured INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  readingTime INTEGER DEFAULT 5,
  source TEXT DEFAULT 'd1'
);

CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts (slug);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts (status);
CREATE INDEX IF NOT EXISTS idx_posts_publishedAt ON posts (publishedAt DESC);
