'use client';

import { memo } from 'react';
import { CAPABILITY_SHOWCASE_ITEMS } from './data';
import { CapabilityCard } from './CapabilityCard';

function CapabilityShowcaseInner() {
  return (
    <section className="px-6 pb-24 pt-12 md:pt-16" aria-label="Capabilities">
      <div className="mx-auto max-w-[1720px]">
        <div className="capability-grid grid grid-cols-1 gap-6 xl:grid-cols-3">
          {CAPABILITY_SHOWCASE_ITEMS.map((item) => (
            <CapabilityCard key={item.title} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

export const CapabilityShowcase = memo(CapabilityShowcaseInner);
