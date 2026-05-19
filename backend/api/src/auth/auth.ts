// ═══════════════════════════════════════════════════════════
// VEL AI — Better Auth Configuration
// ═══════════════════════════════════════════════════════════

import { betterAuth } from 'better-auth';
import { dash } from '@better-auth/infra';

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3001',
  basePath: '/api/v1/auth',
  secret: process.env.BETTER_AUTH_SECRET,

  database: {
    type: 'postgres',
    url: process.env.DATABASE_URL!,
  },

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
  },

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },

  trustedOrigins: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://127.0.0.1:3000',
  ],

  plugins: [
    dash({
      apiKey: process.env.BETTER_AUTH_API_KEY,
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
