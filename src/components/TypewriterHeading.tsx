import React, { useState, useEffect } from 'react';

const ROTATING_PHRASES = [
  "Zero installation required.",
  "100% private in browser.",
  "Instant PDF & image tools.",
  "Zero cloud server uploads.",
  "156+ free daily utilities.",
  "Built for speed & privacy."
];

export const TypewriterHeading: React.FC = () => {
  const [phraseIndex, setPhraseIndex] = useState(0);
  // Initialize with full first phrase so Largest Contentful Paint (LCP) paints at 0ms on Mobile & PC
  const [currentText, setCurrentText] = useState(ROTATING_PHRASES[0]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fullPhrase = ROTATING_PHRASES[phraseIndex];

    // Continuous flow: brief 900ms reading beat at the end of a phrase instead of a long 5-6s freeze
    if (!isDeleting && currentText === fullPhrase) {
      const pauseTimer = setTimeout(() => setIsDeleting(true), 900);
      return () => clearTimeout(pauseTimer);
    }

    // Smooth, continuous keyboard typing & backspacing speed
    let typingSpeed = isDeleting ? 28 : 55;
    if (!isDeleting) {
      typingSpeed += Math.floor(Math.random() * 15);
    }

    const handleType = () => {
      if (!isDeleting) {
        setCurrentText(fullPhrase.substring(0, currentText.length + 1));
      } else {
        const nextText = fullPhrase.substring(0, currentText.length - 1);
        setCurrentText(nextText);
        if (nextText === '') {
          setIsDeleting(false);
          setPhraseIndex((prevIndex) => (prevIndex + 1) % ROTATING_PHRASES.length);
        }
      }
    };

    const timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, phraseIndex]);

  return (
    <h1
      className="text-[1.6rem] sm:text-3xl md:text-4xl lg:text-[2.45rem] xl:text-[2.75rem] font-display font-black tracking-[-0.03em] mb-3 text-foreground leading-[1.2] select-none text-center lg:text-left"
      aria-label="Every web tool you need. Zero installation required."
    >
      <span className="block text-foreground mb-1 whitespace-nowrap overflow-hidden text-ellipsis text-center lg:text-left">
        Every web tool you need.
      </span>
      {/* Strict single-line locked height container (h-[1.3em] + whitespace-nowrap) so text NEVER wraps to 2 lines or jumps */}
      <span className="text-brand-gradient flex items-center justify-center lg:justify-start h-[1.3em] leading-[1.3] whitespace-nowrap overflow-hidden">
        <span className="inline-block truncate">{currentText || '\u200b'}</span>
        {/* Realistic Keyboard Cursor locked to typography baseline */}
        <span
          className="inline-block w-[3px] h-[0.82em] bg-primary ml-1 rounded-full animate-pulse shrink-0"
          aria-hidden="true"
        />
      </span>
    </h1>
  );
};
