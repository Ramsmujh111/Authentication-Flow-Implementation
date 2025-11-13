'use client';

import { useState } from 'react';
import { Input } from '@/components/ui';
import { PasswordInput } from '@/components/ui';
import { Button } from '@/components/ui';
import { Checkbox } from '@/components/ui';

interface RegisterFormProps {
  onSuccess?: () => void;
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    agreeToTerms: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Register form submitted:', formData);
    // Add registration logic here
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
      <Input
        type="text"
        placeholder="Enter your full name"
        name="name"
        value={formData.name}
        onChange={handleInputChange}
        label="Full Name"
        required
      />

      <Input
        type="email"
        placeholder="Enter your email address"
        name="email"
        value={formData.email}
        onChange={handleInputChange}
        label="Email Address"
        required
      />

      <PasswordInput
        placeholder="Create a strong password"
        name="password"
        value={formData.password}
        onChange={handleInputChange}
        label="Password"
        required
      />

      {/* <Checkbox
        id="agreeToTerms"
        name="agreeToTerms"
        checked={formData.agreeToTerms}
        onChange={handleInputChange}
        label="I agree to the Terms and Conditions"
      /> */}

      <Button type="submit" variant="primary" fullWidth>
        Create Account
      </Button>

      <p className="text-center text-zinc-600 text-sm">
        Already have an account?{' '}
        <a href="/login" className="text-teal-600 hover:text-teal-700 font-medium">
          Sign In
        </a>
      </p>
    </form>
  );
}
