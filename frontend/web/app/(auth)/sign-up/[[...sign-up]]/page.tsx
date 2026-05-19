'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function SignUpPage() {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      // In dev mode, skip OTP and go straight to dashboard
      if (data.user) {
        localStorage.setItem('vel_user', JSON.stringify(data.user));
        router.push('/dashboard');
        return;
      }

      localStorage.setItem('pending_email', email);
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const savedEmail = localStorage.getItem('pending_email');

      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: savedEmail, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      localStorage.removeItem('pending_email');
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Background glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 800,
          height: 800,
          background:
            'radial-gradient(circle, rgba(109,95,255,0.15) 0%, transparent 60%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      <div
        className="relative z-10 w-full max-w-[420px] mx-4 text-center"
        style={{
          padding: '48px 40px',
          borderRadius: 24,
          background: 'rgba(17, 17, 17, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        }}
      >
        {/* Logo */}
        <div className="w-14 h-14 mx-auto mb-6 flex items-center justify-center">
          <Image src="/logo.avif" alt="VEL AI" width={56} height={56} />
        </div>

        <h2 className="text-2xl font-semibold text-white mb-2">
          {step === 'email' ? 'Create Account' : 'Verify Email'}
        </h2>
        <p className="text-sm text-[#888] mb-8">
          {step === 'email'
            ? 'Start building with multiple AI models'
            : `Enter the code we sent to ${email}`}
        </p>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-lg text-sm text-red-400 bg-red-500/10 border border-red-500/30">
            {error}
          </div>
        )}

        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              required
              className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-lg text-white text-[15px] outline-none focus:border-violet-500/50 transition placeholder:text-[#555]"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-lg text-white text-[15px] outline-none focus:border-violet-500/50 transition placeholder:text-[#555]"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (8+ characters)"
              required
              minLength={8}
              className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-lg text-white text-[15px] outline-none focus:border-violet-500/50 transition placeholder:text-[#555]"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 bg-[#6D5FFF] hover:bg-[#5B4FE6] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-[15px] rounded-xl transition"
            >
              {loading ? 'Creating account...' : 'Continue'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleOTPVerify} className="space-y-4">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter 6-digit code"
              maxLength={6}
              required
              className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-lg text-white text-[15px] text-center tracking-[0.3em] outline-none focus:border-violet-500/50 transition placeholder:text-[#555] placeholder:tracking-normal"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#6D5FFF] hover:bg-[#5B4FE6] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-[15px] rounded-xl transition"
            >
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>
            <button
              type="button"
              onClick={() => setStep('email')}
              className="w-full py-2 text-sm text-[#888] hover:text-white transition"
            >
              ← Back to sign up
            </button>
          </form>
        )}

        <div className="mt-6 text-sm text-[#666]">
          Already have an account?{' '}
          <Link
            href="/sign-in"
            className="text-[#6D5FFF] hover:text-[#8B7AFF] font-medium no-underline transition"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
