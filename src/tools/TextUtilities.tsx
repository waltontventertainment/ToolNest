import React, { useState, useMemo, useDeferredValue } from 'react';
import { ToolPanel, OutputBox, CopyButton } from '../lib/toolkit';
import * as Diff from 'diff';

const TextTransformTool = ({ transformFn, label, placeholder }: { transformFn: (text: string) => string, label: string, placeholder?: string }) => {
  const [text, setText] = useState('');
  const deferredText = useDeferredValue(text);
  
  const output = useMemo(() => {
    if (!deferredText) return '';
    try {
      return transformFn(deferredText);
    } catch (e) {
      return 'Error processing text.';
    }
  }, [deferredText, transformFn]);

  return (
    <div className="space-y-6">
      <ToolPanel>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-foreground">Input Text</label>
          <button onClick={() => setText('')} className="px-3 py-1.5 text-sm font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-brand">Clear</button>
        </div>
        <textarea
          className="w-full min-h-[150px] p-4 rounded-md bg-transparent border-input border focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder || "Paste your text here..."}
        />
      </ToolPanel>
      <OutputBox value={output} label={label} />
    </div>
  );
};

export const RemoveDuplicateLines = () => <TextTransformTool label="Unique Lines" transformFn={(t) => Array.from(new Set(t.split(/\r?\n/))).join('\n')} />
export const SortLines = () => <TextTransformTool label="Sorted Lines" transformFn={(t) => t.split(/\r?\n/).sort((a, b) => a.localeCompare(b)).join('\n')} />
export const RemoveExtraSpaces = () => <TextTransformTool label="Cleaned Text" transformFn={(t) => t.replace(/[ \t]+/g, ' ').trim()} />
export const RemoveEmptyLines = () => <TextTransformTool label="No Empty Lines" transformFn={(t) => t.split(/\r?\n/).filter(l => l.trim().length > 0).join('\n')} />
export const ReverseText = () => <TextTransformTool label="Reversed Text" transformFn={(t) => t.split('').reverse().join('')} />
export const ReverseLines = () => <TextTransformTool label="Reversed Lines" transformFn={(t) => t.split(/\r?\n/).reverse().join('\n')} />
export const HtmlStripper = () => <TextTransformTool label="Plain Text" transformFn={(t) => t.replace(/<[^>]*>?/gm, '')} />
export const ExtractEmails = () => <TextTransformTool label="Extracted Emails" transformFn={(t) => (t.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi) || []).join('\n')} />
export const ExtractUrls = () => <TextTransformTool label="Extracted URLs" transformFn={(t) => (t.match(/https?:\/\/[^\s]+/g) || []).join('\n')} />
export const TextToBinary = () => <TextTransformTool label="Binary Output" transformFn={(t) => Array.from(t).map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ')} />
export const BinaryToText = () => <TextTransformTool label="Text Output" transformFn={(t) => { try { return t.split(/\s+/).filter(Boolean).map(b => String.fromCharCode(parseInt(b, 2))).join(''); } catch { return 'Invalid Binary'; } }} />
export const TextToHex = () => <TextTransformTool label="Hex Output" transformFn={(t) => Array.from(t).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ')} />
export const HexToText = () => <TextTransformTool label="Text Output" transformFn={(t) => { try { return t.split(/\s+/).filter(Boolean).map(h => String.fromCharCode(parseInt(h, 16))).join(''); } catch { return 'Invalid Hex'; } }} />
export const TextToAscii = () => <TextTransformTool label="ASCII Codes" transformFn={(t) => Array.from(t).map(c => c.charCodeAt(0)).join(' ')} />
export const AsciiToText = () => <TextTransformTool label="Text Output" transformFn={(t) => { try { return t.split(/\s+/).filter(Boolean).map(a => String.fromCharCode(parseInt(a, 10))).join(''); } catch { return 'Invalid ASCII'; } }} />
export const ShuffleLines = () => <TextTransformTool label="Shuffled Lines" transformFn={(t) => { const arr = t.split(/\r?\n/); for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr.join('\n'); }} />
export const AddLineNumbers = () => <TextTransformTool label="Numbered Lines" transformFn={(t) => t.split(/\r?\n/).map((l, i) => `${i + 1}. ${l}`).join('\n')} />

export const PrefixSuffixLines = () => {
  const [text, setText] = useState('');
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  
  const deferredText = useDeferredValue(text);
  const deferredPrefix = useDeferredValue(prefix);
  const deferredSuffix = useDeferredValue(suffix);

  const output = useMemo(() => {
    if (!deferredText) return '';
    return deferredText.split(/\r?\n/).map(l => `${deferredPrefix}${l}${deferredSuffix}`).join('\n');
  }, [deferredText, deferredPrefix, deferredSuffix]);

  return (
    <div className="space-y-6">
      <ToolPanel className="space-y-4">
        <textarea
          className="w-full min-h-[150px] p-4 rounded-md bg-transparent border-input border focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your text here..."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Prefix</label>
            <input type="text" className="w-full p-2.5 rounded-md bg-transparent border-input border focus:outline-none focus:ring-2 focus:ring-ring text-sm" value={prefix} onChange={e => setPrefix(e.target.value)} placeholder="Add to beginning of each line..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Suffix</label>
            <input type="text" className="w-full p-2.5 rounded-md bg-transparent border-input border focus:outline-none focus:ring-2 focus:ring-ring text-sm" value={suffix} onChange={e => setSuffix(e.target.value)} placeholder="Add to end of each line..." />
          </div>
        </div>
      </ToolPanel>
      <OutputBox value={output} />
    </div>
  );
};

export const TextDiff = () => {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  
  const deferredText1 = useDeferredValue(text1);
  const deferredText2 = useDeferredValue(text2);
  
  const diff = useMemo(() => {
    if (!deferredText1 && !deferredText2) return [];
    return Diff.diffLines(deferredText1, deferredText2);
  }, [deferredText1, deferredText2]);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <ToolPanel>
           <label className="block text-sm font-medium mb-2">Original Text</label>
           <textarea className="w-full min-h-[200px] p-3 rounded-md bg-transparent border-input border focus:outline-none focus:ring-2 focus:ring-ring text-sm" value={text1} onChange={e => setText1(e.target.value)} placeholder="Paste original text here..." />
         </ToolPanel>
         <ToolPanel>
           <label className="block text-sm font-medium mb-2">Changed Text</label>
           <textarea className="w-full min-h-[200px] p-3 rounded-md bg-transparent border-input border focus:outline-none focus:ring-2 focus:ring-ring text-sm" value={text2} onChange={e => setText2(e.target.value)} placeholder="Paste changed text here..." />
         </ToolPanel>
      </div>
      <ToolPanel>
        <label className="block text-sm font-medium mb-2">Difference (Red = Removed, Green = Added)</label>
        <div className="p-4 border rounded-md bg-secondary/30 min-h-[100px] whitespace-pre-wrap font-mono text-sm max-h-[500px] overflow-y-auto">
           {diff.map((part, i) => (
             <span key={i} className={part.added ? 'bg-green-500/20 text-green-700 dark:text-green-400' : part.removed ? 'bg-destructive/20 text-destructive line-through' : 'text-muted-foreground'}>{part.value}</span>
           ))}
        </div>
      </ToolPanel>
    </div>
  );
};

export const FindAndReplace = () => {
  const [text, setText] = useState('');
  const [find, setFind] = useState('');
  const [replace, setReplace] = useState('');
  const [useRegex, setUseRegex] = useState(false);
  const [matchCase, setMatchCase] = useState(false);
  
  const deferredText = useDeferredValue(text);
  const deferredFind = useDeferredValue(find);
  const deferredReplace = useDeferredValue(replace);

  const output = useMemo(() => {
    if (!deferredFind || !deferredText) return deferredText;
    try {
       if (useRegex) {
          const flags = `g${matchCase ? '' : 'i'}`;
          const re = new RegExp(deferredFind, flags);
          return deferredText.replace(re, deferredReplace);
       } else {
          if (matchCase) {
             return deferredText.split(deferredFind).join(deferredReplace);
          } else {
             const re = new RegExp(deferredFind.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
             return deferredText.replace(re, deferredReplace);
          }
       }
    } catch (e) {
       return deferredText;
    }
  }, [deferredText, deferredFind, deferredReplace, useRegex, matchCase]);
  
  return (
    <div className="space-y-6">
      <ToolPanel className="space-y-4">
        <textarea className="w-full min-h-[150px] p-3 rounded-md bg-transparent border-input border focus:outline-none focus:ring-2 focus:ring-ring text-sm" value={text} onChange={e => setText(e.target.value)} placeholder="Target text..." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div><label className="block text-sm font-medium mb-1">Find</label><input type="text" className="w-full p-2.5 rounded-md bg-transparent border-input border focus:outline-none focus:ring-2 focus:ring-ring text-sm" value={find} onChange={e=>setFind(e.target.value)} /></div>
           <div><label className="block text-sm font-medium mb-1">Replace with</label><input type="text" className="w-full p-2.5 rounded-md bg-transparent border-input border focus:outline-none focus:ring-2 focus:ring-ring text-sm" value={replace} onChange={e=>setReplace(e.target.value)} /></div>
        </div>
        <div className="flex gap-4">
           <label className="flex items-center gap-2 text-sm">
             <input type="checkbox" className="rounded border-input text-primary focus:ring-primary accent-primary" checked={useRegex} onChange={e=>setUseRegex(e.target.checked)}/> 
             Use Regex
           </label>
           <label className="flex items-center gap-2 text-sm">
             <input type="checkbox" className="rounded border-input text-primary focus:ring-primary accent-primary" checked={matchCase} onChange={e=>setMatchCase(e.target.checked)}/> 
             Match Case
           </label>
        </div>
      </ToolPanel>
      <OutputBox value={output} />
    </div>
  );
};
