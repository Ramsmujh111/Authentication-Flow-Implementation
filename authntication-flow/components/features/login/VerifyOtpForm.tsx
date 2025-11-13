'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui';

export default function VerifyOtpForm() {
  const [otp, setOtp] = useState(['', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length === 4) {
      console.log('OTP submitted:', otpCode);
      // Add your verification logic here
    }
  };

  const isComplete = otp.every((digit) => digit !== '');

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      {/* OTP Input Fields */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-4">
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
              className="w-16 h-16 text-2xl font-bold text-center border-2 border-zinc-300 rounded-lg focus:border-teal-600 focus:outline-none transition-colors"
              placeholder="0"
            />
          ))}
        </div>
      </div>

      {/* Resend OTP */}
      <div className="text-center text-sm">
        <p className="text-zinc-600">
          Didn&apos;t receive the code?{' '}
          <button
            type="button"
            className="text-teal-600 hover:text-teal-700 font-medium"
          >
            Resend OTP
          </button>
        </p>
      </div>

      {/* Verify Button */}
      <Button
        type="submit"
        variant="primary"
        fullWidth
        disabled={!isComplete}
        className={!isComplete ? 'opacity-50 cursor-not-allowed' : ''}
      >
        Verify OTP
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
