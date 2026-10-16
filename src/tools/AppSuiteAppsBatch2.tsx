import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  Play,
  Pause,
  Download,
  Upload,
  Plus,
  Trash2,
  Copy,
  Check,
  Send,
  FileText,
  Clock,
  RotateCcw,
  Sparkles,
  Layers,
  Layout,
  Music,
  Sliders,
  Printer,
  DollarSign,
  Maximize2,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { toast } from 'sonner';

// ============================================================================
// 1. PIANO & MUSIC STUDIO APP (Web Audio API)
// ============================================================================

const NOTES = [
  { note: 'C4', freq: 261.63, key: 'A', isBlack: false },
  { note: 'C#4', freq: 277.18, key: 'W', isBlack: true },
  { note: 'D4', freq: 293.66, key: 'S', isBlack: false },
  { note: 'D#4', freq: 311.13, key: 'E', isBlack: true },
  { note: 'E4', freq: 329.63, key: 'D', isBlack: false },
  { note: 'F4', freq: 349.23, key: 'F', isBlack: false },
  { note: 'F#4', freq: 369.99, key: 'T', isBlack: true },
  { note: 'G4', freq: 392.0, key: 'G', isBlack: false },
  { note: 'G#4', freq: 415.3, key: 'Y', isBlack: true },
  { note: 'A4', freq: 440.0, key: 'H', isBlack: false },
  { note: 'A#4', freq: 466.16, key: 'U', isBlack: true },
  { note: 'B4', freq: 493.88, key: 'J', isBlack: false },
  { note: 'C5', freq: 523.25, key: 'K', isBlack: false },
];

export const PianoMusicStudioApp: React.FC = () => {
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [activeNote, setActiveNote] = useState<string | null>(null);

  const getOrCreateAudioContext = () => {
    if (!audioCtx) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioCtx(ctx);
      return ctx;
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  };

  const playFreq = (freq: number, noteName: string) => {
    try {
      const ctx = getOrCreateAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.2);

      setActiveNote(noteName);
      setTimeout(() => setActiveNote(null), 250);
    } catch {}
  };

  return (
    <div className="w-full flex flex-col items-center gap-4 select-none">
      <div className="w-full max-w-xl bg-card border border-border/80 rounded-2xl p-3 shadow-2xs flex items-center justify-between text-xs">
        <span className="font-bold text-foreground flex items-center gap-2">
          <Music className="w-4 h-4 text-primary" />
          <span>Interactive Piano Studio</span>
        </span>
        <span className="text-muted-foreground font-mono">Click keys or use keyboard (A, W, S, E, D, F...)</span>
      </div>

      {/* Piano Keyboard */}
      <div className="relative flex justify-center p-4 bg-slate-950 rounded-3xl shadow-2xl border-4 border-slate-900 overflow-x-auto max-w-full">
        {NOTES.map(item => (
          <button
            key={item.note}
            type="button"
            onClick={() => playFreq(item.freq, item.note)}
            className={`transition-all rounded-b-xl flex flex-col justify-end items-center pb-2 font-mono text-[10px] cursor-pointer ${
              item.isBlack
                ? 'w-8 h-28 -mx-4 z-10 bg-slate-900 hover:bg-slate-800 text-white shadow-lg border border-slate-800'
                : 'w-12 h-44 bg-white hover:bg-slate-100 text-slate-800 border-r border-slate-200'
            } ${activeNote === item.note ? 'ring-2 ring-primary scale-95' : ''}`}
          >
            <span className="font-bold">{item.note}</span>
            <span className="text-muted-foreground opacity-70">({item.key})</span>
          </button>
        ))}
      </div>
    </div>
  );
};


// ============================================================================
// 2. API CLIENT STUDIO (Postman Alternative)
// ============================================================================

export const ApiClientStudioApp: React.FC = () => {
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [url, setUrl] = useState<string>('https://jsonplaceholder.typicode.com/posts/1');
  const [headers, setHeaders] = useState<string>('Content-Type: application/json');
  const [body, setBody] = useState<string>('{\n  "title": "Hello Toolzaro"\n}');
  const [response, setResponse] = useState<any>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [timeMs, setTimeMs] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSend = async () => {
    setIsLoading(true);
    const start = performance.now();
    try {
      const parsedHeaders: Record<string, string> = {};
      headers.split('\n').forEach(line => {
        const [k, ...v] = line.split(':');
        if (k && v.length) parsedHeaders[k.trim()] = v.join(':').trim();
      });

      const options: RequestInit = {
        method,
        headers: parsedHeaders,
      };

      if (method !== 'GET') {
        options.body = body;
      }

      const res = await fetch(url, options);
      const elapsed = Math.round(performance.now() - start);
      setStatus(res.status);
      setTimeMs(elapsed);

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await res.json();
        setResponse(json);
      } else {
        const txt = await res.text();
        setResponse(txt);
      }
      toast.success(`Request succeeded (${res.status} OK)`);
    } catch (err: any) {
      setStatus(500);
      setResponse({ error: err.message || 'CORS or Network Error' });
      toast.error('Request failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* URL Request Bar */}
      <div className="bg-card border border-border/80 rounded-2xl p-2.5 shadow-2xs flex flex-wrap items-center gap-2">
        <select
          value={method}
          onChange={e => setMethod(e.target.value as any)}
          className="h-10 px-3 rounded-xl border border-border bg-background text-xs font-mono font-bold text-foreground focus:outline-none"
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>

        <input
          type="text"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://api.example.com/v1/resource"
          className="flex-1 min-w-[200px] h-10 px-3 rounded-xl border border-border bg-background text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={isLoading}
          className="px-4 h-10 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-1.5 shadow-xs hover:opacity-95 transition-opacity disabled:opacity-50 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{isLoading ? 'Sending...' : 'Send'}</span>
        </button>
      </div>

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Request Pane */}
        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-2xs space-y-3">
          <span className="text-xs font-bold text-foreground">Request Payload & Headers</span>
          <div>
            <label className="text-[11px] font-mono text-muted-foreground block mb-1">Headers</label>
            <textarea
              value={headers}
              onChange={e => setHeaders(e.target.value)}
              className="w-full h-20 p-2.5 rounded-xl border border-border bg-background font-mono text-xs text-foreground focus:outline-none"
            />
          </div>
          {method !== 'GET' && (
            <div>
              <label className="text-[11px] font-mono text-muted-foreground block mb-1">JSON Body</label>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                className="w-full h-36 p-2.5 rounded-xl border border-border bg-background font-mono text-xs text-foreground focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Response Pane */}
        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-border/60 text-xs">
            <span className="font-bold text-foreground">Response</span>
            {status !== null && (
              <div className="flex items-center gap-2 font-mono">
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${status >= 200 && status < 300 ? 'bg-emerald-500/20 text-emerald-600' : 'bg-rose-500/20 text-rose-600'}`}>
                  {status}
                </span>
                <span className="text-muted-foreground">{timeMs}ms</span>
              </div>
            )}
          </div>
          <pre className="flex-1 mt-3 p-3 rounded-xl bg-secondary/50 font-mono text-xs overflow-auto max-h-[340px] text-foreground">
            {response ? JSON.stringify(response, null, 2) : '// Response will appear here'}
          </pre>
        </div>
      </div>
    </div>
  );
};


// ============================================================================
// 3. INVOICE GENERATOR STUDIO
// ============================================================================

export const InvoiceGeneratorApp: React.FC = () => {
  const [invoiceNumber, setInvoiceNumber] = useState<string>('INV-2026-001');
  const [senderName, setSenderName] = useState<string>('Toolzaro Studio');
  const [clientName, setClientName] = useState<string>('Acme Global Inc.');
  const [currency, setCurrency] = useState<string>('$');
  const [items, setItems] = useState<Array<{ id: number; desc: string; qty: number; price: number }>>([
    { id: 1, desc: 'Web App Development & Integration', qty: 1, price: 1200 },
    { id: 2, desc: 'Client-Side SEO & Performance Tuning', qty: 1, price: 350 },
  ]);

  const addItem = () => {
    setItems(prev => [...prev, { id: Date.now(), desc: 'New Service', qty: 1, price: 100 }]);
  };

  const removeItem = (id: number) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateItem = (id: number, key: 'desc' | 'qty' | 'price', val: any) => {
    setItems(prev => prev.map(item => (item.id === id ? { ...item, [key]: val } : item)));
  };

  const subtotal = items.reduce((acc, curr) => acc + curr.qty * curr.price, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Top Toolbar */}
      <div className="bg-card border border-border/80 rounded-2xl p-3 shadow-2xs flex items-center justify-between text-xs print:hidden">
        <span className="font-bold text-foreground">Professional Invoice Studio</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={addItem}
            className="px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-secondary font-bold text-foreground transition-colors"
          >
            + Add Item
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground font-bold flex items-center gap-1.5 shadow-xs hover:opacity-95 transition-opacity"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Invoice Canvas */}
      <div className="bg-white text-slate-900 border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-lg max-w-3xl mx-auto w-full">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-6 mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">INVOICE</h1>
            <p className="text-xs font-mono text-slate-500 mt-1">#{invoiceNumber}</p>
          </div>
          <div className="text-right">
            <input
              type="text"
              value={senderName}
              onChange={e => setSenderName(e.target.value)}
              className="text-right font-bold text-sm text-slate-900 border-none focus:outline-none"
            />
            <p className="text-xs text-slate-500">Date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Client Info */}
        <div className="mb-6">
          <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Billed To</span>
          <input
            type="text"
            value={clientName}
            onChange={e => setClientName(e.target.value)}
            className="font-bold text-sm text-slate-800 border-b border-slate-300 w-64 focus:outline-none"
          />
        </div>

        {/* Item Table */}
        <table className="w-full text-xs text-left mb-6">
          <thead>
            <tr className="border-b border-slate-300 text-slate-500 uppercase text-[10px]">
              <th className="py-2">Description</th>
              <th className="py-2 text-center w-16">Qty</th>
              <th className="py-2 text-right w-24">Price</th>
              <th className="py-2 text-right w-24">Total</th>
              <th className="py-2 w-8 print:hidden" />
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="border-b border-slate-100">
                <td className="py-2.5">
                  <input
                    type="text"
                    value={item.desc}
                    onChange={e => updateItem(item.id, 'desc', e.target.value)}
                    className="w-full font-medium text-slate-800 focus:outline-none"
                  />
                </td>
                <td className="py-2.5 text-center">
                  <input
                    type="number"
                    value={item.qty}
                    onChange={e => updateItem(item.id, 'qty', Number(e.target.value))}
                    className="w-12 text-center text-slate-800 focus:outline-none font-mono"
                  />
                </td>
                <td className="py-2.5 text-right font-mono">
                  {currency}
                  <input
                    type="number"
                    value={item.price}
                    onChange={e => updateItem(item.id, 'price', Number(e.target.value))}
                    className="w-16 text-right text-slate-800 focus:outline-none inline"
                  />
                </td>
                <td className="py-2.5 text-right font-mono font-bold">
                  {currency}{(item.qty * item.price).toFixed(2)}
                </td>
                <td className="py-2.5 text-right print:hidden">
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-rose-400 hover:text-rose-600"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end text-xs font-mono">
          <div className="w-56 space-y-1.5 border-t border-slate-200 pt-3">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal:</span>
              <span>{currency}{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Tax (5%):</span>
              <span>{currency}{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 text-sm border-t border-slate-300 pt-2">
              <span>Grand Total:</span>
              <span>{currency}{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// ============================================================================
// 4. POMODORO TIME TRACKER STUDIO
// ============================================================================

export const PomodoroTrackerApp: React.FC = () => {
  const [mode, setMode] = useState<'focus' | 'short' | 'long'>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedSessions, setCompletedSessions] = useState<number>(0);

  useEffect(() => {
    let timer: any = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      toast.success('Session finished! Take a break. 🔔');
      if (mode === 'focus') setCompletedSessions(c => c + 1);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, mode]);

  const switchMode = (newMode: 'focus' | 'short' | 'long') => {
    setMode(newMode);
    setIsRunning(false);
    if (newMode === 'focus') setTimeLeft(25 * 60);
    if (newMode === 'short') setTimeLeft(5 * 60);
    if (newMode === 'long') setTimeLeft(15 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="w-full flex flex-col items-center gap-6">
      {/* Mode Tabs */}
      <div className="flex items-center gap-1.5 bg-secondary/80 p-1 rounded-2xl border border-border">
        <button
          type="button"
          onClick={() => switchMode('focus')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            mode === 'focus' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground'
          }`}
        >
          Focus (25m)
        </button>
        <button
          type="button"
          onClick={() => switchMode('short')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            mode === 'short' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground'
          }`}
        >
          Short Break (5m)
        </button>
        <button
          type="button"
          onClick={() => switchMode('long')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            mode === 'long' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground'
          }`}
        >
          Long Break (15m)
        </button>
      </div>

      {/* Timer Display Ring */}
      <div className="w-64 h-64 rounded-full border-8 border-primary/20 flex flex-col items-center justify-center bg-card shadow-xl relative">
        <span className="font-display font-black text-5xl text-foreground tracking-tight">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
        <span className="text-xs uppercase font-bold text-muted-foreground mt-2">
          {isRunning ? 'Running' : 'Paused'}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsRunning(!isRunning)}
          className="px-6 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-md hover:opacity-95 transition-all"
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button
          type="button"
          onClick={() => switchMode(mode)}
          className="p-3 rounded-2xl border border-border bg-card hover:bg-secondary text-foreground transition-colors"
          title="Reset Timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="text-xs text-muted-foreground font-mono">
        Completed Sessions Today: <strong className="text-foreground">{completedSessions}</strong>
      </div>
    </div>
  );
};


// ============================================================================
// 5. KANBAN TASK BOARD APP
// ============================================================================

export const KanbanBoardApp: React.FC = () => {
  const [tasks, setTasks] = useState<Array<{ id: number; title: string; col: 'todo' | 'in_progress' | 'done' }>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tz_app_kanban');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return [
      { id: 1, title: 'Explore Toolzaro App Suite', col: 'done' },
      { id: 2, title: 'Draft project notes in Markdown Studio', col: 'in_progress' },
      { id: 3, title: 'Generate financial report in Spreadsheet', col: 'todo' },
    ];
  });

  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('tz_app_kanban', JSON.stringify(tasks));
    } catch {}
  }, [tasks]);

  const addTask = () => {
    if (!newTitle.trim()) return;
    setTasks(prev => [...prev, { id: Date.now(), title: newTitle.trim(), col: 'todo' }]);
    setNewTitle('');
    toast.success('Task created in To Do column');
  };

  const moveTask = (id: number, nextCol: 'todo' | 'in_progress' | 'done') => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, col: nextCol } : t)));
  };

  const deleteTask = (id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Create Task Bar */}
      <div className="bg-card border border-border/80 rounded-2xl p-3 shadow-2xs flex items-center gap-2 max-w-lg">
        <input
          type="text"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTask()}
          placeholder="Add a new task..."
          className="flex-1 h-9 px-3 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none"
        />
        <button
          type="button"
          onClick={addTask}
          className="px-3 h-9 rounded-xl bg-primary text-primary-foreground font-bold text-xs"
        >
          Add
        </button>
      </div>

      {/* 3 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(['todo', 'in_progress', 'done'] as const).map(col => {
          const colTasks = tasks.filter(t => t.col === col);
          const colLabel = col === 'todo' ? 'To Do' : col === 'in_progress' ? 'In Progress' : 'Done';

          return (
            <div key={col} className="bg-card border border-border/80 rounded-2xl p-3.5 shadow-2xs flex flex-col min-h-[300px]">
              <div className="flex items-center justify-between pb-2 border-b border-border/60 text-xs font-bold text-foreground mb-3">
                <span>{colLabel}</span>
                <span className="px-1.5 py-0.5 rounded bg-secondary font-mono text-[10px]">{colTasks.length}</span>
              </div>

              <div className="space-y-2 flex-1">
                {colTasks.map(t => (
                  <div key={t.id} className="p-3 rounded-xl bg-background border border-border shadow-2xs space-y-2">
                    <p className="text-xs font-medium text-foreground">{t.title}</p>
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/40">
                      <div className="flex items-center gap-1">
                        {col !== 'todo' && (
                          <button
                            type="button"
                            onClick={() => moveTask(t.id, col === 'done' ? 'in_progress' : 'todo')}
                            className="text-primary hover:underline text-[10px]"
                          >
                            ◀ Prev
                          </button>
                        )}
                        {col !== 'done' && (
                          <button
                            type="button"
                            onClick={() => moveTask(t.id, col === 'todo' ? 'in_progress' : 'done')}
                            className="text-primary hover:underline text-[10px]"
                          >
                            Next ▶
                          </button>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteTask(t.id)}
                        className="text-rose-400 hover:text-rose-600 text-[10px]"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
