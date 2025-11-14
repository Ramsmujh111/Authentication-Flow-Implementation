'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui';

export default function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds for resend button
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer for OTP expiry
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Keep only last digit
    setOtp(newOtp);

    // Auto-focus to next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!email) {
      setError('Email not found. Please start from login.');
      return;
    }

    const otpCode = otp.join('');
    if (otpCode.length !== 4) {
      setError('Please enter a valid 4-digit OTP');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to verify OTP');
        return;
      }

      // Store token in localStorage
      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('access_login', JSON.stringify(data?.data));
      
      setSuccessMessage('OTP verified successfully! Redirecting...');
      
      // Redirect to user profile after short delay
      setTimeout(() => {
        router.push('/user-profile');
      }, 1500);
    } catch (err) {
      setError('An error occurred while verifying OTP');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to resend OTP');
        return;
      }

      // Reset OTP fields and timer
      setOtp(['', '', '', '']);
      setTimeLeft(60); // Reset to 60 seconds for next resend
      setCanResend(false);
      setSuccessMessage('New OTP sent to your email!');
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError('Failed to resend OTP');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const isComplete = otp.every((digit) => digit !== '');

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      {/* Email Display */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
        <p className="text-blue-900">
          OTP being sent to: <strong>{email}</strong>
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {/* OTP Input Fields */}
      <div>
        <label className="block text-sm font-bold text-zinc-900 mb-4">
          4-Digit OTP Code
        </label>
        <div className="flex gap-4 justify-center">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={isLoading}
              className="w-16 h-16 text-3xl font-bold text-center border-2 border-teal-400 rounded-lg bg-white text-teal-600 focus:border-teal-600 focus:bg-teal-50 focus:outline-none transition-all shadow-md hover:border-teal-500 disabled:bg-zinc-100 placeholder:text-zinc-300"
              placeholder="•"
              autoComplete="off"
            />
          ))}
        </div>
        <p className="text-xs text-zinc-500 text-center mt-3">
          Each box: one digit (0-9)
        </p>
      </div>

      {/* Timer and Resend */}
      <div className="text-center space-y-2">
        <p className="text-sm text-zinc-600">
          Didn&apos;t receive the code?{' '}
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={!canResend || isLoading}
            className={`font-medium transition-colors ${
              canResend && !isLoading
                ? 'text-teal-600 hover:text-teal-700 cursor-pointer'
                : 'text-zinc-400 cursor-not-allowed'
            }`}
          >
            {canResend ? 'Resend OTP' : `Resend in ${timeLeft}s`}
          </button>
        </p>
      </div>

      {/* Verify Button */}
      <Button
        type="submit"
        variant="primary"
        fullWidth
        disabled={!isComplete || isLoading}
        className={!isComplete || isLoading ? 'opacity-50 cursor-not-allowed' : ''}
      >
        {isLoading ? 'Verifying...' : 'Verify OTP'}
      </Button>

      {/* Back to Login */}
      <div className="text-center">
        <a
          href="/login"
          className="text-sm text-zinc-600 hover:text-zinc-800 font-medium"
        >
          Back to Login
        </a>
      </div>
    </form>
  );
}
