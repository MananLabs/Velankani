'use client';

import { memo } from 'react';

function TerminalShowcaseInner() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl space-y-8">
        <article className="rounded-[28px] border border-white/10 bg-[#050609] p-4 md:p-6">
          <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-black min-h-[520px]">
            <div className="absolute left-0 top-0 h-full w-16 border-r border-white/10 bg-white/[0.02]">
              <div className="flex h-full flex-col items-center gap-4 pt-6 text-white/60">
                {['◎', '⌕', '✎', '⋮', '◌', '↺'].map((i) => (
                  <span key={i} className="text-sm">{i}</span>
                ))}
              </div>
            </div>

            <div className="absolute right-8 top-8 text-sm text-white/50">Private</div>

            <div className="ml-20 mr-10 mt-28 text-center">
              <h3 className="text-6xl font-semibold tracking-tight text-white/95">VEL AI</h3>
              <div className="mx-auto mt-12 max-w-3xl rounded-full border border-white/10 bg-white/[0.07] px-6 py-3 text-left text-white/45">
                What do you want to know?
              </div>
              <div className="mt-5 flex justify-center gap-3 text-sm text-white/65">
                {['DeepSearch', 'Create Images', 'Personas'].map((chip) => (
                  <span key={chip} className="rounded-full border border-white/15 px-4 py-1.5">{chip}</span>
                ))}
              </div>
            </div>

            <div className="absolute bottom-0 right-0 w-[260px] sm:w-[340px]">
              <div className="rounded-t-[46px] border border-white/15 bg-black/95 p-4">
                <div className="mb-4 text-xs text-white/70">Ask | Imagine</div>
                <div className="h-56 rounded-2xl border border-white/10 bg-black/70" />
                <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.05] p-3 text-white/35">Ask anything...</div>
              </div>
            </div>
          </div>
        </article>

        <article className="grid border border-white/10 bg-black/85 md:grid-cols-2">
          <div className="border-b border-white/10 p-10 md:border-b-0 md:border-r">
            <h3 className="text-[56px] font-semibold leading-[0.95] tracking-tight text-white">
              Deep dive with
              <br />
              <span className="text-white/45">VEL Heavy</span>
            </h3>
            <p className="mt-20 max-w-xl text-[20px] leading-relaxed text-white/75">
              The most powerful run mode for long-horizon agent orchestration across your workspace.
            </p>
            <button className="mt-8 rounded-full border border-white/25 px-7 py-2 text-sm tracking-[0.2em] text-white/80">DIVE DEEP ↗</button>
          </div>

          <div className="p-10 relative">
            <div className="mx-auto max-w-xl relative">
              <div className="absolute left-1/2 top-[-34px] h-9 w-px -translate-x-1/2 bg-emerald-300/55" />
              <div className="mb-8 rounded-2xl border border-white/15 p-5">
                <div className="text-2xl font-semibold">VEL 4 Heavy</div>
                <div className="mt-4 flex items-center justify-between text-sm text-white/60">
                  <span className="text-emerald-300">● COMPLETE</span>
                  <span>RAN FOR 10 MINUTES</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {['AGENT 1', 'AGENT 2', 'AGENT 3'].map((a, i) => (
                  <div key={a} className={`rounded-xl border p-4 ${i === 1 ? 'border-emerald-300/70' : 'border-white/15'}`}>
                    <div className={`text-sm ${i === 1 ? 'text-emerald-300' : 'text-orange-300'}`}>● {a}</div>
                    <div className="mt-1 text-white/60">COMPLETE</div>
                    <div className="mt-3 text-orange-300">:::::::::::::::</div>
                  </div>
                ))}
              </div>
              <div className="mx-auto mt-8 max-w-xs rounded-xl border border-emerald-300/70 p-4 text-center text-xl">
                Thought for 10 minutes
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

export const TerminalShowcase = memo(TerminalShowcaseInner);
