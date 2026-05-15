'use client';

import { memo, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { useStreamingStore } from '@/lib/stores/streaming.store';

interface StreamingTextProps {
  tileId: string;
  fallbackContent?: string;
}

function StreamingTextInner({ tileId, fallbackContent }: StreamingTextProps) {
  const stream = useStreamingStore((s) => s.streams[tileId]);
  const status = stream?.status || 'idle';
  const content = stream?.content || fallbackContent || '';

  const isActive = status === 'streaming' || status === 'pending';

  const markdownComponents = useMemo(
    () => ({
      p: ({ children }: { children?: React.ReactNode }) => (
        <p style={{ margin: '0.5em 0', lineHeight: 1.7 }}>{children}</p>
      ),
      code: ({
        className,
        children,
      }: {
        className?: string;
        children?: React.ReactNode;
      }) => {
        const isInline = !className;
        if (isInline) {
          return (
            <code
              style={{
                background: 'var(--vel-card)',
                padding: '2px 6px',
                borderRadius: 4,
                fontSize: '0.88em',
                fontFamily: 'var(--font-mono)',
                color: 'var(--vel-violet-bright)',
              }}
            >
              {children}
            </code>
          );
        }
        return (
          <pre
            style={{
              background: 'var(--vel-black)',
              border: '1px solid var(--vel-border-subtle)',
              borderRadius: 8,
              padding: '12px 16px',
              overflowX: 'auto',
              margin: '8px 0',
              fontSize: '0.85em',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <code>{children}</code>
          </pre>
        );
      },
      strong: ({ children }: { children?: React.ReactNode }) => (
        <strong style={{ color: 'var(--vel-text)', fontWeight: 600 }}>
          {children}
        </strong>
      ),
      ul: ({ children }: { children?: React.ReactNode }) => (
        <ul style={{ paddingLeft: 20, margin: '4px 0' }}>{children}</ul>
      ),
      ol: ({ children }: { children?: React.ReactNode }) => (
        <ol style={{ paddingLeft: 20, margin: '4px 0' }}>{children}</ol>
      ),
      li: ({ children }: { children?: React.ReactNode }) => (
        <li style={{ margin: '2px 0' }}>{children}</li>
      ),
      h1: ({ children }: { children?: React.ReactNode }) => (
        <h1
          style={{
            fontSize: '1.25em',
            fontWeight: 700,
            margin: '12px 0 6px',
            fontFamily: 'var(--font-display)',
          }}
        >
          {children}
        </h1>
      ),
      h2: ({ children }: { children?: React.ReactNode }) => (
        <h2
          style={{
            fontSize: '1.1em',
            fontWeight: 700,
            margin: '10px 0 4px',
            fontFamily: 'var(--font-display)',
          }}
        >
          {children}
        </h2>
      ),
      h3: ({ children }: { children?: React.ReactNode }) => (
        <h3
          style={{
            fontSize: '1em',
            fontWeight: 600,
            margin: '8px 0 4px',
            fontFamily: 'var(--font-display)',
          }}
        >
          {children}
        </h3>
      ),
      blockquote: ({ children }: { children?: React.ReactNode }) => (
        <blockquote
          style={{
            borderLeft: '3px solid var(--vel-violet)',
            paddingLeft: 12,
            margin: '8px 0',
            color: 'var(--vel-text-secondary)',
          }}
        >
          {children}
        </blockquote>
      ),
    }),
    [],
  );

  if (!content && !isActive) return null;

  return (
    <div
      style={{
        fontSize: 13,
        lineHeight: 1.7,
        color: 'var(--vel-text)',
        wordBreak: 'break-word',
      }}
    >
      <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
      {isActive && <span className="streaming-cursor" />}
    </div>
  );
}

export const StreamingText = memo(StreamingTextInner);
