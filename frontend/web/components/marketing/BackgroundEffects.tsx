'use client';

import { memo } from 'react';

function BackgroundEffectsInner() {
  return (
    <>
      <div className="fixed inset-0 -z-10 pointer-events-none grok-page-bg" />
      <div className="fixed inset-0 -z-10 pointer-events-none grok-grid-overlay" />
    </>
  );
}

export const BackgroundEffects = memo(BackgroundEffectsInner);
