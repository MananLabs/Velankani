import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import {
  NextResponse,
  type NextFetchEvent,
  type NextMiddleware,
  type NextRequest,
} from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
]);

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/workspace(.*)',
  '/api(.*)',
]);

const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const clerkSecretKey = process.env.CLERK_SECRET_KEY;
const hasValidClerkPublishableKey =
  typeof clerkPublishableKey === 'string' &&
  clerkPublishableKey.startsWith('pk_') &&
  clerkPublishableKey.length > 20;
const hasValidClerkSecret =
  typeof clerkSecretKey === 'string' &&
  clerkSecretKey.startsWith('sk_') &&
  clerkSecretKey.length > 20;

const hasValidClerkConfig = hasValidClerkPublishableKey && hasValidClerkSecret;

let protectedClerkMiddleware: NextMiddleware | null = null;

if (hasValidClerkConfig) {
  protectedClerkMiddleware = clerkMiddleware(
    async (auth, req) => {
      if (isPublicRoute(req)) {
        return;
      }

      if (isProtectedRoute(req)) {
        await auth().protect();
      }
    },
    {
      publishableKey: clerkPublishableKey,
      secretKey: clerkSecretKey,
    },
  );
}

export default function middleware(req: NextRequest, evt: NextFetchEvent) {
  if (!protectedClerkMiddleware) {
    return NextResponse.next();
  }

  return protectedClerkMiddleware(req, evt) ?? NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
