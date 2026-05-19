import { NextRequest, NextResponse } from 'next/server';

/**
 * Dev-mode OTP verification handler.
 * Accepts any code in development. Replace with real verification when ready.
 */
export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 },
      );
    }

    // In dev mode, accept any 6-digit code
    if (code.length < 4) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true, verified: true });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
