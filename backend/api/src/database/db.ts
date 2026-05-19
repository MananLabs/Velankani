// ═══════════════════════════════════════════════════════════
// VEL AI — Neon PostgreSQL Connection
// ═══════════════════════════════════════════════════════════

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

let db: ReturnType<typeof drizzle<typeof schema>>;

if (process.env.DATABASE_URL) {
  const sql = neon(process.env.DATABASE_URL);
  db = drizzle(sql, { schema });
} else {
  console.warn(
    '⚠️  DATABASE_URL not set — database features will be unavailable. Set it in backend/api/.env when ready.',
  );
  // Proxy that throws a clear error only when DB is actually used
  db = new Proxy({} as any, {
    get(_target, prop) {
      if (prop === 'then') return undefined; // prevent Promise-like behavior
      return (...args: any[]) => {
        throw new Error(
          `Database not configured. Set DATABASE_URL in backend/api/.env to enable database features.`,
        );
      };
    },
  });
}

export { db };
export type DB = typeof db;
