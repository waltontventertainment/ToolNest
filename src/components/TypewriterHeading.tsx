import React, { useState, useEffect } from 'react';

const ROTATING_PHRASES = [
  "Zero installation required.",
  "100% free & private in browser.",
  "Instant PDF, Image & AI tools.",
  "Zero cloud server uploads."
];

export const TypewriterHeading: React.FC = () => {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fullPhrase = ROTATING_PHRASES[phraseIndex];
    
    // Typing speed calculation
    let typingSpeed = isDeleting ? 35 : 70;
    
    // Add realistic human typing randomness
    if (!isDeleting) {
      typingSpeed += Math.floor(Math.random() * 30);
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
      className="text-3xl sm:text-5xl lg:text-6xl font-display font-black tracking-[-0.035em] mb-4 text-foreground leading-[1.15] select-none"
      aria-label="Every web tool you need. Zero installation required."
    >
      <span className="block text-foreground">
        Every web tool you need.
      </span>
      <span className="text-brand-gradient inline-flex items-center min-h-[1.2em]">
        <span>{currentText}</span>
        {/* Realistic Glowing Keyboard Cursor */}
        <span 
          className="inline-block w-[3px] sm:w-[4px] h-[0.85em] bg-primary ml-1 rounded-full animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.8)] align-middle"
          aria-hidden="true"
        />
      </span>
    </h1>
  );
};
