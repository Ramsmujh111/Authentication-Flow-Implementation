'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import Link from 'next/link';

export default function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  const token = searchParams.get('token');
  const verified = searchParams.get('verified');
  const urlEmail = searchParams.get('email');

  useEffect(() => {
    const verifyEmail = async () => {
      // If verified is already true, show success
      if (verified === 'true' && token) {
        setStatus('success');
        setMessage('Your email has been verified successfully! You are now logged in.');
        setEmail(urlEmail || '');
        // Store token in localStorage
        localStorage.setItem('authToken', token);
        return;
      }

      // If no token, show form
      if (!token) {
        setStatus('error');
        setMessage('No verification token provided. Please check your email for the verification link.');
        return;
      }

      // Try to verify with token
      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          setStatus('error');
          setMessage(data.message || 'Verification failed. Please try again.');
          return;
        }

        setStatus('success');
        setMessage('Your email has been verified successfully! Go to Login');
        setEmail(data.data.user.email);
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred during verification. Please try again.');
        console.error('Verification error:', error);
      }
    };

    verifyEmail();
  }, [token, verified, urlEmail]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Email Verification</h1>
        </div>

        {status === 'loading' && (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
            <p className="text-gray-600">Verifying your email...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6 bg-white p-8 rounded-lg shadow">
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
              <h2 className="text-xl font-semibold text-gray-900">Verification Successful!</h2>
              <p className="text-gray-600">{message}</p>
              {email && <p className="text-sm text-gray-500">Email: {email}</p>}
            </div>

            <div className="space-y-3">
              {/* <Button
                type="button"
                variant="primary"
                fullWidth
                onClick={() => router.push('/login')}
              >
                Go to Login
              </Button> */}
              <Link href="/" className="w-full">
                <Button type="button" variant="secondary" fullWidth>
                  Back to Login
                </Button>
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6 bg-white p-8 rounded-lg shadow">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="bg-red-100 rounded-full p-3">
                  <svg
                    className="h-8 w-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Verification Failed</h2>
              <p className="text-gray-600">{message}</p>
            </div>

            <div className="space-y-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900 font-semibold">What can you do?</p>
              <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
                <li>Check your spam folder for the verification email</li>
                <li>Request a new verification email below</li>
                <li>Contact support if the problem persists</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Link href="/resend-verification" className="w-full block">
                <Button type="button" variant="primary" fullWidth>
                  Resend Verification Email
                </Button>
              </Link>
              <Link href="/login" className="w-full block">
                <Button type="button" variant="secondary" fullWidth>
                  Back to Login
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
