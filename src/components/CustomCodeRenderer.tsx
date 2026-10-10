import React, { useEffect, useRef } from 'react';

interface CustomCodeRendererProps {
  html?: string;
  css?: string;
  js?: string;
  className?: string;
}

export const CustomCodeRenderer: React.FC<CustomCodeRendererProps> = ({
  html = '',
  css = '',
  js = '',
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Execute custom JS if present
    if (js && js.trim()) {
      try {
        // Execute inside a scoped function with container reference
        const scopedFn = new Function('container', `
          try {
            ${js}
          } catch (err) {
            console.error('Custom post JS execution error:', err);
          }
        `);
        scopedFn(containerRef.current);
      } catch (err) {
        console.error('Failed to initialize custom post script:', err);
      }
    }
  }, [html, js]);

  return (
    <div className={`custom-code-container ${className}`}>
      {css && (
        <style dangerouslySetInnerHTML={{ __html: css }} />
      )}
      <div
        ref={containerRef}
        className="custom-code-markup"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
};
