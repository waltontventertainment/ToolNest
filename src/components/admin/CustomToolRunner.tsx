import React, { useState } from 'react';
import { Maximize2, Minimize2, ExternalLink, Code } from 'lucide-react';

interface CustomToolRunnerProps {
  customHtml: string;
  name: string;
  description?: string;
}

export const CustomToolRunner: React.FC<CustomToolRunnerProps> = ({
  customHtml,
  name,
  description,
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Sandboxed HTML document embedding Toolzaro's clean styling base
  const docHtml = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${name}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 16px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Plus Jakarta Sans", sans-serif;
            color: #1e1b4b;
            background-color: transparent;
            font-size: 14px;
            line-height: 1.5;
          }
          @media (prefers-color-scheme: dark) {
            body {
              color: #f1f5f9;
            }
          }
          input, textarea, select, button {
            font-family: inherit;
            font-size: 14px;
          }
          button {
            cursor: pointer;
          }
        </style>
      </head>
      <body>
        ${customHtml}
      </body>
    </html>
  `;

  return (
    <div
      className={`relative bg-card rounded-2xl border border-border shadow-2xs overflow-hidden transition-all duration-200 ${
        isFullScreen ? 'fixed inset-0 z-50 rounded-none border-0' : 'w-full min-h-[500px]'
      }`}
    >
      {/* Header bar */}
      <div className="h-12 border-b border-border bg-muted/30 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm text-foreground">{name}</span>
          {description && (
            <span className="text-xs text-muted-foreground hidden sm:inline truncate max-w-xs">
              • {description}
            </span>
          )}
        </div>

        <button
          onClick={() => setIsFullScreen(!isFullScreen)}
          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs font-medium transition-colors"
          title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
        >
          {isFullScreen ? (
            <>
              <Minimize2 className="w-4 h-4" />
              <span className="hidden sm:inline">Exit Fullscreen</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-4 h-4" />
              <span className="hidden sm:inline">Fullscreen</span>
            </>
          )}
        </button>
      </div>

      {/* Sandboxed responsive iframe */}
      <iframe
        srcDoc={docHtml}
        title={name}
        sandbox="allow-scripts allow-forms allow-popups allow-modals"
        className="w-full h-[calc(100%-3rem)] min-h-[460px] border-0"
      />
    </div>
  );
};
