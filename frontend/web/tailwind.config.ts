import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        vel: {
          black:          '#0A0A0A',
          surface:        '#111111',
          card:           '#161616',
          'card-elevated':'#1C1C1C',
          overlay:        '#202020',
          border:         '#222222',
          'border-subtle':'#1A1A1A',
          violet:         '#7C3AED',
          'violet-bright':'#8B5CF6',
          'violet-dim':   '#6D28D9',
          'violet-muted': '#4C1D95',
          success:        '#10B981',
          warning:        '#F59E0B',
          danger:         '#EF4444',
          info:           '#3B82F6',
        },
      },
      fontFamily: {
        heading: ['var(--font-syne)', 'Syne', 'sans-serif'],
        display: ['var(--font-syne)', 'Syne', 'sans-serif'],
        body:    ['var(--font-dm-sans)', 'DM Sans', 'sans-serif'],
        mono:    ['var(--font-jetbrains)', 'JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
      },
      boxShadow: {
        'tile':        '0 0 0 1px rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.4)',
        'tile-active': '0 0 0 2px rgba(124,58,237,0.5), 0 8px 32px rgba(0,0,0,0.6)',
        'violet-glow': '0 0 20px rgba(124, 58, 237, 0.35)',
        'modal':       '0 16px 64px rgba(0,0,0,0.8)',
      },
      animation: {
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'cursor-blink': 'cursor-blink 1s step-end infinite',
        'context-flow': 'context-flow 2s linear infinite',
        'tile-spawn': 'tile-spawn 300ms cubic-bezier(0,0,0.2,1) forwards',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'cursor-blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'context-flow': {
          from: { strokeDashoffset: '36' },
          to: { strokeDashoffset: '0' },
        },
        'tile-spawn': {
          from: { opacity: '0', transform: 'scale(0.96) translateY(8px)' },
          to: { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
