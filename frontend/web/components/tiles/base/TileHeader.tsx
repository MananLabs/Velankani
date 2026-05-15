'use client';

import { memo, useState, useRef, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type StreamStatus = 'idle' | 'pending' | 'streaming' | 'complete' | 'error';

interface TileHeaderProps {
  icon: string;
  label: string;
  modelName?: string;
  modelColor?: string;
  creditCost?: number;
  status?: StreamStatus;
  children?: ReactNode;
  onClear?: () => void;
  onDuplicate?: () => void;
  onExport?: () => void;
  onDelete?: () => void;
}

function TileHeaderInner({
  icon,
  label,
  modelName,
  modelColor,
  creditCost,
  status = 'idle',
  children,
  onClear,
  onDuplicate,
  onExport,
  onDelete,
}: TileHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const statusDot = {
    idle: { color: 'var(--vel-text-muted)', label: 'idle' },
    pending: { color: 'var(--vel-warning)', label: 'pending' },
    streaming: { color: 'var(--vel-success)', label: 'streaming' },
    complete: { color: 'var(--vel-text-secondary)', label: 'done' },
    error: { color: 'var(--vel-danger)', label: 'error' },
  }[status];

  return (
    <div
      className="nodrag"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        borderBottom: '1px solid var(--vel-border-subtle)',
        gap: 8,
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        <span style={{ fontSize: 14, flexShrink: 0 }}>{icon}</span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            fontFamily: 'var(--font-body)',
            color: 'var(--vel-text)',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </span>
        {modelName && (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              color: 'var(--vel-text-secondary)',
              background: 'var(--vel-card)',
              padding: '2px 8px',
              borderRadius: 4,
              whiteSpace: 'nowrap',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: modelColor || 'var(--vel-violet)',
                flexShrink: 0,
              }}
            />
            {modelName}
          </span>
        )}
        {status !== 'idle' && (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 10,
              color: statusDot.color,
            }}
          >
            <motion.span
              animate={
                status === 'streaming'
                  ? { opacity: [1, 0.3, 1] }
                  : { opacity: 1 }
              }
              transition={
                status === 'streaming'
                  ? { duration: 1.2, repeat: Infinity }
                  : undefined
              }
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: statusDot.color,
              }}
            />
            {statusDot.label}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {children}
        {creditCost !== undefined && (
          <span
            style={{
              fontSize: 10,
              color: 'var(--vel-text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {creditCost}cr
          </span>
        )}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--vel-text-muted)',
              cursor: 'pointer',
              padding: '2px 4px',
              fontSize: 14,
              borderRadius: 4,
              transition: 'color 150ms',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = 'var(--vel-text)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = 'var(--vel-text-muted)')
            }
          >
            ⋯
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.12 }}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: 4,
                  background: 'var(--vel-card-elevated)',
                  border: '1px solid var(--vel-border)',
                  borderRadius: 8,
                  padding: 4,
                  minWidth: 160,
                  zIndex: 50,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                }}
              >
                {onDuplicate && (
                  <MenuItem
                    label="Duplicate"
                    onClick={() => {
                      onDuplicate();
                      setMenuOpen(false);
                    }}
                  />
                )}
                {onExport && (
                  <MenuItem
                    label="Export as Markdown"
                    onClick={() => {
                      onExport();
                      setMenuOpen(false);
                    }}
                  />
                )}
                {onClear && (
                  <MenuItem
                    label="Clear history"
                    onClick={() => {
                      onClear();
                      setMenuOpen(false);
                    }}
                  />
                )}
                {onDelete && (
                  <>
                    <div
                      style={{
                        height: 1,
                        background: 'var(--vel-border-subtle)',
                        margin: '4px 0',
                      }}
                    />
                    <MenuItem
                      label="Delete tile"
                      destructive
                      onClick={() => {
                        onDelete();
                        setMenuOpen(false);
                      }}
                    />
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function MenuItem({
  label,
  destructive,
  onClick,
}: {
  label: string;
  destructive?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        padding: '6px 10px',
        fontSize: 12,
        fontFamily: 'var(--font-body)',
        color: destructive ? 'var(--vel-danger)' : 'var(--vel-text-secondary)',
        background: 'transparent',
        border: 'none',
        borderRadius: 4,
        cursor: 'pointer',
        transition: 'background 100ms, color 100ms',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = destructive
          ? 'var(--vel-danger-alpha)'
          : 'var(--vel-violet-alpha-12)';
        e.currentTarget.style.color = destructive
          ? 'var(--vel-danger)'
          : 'var(--vel-text)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = destructive
          ? 'var(--vel-danger)'
          : 'var(--vel-text-secondary)';
      }}
    >
      {label}
    </button>
  );
}

export const TileHeader = memo(TileHeaderInner);
