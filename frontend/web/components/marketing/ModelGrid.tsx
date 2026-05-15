'use client';

import { memo } from 'react';

const MODELS = [
  { name: 'Claude Sonnet', provider: 'Anthropic', tier: 'Included' },
  { name: 'GPT-4o', provider: 'OpenAI', tier: 'Pro' },
  { name: 'Gemini Flash', provider: 'Google', tier: 'Included' },
  { name: 'Grok', provider: 'xAI', tier: 'Included' },
  { name: 'Llama 3.3', provider: 'Meta', tier: 'Included' },
  { name: 'Qwen Coder', provider: 'Qwen', tier: 'Included' },
  { name: 'Sonar', provider: 'Perplexity', tier: 'Included' },
  { name: 'Hermes', provider: 'Nous', tier: 'Included' },
];

function ModelGridInner() {
  return (
    <section id="models" className="border-y border-white/10 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.18em] text-sky-300/80">Models</p>
          <h2 className="text-[clamp(30px,4.8vw,52px)] font-bold text-white">Use the best model for each question.</h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {MODELS.map((m) => (
            <div key={m.name} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-sm font-semibold text-white">{m.name}</div>
              <div className="mt-1 text-xs text-white/55">{m.provider}</div>
              <div className="mt-3 text-xs font-medium text-sky-200/90">{m.tier}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export const ModelGrid = memo(ModelGridInner);
