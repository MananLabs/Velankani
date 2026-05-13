'use client';

import { memo, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

function HeroInner() {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <section
      style={{
        position: 'relative',
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 96,
        paddingBottom: 128,
        overflow: 'hidden',
      }}
    >
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        ref={videoRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
        }}
      >
        <source
          src="https://res.cloudinary.com/dfonotyfb/video/upload/v1775585556/dds3_1_rqhg7x.mp4"
          type="video/mp4"
        />
      </video>

      {/* Gradient Overlays for cinematic effect */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background: [
            'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,0,0,0.4) 0%, transparent 60%)',
            'radial-gradient(ellipse 60% 40% at 50% 100%, rgba(0,0,0,0.8) 0%, transparent 50%)',
            'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.1) 70%, rgba(0,0,0,0.5) 100%)',
          ].join(', '),
        }}
      />

      {/* Top vignette */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 200,
          zIndex: 2,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Bottom fade */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 300,
          zIndex: 2,
          background: 'linear-gradient(0deg, #000 0%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Side vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          background: [
            'radial-gradient(ellipse 50% 100% at 0% 50%, rgba(0,0,0,0.5) 0%, transparent 50%)',
            'radial-gradient(ellipse 50% 100% at 100% 50%, rgba(0,0,0,0.5) 0%, transparent 50%)',
          ].join(', '),
          pointerEvents: 'none',
        }}
      />

      {/* Subtle scan line effect */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 3,
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
          pointerEvents: 'none',
          opacity: 0.5,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '0 24px',
          maxWidth: 900,
          margin: '0 auto',
        }}
      >
        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            borderRadius: 9999,
            background: 'rgba(124,58,237,0.15)',
            border: '1px solid rgba(124,58,237,0.3)',
            marginBottom: 32,
            backdropFilter: 'blur(10px)',
            boxShadow: '0 0 30px rgba(124,58,237,0.2)',
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#7C3AED',
              boxShadow: '0 0 12px #7C3AED, 0 0 24px rgba(124,58,237,0.5)',
              animation: 'pulse 2s infinite',
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.9)',
            }}
          >
            The Infinite Multi-Agent Operating Workspace
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontSize: 'clamp(44px, 6vw, 80px)',
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: '-0.04em',
            background: 'linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0.6) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            paddingBottom: 8,
            margin: 0,
            textShadow: '0 0 80px rgba(255,255,255,0.1)',
          }}
        >
          The Future of{' '}
          <br className="hidden md:block" />
          AI Workflows
          <span style={{ WebkitTextFillColor: '#A78BFA' }}>.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          style={{
            marginTop: 28,
            fontSize: 'clamp(16px, 2vw, 20px)',
            lineHeight: 1.65,
            color: 'rgba(255,255,255,0.7)',
            maxWidth: 680,
            fontWeight: 450,
            letterSpacing: '-0.01em',
            textShadow: '0 2px 20px rgba(0,0,0,0.5)',
          }}
        >
          VEL AI unifies Claude, GPT, Gemini, Perplexity, terminal agents,
          and intelligent workflows into one infinite workspace.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            marginTop: 48,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
          }}
        >
          <Link
            href="/sign-up"
            style={{
              height: 52,
              padding: '0 36px',
              borderRadius: 9999,
              background: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 50%, #A78BFA 100%)',
              color: '#fff',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              textDecoration: 'none',
              fontSize: 15,
              boxShadow: '0 0 40px rgba(124,58,237,0.4), 0 4px 20px rgba(0,0,0,0.3)',
              transition: 'all 200ms',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            Start Building
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <button
            style={{
              height: 52,
              padding: '0 36px',
              borderRadius: 9999,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
              fontSize: 15,
              backdropFilter: 'blur(20px)',
              transition: 'all 200ms',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            Watch Demo
          </button>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          style={{
            position: 'absolute',
            bottom: -80,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: 24,
              height: 40,
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 12,
              display: 'flex',
              justifyContent: 'center',
              paddingTop: 8,
            }}
          >
            <div style={{ width: 4, height: 8, background: 'rgba(255,255,255,0.4)', borderRadius: 2 }} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export const Hero = memo(HeroInner);