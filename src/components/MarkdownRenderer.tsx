import React, { useState } from 'react';
import { Copy, Check, Terminal, Info, Lightbulb, FileCode } from 'lucide-react';
import { toast } from 'sonner';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Split content into blocks: code blocks vs standard text
  const blocks = parseMarkdownBlocks(content);

  return (
    <div className={`space-y-6 text-foreground leading-relaxed ${className}`}>
      {blocks.map((block, idx) => {
        if (block.type === 'code') {
          return <CodeBlock key={idx} code={block.content} language={block.language || 'text'} />;
        }
        if (block.type === 'table') {
          return <TableBlock key={idx} tableMarkdown={block.content} />;
        }
        if (block.type === 'blockquote') {
          return <BlockquoteBlock key={idx} text={block.content} />;
        }
        return <TextBlock key={idx} text={block.content} />;
      })}
    </div>
  );
};

// Code block with Copy button & language tag
const CodeBlock: React.FC<{ code: string; language: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-5 rounded-2xl overflow-hidden border border-border/80 bg-neutral-950 text-neutral-100 shadow-md">
      <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900 border-b border-neutral-800 text-xs text-neutral-400">
        <div className="flex items-center gap-2 font-mono font-bold uppercase tracking-wider text-[11px] text-neutral-300">
          <FileCode className="w-3.5 h-3.5 text-primary" />
          <span>{language || 'code'}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white transition-colors cursor-pointer text-xs font-semibold"
          title="Copy code snippet"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-xs font-mono leading-relaxed text-emerald-300 dark:text-emerald-400 bg-neutral-950">
        <code>{code}</code>
      </pre>
    </div>
  );
};

// Callout / Blockquote with styling
const BlockquoteBlock: React.FC<{ text: string }> = ({ text }) => {
  const cleaned = text.replace(/^>\s*/gm, '').trim();
  const isTip = cleaned.toLowerCase().includes('pro tip') || cleaned.toLowerCase().includes('tip:');

  return (
    <div className={`my-5 p-4 md:p-5 rounded-2xl border flex items-start gap-3.5 shadow-2xs ${
      isTip
        ? 'bg-amber-500/10 border-amber-400/30 text-amber-950 dark:text-amber-200'
        : 'bg-primary/10 border-primary/20 text-foreground'
    }`}>
      <div className={`p-1.5 rounded-xl shrink-0 ${isTip ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'bg-primary/20 text-primary'}`}>
        {isTip ? <Lightbulb className="w-4 h-4" /> : <Info className="w-4 h-4" />}
      </div>
      <div className="text-xs md:text-sm leading-relaxed">
        <FormattedInline text={cleaned} />
      </div>
    </div>
  );
};

// Table renderer
const TableBlock: React.FC<{ tableMarkdown: string }> = ({ tableMarkdown }) => {
  const lines = tableMarkdown.trim().split('\n').filter(Boolean);
  if (lines.length < 2) return null;

  const parseRow = (row: string) => 
    row.split('|').map(c => c.trim()).filter((c, i, arr) => (i > 0 && i < arr.length - 1) || c !== '');

  const header = parseRow(lines[0]);
  const dataRows = lines.slice(2).map(parseRow);

  return (
    <div className="my-6 overflow-x-auto rounded-2xl border border-border shadow-xs">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="bg-muted/70 border-b border-border">
            {header.map((col, idx) => (
              <th key={idx} className="p-3.5 font-bold text-foreground">
                <FormattedInline text={col} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {dataRows.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-muted/30 transition-colors">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="p-3.5 text-muted-foreground font-medium">
                  <FormattedInline text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Text block parser (Headings, Paragraphs, Lists, Dividers)
const TextBlock: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  let currentList: string[] = [];
  let isNumberedList = false;

  const flushList = () => {
    if (currentList.length > 0) {
      if (isNumberedList) {
        elements.push(
          <ol key={`ol-${elements.length}`} className="my-3 space-y-1.5 list-decimal list-inside text-xs md:text-sm text-foreground/90 pl-2">
            {currentList.map((item, idx) => (
              <li key={idx} className="leading-relaxed"><FormattedInline text={item} /></li>
            ))}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`ul-${elements.length}`} className="my-3 space-y-1.5 list-disc list-inside text-xs md:text-sm text-foreground/90 pl-2">
            {currentList.map((item, idx) => (
              <li key={idx} className="leading-relaxed"><FormattedInline text={item} /></li>
            ))}
          </ul>
        );
      }
      currentList = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      continue;
    }

    // Dividers
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      flushList();
      elements.push(<hr key={`hr-${i}`} className="my-8 border-border/80" />);
      continue;
    }

    // H1
    if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(
        <h1 key={`h1-${i}`} className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight font-display mt-8 mb-4">
          <FormattedInline text={trimmed.slice(2)} />
        </h1>
      );
      continue;
    }

    // H2
    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={`h2-${i}`} className="text-xl md:text-2xl font-bold text-foreground tracking-tight font-display mt-8 mb-3 pb-2 border-b border-border/60 flex items-center gap-2">
          <FormattedInline text={trimmed.slice(3)} />
        </h2>
      );
      continue;
    }

    // H3
    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={`h3-${i}`} className="text-base md:text-lg font-bold text-foreground tracking-tight mt-6 mb-2">
          <FormattedInline text={trimmed.slice(4)} />
        </h3>
      );
      continue;
    }

    // Unordered List
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      isNumberedList = false;
      currentList.push(trimmed.slice(2));
      continue;
    }

    // Numbered List
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      isNumberedList = true;
      currentList.push(numMatch[2]);
      continue;
    }

    // Standard paragraph
    flushList();
    elements.push(
      <p key={`p-${i}`} className="my-3 text-xs md:text-sm text-foreground/90 leading-relaxed">
        <FormattedInline text={trimmed} />
      </p>
    );
  }

  flushList();

  return <>{elements}</>;
};

// Format inline bold, italic, and inline code
const FormattedInline: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;

  // Split by inline code first
  const parts = text.split(/(`[^`]+`)/g);

  return (
    <>
      {parts.map((part, idx) => {
        if (part.startsWith('`') && part.endsWith('`') && part.length > 1) {
          return (
            <code key={idx} className="px-1.5 py-0.5 mx-0.5 rounded-md bg-muted font-mono text-[11px] font-bold text-primary border border-border/80">
              {part.slice(1, -1)}
            </code>
          );
        }

        // Parse bold & italic inside standard text
        return <span key={idx} dangerouslySetInnerHTML={{ __html: parseInlineStyles(part) }} />;
      })}
    </>
  );
};

function parseInlineStyles(str: string): string {
  return str
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-foreground">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
}

// Block tokenizer
function parseMarkdownBlocks(md: string): Array<{ type: 'text' | 'code' | 'table' | 'blockquote'; content: string; language?: string }> {
  const blocks: Array<{ type: 'text' | 'code' | 'table' | 'blockquote'; content: string; language?: string }> = [];
  const lines = md.split('\n');

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Code block check ```
    if (line.trim().startsWith('```')) {
      const language = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      blocks.push({ type: 'code', content: codeLines.join('\n'), language });
      continue;
    }

    // Table check | ... |
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: 'table', content: tableLines.join('\n') });
      continue;
    }

    // Blockquote check >
    if (line.trim().startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && (lines[i].trim().startsWith('>') || (quoteLines.length > 0 && lines[i].trim().length > 0 && !lines[i].trim().startsWith('#')))) {
        quoteLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: 'blockquote', content: quoteLines.join('\n') });
      continue;
    }

    // Standard text block
    const textLines: string[] = [];
    while (
      i < lines.length &&
      !lines[i].trim().startsWith('```') &&
      !(lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) &&
      !lines[i].trim().startsWith('>')
    ) {
      textLines.push(lines[i]);
      i++;
    }
    if (textLines.length > 0) {
      blocks.push({ type: 'text', content: textLines.join('\n') });
    }
  }

  return blocks;
}
