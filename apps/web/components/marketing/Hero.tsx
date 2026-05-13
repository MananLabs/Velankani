'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const SWARM_ITEMS = [
  { label: 'Research Competitors', color: 'bg-emerald-400' },
  { label: 'Analyze Codebase', color: 'bg-violet-400' },
  { label: 'Deploy Infrastructure', color: 'bg-amber-400' },
  { label: 'Generate Reports', color: 'bg-sky-400' },
];

function HeroInner() {
  return (
    <section className="relative overflow-hidden px-6 pt-40 pb-24">
      <div className="grok-hero-glow" />
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-[clamp(44px,7vw,82px)] font-extrabold leading-[0.95] tracking-tight text-white">
            Infinite Canvas.
            <br />
            <span className="text-white/45">Zero limitations.</span>
          </h1>
          <p className="mt-7 max-w-3xl text-[clamp(18px,2.1vw,36px)] leading-relaxed text-white/50">
            Break out of the chat box. Orchestrate complex workflows with multi-agent consensus, live terminal execution, and persistent shared context.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/sign-up" className="rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white no-underline transition hover:bg-white/15">
              Launch App
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.12 }}
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          <article className="rounded-3xl border border-white/10 bg-black/55 p-7 md:col-span-1 bento-card">
            <div className="space-y-3">
              {SWARM_ITEMS.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3">
                  <span className="text-[15px] text-white/80">{item.label}</span>
                  <span className={`h-2.5 w-2.5 rounded-full ${item.color} shadow-[0_0_12px_currentColor]`} />
                </div>
              ))}
            </div>
            <h3 className="mt-10 text-[clamp(30px,2.6vw,35px)] font-semibold tracking-tight text-white">Autonomous Swarms</h3>
            <p className="mt-3 text-[clamp(16px,1.35vw,20px)] leading-relaxed text-white/43">
              Deploy multiple specialized agents to handle repetitive research and engineering pipelines.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-black/55 p-7 md:col-span-2 bento-card relative overflow-hidden">
            <div className="absolute inset-0 opacity-70" style={{ background: 'radial-gradient(55% 55% at 50% 0%, rgba(94,144,255,0.15) 0%, transparent 72%)' }} />
            <div className="relative min-h-[220px]">
              <svg viewBox="0 0 600 220" className="h-[220px] w-full">
                <rect x="260" y="88" width="56" height="56" rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.15)" />
                <path d="M315 116 C 390 104, 420 78, 520 54" stroke="rgba(116,151,255,0.55)" strokeDasharray="5 6" fill="none" />
                <rect x="525" y="38" width="34" height="34" rx="9" fill="rgba(86,131,255,0.08)" stroke="rgba(86,131,255,0.4)" />
                <rect x="525" y="92" width="34" height="34" rx="9" fill="rgba(149,93,255,0.08)" stroke="rgba(149,93,255,0.4)" />
                <rect x="525" y="146" width="34" height="34" rx="9" fill="rgba(255,170,74,0.08)" stroke="rgba(255,170,74,0.4)" />
              </svg>
            </div>
            <h3 className="mt-2 text-[clamp(30px,2.6vw,35px)] font-semibold tracking-tight text-white">Infinite Routing</h3>
            <p className="mt-3 max-w-3xl text-[clamp(16px,1.35vw,20px)] leading-relaxed text-white/43">
              Design complex acyclic graphs. Output from GPT-4o flows directly into Claude&apos;s context window.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-black/55 p-7 bento-card min-h-[290px] flex flex-col justify-end">
            <div className="mb-16 mx-auto h-40 w-40 rounded-full border border-white/10 bg-gradient-to-b from-white/10 to-transparent relative">
              <div className="absolute inset-5 rounded-full border border-white/10" />
              <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
            </div>
            <h3 className="text-[clamp(30px,2.6vw,35px)] font-semibold tracking-tight text-white">Shared Context</h3>
            <p className="mt-3 text-[clamp(16px,1.35vw,20px)] leading-relaxed text-white/43">
              A persistent memory store ensures all agents maintain exact situational awareness.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-black/55 p-7 bento-card min-h-[290px] flex flex-col justify-end">
            <div className="mb-10 rounded-2xl border border-white/10 bg-[#08090f] p-4 font-mono text-sm text-white/70">
              <div className="mb-2 text-white/30">terminal.tsx</div>
              <div>const agent = new DevOpsAgent();</div>
              <div>agent.deploy({`{`}</div>
              <div className="pl-3">target: 'production',</div>
              <div className="pl-3">autoFix: true</div>
              <div>{`}`});</div>
            </div>
            <h3 className="text-[clamp(30px,2.6vw,35px)] font-semibold tracking-tight text-white">Terminal Sandboxes</h3>
            <p className="mt-3 text-[clamp(16px,1.35vw,20px)] leading-relaxed text-white/43">
              Deploy agents that can write, execute, and debug bash scripts natively.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-black/55 p-7 bento-card min-h-[290px] flex flex-col justify-end">
            <div className="mb-16 flex h-40 items-center justify-center">
              <div className="flex items-end gap-2">
                {[28, 40, 24, 52, 32, 61, 36].map((h, i) => (
                  <div key={i} className="w-3 rounded-md bg-white/22" style={{ height: `${h}px` }} />
                ))}
              </div>
            </div>
            <h3 className="text-[clamp(30px,2.6vw,35px)] font-semibold tracking-tight text-white">Deep Research</h3>
            <p className="mt-3 text-[clamp(16px,1.35vw,20px)] leading-relaxed text-white/43">
              Multi-pass data extraction powered by Perplexity Sonar and continuous learning.
            </p>
          </article>
        </motion.div>
      </div>
    </section>
  );
}

export const Hero = memo(HeroInner);
