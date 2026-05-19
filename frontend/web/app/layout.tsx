import type { Metadata } from 'next';
import { Syne, DM_Sans, JetBrains_Mono } from 'next/font/google';
import { QueryProvider } from '@/components/providers/query-provider';
import '@/styles/globals.css';
import '@/styles/marketing.css';

const syne = Syne({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-syne',
  display: 'swap',
  preload: true,
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-dm-sans',
  display: 'swap',
  preload: true,
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: 'VEL AI — The Infinite Multi-Agent AI Operating Workspace',
  description:
    'Orchestrate Claude, GPT-4o, Gemini, and every frontier AI model simultaneously on one infinite canvas. Share context between agents. Ship faster.',
  keywords: [
    'AI workspace',
    'multi-agent AI',
    'AI orchestration',
    'Claude',
    'GPT-4o',
    'Gemini',
    'AI canvas',
    'consensus mode',
  ],
  openGraph: {
    title: 'VEL AI — The Infinite Multi-Agent AI Operating Workspace',
    description:
      'Run multiple AI models simultaneously on one infinite canvas with shared context.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VEL AI',
    description: 'The Infinite Multi-Agent AI Operating Workspace',
  },
  icons: {
    icon: '/logo.avif',
    shortcut: '/logo.avif',
    apple: '/logo.avif',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${syne.variable} ${dmSans.variable} ${jetbrains.variable}`}
    >
      <body className="bg-[#0A0A0A] text-[#F5F5F5] font-body antialiased selection:bg-violet-500/30 selection:text-white">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
