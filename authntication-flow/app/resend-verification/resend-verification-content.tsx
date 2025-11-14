'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Button } from '@/components/ui';
import Link from 'next/link';

export default function ResendVerificationContent() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to resend verification email');
        return;
      }

      setSuccess(true);
      setMessage(
        'A new verification email has been sent to your inbox. Please check your email and click the verification link.'
      );
      setEmail('');

      // Redirect to verify-email page after 3 seconds
      setTimeout(() => {
        router.push('/verify-email');
      }, 3000);
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Resend verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Resend Verification Email</h1>
          <p className="mt-2 text-gray-600">
            Enter your email address and we'll send you a new verification link
          </p>
        </div>

        {success ? (
          <div className="bg-white p-8 rounded-lg shadow space-y-4">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="bg-green-100 rounded-full p-3">
                  <svg
                    className="h-8 w-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Email Sent!</h2>
              <p className="text-gray-600">{message}</p>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 text-center mb-4">
                Redirecting to verification page...
              </p>
              <Link href="/login" className="w-full block">
                <Button type="button" variant="secondary" fullWidth>
                  Back to Login
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div>
              <Input
                type="email"
                label="Email Address"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button type="submit" variant="primary" fullWidth disabled={loading}>
              {loading ? 'Sending...' : 'Resend Verification Email'}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Already verified?{' '}
                <Link href="/login" className="text-teal-600 hover:text-teal-700 font-medium">
                  Login here
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/signup" className="text-teal-600 hover:text-teal-700 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
