import { NextResponse, type NextRequest } from 'next/server';

const publicRoutes = ['/', '/sign-in', '/sign-up', '/api/auth'];

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes and static assets
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Check for Better Auth session cookie
  // Better Auth sets a cookie named "better-auth.session_token" by default
  const session =
    req.cookies.get('better-auth.session_token') ||
    req.cookies.get('__Secure-better-auth.session_token');

  if (!session) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
