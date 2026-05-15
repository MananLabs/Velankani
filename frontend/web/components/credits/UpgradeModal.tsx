'use client';

import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalVariants, EASE_OUT_FAST } from '@/lib/motion';

interface Plan {
  name: string;
  price: string;
  period: string;
  credits: string;
  features: string[];
  highlight?: boolean;
  badge?: string;
}

const PLANS: Plan[] = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    credits: '500 credits',
    features: [
      '3 workspaces',
      'GPT-4o Mini, Gemini Flash',
      'Basic context routing',
      'Community support',
    ],
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    credits: '10,000 credits',
    highlight: true,
    badge: 'Most Popular',
    features: [
      'Unlimited workspaces',
      'All 12+ models (Claude, GPT-4o, Gemini Pro)',
      'Consensus Mode',
      'Priority streaming',
      'Export & API access',
      'Email support',
    ],
  },
  {
    name: 'Pro BYOK',
    price: '$9',
    period: '/month',
    credits: 'Unlimited (your keys)',
    features: [
      'Everything in Pro',
      'Bring your own API keys',
      'Zero credit limits',
      'Custom model routing',
      'Priority support',
    ],
  },
];

const TOP_UPS = [
  { credits: 1000, price: '$5' },
  { credits: 5000, price: '$20' },
  { credits: 15000, price: '$50' },
];

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: string;
  onSelectPlan?: (plan: string) => void;
  onTopUp?: (credits: number) => void;
}

function UpgradeModalInner({
  isOpen,
  onClose,
  currentPlan = 'Free',
  onSelectPlan,
  onTopUp,
}: UpgradeModalProps) {
  const [tab, setTab] = useState<'plans' | 'topup'>('plans');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={EASE_OUT_FAST}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
          }}
          onClick={onClose}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 720,
              background: 'var(--vel-surface)',
              border: '1px solid var(--vel-border-default)',
              borderRadius: 16,
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--vel-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-heading)', margin: 0 }}>Upgrade Plan</h2>
                <p style={{ fontSize: 12, color: 'var(--vel-text-muted)', margin: '4px 0 0' }}>Current: {currentPlan}</p>
              </div>
              <div style={{ display: 'flex', gap: 2, background: 'var(--vel-card)', borderRadius: 8, padding: 2 }}>
                {(['plans', 'topup'] as const).map((t) => (
                  <button key={t} onClick={() => setTab(t)} style={{ padding: '6px 16px', borderRadius: 6, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer', background: tab === t ? 'var(--vel-card-elevated)' : 'transparent', color: tab === t ? 'var(--vel-text-primary)' : 'var(--vel-text-muted)', transition: 'all 150ms' }}>
                    {t === 'plans' ? 'Plans' : 'Top Up'}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: 24 }}>
              {tab === 'plans' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {PLANS.map((plan) => (
                    <div key={plan.name} style={{ padding: 20, borderRadius: 12, border: `1px solid ${plan.highlight ? 'rgba(124, 58, 237, 0.4)' : 'var(--vel-border-subtle)'}`, background: plan.highlight ? 'rgba(124, 58, 237, 0.05)' : 'var(--vel-card)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                      {plan.badge && (
                        <span style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', fontSize: 10, fontWeight: 600, background: '#7C3AED', color: '#fff', padding: '2px 10px', borderRadius: 10 }}>{plan.badge}</span>
                      )}
                      <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-heading)', marginBottom: 4 }}>{plan.name}</div>
                      <div style={{ marginBottom: 12 }}>
                        <span style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-heading)' }}>{plan.price}</span>
                        <span style={{ fontSize: 12, color: 'var(--vel-text-muted)' }}>{plan.period}</span>
                      </div>
                      <div style={{ fontSize: 11, color: '#7C3AED', fontFamily: 'var(--font-mono)', marginBottom: 16 }}>{plan.credits}</div>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1 }}>
                        {plan.features.map((f) => (
                          <li key={f} style={{ fontSize: 12, color: 'var(--vel-text-secondary)', padding: '4px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ color: '#22C55E', fontSize: 10 }}>✓</span> {f}
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={() => onSelectPlan?.(plan.name)}
                        disabled={currentPlan === plan.name}
                        style={{
                          marginTop: 16, width: '100%', padding: '10px 0', borderRadius: 8, border: 'none', cursor: currentPlan === plan.name ? 'default' : 'pointer', fontSize: 12, fontWeight: 600,
                          background: plan.highlight ? '#7C3AED' : 'var(--vel-card-elevated)',
                          color: plan.highlight ? '#fff' : 'var(--vel-text-primary)',
                          opacity: currentPlan === plan.name ? 0.5 : 1,
                          transition: 'all 150ms',
                        }}
                      >
                        {currentPlan === plan.name ? 'Current Plan' : 'Upgrade'}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  {TOP_UPS.map((t) => (
                    <button key={t.credits} onClick={() => onTopUp?.(t.credits)} style={{ flex: 1, maxWidth: 200, padding: 20, borderRadius: 12, border: '1px solid var(--vel-border-subtle)', background: 'var(--vel-card)', cursor: 'pointer', textAlign: 'center', transition: 'all 150ms' }}>
                      <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#7C3AED' }}>{t.credits.toLocaleString()}</div>
                      <div style={{ fontSize: 11, color: 'var(--vel-text-muted)', margin: '4px 0 12px' }}>credits</div>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>{t.price}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '12px 24px', borderTop: '1px solid var(--vel-border-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={onClose} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid var(--vel-border-subtle)', background: 'transparent', color: 'var(--vel-text-muted)', cursor: 'pointer', fontSize: 12 }}>Close</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const UpgradeModal = memo(UpgradeModalInner);
