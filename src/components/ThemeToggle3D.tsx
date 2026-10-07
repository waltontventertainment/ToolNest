import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggle3DProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const ThemeToggle3D: React.FC<ThemeToggle3DProps> = ({ theme, setTheme }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [sweepMode, setSweepMode] = useState<'to-dark' | 'to-light' | null>(null);

  const handleToggle = () => {
    if (isAnimating) return;

    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    const mode = nextTheme === 'dark' ? 'to-dark' : 'to-light';

    setIsAnimating(true);
    setSweepMode(mode);

    // Apply the theme transition smoothly midway through the beam sweep
    setTimeout(() => {
      setTheme(nextTheme);
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }, 250);

    // Conclude animation cleanly
    setTimeout(() => {
      setSweepMode(null);
      setIsAnimating(false);
    }, 600);
  };

  return (
    <>
      {/* 1. Silky Smooth Top-to-Bottom Cyber-Laser Sweep (Entering Dark Mode) */}
      {sweepMode === 'to-dark' && (
        <div className="theme-laser-container" aria-hidden="true">
          <div className="theme-sweep-down-layer" />
          <div className="theme-laser-beam-down" />
        </div>
      )}

      {/* 2. Silky Smooth Bottom-to-Top Solar-Laser Sweep (Entering Light Mode) */}
      {sweepMode === 'to-light' && (
        <div className="theme-laser-container" aria-hidden="true">
          <div className="theme-sweep-up-layer" />
          <div className="theme-laser-beam-up" />
        </div>
      )}

      {/* 3. Tactile 3D Theme Switcher Button */}
      <button
        onClick={handleToggle}
        className={`btn-signature-header btn-theme-3d w-10 p-0 text-muted-foreground hover:text-foreground cursor-pointer group relative overflow-hidden ${
          isAnimating ? 'animating' : ''
        }`}
        aria-label="Toggle Theme Mode"
        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        <div className="icon-3d flex items-center justify-center w-full h-full transition-transform">
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 group-hover:rotate-90 group-hover:scale-115 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.85)]" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600 transition-all duration-300 group-hover:-rotate-12 group-hover:scale-115 filter drop-shadow-[0_1px_4px_rgba(99,102,241,0.65)]" />
          )}
        </div>
      </button>
    </>
  );
};
