'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import MagicBento from '@/components/marketing/MagicBento';
import GradientBlinds from '@/components/marketing/GradientBlinds';
import RotatingText from '@/components/marketing/RotatingText';
import CardDemo from '@/components/cards-demo-3';

const SWARM_ITEMS = [
  { label: 'Ask once, compare instantly', color: 'bg-emerald-400' },
  { label: 'Search the web in realtime', color: 'bg-violet-400' },
  { label: 'Generate images and audio', color: 'bg-amber-400' },
  { label: 'Save chats by project', color: 'bg-sky-400' },
];

function HeroInner() {
  return (
    <section className="relative min-h-screen overflow-hidden px-6 pt-40 pb-24 flex items-end">
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0">
        <source src="https://res.cloudinary.com/dfonotyfb/video/upload/v1775585556/dds3_1_rqhg7x.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 z-[5] pointer-events-none opacity-30">
        <GradientBlinds
          gradientColors={['#FFFFFF', '#E5E7EB', '#94A3B8']}
          angle={8}
          noise={0.2}
          blindCount={12}
          blindMinWidth={50}
          spotlightRadius={0.45}
          spotlightSoftness={1}
          spotlightOpacity={0.5}
          mouseDampening={0.15}
          distortAmount={0.15}
          shineDirection="left"
          mixBlendMode="screen"
        />
      </div>
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/65 via-black/70 to-black/88" />
      <div className="grok-hero-glow z-10" />
      <div className="relative z-20 mx-auto max-w-6xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="max-w-5xl text-[clamp(40px,6vw,84px)] font-black leading-[0.92] tracking-[-0.05em] text-white">
            <span className="block text-white/82">The smartest AI workspace for</span>
            <span className="mt-4 block">
              your{' '}
              <span className="inline-flex items-center rounded-[0.26em] border border-white/15 bg-white/92 px-[0.2em] py-[0.04em] align-middle shadow-[0_0_34px_rgba(255,255,255,0.14)]">
                <RotatingText
                  texts={['GPT', 'Claude', 'Gemini', 'Grok', 'DeepSeek', 'Kimi']}
                  splitBy="words"
                  mainClassName="inline-flex min-w-[5.5ch] flex-nowrap items-center justify-center whitespace-nowrap text-[0.9em] leading-none font-black align-middle text-blue-800"
                  splitLevelClassName="overflow-hidden leading-none"
                  elementLevelClassName="inline-block leading-none"
                  staggerFrom="last"
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '-120%' }}
                  staggerDuration={0.02}
                  transition={{ type: 'spring', damping: 30, stiffness: 420 }}
                  rotationInterval={1800}
                />
              </span>{' '}
              growth
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-[clamp(16px,1.8vw,24px)] leading-relaxed text-white/50">
            Ask once, compare instantly, and keep every model, doc, and decision in one premium workspace.
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
          className="relative"
        >
          <MagicBento
            className="grid grid-cols-1 gap-4 md:grid-cols-3"
            textAutoHide={false}
            enableStars={true}
            enableSpotlight={true}
            enableBorderGlow={true}
            enableTilt={true}
            enableMagnetism={true}
            clickEffect={true}
            spotlightRadius={300}
            particleCount={12}
            glowColor="255, 255, 255"
          >
          <article className="magic-bento-card rounded-3xl border border-white/10 bg-black/55 p-7 md:col-span-1 bento-card">
            <div className="space-y-3">
              {SWARM_ITEMS.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3">
                  <span className="text-[15px] text-white/80">{item.label}</span>
                  <span className={`h-2.5 w-2.5 rounded-full ${item.color} shadow-[0_0_12px_currentColor]`} />
                </div>
              ))}
            </div>
            <h3 className="mt-10 text-[clamp(30px,2.6vw,35px)] font-semibold tracking-tight text-white">One Prompt, Many Answers</h3>
            <p className="mt-3 text-[clamp(16px,1.35vw,20px)] leading-relaxed text-white/43">
              Ask once and compare multiple model responses side-by-side in seconds.
            </p>
          </article>

          <article className="magic-bento-card rounded-3xl border border-white/10 bg-black/55 p-7 md:col-span-2 bento-card relative overflow-hidden">
            <div className="absolute inset-0 opacity-70" style={{ background: 'radial-gradient(55% 55% at 50% 0%, rgba(94,144,255,0.15) 0%, transparent 72%)' }} />
            <div className="relative min-h-[224px] flex items-center justify-center">
              <CardDemo />
            </div>
            <h3 className="mt-2 text-[clamp(30px,2.6vw,35px)] font-semibold tracking-tight text-white">Smart Model Selection</h3>
            <p className="mt-3 max-w-3xl text-[clamp(16px,1.35vw,20px)] leading-relaxed text-white/43">
              Pick your model manually or auto-route prompts to the right model for each task.
            </p>
          </article>

          <article className="magic-bento-card rounded-3xl border border-white/10 bg-black/55 p-7 bento-card min-h-[290px] flex flex-col justify-end">
            <div className="mb-16 mx-auto h-40 w-40 rounded-full border border-white/10 bg-gradient-to-b from-white/10 to-transparent relative">
              <div className="absolute inset-5 rounded-full border border-white/10" />
              <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
            </div>
            <h3 className="text-[clamp(30px,2.6vw,35px)] font-semibold tracking-tight text-white">Persistent Chat Memory</h3>
            <p className="mt-3 text-[clamp(16px,1.35vw,20px)] leading-relaxed text-white/43">
              Keep context across conversations so your chats stay useful and on track.
            </p>
          </article>

          <article className="magic-bento-card rounded-3xl border border-white/10 bg-black/55 p-7 bento-card min-h-[290px] flex flex-col justify-end">
            <div className="mb-10 rounded-2xl border border-white/10 bg-[#08090f] p-4 font-mono text-sm text-white/70">
              <div className="mb-2 text-white/30">chat.tsx</div>
              <div>model: &quot;gpt-4o&quot;</div>
              <div>compare: [&quot;claude&quot;, &quot;gemini&quot;]</div>
              <div>mode: &quot;deepsearch&quot;</div>
              <div>output: &quot;best_response&quot;</div>
            </div>
            <h3 className="text-[clamp(30px,2.6vw,35px)] font-semibold tracking-tight text-white">Fast Prompt Workflows</h3>
            <p className="mt-3 text-[clamp(16px,1.35vw,20px)] leading-relaxed text-white/43">
              Run prompt chains, compare outcomes, and ship better outputs with less effort.
            </p>
          </article>

          <article className="magic-bento-card rounded-3xl border border-white/10 bg-black/55 p-7 bento-card min-h-[290px] flex flex-col justify-end">
            <div className="mb-16 flex h-40 items-center justify-center">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <svg
                  viewBox="0 0 64 64"
                  className="h-20 w-20 text-white/95"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <path
                    d="M21 18.5L42.5 9.5C44.4 8.7 46.5 9.6 47.3 11.5L49.8 17.7C50.6 19.6 49.7 21.7 47.8 22.5L26.3 31.5"
                    stroke="currentColor"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M17 22.5L26.3 31.5L21.4 36.8L12.5 28"
                    stroke="currentColor"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M34.5 37L22.5 50.5"
                    stroke="currentColor"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M18.5 45L22.5 50.5L27 55.5"
                    stroke="currentColor"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="53.5" cy="14" r="2.7" fill="currentColor" />
                </svg>
              </div>
            </div>
            <h3 className="text-[clamp(30px,2.6vw,35px)] font-semibold tracking-tight text-white">Deep Research</h3>
            <p className="mt-3 text-[clamp(16px,1.35vw,20px)] leading-relaxed text-white/43">
              Pull live web context and citations before you trust an answer.
            </p>
          </article>
          </MagicBento>
        </motion.div>
      </div>
    </section>
  );
}

export const Hero = memo(HeroInner);
