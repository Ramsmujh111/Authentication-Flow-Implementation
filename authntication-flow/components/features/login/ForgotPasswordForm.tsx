'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Button } from '@/components/ui';
import { forgotPasswordSchema } from '@/lib/schemas/validationSchemas';
import { ZodError } from 'zod';

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    try {
      forgotPasswordSchema.parse({ email });
      setErrors({});
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          const path = issue.path[0] as string;
          newErrors[path] = issue.message;
        });
        setErrors(newErrors);
      }
      return;
    }

    // API call to request password reset
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({
            submit: data.message || 'Failed to send reset email. Please try again.',
          });
        }
        setIsLoading(false);
        return;
      }

      // Success
      setIsSubmitted(true);
      setIsLoading(false);
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'An error occurred. Please try again.',
      });
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setEmail('');
    setIsSubmitted(false);
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      {!isSubmitted ? (
        <>
          <p className="text-sm text-zinc-600 mb-6">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>

          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm font-medium">{errors.submit}</p>
            </div>
          )}

          <Input
            type="email"
            name="email"
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) {
                setErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.email;
                  return newErrors;
                });
              }
            }}
            error={errors.email}
            required
          />

          <Button type="submit" variant="primary" fullWidth disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Reset Link'}
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
