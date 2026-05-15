'use client';

import { memo } from 'react';

interface TileContextBadgeProps {
  count: number;
  sourceNames?: string[];
}

function TileContextBadgeInner({ count, sourceNames = [] }: TileContextBadgeProps) {
  if (count === 0) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 12px',
        borderBottom: '1px solid var(--vel-border-subtle)',
        background: 'rgba(124, 58, 237, 0.06)',
        fontSize: 11,
        color: 'var(--vel-violet-bright)',
        fontFamily: 'var(--font-body)',
      }}
      title={
        sourceNames.length > 0
          ? `Context from: ${sourceNames.join(', ')}`
          : `${count} context source${count > 1 ? 's' : ''}`
      }
    >
      <span style={{ fontSize: 10 }}>←</span>
      <span>{count} context source{count > 1 ? 's' : ''}</span>
    </div>
  );
}

export const TileContextBadge = memo(TileContextBadgeInner);
