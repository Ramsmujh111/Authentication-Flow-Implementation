'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input, PasswordInput, Button, Checkbox } from '@/components/ui';
import { loginFormSchema, otpFormSchema, type LoginFormData, type OtpFormData } from '@/lib/schemas/validationSchemas';
import { ZodError } from 'zod';

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      loginFormSchema.parse({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
      });
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

    // API call to login
    setIsLoading(true);
    setSuccessMessage('');
    setErrors({}); // Clear any previous errors

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if it's a verification error
        if (response.status === 403 && data.message?.includes('verify')) {
          setErrors({
            submit: data.message,
          });
          setIsLoading(false);
          return;
        }

        // Handle other errors
        if (data.errors && typeof data.errors === 'object') {
          setErrors(data.errors);
        } else if (data.message) {
          setErrors({
            submit: data.message,
          });
        } else {
          setErrors({
            submit: 'Login failed. Please try again.',
          });
        }
        setIsLoading(false);
        return;
      }

      // Success - store token and redirect
      if (data.data?.token) {
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('access_login', JSON.stringify(data?.data));
        console.log(data?.data , 'this is data')
        if (formData.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }
      }

      setSuccessMessage('Login successful! Redirecting...');
      setIsLoading(false);

      // Redirect to dashboard
      setTimeout(() => {
        router.push('/user-profile');
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      setErrors({
        submit: error instanceof Error ? error.message : 'An error occurred. Please try again.',
      });
      console.error('Login error:', error);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      otpFormSchema.parse({
        email: formData.email,
      });
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

    setIsLoading(true);
    setSuccessMessage('');

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({
          submit: data.message || 'Failed to send OTP. Please try again.',
        });
        setIsLoading(false);
        return;
      }

      setSuccessMessage('OTP sent! Check your email.');
      setIsLoading(false);

      // Redirect to verify OTP page after short delay
      setTimeout(() => {
        router.push(`/verify-otp?email=${formData.email}`);
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to send OTP',
      });
      console.error('OTP send error:', error);
    }
  };

  return (
    <div>
      {/* Toggle Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          type="button"
          onClick={() => {
            setIsOtpMode(false);
            setErrors({});
            setSuccessMessage('');
          }}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            !isOtpMode
              ? 'bg-teal-600 text-white'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => {
            setIsOtpMode(true);
            setErrors({});
            setSuccessMessage('');
          }}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            isOtpMode
              ? 'bg-teal-600 text-white'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          OTP
        </button>
      </div>

      {!isOtpMode ? (
        // Password Login Form
        <form onSubmit={handleSubmit}>
          {successMessage && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
              <p className="text-green-800 text-sm font-medium">{successMessage}</p>
            </div>
          )}

          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
              <div className="text-red-800 text-sm font-medium">{errors.submit}</div>
              {errors.submit.includes('verify') && (
                <a href="/resend-verification" className="text-red-600 hover:text-red-700 text-sm font-medium mt-2 inline-block">
                  Resend verification email →
                </a>
              )}
            </div>
          )}
          <Input
            type="email"
            name="email"
            label="Email"
            placeholder="Enter your mail"
            value={formData.email}
            onChange={handleInputChange}
            error={errors.email}
            required
          />

          <PasswordInput
            name="password"
            label="Password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleInputChange}
            error={errors.password}
            required
          />

          <div className="flex items-center justify-between mt-4 mb-6 text-sm">
            <Checkbox
              name="rememberMe"
              label="Remember me"
              checked={formData.rememberMe}
              onChange={handleInputChange}
            />

            <a href="/forgot-password" className="text-teal-700 hover:text-teal-800 font-medium">
              Forgot password?
            </a>
          </div>

          <Button type="submit" variant="primary" fullWidth disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Log in'}
          </Button>
        </form>
      ) : (
        // OTP Login Form
        <form onSubmit={handleOtpSubmit}>
          {successMessage && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
              <p className="text-green-800 text-sm font-medium">{successMessage}</p>
            </div>
          )}

          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
              <p className="text-red-800 text-sm font-medium">{errors.submit}</p>
            </div>
          )}

          <Input
            type="email"
            name="email"
            label="Email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange}
            error={errors.email}
            required
          />

          <p className="text-sm text-zinc-600 mt-4 mb-6">
            We&apos;ll send you a 4-digit OTP code to verify your identity.
          </p>

          <Button type="submit" variant="primary" fullWidth disabled={isLoading}>
            {isLoading ? 'Sending OTP...' : 'Send OTP'}
          </Button>
        </form>
      )}
    </div>
  );
};
