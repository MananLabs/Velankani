'use client';

import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '@/lib/hooks/useAuth';
import { v4 as uuidv4 } from 'uuid';

interface ConsensusTileData {
  workspaceId: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

type ModelKey = 'claude' | 'gpt' | 'gemini';
type ModelStatus = 'idle' | 'streaming' | 'complete' | 'error';

const MODELS: { label: string; key: ModelKey; color: string; icon: string }[] = [
  { label: 'Claude', key: 'claude', color: '#8B5CF6', icon: '◆' },
  { label: 'GPT-4o', key: 'gpt', color: '#10B981', icon: '●' },
  { label: 'Gemini', key: 'gemini', color: '#3B82F6', icon: '◈' },
];

function ConsensusTile({ id, data, selected }: NodeProps<ConsensusTileData>) {
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [synthesis, setSynthesis] = useState('');
  const [modelStatus, setModelStatus] = useState<Record<ModelKey, ModelStatus>>({
    claude: 'idle', gpt: 'idle', gemini: 'idle',
  });
  const [synthStreaming, setSynthStreaming] = useState(false);
  const [activeTab, setActiveTab] = useState<ModelKey | 'synthesis'>('claude');
  const contentRef = useRef<HTMLDivElement>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    contentRef.current?.scrollTo({ top: contentRef.current.scrollHeight, behavior: 'smooth' });
  }, [responses, synthesis]);

  const sendConsensus = useCallback(async () => {
    if (!input.trim() || isStreaming) return;
    const prompt = input.trim();
    setInput('');
    setIsStreaming(true);
    setResponses({});
    setSynthesis('');
    setModelStatus({ claude: 'streaming', gpt: 'streaming', gemini: 'streaming' });
    setSynthStreaming(false);

    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE}/ai/consensus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ prompt, workspaceId: data.workspaceId, tileId: id, requestId: uuidv4() }),
      });

      if (!response.ok) throw new Error(`Request failed: ${response.status}`);
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;
          const eventData = trimmed.slice(6);
          if (eventData === '[DONE]') continue;

          try {
            const p = JSON.parse(eventData);
            if (p.type === 'delta' && p.model) {
              setResponses((prev) => ({ ...prev, [p.model]: (prev[p.model] || '') + (p.content || '') }));
            } else if (p.type === 'error' && p.model) {
              setModelStatus((prev) => ({ ...prev, [p.model]: 'error' as ModelStatus }));
              setResponses((prev) => ({ ...prev, [p.model]: `⚠️ ${p.message}` }));
            } else if (p.type === 'synthesis_start') {
              setModelStatus((prev) => {
                const u = { ...prev };
                for (const k of Object.keys(u) as ModelKey[]) if (u[k] === 'streaming') u[k] = 'complete';
                return u;
              });
              setSynthStreaming(true);
              setActiveTab('synthesis');
            } else if (p.type === 'synthesis_delta') {
              setSynthesis((prev) => prev + (p.content || ''));
            } else if (p.type === 'done') {
              setModelStatus((prev) => {
                const u = { ...prev };
                for (const k of Object.keys(u) as ModelKey[]) if (u[k] === 'streaming') u[k] = 'complete';
                return u;
              });
              setSynthStreaming(false);
              setIsStreaming(false);
            }
          } catch { /* skip malformed */ }
        }
      }
      reader.releaseLock();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setModelStatus({ claude: 'error', gpt: 'error', gemini: 'error' });
      setResponses({ claude: `⚠️ ${msg}`, gpt: `⚠️ ${msg}`, gemini: `⚠️ ${msg}` });
      setIsStreaming(false);
    }
  }, [input, isStreaming, getToken, data.workspaceId, id]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendConsensus(); }
  };

  const currentContent = activeTab === 'synthesis' ? synthesis : responses[activeTab] || '';

  const statusDot = (s: ModelStatus) => {
    if (s === 'streaming') return <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7C3AED', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />;
    if (s === 'complete') return <span style={{ color: '#22C55E', fontSize: 10 }}>✓</span>;
    if (s === 'error') return <span style={{ color: '#EF4444', fontSize: 10 }}>✕</span>;
    return null;
  };

  const isTabStreaming = activeTab !== 'synthesis'
    ? modelStatus[activeTab as ModelKey] === 'streaming'
    : synthStreaming;

  return (
    <div className="vel-tile tile-spawn" style={{ width: 640, minHeight: 520, maxHeight: 720, borderColor: selected ? 'var(--vel-violet-bright)' : 'var(--vel-border-subtle)', borderTopWidth: 3, borderTopColor: '#7C3AED', boxShadow: selected ? 'var(--shadow-tile), 0 0 32px rgba(124,58,237,0.15)' : 'var(--shadow-tile)' }}>
      <Handle type="target" position={Position.Left} style={{ background: '#7C3AED', border: 'none', width: 10, height: 10 }} />
      <Handle type="source" position={Position.Right} style={{ background: '#7C3AED', border: 'none', width: 10, height: 10 }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid var(--vel-border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>⚡</span>
          <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-heading)' }}>Consensus Mode</span>
          <span style={{ fontSize: 10, color: '#7C3AED', background: 'rgba(124,58,237,0.1)', padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--font-mono)' }}>3 models</span>
        </div>
        <span style={{ fontSize: 11, color: 'var(--vel-text-muted)', fontFamily: 'var(--font-mono)' }}>19cr</span>
      </div>

      {/* Model tabs */}
      <div style={{ display: 'flex', gap: 2, padding: '6px 8px', borderBottom: '1px solid var(--vel-border-subtle)' }}>
        {MODELS.map((m) => (
          <button key={m.key} onClick={() => setActiveTab(m.key)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '6px 0', background: activeTab === m.key ? `${m.color}15` : 'transparent', border: `1px solid ${activeTab === m.key ? `${m.color}40` : 'transparent'}`, borderRadius: 6, color: activeTab === m.key ? 'var(--vel-text-primary)' : 'var(--vel-text-muted)', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-body)', transition: 'all 150ms' }}>
            <span style={{ color: m.color, fontSize: 10 }}>{m.icon}</span>
            {m.label}
            {statusDot(modelStatus[m.key])}
          </button>
        ))}
        <button onClick={() => setActiveTab('synthesis')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '6px 0', background: activeTab === 'synthesis' ? 'rgba(124,58,237,0.1)' : 'transparent', border: `1px solid ${activeTab === 'synthesis' ? 'rgba(124,58,237,0.3)' : 'transparent'}`, borderRadius: 6, color: activeTab === 'synthesis' ? '#7C3AED' : 'var(--vel-text-muted)', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-body)', fontWeight: 600, transition: 'all 150ms' }}>
          🎯 Synthesis
          {synthStreaming && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7C3AED', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />}
        </button>
      </div>

      {/* Content */}
      <div ref={contentRef} className="nodrag nowheel" style={{ flex: 1, overflowY: 'auto', padding: 14, fontSize: 13, lineHeight: 1.7 }}>
        {!currentContent && !isStreaming && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--vel-text-muted)', textAlign: 'center', gap: 8 }}>
            <div style={{ fontSize: 32 }}>⚡</div>
            <p style={{ fontSize: 13 }}>Ask a question to compare 3 AI models</p>
            <p style={{ fontSize: 11, color: 'var(--vel-text-disabled)' }}>Claude + GPT-4o + Gemini → AI Synthesis</p>
          </div>
        )}
        {isStreaming && !currentContent && (
          <div style={{ display: 'flex', gap: 4, padding: '6px 0', alignItems: 'center' }}>
            {[0, 1, 2].map((j) => (<div key={j} className="streaming-dot" style={{ background: MODELS.find((m) => m.key === activeTab)?.color || '#7C3AED', animationDelay: `${j * 0.2}s` }} />))}
            <span style={{ fontSize: 11, color: 'var(--vel-text-muted)', marginLeft: 8 }}>
              {activeTab === 'synthesis' ? 'Synthesizing...' : `${MODELS.find((m) => m.key === activeTab)?.label} is thinking...`}
            </span>
          </div>
        )}
        {currentContent && <ReactMarkdown>{currentContent}</ReactMarkdown>}
        {isTabStreaming && currentContent && (
          <span style={{ display: 'inline-block', width: 2, height: 16, background: '#7C3AED', marginLeft: 2, animation: 'blink 1s step-end infinite', verticalAlign: 'text-bottom' }} />
        )}
      </div>

      {/* Input */}
      <div className="nodrag" style={{ borderTop: '1px solid var(--vel-border-subtle)', padding: '10px 12px', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask all 3 models..." rows={1} disabled={isStreaming} style={{ flex: 1, background: 'var(--vel-card)', border: '1px solid var(--vel-border-subtle)', borderRadius: 8, padding: '8px 12px', color: 'var(--vel-text-primary)', fontFamily: 'var(--font-body)', fontSize: 13, resize: 'none', outline: 'none', minHeight: 36 }} />
        <button onClick={sendConsensus} disabled={!input.trim() || isStreaming} className="btn-primary" style={{ width: 36, height: 36, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, opacity: !input.trim() || isStreaming ? 0.4 : 1, fontSize: 14 }}>⚡</button>
      </div>
    </div>
  );
}

export const ConsensusTileNode = memo(ConsensusTile);
