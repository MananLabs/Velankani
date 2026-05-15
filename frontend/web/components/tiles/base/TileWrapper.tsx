'use client';

import { memo, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Handle, Position, NodeResizer } from 'reactflow';
import { tileEntrance } from '@/lib/motion';

interface TileWrapperProps {
  id: string;
  selected: boolean;
  width?: number;
  minWidth?: number;
  minHeight?: number;
  accentColor?: string;
  children: ReactNode;
}

function TileWrapperInner({
  id,
  selected,
  width = 400,
  minWidth = 320,
  minHeight = 400,
  accentColor,
  children,
}: TileWrapperProps) {
  return (
    <motion.div
      variants={tileEntrance}
      initial="initial"
      animate="animate"
      exit="exit"
      className="vel-tile"
      style={{
        width,
        minHeight,
        borderColor: selected
          ? 'rgba(124, 58, 237, 0.5)'
          : 'var(--vel-border-subtle)',
        boxShadow: selected
          ? 'var(--vel-tile-shadow-active)'
          : 'var(--vel-tile-shadow)',
        ...(accentColor && {
          borderTopWidth: 2,
          borderTopColor: accentColor,
        }),
      }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={minWidth}
        minHeight={minHeight}
        lineStyle={{
          borderColor: 'rgba(124, 58, 237, 0.3)',
          borderWidth: 1,
        }}
        handleStyle={{
          backgroundColor: '#7C3AED',
          border: '2px solid #111111',
          width: 8,
          height: 8,
          borderRadius: 2,
        }}
      />
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: '#7C3AED',
          border: '2px solid #111111',
          width: 10,
          height: 10,
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: '#7C3AED',
          border: '2px solid #111111',
          width: 10,
          height: 10,
        }}
      />
      {children}
    </motion.div>
  );
}

export const TileWrapper = memo(TileWrapperInner);
