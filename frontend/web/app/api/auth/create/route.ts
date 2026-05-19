import { NextRequest, NextResponse } from 'next/server';

/**
 * Dev-mode sign-up handler.
 * Stores user info in a cookie and skips OTP verification.
 * Replace with Better Auth when integrated.
 */
export async function POST(req: NextRequest) {
  try {
    const { email, name, password } = await req.json();

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Email, name, and password are required' },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 },
      );
    }

    // In dev mode, we just accept the sign-up and create a session cookie
    const user = {
      id: crypto.randomUUID(),
      email,
      name,
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
