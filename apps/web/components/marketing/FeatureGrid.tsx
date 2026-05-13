'use client';

import { memo } from 'react';

const FEATURES = [
  {
    title: 'Compare Answers Side-by-Side',
    desc: 'Ask once and instantly compare outputs from top AI models.',
  },
  {
    title: 'DeepSearch',
    desc: 'Get current web-backed answers with source-aware results.',
  },
  {
    title: 'Image + Audio',
    desc: 'Generate images and use voice features inside the same chat.',
  },
  {
    title: 'Long Context Chat',
    desc: 'Handle long conversations and documents without losing context.',
  },
  {
    title: 'Personas',
    desc: 'Switch between role-based assistants for writing, coding, and strategy.',
  },
  {
    title: 'One Subscription',
    desc: 'Access multiple premium models without juggling separate plans.',
  },
];

function FeatureGridInner() {
  return (
    <section id="features" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-white/45">Features</p>
          <h2 className="text-[clamp(30px,4.8vw,54px)] font-semibold leading-tight text-white">
            Everything you need for
            <span className="text-white/45"> better AI answers.</span>
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, idx) => (
            <article key={feature.title} className="feature-panel rounded-2xl border border-white/10 bg-black/55 p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[11px] tracking-[0.16em] text-white/45">0{idx + 1}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
              </div>
              <h3 className="mb-2 text-[22px] font-semibold tracking-tight text-white">{feature.title}</h3>
              <p className="text-[15px] leading-relaxed text-white/58">{feature.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export const FeatureGrid = memo(FeatureGridInner);
