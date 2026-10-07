import React, { useState, useMemo } from 'react';
import { ToolPanel, CopyButton } from '../lib/toolkit';

export const WordCounter: React.FC = () => {
  const [text, setText] = useState('');

  const stats = useMemo(() => {
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s+/g, '').length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text === '' ? 0 : text.split(/\r\n|\r|\n/).length;
    const paragraphs = text === '' ? 0 : text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;

    return { chars, charsNoSpaces, words, lines, paragraphs };
  }, [text]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Words', value: stats.words },
          { label: 'Characters', value: stats.chars },
          { label: 'No Spaces', value: stats.charsNoSpaces },
          { label: 'Lines', value: stats.lines },
          { label: 'Paragraphs', value: stats.paragraphs }
        ].map(stat => (
          <div key={stat.label} className="bg-card border rounded-lg p-4 text-center shadow-sm">
            <div className="text-3xl font-display font-bold text-primary tabular-nums">{stat.value}</div>
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <ToolPanel>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-foreground">Your Text</label>
          <div className="flex gap-2">
            <button
              onClick={() => setText('')}
              className="px-3 py-1.5 text-sm font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-brand"
            >
              Clear
            </button>
            <CopyButton text={text} />
          </div>
        </div>
        <textarea
          className="w-full min-h-[250px] p-4 rounded-md bg-transparent border-input border focus:outline-none focus:ring-2 focus:ring-ring text-base"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your text here to count words, characters, and more..."
        />
      </ToolPanel>
    </div>
  );
};
