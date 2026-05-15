'use client';

import { memo } from 'react';
import Link from 'next/link';

function FinalCtaInner() {
  return (
    <section className="px-6 py-24">
      <div className="final-cta-shell mx-auto max-w-5xl rounded-[28px] border border-white/10 px-8 py-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 final-cta-noise" />
        <div className="relative">
          <h2 className="text-[clamp(30px,4.8vw,56px)] font-semibold leading-[1.02] text-white tracking-tight">
            Stop tab-switching.
            <br />
            <span className="text-white/45">Start orchestrating.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-[17px] leading-relaxed text-white/62">
            Bring your full AI workflow into one production-grade workspace and execute faster with context-aware agents.
          </p>
          <div className="mt-9 flex items-center justify-center gap-3">
            <Link href="/sign-up" className="rounded-full border border-white/20 bg-white/10 px-7 py-3 text-sm font-semibold text-white no-underline transition hover:bg-white/16">
              Start Building Free
            </Link>
            <Link href="/dashboard" className="rounded-full border border-white/15 px-7 py-3 text-sm text-white/80 no-underline transition hover:bg-white/8">
              Open Dashboard
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export const FinalCta = memo(FinalCtaInner);
