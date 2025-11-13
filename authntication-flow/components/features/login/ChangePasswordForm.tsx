'use client';

import React, { useState } from 'react';
import { PasswordInput, Button } from '@/components/ui';

export default function ChangePasswordForm() {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    console.log('Password changed successfully');
    setIsSuccess(true);
    // Add your password change logic here
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      {!isSuccess ? (
        <>
          <p className="text-sm text-zinc-600 mb-6">
            Create a new strong password for your account.
          </p>

          <PasswordInput
            name="newPassword"
            label="New Password"
            placeholder="Enter new password"
            value={formData.newPassword}
            onChange={handleInputChange}
            required
          />

          <PasswordInput
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="text-xs text-zinc-500 space-y-1">
            <p>Password must contain:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>At least 8 characters</li>
              <li>Mix of uppercase and lowercase letters</li>
              <li>At least one number</li>
              <li>At least one special character</li>
            </ul>
          </div>

          <Button type="submit" variant="primary" fullWidth>
            Update Password
          </Button>
        </>
      ) : (
        <>
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <h3 className="font-semibold text-teal-900 mb-2">Password Updated!</h3>
            <p className="text-sm text-teal-800">
              Your password has been successfully changed. You can now log in with your new password.
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            fullWidth
            onClick={() => (window.location.href = '/login')}
          >
            Go to Login
          </Button>
        </>
      )}
    </form>
  );
}
