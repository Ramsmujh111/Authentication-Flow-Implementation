'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { PasswordInput, Button } from '@/components/ui';
import { z } from 'zod';
import { ZodError } from 'zod';

// Password validation schema
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

const resetPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

function ResetPasswordFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setErrors({
        submit: 'No reset token provided. Please check your email for the reset link.',
      });
    }
  }, [token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    try {
      resetPasswordSchema.parse(formData);
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

    if (!token) {
      setErrors({
        submit: 'No reset token provided. Please check your email for the reset link.',
      });
      return;
    }

    // API call to reset password
    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({
            submit: data.message || 'Failed to reset password. Please try again.',
          });
        }
        setIsLoading(false);
        return;
      }

      // Success
      setIsSuccess(true);
      setIsLoading(false);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      setIsLoading(false);
      setErrors({
        submit: error instanceof Error ? error.message : 'An error occurred. Please try again.',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      {isSuccess ? (
        <>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">Password Reset Successful!</h3>
            <p className="text-sm text-green-800">
              Your password has been successfully reset. You can now log in with your new password.
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            fullWidth
            onClick={() => router.push('/login')}
          >
            Go to Login
          </Button>
        </>
      ) : (
        <>
          <p className="text-sm text-zinc-600 mb-6">
            Create a new strong password for your account.
          </p>

          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm font-medium">{errors.submit}</p>
            </div>
          )}

          <PasswordInput
            name="newPassword"
            label="New Password"
            placeholder="Enter new password"
            value={formData.newPassword}
            onChange={handleInputChange}
            error={errors.newPassword}
            required
          />

          <PasswordInput
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            error={errors.confirmPassword}
            required
          />

          <div className="text-xs text-zinc-500 space-y-1">
            <p>Password must contain:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>At least 8 characters</li>
              <li>Mix of uppercase and lowercase letters</li>
              <li>At least one number</li>
              <li>At least one special character</li>
            </ul>
          </div>

          <Button type="submit" variant="primary" fullWidth disabled={isLoading}>
            {isLoading ? 'Resetting Password...' : 'Reset Password'}
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

export default function ResetPasswordForm() {
  return (
    <Suspense
      fallback={
        <div className="w-full space-y-6">
          <p className="text-sm text-zinc-600 mb-6">Loading...</p>
        </div>
      }
    >
      <ResetPasswordFormContent />
    </Suspense>
  );
}
