import React, { useState } from 'react';
import { ToolPanel, OutputBox } from '../lib/toolkit';

export const MetaTagGenerator: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [author, setAuthor] = useState('');
  const [image, setImage] = useState('');
  const [url, setUrl] = useState('');
  const [allowRobots, setAllowRobots] = useState(true);

  const generateMetaTags = () => {
    const tags = [];
    
    tags.push('<!-- Primary Meta Tags -->');
    if (title) tags.push(`<title>${title}</title>`);
    if (title) tags.push(`<meta name="title" content="${title}">`);
    if (description) tags.push(`<meta name="description" content="${description}">`);
    if (keywords) tags.push(`<meta name="keywords" content="${keywords}">`);
    if (author) tags.push(`<meta name="author" content="${author}">`);
    
    tags.push(`<meta name="robots" content="${allowRobots ? 'index, follow' : 'noindex, nofollow'}">`);

    tags.push('\n<!-- Open Graph / Facebook -->');
    tags.push('<meta property="og:type" content="website">');
    if (url) tags.push(`<meta property="og:url" content="${url}">`);
    if (title) tags.push(`<meta property="og:title" content="${title}">`);
    if (description) tags.push(`<meta property="og:description" content="${description}">`);
    if (image) tags.push(`<meta property="og:image" content="${image}">`);

    tags.push('\n<!-- Twitter -->');
    tags.push('<meta property="twitter:card" content="summary_large_image">');
    if (url) tags.push(`<meta property="twitter:url" content="${url}">`);
    if (title) tags.push(`<meta property="twitter:title" content="${title}">`);
    if (description) tags.push(`<meta property="twitter:description" content="${description}">`);
    if (image) tags.push(`<meta property="twitter:image" content="${image}">`);

    return tags.join('\n');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ToolPanel className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Site Title</label>
          <input
            type="text"
            className="w-full p-2.5 rounded-md bg-transparent border-input border focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. My Awesome Website"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Description (Max 160 chars)</label>
          <textarea
            className="w-full p-2.5 rounded-md bg-transparent border-input border focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of your site..."
            rows={3}
          />
          <div className={`text-xs mt-1 ${description.length > 160 ? 'text-warning' : 'text-muted-foreground'}`}>
            {description.length} / 160 characters
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Keywords (Comma separated)</label>
          <input
            type="text"
            className="w-full p-2.5 rounded-md bg-transparent border-input border focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="e.g. tools, online, free"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Author</label>
            <input
              type="text"
              className="w-full p-2.5 rounded-md bg-transparent border-input border focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Robots</label>
            <select
              className="w-full p-2.5 rounded-md bg-transparent border-input border focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              value={allowRobots ? 'allow' : 'disallow'}
              onChange={(e) => setAllowRobots(e.target.value === 'allow')}
            >
              <option value="allow">Index, Follow</option>
              <option value="disallow">No Index, No Follow</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Site URL</label>
          <input
            type="text"
            className="w-full p-2.5 rounded-md bg-transparent border-input border focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Image URL (For social sharing)</label>
          <input
            type="text"
            className="w-full p-2.5 rounded-md bg-transparent border-input border focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </ToolPanel>

      <ToolPanel>
        <OutputBox value={generateMetaTags()} label="Generated HTML Meta Tags" className="h-full [&>textarea]:h-[500px]" />
      </ToolPanel>
    </div>
  );
};
