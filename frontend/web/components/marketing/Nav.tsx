'use client';

import { memo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Button as MovingBorderButton } from '@/components/ui/moving-border';

function NavInner() {
  return (
    <motion.nav
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-5 left-0 right-0 z-50 px-4"
    >
      <div className="mx-auto flex w-full max-w-[860px] items-center justify-between rounded-full border border-white/12 bg-black/60 px-4 py-2 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-3 text-white no-underline">
          <div className="h-8 w-8 overflow-hidden rounded-full border border-white/15 bg-white/5 grid place-items-center">
            <Image src="/logo.avif" alt="VEL AI logo" width={26} height={26} />
          </div>
          <span className="text-sm font-medium tracking-tight">VEL AI</span>
        </Link>

        <div className="hidden md:flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.02] p-1">
          {['Features', 'Models', 'Pricing'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="rounded-full px-3 py-1.5 text-xs text-white/58 transition hover:bg-white/10 hover:text-white no-underline"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a href="/sign-in" className="hidden sm:inline text-xs text-white/60 no-underline hover:text-white transition">Login</a>
          <MovingBorderButton
            as={Link}
            href="/sign-up"
            borderRadius="999px"
            duration={2800}
            containerClassName="h-9 w-auto px-[1px] no-underline"
            className="px-4 bg-black/75 text-xs font-semibold text-white border-white/20"
            borderClassName="bg-[radial-gradient(#8CC8FF_40%,transparent_60%)]"
          >
            Launch App
          </MovingBorderButton>
        </div>
      </div>
    </motion.nav>
  );
}

export const Nav = memo(NavInner);
