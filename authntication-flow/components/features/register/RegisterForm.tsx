'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui';
import { PasswordInput } from '@/components/ui';
import { Button } from '@/components/ui';
import { registerFormSchema } from '@/lib/schemas/validationSchemas';
import { ZodError } from 'zod';

interface RegisterFormProps {
  onSuccess?: () => void;
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    try {
      const validatedData = registerFormSchema.parse(formData);
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

    // API call to register
    setIsLoading(true);
    setSuccessMessage('');
    setErrors({}); // Clear any previous errors
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          agreeToTerms: formData.agreeToTerms,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle different error types
        if (data.errors && typeof data.errors === 'object') {
          // Validation errors from API
          setErrors(data.errors);
        } else if (data.message) {
          // General error message
          setErrors({
            submit: data.message,
          });
        } else {
          setErrors({
            submit: 'Registration failed. Please try again.',
          });
        }
        setIsLoading(false);
        return;
      }

      // Success - show message and redirect
      setSuccessMessage(
        'Registration successful! Please check your email to verify your account.'
      );
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false,
      });

      setIsLoading(false);

      if (onSuccess) {
        onSuccess();
      }

      // Redirect to verify-email page after 2 seconds
      setTimeout(() => {
        router.push('/verify-email');
      }, 2000);
    } catch (error) {
      setIsLoading(false);
      setErrors({
        submit: error instanceof Error ? error.message : 'An error occurred. Please try again.',
      });
      console.error('Registration error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm font-medium">{successMessage}</p>
        </div>
      )}

      {errors.submit && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm font-medium">{errors.submit}</p>
        </div>
      )}
      <Input
        type="text"
        placeholder="Enter your full name"
        name="name"
        value={formData.name}
        onChange={handleInputChange}
        label="Full Name"
        error={errors.name}
        required
      />

      <Input
        type="email"
        placeholder="Enter your email address"
        name="email"
        value={formData.email}
        onChange={handleInputChange}
        label="Email Address"
        error={errors.email}
        required
      />

      <PasswordInput
        placeholder="Create a strong password"
        name="password"
        value={formData.password}
        onChange={handleInputChange}
        label="Password"
        error={errors.password}
        required
      />

      <PasswordInput
        placeholder="Confirm your password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleInputChange}
        label="Confirm Password"
        error={errors.confirmPassword}
        required
      />

      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          name="agreeToTerms"
          checked={formData.agreeToTerms}
          onChange={handleInputChange}
          className={`mt-1 h-4 w-4 rounded cursor-pointer focus:ring-2 
            ${errors.agreeToTerms ? 'bg-red-50 border-red-500 text-red-600 focus:ring-red-600' : 'text-teal-600 focus:ring-teal-600'}`}
        />
        <div className="flex-1">
          <label className="text-sm text-slate-700 cursor-pointer">
            I agree to the{' '}
            <a href="/terms" className="text-teal-600 hover:text-teal-700 font-medium">
              Terms & Conditions
            </a>
            {' '}and{' '}
            <a href="/privacy" className="text-teal-600 hover:text-teal-700 font-medium">
              Privacy Policy
            </a>
            <span className="text-red-500">*</span>
          </label>
          {errors.agreeToTerms && (
            <p className="mt-1 text-sm text-red-500">{errors.agreeToTerms}</p>
          )}
        </div>
      </div>


      <Button type="submit" variant="primary" fullWidth disabled={isLoading}>
        {isLoading ? 'Creating Account...' : 'Create Account'}
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
