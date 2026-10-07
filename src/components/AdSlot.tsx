import React, { useEffect, useRef, useState } from 'react';

// Google AdSense Publisher Client ID
const DEFAULT_ADSENSE_CLIENT = 'ca-pub-8769496591745522'; 

interface AdSlotProps {
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  className?: string;
  label?: boolean;
}

/**
 * Intelligent Google AdSense Slot with 100% Zero-Whitespace Auto-Collapse.
 * Does not render any padding, margins, or height unless the ad actually delivers an iframe.
 */
export const AdSlot: React.FC<AdSlotProps> = ({ 
  slot, 
  format = 'auto', 
  className = '',
  label = false
}) => {
  const adRef = useRef<HTMLModElement>(null);
  const [isFilled, setIsFilled] = useState(false);
  const client = (typeof window !== 'undefined' && (window as any).ADSENSE_CLIENT) || DEFAULT_ADSENSE_CLIENT;

  useEffect(() => {
    if (!client || !adRef.current) return;

    if (!adRef.current.hasAttribute('data-adsbygoogle-status')) {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (e) {
        console.debug('AdSense notice:', e);
      }
    }

    const checkFilledStatus = () => {
      if (!adRef.current) return;
      const iframe = adRef.current.querySelector('iframe');
      const status = adRef.current.getAttribute('data-ad-status');
      
      if (status === 'filled' || (iframe && (iframe.clientHeight > 20 || iframe.offsetHeight > 20))) {
        setIsFilled(true);
      } else if (status === 'unfilled') {
        setIsFilled(false);
      }
    };

    // Mutation observer to detect iframe injection and size
    const observer = new MutationObserver(checkFilledStatus);
    observer.observe(adRef.current, { attributes: true, childList: true, subtree: true });

    // Periodic safety check in case iframe takes a moment to paint
    const timer = setTimeout(checkFilledStatus, 1500);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [slot, client]);

  // If no client, return null to avoid any whitespace
  if (!client) {
    return null;
  }

  return (
    <div 
      className={`ad-slot-wrapper transition-all duration-300 ${
        isFilled 
          ? `w-full flex flex-col items-center justify-center my-6 ${className}` 
          : 'hidden h-0 max-h-0 min-h-0 m-0 p-0 border-0 opacity-0 overflow-hidden pointer-events-none'
      }`}
      data-filled={isFilled ? 'true' : 'false'}
      style={!isFilled ? { display: 'none', height: 0, minHeight: 0, margin: 0, padding: 0 } : undefined}
    >
      {label && isFilled && (
        <span className="text-[9px] font-bold tracking-widest uppercase text-muted-foreground/60 mb-1.5 select-none">
          Advertisement
        </span>
      )}
      <ins
        ref={adRef}
        className="adsbygoogle block w-full text-center"
        data-ad-client={client}
        data-ad-slot={slot || '1234567890'}
        data-ad-format={format}
        data-full-width-responsive="true"
        style={{ 
          display: isFilled ? 'block' : 'none', 
          minHeight: isFilled ? '60px' : '0px',
          height: isFilled ? 'auto' : '0px'
        }}
      />
    </div>
  );
};
