'use client';

import React, { useState } from 'react';
import { Input, PasswordInput, Button, Checkbox } from '@/components/ui';

export const LoginForm: React.FC = () => {
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add your login logic here
  };

  const handleOtpSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('OTP request sent to:', formData.email);
    // Redirect to verify OTP page
    window.location.href = `/verify-otp?email=${formData.email}`;
  };

  return (
    <div>
      {/* Toggle Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          type="button"
          onClick={() => setIsOtpMode(false)}
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
          onClick={() => setIsOtpMode(true)}
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
          <Input
            type="email"
            name="email"
            label="Email"
            placeholder="Enter your mail"
            value={formData.email}
            onChange={handleInputChange}
            required
          />

          <PasswordInput
            name="password"
            label="Password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleInputChange}
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

          <Button type="submit" variant="primary" fullWidth>
            Log in
          </Button>
        </form>
      ) : (
        // OTP Login Form
        <form onSubmit={handleOtpSubmit}>
          <Input
            type="email"
            name="email"
            label="Email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />

          <p className="text-sm text-zinc-600 mt-4 mb-6">
            We&apos;ll send you a 4-digit OTP code to verify your identity.
          </p>

          <Button type="submit" variant="primary" fullWidth>
            Send OTP
          </Button>
        </form>
      )}
    </div>
  );
};
