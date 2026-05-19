'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { NewWorkspaceModal } from '@/components/workspace/NewWorkspaceModal';

const MOCK_WORKSPACES = [
  {
    id: '1',
    name: 'Product Research Sprint',
    tileCount: 5,
    lastOpenedAt: '2 hours ago',
    models: ['Claude', 'GPT-4o'],
  },
  {
    id: '2',
    name: 'Code Architecture Review',
    tileCount: 3,
    lastOpenedAt: '1 day ago',
    models: ['Claude', 'Codex'],
  },
  {
    id: '3',
    name: 'Market Analysis',
    tileCount: 8,
    lastOpenedAt: '3 days ago',
    models: ['Gemini', 'Sonar Pro', 'Claude'],
  },
];

export default function DashboardPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'transparent',
        backgroundImage: 'url(/bg-dashboard.avif)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: 'var(--vel-text-primary)',
      }}
    >
      {/* Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 32px',
          borderBottom: '1px solid var(--vel-border-subtle)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Image src="/logo.png" alt="VEL AI logo" width={32} height={32} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>
            VEL AI
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              background: 'var(--vel-bg-surface)',
              border: '1px solid var(--vel-border-subtle)',
              borderRadius: 8,
              fontSize: 13,
            }}
          >
            <span className="credit-ok" style={{ fontWeight: 600 }}>
              100
            </span>
            <span style={{ color: 'var(--vel-text-muted)', fontSize: 11 }}>
              credits
            </span>
          </div>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #7C3AED, #6D5FFF)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 600,
              color: '#FFF',
              cursor: 'pointer',
            }}
          >
            U
          </div>
        </div>
      </header>

      {/* Content */}
      <main
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '48px 32px',
        }}
      >
        {/* Title + Create */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 36,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: 'Clash Display, sans-serif',
                fontSize: 32,
                fontWeight: 700,
                letterSpacing: '-1px',
              }}
            >
              Workspaces
            </h1>
            <p
              style={{
                fontSize: 14,
                color: 'var(--vel-text-secondary)',
                marginTop: 4,
              }}
            >
              Your AI operating environments
            </p>
          </div>

          <button
            className="btn-primary"
            onClick={() => setShowCreateModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              fontSize: 14,
            }}
          >
            <span>+</span>
            New Workspace
          </button>
        </div>

        {/* Workspace grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 16,
          }}
        >
          {MOCK_WORKSPACES.map((ws, i) => (
            <motion.div
              key={ws.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                href={`/workspace/${ws.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div
                  style={{
                    background: 'var(--vel-bg-surface)',
                    border: '1px solid var(--vel-border-subtle)',
                    borderRadius: 14,
                    padding: 24,
                    cursor: 'pointer',
                    transition: 'all 200ms',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      'var(--vel-border-active)';
                    (e.currentTarget as HTMLElement).style.transform =
                      'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = '';
                    (e.currentTarget as HTMLElement).style.transform = '';
                  }}
                >
                  {/* Thumbnail */}
                  <div
                    className="canvas-background"
                    style={{
                      height: 140,
                      borderRadius: 8,
                      marginBottom: 16,
                      border: '1px solid var(--vel-border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        gap: 8,
                        opacity: 0.4,
                      }}
                    >
                      {[0, 1, 2].map((j) => (
                        <div
                          key={j}
                          style={{
                            width: 48,
                            height: 40,
                            background: 'var(--vel-bg-elevated)',
                            borderRadius: 6,
                            border: '1px solid var(--vel-border-subtle)',
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <h3
                    style={{
                      fontFamily: 'Clash Display, sans-serif',
                      fontSize: 16,
                      fontWeight: 600,
                      marginBottom: 6,
                    }}
                  >
                    {ws.name}
                  </h3>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        gap: 6,
                      }}
                    >
                      {ws.models.map((m) => (
                        <span
                          key={m}
                          style={{
                            fontSize: 10,
                            padding: '2px 6px',
                            background: 'var(--vel-bg-elevated)',
                            borderRadius: 4,
                            color: 'var(--vel-text-secondary)',
                          }}
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        color: 'var(--vel-text-muted)',
                      }}
                    >
                      {ws.lastOpenedAt}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>

      <NewWorkspaceModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
