import React, { useState, useEffect } from 'react';
import { Copy, Check, Download, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from './utils';

// Helper for safely parsing JSON or fallback to raw string without throwing
function safeParse<T>(item: string | null, fallback: T): T {
  if (item === null) return fallback;
  try {
    return JSON.parse(item);
  } catch {
    // If it's a plain string like "light", "dark", "true", "false", return graceful cast
    if (item === 'true') return true as unknown as T;
    if (item === 'false') return false as unknown as T;
    return item as unknown as T;
  }
}

// LocalStorage hook with SSR support & cross-component reactive sync
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    const item = window.localStorage.getItem(key);
    return safeParse(item, initialValue);
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: Event) => {
      let eventKey: string | null = null;
      if ('key' in e && typeof (e as StorageEvent).key === 'string') {
        eventKey = (e as StorageEvent).key;
      } else if ('detail' in e && (e as CustomEvent).detail && typeof (e as CustomEvent).detail.key === 'string') {
        eventKey = (e as CustomEvent).detail.key;
      }

      // If the event targets a specific key that isn't ours, or specifies no key, safely ignore
      if (!eventKey || eventKey !== key) return;

      const item = window.localStorage.getItem(key);
      const nextVal = safeParse(item, initialValue);
      // Run in microtask to prevent triggering setState inside an active render cycle of another component
      queueMicrotask(() => {
        setStoredValue(prev => {
          if (JSON.stringify(prev) === JSON.stringify(nextVal)) return prev;
          return nextVal;
        });
      });
    };

    window.addEventListener('storage', handleStorageChange as EventListener);
    window.addEventListener('local-storage-update', handleStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange as EventListener);
      window.removeEventListener('local-storage-update', handleStorageChange as EventListener);
    };
  }, [key, initialValue]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        // Dispatch in microtask so listeners don't update synchronously inside render
        queueMicrotask(() => {
          window.dispatchEvent(new CustomEvent('local-storage-update', { detail: { key, value: valueToStore } }));
        });
      }
    } catch {
      // Safe no-op
    }
  };

  return [storedValue, setValue];
}

export function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-brand",
        copied ? "bg-accent/10 text-accent" : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        className
      )}
      aria-label="Copy output"
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

export function DownloadButton({ onClick, label = "Download", className }: { onClick: () => void; label?: string; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-brand",
        className
      )}
    >
      <Download className="w-4 h-4" />
      {label}
    </button>
  );
}

export function ToolPanel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-card text-card-foreground rounded-lg border shadow-sm p-4 sm:p-6", className)}>
      {children}
    </div>
  );
}

export function OutputBox({ value, label = "Output", className }: { value: string; label?: string; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <CopyButton text={value} />
      </div>
      <textarea
        readOnly
        value={value}
        className="w-full min-h-[120px] p-3 rounded-md bg-secondary/50 border-input border font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
