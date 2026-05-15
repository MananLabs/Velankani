'use client';

import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/motion';
import Image from 'next/image';

interface Workspace {
  id: string;
  name: string;
  tileCount?: number;
  updatedAt?: string;
}

interface WorkspaceSidebarProps {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  onSelectWorkspace: (id: string) => void;
  onCreateWorkspace: () => void;
  onRenameWorkspace?: (id: string, name: string) => void;
  onDeleteWorkspace?: (id: string) => void;
  creditsRemaining?: number;
  plan?: string;
  userName?: string;
}

const TEMPLATES = [
  { id: 'research', name: 'Research Setup', icon: '🔍', description: '2 AI tiles + Consensus' },
  { id: 'code-review', name: 'Code Review', icon: '💻', description: '2 AI tiles + Terminal' },
  { id: 'content', name: 'Content Pipeline', icon: '📝', description: '3 AI tiles in sequence' },
];

function WorkspaceSidebarInner({
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onCreateWorkspace,
  onRenameWorkspace,
  onDeleteWorkspace,
  creditsRemaining = 0,
  plan = 'free',
  userName,
}: WorkspaceSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const startRename = (ws: Workspace) => {
    setEditingId(ws.id);
    setEditValue(ws.name);
  };

  const commitRename = () => {
    if (editingId && editValue.trim() && onRenameWorkspace) {
      onRenameWorkspace(editingId, editValue.trim());
    }
    setEditingId(null);
  };

  return (
    <div
      style={{
        width: 240,
        height: '100vh',
        background: 'var(--vel-surface)',
        borderRight: '1px solid var(--vel-border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '16px 16px 12px',
          borderBottom: '1px solid var(--vel-border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Image src="/logo.avif" alt="VEL AI logo" width={24} height={24} />
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 16,
              color: 'var(--vel-text)',
              letterSpacing: '-0.02em',
            }}
          >
            VEL AI
          </span>
        </div>
      </div>

      {/* Create */}
      <div style={{ padding: '12px 12px 8px' }}>
        <button
          onClick={onCreateWorkspace}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            background: 'var(--vel-violet-alpha-12)',
            border: '1px solid rgba(124, 58, 237, 0.2)',
            borderRadius: 8,
            color: 'var(--vel-violet-bright)',
            fontSize: 12,
            fontWeight: 500,
            fontFamily: 'var(--font-body)',
            cursor: 'pointer',
            transition: 'all 150ms',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--vel-violet-alpha-20)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--vel-violet-alpha-12)';
          }}
        >
          <span style={{ fontSize: 14 }}>+</span>
          New Workspace
        </button>
      </div>

      {/* Workspace List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px' }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: 'var(--vel-text-muted)',
            padding: '8px 8px 4px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          Workspaces
        </div>
        <motion.div variants={staggerContainer} initial="initial" animate="animate">
          {workspaces.map((ws) => (
            <motion.div key={ws.id} variants={fadeIn}>
              {editingId === ws.id ? (
                <input
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitRename();
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    background: 'var(--vel-card)',
                    border: '1px solid var(--vel-violet)',
                    borderRadius: 6,
                    color: 'var(--vel-text)',
                    fontSize: 12,
                    fontFamily: 'var(--font-body)',
                    outline: 'none',
                  }}
                />
              ) : (
                <button
                  onClick={() => onSelectWorkspace(ws.id)}
                  onDoubleClick={() => startRename(ws)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '7px 8px',
                    background:
                      activeWorkspaceId === ws.id
                        ? 'var(--vel-violet-alpha-12)'
                        : 'transparent',
                    border: 'none',
                    borderRadius: 6,
                    color:
                      activeWorkspaceId === ws.id
                        ? 'var(--vel-text)'
                        : 'var(--vel-text-secondary)',
                    fontSize: 12,
                    fontFamily: 'var(--font-body)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 100ms',
                  }}
                  onMouseEnter={(e) => {
                    if (activeWorkspaceId !== ws.id) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeWorkspaceId !== ws.id) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background:
                        activeWorkspaceId === ws.id
                          ? 'var(--vel-violet)'
                          : 'var(--vel-border)',
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {ws.name}
                  </span>
                </button>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Templates */}
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: 'var(--vel-text-muted)',
            padding: '16px 8px 4px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          Templates
        </div>
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '7px 8px',
              background: 'transparent',
              border: 'none',
              borderRadius: 6,
              color: 'var(--vel-text-muted)',
              fontSize: 12,
              fontFamily: 'var(--font-body)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 100ms',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
              e.currentTarget.style.color = 'var(--vel-text-secondary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--vel-text-muted)';
            }}
          >
            <span style={{ fontSize: 13 }}>{t.icon}</span>
            {t.name}
          </button>
        ))}
      </div>

      {/* User Area */}
      <div
        style={{
          borderTop: '1px solid var(--vel-border-subtle)',
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: 11, color: 'var(--vel-text-secondary)' }}>
            {userName || 'User'}
          </span>
          <span
            style={{
              fontSize: 10,
              color: 'var(--vel-violet-bright)',
              background: 'var(--vel-violet-alpha-12)',
              padding: '2px 6px',
              borderRadius: 4,
              textTransform: 'uppercase',
              fontWeight: 600,
              letterSpacing: '0.04em',
            }}
          >
            {plan}
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 12,
            fontFamily: 'var(--font-mono)',
            color:
              creditsRemaining < 50
                ? 'var(--vel-danger)'
                : creditsRemaining < 200
                  ? 'var(--vel-warning)'
                  : 'var(--vel-text-secondary)',
          }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background:
                creditsRemaining < 50
                  ? 'var(--vel-danger)'
                  : creditsRemaining < 200
                    ? 'var(--vel-warning)'
                    : 'var(--vel-success)',
            }}
          />
          {creditsRemaining.toLocaleString()} credits
        </div>
      </div>
    </div>
  );
}

export const WorkspaceSidebar = memo(WorkspaceSidebarInner);
