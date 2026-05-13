'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DirectSignUp() {
  const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');
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

      // Store for verification
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
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: 800,
          height: 800,
          background: 'radial-gradient(circle, rgba(109,95,255,0.15) 0%, transparent 60%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="vel-glass"
        style={{
          padding: '48px 40px',
          borderRadius: 24,
          textAlign: 'center',
          maxWidth: 420,
          position: 'relative',
          zIndex: 10,
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
          width: '100%',
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            background: '#6D5FFF',
            borderRadius: 12,
            margin: '0 auto 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ color: 'white', fontSize: 24 }}>✧</span>
        </div>

        <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 28, fontWeight: 600, marginBottom: 8, color: '#FFF' }}>
          {step === 'email' ? 'Create Account' : step === 'otp' ? 'Verify Email' : 'Set Password'}
        </h2>
        <p style={{ color: '#888', fontSize: 14, marginBottom: 32 }}>
          {step === 'email' ? 'Email-only sign up (no phone required)' : 
           step === 'otp' ? 'Enter the code we sent to your email' : 'Create a secure password'}
        </p>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, color: '#EF4444', fontSize: 14 }}>
            {error}
          </div>
        )}

        {step === 'email' && (
          <form onSubmit={handleEmailSubmit}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              required
              style={inputStyle}
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              style={{ ...inputStyle, marginTop: 16 }}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (8+ characters)"
              required
              minLength={8}
              style={{ ...inputStyle, marginTop: 16 }}
            />
            <button type="submit" disabled={loading} style={buttonStyle(loading)}>
              {loading ? 'Creating...' : 'Continue'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleOTPVerify}>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter 6-digit code"
              maxLength={6}
              required
              style={inputStyle}
            />
            <button type="submit" disabled={loading} style={{ ...buttonStyle(loading), marginTop: 24 }}>
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>
        )}

        <div style={{ marginTop: 24, fontSize: 14, color: '#666' }}>
          Already have an account?{' '}
          <Link href="/sign-in" style={{ color: '#6D5FFF', textDecoration: 'none', fontWeight: 500 }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  color: '#FFF',
  fontSize: 15,
  outline: 'none',
  boxSizing: 'border-box',
};

const buttonStyle = (loading: boolean): React.CSSProperties => ({
  width: '100%',
  padding: '14px 24px',
  background: loading ? '#6D5FFF80' : '#6D5FFF',
  color: '#FFF',
  border: 'none',
  borderRadius: 10,
  fontSize: 15,
  fontWeight: 600,
  cursor: loading ? 'not-allowed' : 'pointer',
  marginTop: 24,
  transition: 'all 0.2s',
});
