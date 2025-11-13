'use client';

import React, { useState } from 'react';
import { Input, Button } from '@/components/ui';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Password reset email sent to:', email);
    setIsSubmitted(true);
    // Add your password reset logic here
  };

  const handleReset = () => {
    setEmail('');
    setIsSubmitted(false);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      {!isSubmitted ? (
        <>
          <p className="text-sm text-zinc-600 mb-6">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>

          <Input
            type="email"
            name="email"
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" fullWidth>
            Send Reset Link
          </Button>

          <div className="text-center">
            <a
              href="/login"
              className="text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              Back to Login
            </a>
          </div>
        </>
      ) : (
        <>
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <h3 className="font-semibold text-teal-900 mb-2">Check your email</h3>
            <p className="text-sm text-teal-800 mb-3">
              We&apos;ve sent a password reset link to <span className="font-medium">{email}</span>
            </p>
            <p className="text-sm text-teal-700">
              Click the link in the email to reset your password. The link will expire in 24 hours.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={handleReset}
          >
            Try Another Email
          </Button>

          <div className="text-center">
            <a
              href="/login"
              className="text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              Back to Login
            </a>
          </div>
        </>
      )}
    </form>
  );
}
