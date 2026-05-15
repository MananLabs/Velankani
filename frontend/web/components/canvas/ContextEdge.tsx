'use client';

import {
  EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
} from 'reactflow';

export function ContextEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const isActive = data?.active as boolean | undefined;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: selected
            ? 'rgba(109, 95, 255, 0.9)'
            : isActive
              ? 'rgba(109, 95, 255, 0.7)'
              : 'rgba(109, 95, 255, 0.4)',
          strokeWidth: selected ? 2 : 1.5,
          strokeDasharray: isActive ? '5 5' : undefined,
          animation: isActive
            ? 'context-flow 0.6s linear infinite'
            : undefined,
        }}
        interactionWidth={20}
      />

      <EdgeLabelRenderer>
        {selected && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <div
              style={{
                background: 'rgba(109, 95, 255, 0.15)',
                border: '1px solid rgba(109, 95, 255, 0.4)',
                borderRadius: 6,
                padding: '3px 8px',
                fontSize: 11,
                color: '#A78BFA',
                fontFamily: 'DM Sans, sans-serif',
                whiteSpace: 'nowrap',
              }}
            >
              Context →{' '}
              {(data?.tokenCount as number)
                ? `${data?.tokenCount} tokens`
                : 'Connected'}
            </div>
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
}
