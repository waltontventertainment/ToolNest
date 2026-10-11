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

  // Extract inline <script> tags from raw HTML so Blogger-style single-box HTML+CSS+JS pastes execute properly
  const { markupWithoutScripts, extractedInlineJs } = React.useMemo(() => {
    if (!html) return { markupWithoutScripts: '', extractedInlineJs: '' };
    const inlineScripts: string[] = [];
    const cleaned = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, (_, code) => {
      if (code && code.trim()) {
        inlineScripts.push(code.trim());
      }
      return '';
    });
    return {
      markupWithoutScripts: cleaned,
      extractedInlineJs: inlineScripts.join('\n;\n')
    };
  }, [html]);

  useEffect(() => {
    if (!containerRef.current) return;

    const combinedJs = [extractedInlineJs, js].filter(Boolean).join('\n;\n');

    if (combinedJs && combinedJs.trim()) {
      try {
        const scopedFn = new Function(
          'container',
          `
          try {
            ${combinedJs}
          } catch (err) {
            console.error('Custom post JS execution error:', err);
          }
        `
        );
        scopedFn(containerRef.current);
      } catch (err) {
        console.error('Failed to initialize custom post script:', err);
      }
    }
  }, [markupWithoutScripts, extractedInlineJs, js]);

  return (
    <div className={`custom-code-container w-full overflow-x-auto ${className}`}>
      {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
      <div
        ref={containerRef}
        className="custom-code-markup"
        dangerouslySetInnerHTML={{ __html: markupWithoutScripts }}
      />
    </div>
  );
};
