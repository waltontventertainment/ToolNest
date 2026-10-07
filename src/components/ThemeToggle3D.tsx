import React, { useState } from 'react';
import { flushSync } from 'react-dom';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggle3DProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const ThemeToggle3D: React.FC<ThemeToggle3DProps> = ({ theme, setTheme }) => {
  const [isRotating, setIsRotating] = useState(false);

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isRotating || typeof document === 'undefined') return;
    setIsRotating(true);
    setTimeout(() => setIsRotating(false), 550);

    const nextTheme = theme === 'dark' ? 'light' : 'dark';

    // Fast zero-latency DOM class update
    const applyThemeToDom = () => {
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      // Sync React state in low priority transition without blocking initial frame
      React.startTransition(() => {
        setTheme(nextTheme);
      });
    };

    // 1. Native View Transitions API with fluid circular ripple
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      const transition = (document as any).startViewTransition(() => {
        applyThemeToDom();
      });

      transition.ready
        .then(() => {
          document.documentElement.animate(
            {
              clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${endRadius}px at ${x}px ${y}px)`
              ]
            },
            {
              duration: 520,
              easing: 'cubic-bezier(0.25, 1, 0.4, 1)',
              pseudoElement: '::view-transition-new(root)'
            }
          );
        })
        .catch(() => {});

      return;
    }

    // 2. Synchronized fallback
    if (typeof window !== 'undefined' && window.document) {
      window.document.documentElement.classList.add('theme-transitioning');
      applyThemeToDom();

      setTimeout(() => {
        if (typeof window !== 'undefined' && window.document) {
          window.document.documentElement.classList.remove('theme-transitioning');
        }
      }, 400);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`btn-signature-header btn-theme-3d w-10 h-10 p-0 text-muted-foreground hover:text-foreground cursor-pointer group relative overflow-hidden transition-transform duration-300 active:scale-90 ${
        isRotating ? 'animating' : ''
      }`}
      aria-label="Toggle Theme Mode"
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <div className="icon-3d flex items-center justify-center w-full h-full transition-transform">
        {theme === 'dark' ? (
          <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 group-hover:rotate-45 group-hover:scale-115 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.85)]" />
        ) : (
          <Moon className="w-4 h-4 text-indigo-600 transition-all duration-300 group-hover:-rotate-12 group-hover:scale-115 filter drop-shadow-[0_1px_4px_rgba(99,102,241,0.65)]" />
        )}
      </div>
    </button>
  );
};
