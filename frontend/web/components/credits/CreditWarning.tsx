'use client';

import { memo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalVariants, EASE_OUT_FAST } from '@/lib/motion';

interface CreditWarningProps {
  balance: number;
  monthlyLimit: number;
  onTopUp?: () => void;
  onUpgrade?: () => void;
  onDismiss?: () => void;
}

function CreditWarningInner({
  balance,
  monthlyLimit,
  onTopUp,
  onUpgrade,
  onDismiss,
}: CreditWarningProps) {
  const [dismissed, setDismissed] = useState(false);
  const [toastShown, setToastShown] = useState(false);
  const percentage = monthlyLimit > 0 ? balance / monthlyLimit : 1;
  const isLow = percentage < 0.2 && percentage >= 0.05;
  const isCritical = percentage < 0.05 && balance > 0;
  const isEmpty = balance <= 0;

  useEffect(() => {
    if (isLow && !toastShown) {
      setToastShown(true);
    }
  }, [isLow, toastShown]);

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  if (dismissed && !isCritical && !isEmpty) return null;

  if (isLow && toastShown) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            background: 'var(--vel-card-elevated)',
            border: '1px solid var(--vel-border)',
            borderLeft: '3px solid var(--vel-warning)',
            borderRadius: 8,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            zIndex: 1000,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            maxWidth: 340,
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--vel-warning)', marginBottom: 2 }}>
              Running low on credits
            </div>
            <div style={{ fontSize: 11, color: 'var(--vel-text-secondary)' }}>
              {balance} credits remaining
            </div>
          </div>
          <button onClick={onTopUp} className="btn-primary" style={{ padding: '6px 12px', fontSize: 11 }}>
            Top up
          </button>
          <button
            onClick={handleDismiss}
            style={{ background: 'none', border: 'none', color: 'var(--vel-text-muted)', cursor: 'pointer', fontSize: 14 }}
          >
            ×
          </button>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (isCritical || isEmpty) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <motion.div
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{
              background: 'var(--vel-card)',
              border: '1px solid var(--vel-border)',
              borderRadius: 12,
              padding: '32px',
              maxWidth: 400,
              width: '90%',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 16 }}>
              {isEmpty ? '⚠️' : '⚡'}
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, marginBottom: 8 }}>
              {isEmpty ? 'Out of credits' : `${balance} credits remaining`}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--vel-text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
              {isEmpty
                ? 'You need credits to continue using AI models. Upgrade your plan or purchase a credit top-up.'
                : 'Your credits are critically low. Top up to continue uninterrupted.'}
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button onClick={onUpgrade} className="btn-primary" style={{ padding: '10px 20px' }}>
                Upgrade plan
              </button>
              <button onClick={onTopUp} className="btn-ghost" style={{ padding: '10px 20px' }}>
                Buy credits
              </button>
            </div>
            {!isEmpty && (
              <button
                onClick={handleDismiss}
                style={{
                  marginTop: 16,
                  background: 'none',
                  border: 'none',
                  color: 'var(--vel-text-muted)',
                  fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                Dismiss
              </button>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return null;
}

export const CreditWarning = memo(CreditWarningInner);
