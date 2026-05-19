import { NextRequest, NextResponse } from 'next/server';

/**
 * Dev-mode sign-in handler.
 * Replace with Better Auth when integrated.
 */
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      );
    }

    // In dev mode, accept any valid-looking credentials
    const user = {
      id: crypto.randomUUID(),
      email,
      name: email.split('@')[0],
      plan: 'free',
      creditsRemaining: 100,
      createdAt: new Date().toISOString(),
    };

    const response = NextResponse.json({ success: true, user });

    // Set a dev session cookie
    response.cookies.set('vel-session', JSON.stringify(user), {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return response;
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
