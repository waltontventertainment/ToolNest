import React, { useEffect, useRef, useState } from 'react';

// Google AdSense Publisher Client ID
const DEFAULT_ADSENSE_CLIENT = 'ca-pub-8769496591745522'; 

interface AdSlotProps {
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  className?: string;
  label?: boolean;
}

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

    // Check if ad actually rendered an iframe
    const observer = new MutationObserver(() => {
      const hasIframe = adRef.current && adRef.current.querySelector('iframe') !== null;
      const status = adRef.current?.getAttribute('data-ad-status');
      if (hasIframe || status === 'filled') {
        setIsFilled(true);
      } else if (status === 'unfilled') {
        setIsFilled(false);
      }
    });

    observer.observe(adRef.current, { attributes: true, childList: true, subtree: true });

    return () => observer.disconnect();
  }, [slot, client]);

  // If no client, return null to avoid any empty whitespace
  if (!client) {
    return null;
  }

  return (
    <div 
      className={`ad-slot-wrapper w-full flex-col items-center justify-center transition-all ${className}`}
      style={{ display: isFilled ? 'flex' : 'none', margin: isFilled ? '1.5rem 0' : '0' }}
    >
      {label && isFilled && (
        <span className="text-[9px] font-bold tracking-widest uppercase text-muted-foreground/60 mb-1">
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
        style={{ display: isFilled ? 'block' : 'none', minHeight: isFilled ? '90px' : '0px' }}
      />
    </div>
  );
};


