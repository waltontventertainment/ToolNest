import React, { useState, useEffect } from 'react';

const ROTATING_PHRASES = [
  "Zero installation required.",
  "100% private in browser.",
  "Instant PDF, Image & Utility tools.",
  "Zero cloud server uploads."
];

export const TypewriterHeading: React.FC = () => {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fullPhrase = ROTATING_PHRASES[phraseIndex];
    
    // Typing speed calculation
    let typingSpeed = isDeleting ? 30 : 65;
    
    // Add realistic human typing randomness
    if (!isDeleting) {
      typingSpeed += Math.floor(Math.random() * 25);
    }

    const handleType = () => {
      if (!isDeleting) {
        // Typing characters out
        setCurrentText(fullPhrase.substring(0, currentText.length + 1));

        // When phrase completes, pause before deleting
        if (currentText === fullPhrase) {
          setTimeout(() => setIsDeleting(true), 2400); // 2.4s display pause
          return;
        }
      } else {
        // Erasing backspace
        setCurrentText(fullPhrase.substring(0, currentText.length - 1));

        // When fully erased, switch to next phrase
        if (currentText === '') {
          setIsDeleting(false);
          setPhraseIndex((prevIndex) => (prevIndex + 1) % ROTATING_PHRASES.length);
          return;
        }
      }
    };

    const timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, phraseIndex]);

  return (
    <h1 
      className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-display font-black tracking-[-0.03em] mb-3 sm:mb-4 text-foreground leading-[1.15] select-none text-center md:text-left"
      aria-label="Every web tool you need. Zero installation required."
    >
      <span className="block text-foreground mb-1 text-center md:text-left">
        Every web tool you need.
      </span>
      {/* Reserved height container to completely prevent any vertical jumping/layout shift on PC, Tablet, and Mobile */}
      <span className="text-brand-gradient block min-h-[2.2em] sm:min-h-[1.5em] md:min-h-[1.25em] text-center md:text-left">
        <span className="inline">{currentText || '\u200b'}</span>
        {/* Realistic Glowing Keyboard Cursor locked to typography baseline */}
        <span 
          className="inline-block w-[3px] sm:w-[4px] h-[0.8em] bg-primary ml-1 rounded-full animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.8)] align-baseline translate-y-[1px]"
          aria-hidden="true"
        />
      </span>
    </h1>
  );
};
