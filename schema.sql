-- Toolzaro Blog D1 Database Schema
-- Database: toolzaro-blog
-- Binding name: DB
-- Run this in Cloudflare Dashboard > Workers & Pages > D1 > toolzaro-blog > Console
-- Or send this prompt to Cloudflare AI: "Execute this SQL to create the posts table in toolzaro-blog"

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
