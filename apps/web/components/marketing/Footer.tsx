'use client';

import { memo } from 'react';
import Aurora from '@/components/marketing/Aurora';

const COLUMNS = [
  { title: 'TRY VEL ON', links: ['Web', 'iOS', 'Android', 'VEL on X'] },
  { title: 'PRODUCT', links: ['Features', 'Models', 'Pricing', 'DeepSearch'] },
  { title: 'API', links: ['Overview', 'Voice API', 'Image API', 'Pricing', 'Console', 'Docs'] },
  { title: 'COMPANY', links: ['Company', 'Careers', 'Contact', 'News'] },
  { title: 'RESOURCES', links: ['Privacy', 'Privacy Portal', 'Security', 'Safety', 'Legal', 'Status'] },
];

function FooterInner() {
  return (
    <footer className="relative mt-20 overflow-hidden border-t border-white/10 px-6 py-24">
      <div className="pointer-events-none absolute inset-0 z-0 opacity-35">
        <Aurora
          colorStops={['#d7ddd6', '#0b0909', '#edecf1']}
          blend={0.49}
          amplitude={1.0}
          speed={0.5}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/30 via-black/10 to-black/45" />
      <div className="absolute inset-x-0 bottom-[-140px] h-[360px] footer-warm-glow" />
      <div className="relative z-[2] mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-5">
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <div className="mb-4 text-xs tracking-[0.15em] text-white/50">{col.title}</div>
            <div className="space-y-3 text-[15px] text-white/88">
              {col.links.map((l) => (
                <div key={l}>{l}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </footer>
  );
}

export const Footer = memo(FooterInner);
