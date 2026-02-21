'use client';

import React, { useEffect, useRef } from 'react';

interface TerminalLine {
  text: string;
  type?: 'info' | 'success' | 'danger' | 'warn';
  timestamp?: number;
}

interface TerminalProps {
  lines: TerminalLine[];
  title?: string;
  autoScroll?: boolean;
  maxLines?: number;
  className?: string;
}

const Terminal: React.FC<TerminalProps> = ({
  lines,
  title = 'Terminal',
  autoScroll = true,
  maxLines = 20,
  className = '',
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines, autoScroll]);

  const getTypeColor = (type?: string) => {
    switch (type) {
      case 'success':
        return 'terminal-success';
      case 'danger':
        return 'terminal-danger';
      case 'warn':
        return 'terminal-warn';
      default:
        return 'terminal-line';
    }
  };

  const displayLines = lines.slice(-maxLines);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {title && (
        <h3 className="text-sm font-mono font-semibold text-text-secondary uppercase tracking-wider">
          {title}
        </h3>
      )}
      <div
        ref={terminalRef}
        className="terminal"
      >
        {displayLines.map((line, idx) => (
          <div key={idx} className={`${getTypeColor(line.type)} text-xs`}>
            {line.timestamp && (
              <span className="text-text-tertiary mr-2">
                [{new Date(line.timestamp).toLocaleTimeString()}]
              </span>
            )}
            {line.text}
          </div>
        ))}
        {displayLines.length === 0 && (
          <div className="text-text-tertiary text-xs">
            [awaiting data...]
          </div>
        )}
      </div>
    </div>
  );
};

export default Terminal;
