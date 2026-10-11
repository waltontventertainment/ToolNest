import React, { useState, useEffect, useMemo, useRef } from 'react';
import { tools } from '../lib/registry';
import { getEffectiveTools } from '../lib/toolOverrides';
import { useSiteSettings } from '../context/SiteSettingsContext';

interface TypewriterHeadingProps {
  toolCount?: number;
}

const TypewriterHeadingComponent: React.FC<TypewriterHeadingProps> = ({ toolCount }) => {
  const { settings } = useSiteSettings();

  // Dynamic live count: prefer passed toolCount prop, or calculate active tools with overrides, or registry length
  const effectiveCount = useMemo(() => {
    if (typeof toolCount === 'number' && toolCount > 0) {
      return toolCount;
    }
    try {
      const active = getEffectiveTools(tools, settings.toolOverrides, false);
      return active.length;
    } catch {
      return tools.length;
    }
  }, [toolCount, settings.toolOverrides]);

  // Dynamic rotating phrases including the real-time tool count and fresh privacy & utility highlights
  const phrases = useMemo(() => [
    "Zero installation required.",
    "100% private in browser.",
    "Instant PDF, image & code tools.",
    "Zero cloud server uploads.",
    `${effectiveCount}+ free daily utilities.`,
    "No data ever leaves your device.",
    "Lightning-fast client-side speed.",
    "Powerful developer & media suite.",
    "Smart WebAssembly & canvas engine.",
    "Works offline & on any device."
  ], [effectiveCount]);

  // Keep a stable ref to phrases so the animation loop is uninterrupted and never resets/freezes on re-renders
  const phrasesRef = useRef(phrases);
  useEffect(() => {
    phrasesRef.current = phrases;
  }, [phrases]);

  // Initialize with full first phrase so Largest Contentful Paint (LCP) paints instantly at 0ms
  const [text, setText] = useState<string>(phrases[0]);

  useEffect(() => {
    let isMounted = true;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    let phraseIdx = 0;
    let charIdx = phrasesRef.current[0].length;
    let deleting = true; // After initial reading beat, begin deleting

    const tick = () => {
      if (!isMounted) return;

      const currentList = phrasesRef.current;
      const activePhrase = currentList[phraseIdx % currentList.length] || '';

      if (!deleting) {
        // --- TYPING PHASE ---
        if (charIdx < activePhrase.length) {
          charIdx++;
          setText(activePhrase.slice(0, charIdx));
          // Natural human typing rhythm (36ms to 48ms per character)
          const typeDelay = 36 + Math.floor(Math.random() * 12);
          timerId = setTimeout(tick, typeDelay);
        } else {
          // Finished typing! Snappy reading beat (1100ms - not 4-5 seconds)
          deleting = true;
          timerId = setTimeout(tick, 1100);
        }
      } else {
        // --- DELETING / BACKSPACING PHASE ---
        if (charIdx > 0) {
          charIdx--;
          setText(activePhrase.slice(0, charIdx));
          // Fast, fluid backspacing (18ms per character)
          timerId = setTimeout(tick, 18);
        } else {
          // Finished deleting! Advance to next phrase with a snappy 180ms breath
          deleting = false;
          phraseIdx = (phraseIdx + 1) % currentList.length;
          charIdx = 0;
          timerId = setTimeout(tick, 180);
        }
      }
    };

    // Initial comfortable reading beat for first pre-rendered phrase (1100ms)
    timerId = setTimeout(tick, 1100);

    return () => {
      isMounted = false;
      if (timerId) clearTimeout(timerId);
    };
  }, []);

  return (
    <h1
      className="text-[1.6rem] sm:text-3xl md:text-4xl lg:text-[2.45rem] xl:text-[2.75rem] font-display font-black tracking-[-0.03em] mb-3 text-foreground leading-[1.2] select-none text-center lg:text-left"
      aria-label={`Every web tool you need. ${effectiveCount}+ free daily utilities.`}
    >
      <span className="block text-foreground mb-1 whitespace-nowrap overflow-hidden text-ellipsis text-center lg:text-left">
        Every web tool you need.
      </span>
      {/* Strict single-line locked height container (h-[1.3em] + whitespace-nowrap) so text NEVER wraps or shifts */}
      <span className="text-brand-gradient flex items-center justify-center lg:justify-start h-[1.3em] leading-[1.3] whitespace-nowrap overflow-hidden">
        <span className="inline-block truncate">{text || '\u00A0'}</span>
        {/* Realistic Keyboard Cursor locked to typography baseline */}
        <span
          className="inline-block w-[3px] h-[0.82em] bg-primary ml-1 rounded-full animate-pulse shrink-0"
          aria-hidden="true"
        />
      </span>
    </h1>
  );
};

export const TypewriterHeading = React.memo(TypewriterHeadingComponent);

