'use client';

import { memo, useEffect, useRef } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface CreditDisplayProps {
  balance: number;
  monthlyLimit: number;
  onClick?: () => void;
}

function CreditDisplayInner({ balance, monthlyLimit, onClick }: CreditDisplayProps) {
  const percentage = monthlyLimit > 0 ? balance / monthlyLimit : 1;
  const isLow = percentage < 0.2;
  const isCritical = percentage < 0.05;

  const springBalance = useSpring(balance, { stiffness: 100, damping: 20 });
  const displayBalance = useTransform(springBalance, (v) =>
    Math.round(v).toLocaleString(),
  );

  const prevBalance = useRef(balance);
  useEffect(() => {
    if (balance !== prevBalance.current) {
      springBalance.set(balance);
      prevBalance.current = balance;
    }
  }, [balance, springBalance]);

  const dotColor = isCritical
    ? 'var(--vel-danger)'
    : isLow
      ? 'var(--vel-warning)'
      : 'var(--vel-success)';

  const textColor = isCritical
    ? 'var(--vel-danger)'
    : isLow
      ? 'var(--vel-warning)'
      : 'var(--vel-text-secondary)';

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        background: 'transparent',
        border: '1px solid var(--vel-border-subtle)',
        borderRadius: 8,
        cursor: 'pointer',
        transition: 'all 150ms',
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: textColor,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--vel-border)';
        e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--vel-border-subtle)';
        e.currentTarget.style.background = 'transparent';
      }}
    >
      <motion.span
        animate={isCritical ? { scale: [1, 1.3, 1] } : { scale: 1 }}
        transition={isCritical ? { duration: 1.5, repeat: Infinity } : undefined}
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: dotColor,
          flexShrink: 0,
        }}
      />
      <motion.span>{displayBalance}</motion.span>
      <span style={{ color: 'var(--vel-text-muted)', fontSize: 10 }}>cr</span>
    </button>
  );
}

export const CreditDisplay = memo(CreditDisplayInner);
