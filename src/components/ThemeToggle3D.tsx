import React, { useState, useRef } from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggle3DProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const ThemeToggle3D: React.FC<ThemeToggle3DProps> = ({ theme, setTheme }) => {
  const [isRotating, setIsRotating] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleToggle = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (isRotating || typeof document === 'undefined') return;
    setIsRotating(true);
    setTimeout(() => setIsRotating(false), 1400);

    const nextTheme = theme === 'dark' ? 'light' : 'dark';

    // Calculate precise center point from button or viewport
    const buttonElem = buttonRef.current || (e?.currentTarget as HTMLButtonElement | null);
    const rect = buttonElem ? buttonElem.getBoundingClientRect() : null;
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth - 60;
    const y = rect ? rect.top + rect.height / 2 : 40;

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // Set CSS custom properties for hardware-accelerated circular wave
    document.documentElement.style.setProperty('--ripple-x', `${x}px`);
    document.documentElement.style.setProperty('--ripple-y', `${y}px`);
    document.documentElement.style.setProperty('--ripple-radius', `${Math.ceil(endRadius + 50)}px`);

    // 1. Native View Transitions API for slow, ultra-smooth circular ripple wave with ZERO viewport jumps
    const canUseViewTransition =
      typeof document !== 'undefined' &&
      'startViewTransition' in document &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (canUseViewTransition) {
      try {
        const transition = (document as any).startViewTransition(() => {
          if (nextTheme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          setTheme(nextTheme);
        });

        transition.ready
          .then(() => {
            document.documentElement.animate(
              {
                clipPath: [
                  `circle(0px at ${x}px ${y}px)`,
                  `circle(${Math.ceil(endRadius + 50)}px at ${x}px ${y}px)`
                ]
              },
              {
                duration: 1400,
                easing: 'cubic-bezier(0.25, 0.9, 0.3, 1)',
                pseudoElement: '::view-transition-new(root)'
              }
            );
          })
          .catch(() => {
            if (nextTheme === 'dark') {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
            setTheme(nextTheme);
          });

        return;
      } catch {
        // Fallback to CSS smooth transition
      }
    }

    // 2. High-performance classic smooth CSS transition fallback for unsupported browsers
    document.documentElement.classList.add('theme-transitioning');
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    setTheme(nextTheme);

    setTimeout(() => {
      if (typeof window !== 'undefined' && window.document) {
        window.document.documentElement.classList.remove('theme-transitioning');
      }
    }, 1400);
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleToggle}
      className={`btn-signature-header btn-theme-3d w-10 h-10 p-0 text-muted-foreground hover:text-foreground cursor-pointer group relative overflow-hidden transition-all duration-300 active:scale-90 ${
        isRotating ? 'animating' : ''
      }`}
      aria-label="Toggle Theme Mode"
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {/* Radiant ambient glow on hover/active */}
      <span className="absolute inset-0 rounded-[0.875rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-tr from-primary/10 via-amber-400/10 to-transparent" />

      <div className="icon-3d flex items-center justify-center w-full h-full transition-transform">
        {theme === 'dark' ? (
          <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 group-hover:rotate-45 group-hover:scale-115 filter drop-shadow-[0_0_10px_rgba(251,191,36,0.9)]" />
        ) : (
          <Moon className="w-4 h-4 text-indigo-600 transition-all duration-300 group-hover:-rotate-12 group-hover:scale-115 filter drop-shadow-[0_1px_4px_rgba(99,102,241,0.65)]" />
        )}
      </div>
    </button>
  );
};

