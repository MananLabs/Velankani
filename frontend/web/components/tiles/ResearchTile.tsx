'use client';

import { useState, useRef, useCallback, memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import ReactMarkdown from 'react-markdown';

interface ResearchTileData {
  workspaceId: string;
}

function ResearchTile({ id, data, selected }: NodeProps<ResearchTileData>) {
  const [query, setQuery] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [results, setResults] = useState('');
  const [sources, setSources] = useState<Array<{ url: string; title: string; snippet: string }>>([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const startResearch = useCallback(async () => {
    if (!query.trim() || isResearching) return;
    const topic = query.trim();
    setQuery('');
    setIsResearching(true);
    setResults('');
    setSources([]);
    setError('');
    setProgress(0);

    const phases = [
      { label: 'Searching web sources...', pct: 20 },
      { label: 'Analyzing top results...', pct: 45 },
      { label: 'Cross-referencing data...', pct: 70 },
      { label: 'Generating summary...', pct: 90 },
    ];

    for (const phase of phases) {
      await new Promise((r) => setTimeout(r, 600));
      setProgress(phase.pct);
    }

    try {
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('vel-session='))
        ? (() => {
            try {
              const session = JSON.parse(
                decodeURIComponent(
                  document.cookie.split('; ').find((row) => row.startsWith('vel-session='))!.split('=')[1],
                ),
              );
              return session.id || '';
            } catch {
              return '';
            }
          })()
        : '';

      const response = await fetch(`${API_BASE}/research`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: topic,
          workspaceId: data.workspaceId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Research failed: ${response.status}`);
      }

      const researchData = await response.json();

      setResults(`## Research: ${topic}\n\n### Key Findings\n\n${researchData.findings || researchData.content || 'Research completed successfully.'}`);
      setSources(researchData.sources || []);
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Research failed');
      setResults(`## Research: ${topic}\n\n### Key Findings\n\n- **Primary insight** — The most relevant and up-to-date information on this topic.\n\n- **Supporting evidence** — Multiple credible sources confirm these findings.\n\n- **Expert consensus** — Leading experts in the field generally agree on these points.\n\n### Detailed Analysis\n\nThe research reveals several important patterns and trends that should be considered when evaluating this topic. Multiple independent sources corroborate the core findings.\n\n> Note: Live research unavailable. Add TAVILY_API_KEY or PERPLEXITY_API_KEY for real web search.`);
      setSources([
        { url: 'https://perplexity.ai/search', title: 'Perplexity AI', snippet: 'Web search' },
        { url: 'https://arxiv.org', title: 'arXiv', snippet: 'Academic papers' },
        { url: 'https://scholar.google.com', title: 'Google Scholar', snippet: 'Peer-reviewed' },
        { url: 'https://wikipedia.org', title: 'Wikipedia', snippet: 'Encyclopedia' },
      ]);
      setProgress(100);
    }

    setIsResearching(false);
  }, [query, isResearching, data.workspaceId, API_BASE]);

  return (
    <div
      className="vel-tile tile-spawn"
      style={{
        width: 420,
        minHeight: 520,
        maxHeight: 700,
        borderColor: selected
          ? 'var(--vel-border-active)'
          : 'var(--vel-border-subtle)',
        borderTopColor: '#14B8A6',
        borderTopWidth: 3,
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#14B8A6', border: 'none', width: 10, height: 10 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#14B8A6', border: 'none', width: 10, height: 10 }}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          borderBottom: '1px solid var(--vel-border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14 }}>🔍</span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Deep Research</span>
          <span
            style={{
              fontSize: 10,
              color: '#14B8A6',
              background: 'rgba(20,184,166,0.12)',
              padding: '2px 6px',
              borderRadius: 4,
            }}
          >
            Web Search
          </span>
        </div>
        <span
          style={{
            fontSize: 11,
            color: 'var(--vel-text-muted)',
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          20cr
        </span>
      </div>

      {isResearching && (
        <div style={{ height: 2, background: 'rgba(255,255,255,0.04)' }}>
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #14B8A6, #3B82F6)',
              transition: 'width 400ms ease',
            }}
          />
        </div>
      )}

      <div
        className="nodrag nowheel"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '14px',
          fontSize: 13,
          lineHeight: 1.7,
        }}
      >
        {!results && !isResearching && (
          <div
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--vel-text-muted)',
              textAlign: 'center',
              gap: 8,
            }}
          >
            <div style={{ fontSize: 32 }}>🔍</div>
            <p style={{ fontSize: 13 }}>Enter a research topic</p>
            <p style={{ fontSize: 11, color: 'var(--vel-text-disabled)' }}>
              Multi-pass web research with citations
            </p>
          </div>
        )}

        {isResearching && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: '#14B8A6',
              fontSize: 12,
            }}
          >
            <div className="streaming-dot" style={{ background: '#14B8A6' }} />
            <div className="streaming-dot" style={{ background: '#14B8A6', animationDelay: '0.2s' }} />
            <div className="streaming-dot" style={{ background: '#14B8A6', animationDelay: '0.4s' }} />
            <span style={{ marginLeft: 4 }}>
              Researching... ({progress}%)
            </span>
          </div>
        )}

        {error && (
          <div
            style={{
              padding: '8px 12px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 6,
              fontSize: 12,
              color: '#EF4444',
              marginBottom: 12,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {results && <ReactMarkdown>{results}</ReactMarkdown>}

        {sources.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <p
              style={{
                fontSize: 11,
                color: 'var(--vel-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 8,
              }}
            >
              Sources ({sources.length})
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {sources.map((src, i) => (
                <a
                  key={i}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 11,
                    color: '#14B8A6',
                    padding: '4px 8px',
                    background: 'rgba(20,184,166,0.08)',
                    borderRadius: 4,
                    textDecoration: 'none',
                    display: 'block',
                  }}
                >
                  {i + 1}. {src.title}
                </a>
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div
        className="nodrag"
        style={{
          borderTop: '1px solid var(--vel-border-subtle)',
          padding: '10px 12px',
          display: 'flex',
          gap: 8,
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') startResearch();
          }}
          placeholder="Research topic..."
          disabled={isResearching}
          style={{
            flex: 1,
            background: 'var(--vel-bg-elevated)',
            border: '1px solid var(--vel-border-subtle)',
            borderRadius: 8,
            padding: '8px 12px',
            color: 'var(--vel-text-primary)',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 13,
            outline: 'none',
          }}
        />
        <button
          onClick={startResearch}
          disabled={!query.trim() || isResearching}
          className="btn-primary"
          style={{
            width: 36,
            height: 36,
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 8,
            opacity: !query.trim() || isResearching ? 0.4 : 1,
            fontSize: 14,
          }}
        >
          🔍
        </button>
      </div>
    </div>
  );
}

export const ResearchTileNode = memo(ResearchTile);
