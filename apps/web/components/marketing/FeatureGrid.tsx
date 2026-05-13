'use client';

import { memo } from 'react';

const FEATURES = [
  {
    title: 'Realtime Search',
    desc: 'Pull fresh web context into prompts with source-aware research tiles.',
  },
  {
    title: 'Long Context',
    desc: 'Handle large docs and multi-step reasoning without losing thread.',
  },
  {
    title: 'Model Routing',
    desc: 'Pick the best model per task and chain outputs across your graph.',
  },
  {
    title: 'Shared Memory',
    desc: 'Keep every tile aligned on goals, facts, and intermediate results.',
  },
  {
    title: 'Execution Loop',
    desc: 'Move from ideas to code with terminal-driven iteration in the same flow.',
  },
  {
    title: 'Team Velocity',
    desc: 'Create reusable workspaces and run parallel AI workflows across projects.',
  },
];

function FeatureGridInner() {
  return (
    <section id="features" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-white/45">Capabilities</p>
          <h2 className="text-[clamp(30px,4.8vw,54px)] font-semibold leading-tight text-white">
            A workspace built for
            <span className="text-white/45"> serious AI output.</span>
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
