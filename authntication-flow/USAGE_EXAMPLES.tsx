// EXAMPLE USAGE GUIDE FOR REFACTORED COMPONENTS

// ============================================
// 1. SIMPLE LOGIN FORM
// ============================================
import { LoginForm, AuthHeader, AuthFooter, SocialLogin } from '@/components/features/login';

export default function LoginPageExample() {
    return (
        <div className="max-w-md mx-auto p-6">
            <AuthHeader
                title="Welcome Back!"
                subtitle="Please enter log in details below"
            />
            <LoginForm />
            <SocialLogin />
            <AuthFooter
                message="Don't have an account?"
                linkText="Sign Up"
                linkHref="/signup"
            />
        </div>
    );
}


// ============================================
// 2. CUSTOM LOGIN FORM
// ============================================
'use client';

import { useState } from 'react';
import { Input, PasswordInput, Button, Checkbox } from '@/components/ui';

export function CustomLoginForm() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false,
    });

    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.password) newErrors.password = 'Password is required';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validateForm();

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            // Call your API here
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                console.log('Login successful');
                // Redirect to dashboard
            } else {
                setErrors({ form: 'Login failed' });
            }
        } catch (error) {
            setErrors({ form: 'An error occurred' });
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {errors.form && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {errors.form}
                </div>
            )}

            <Input
                type="email"
                name="email"
                label="Email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
            />
            {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
            )}

            <PasswordInput
                name="password"
                label="Password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
            />
            {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
            )}

            <div className="flex items-center justify-between">
                <Checkbox
                    name="rememberMe"
                    label="Remember me"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                />
                <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                    Forgot password?
                </a>
            </div>

            <Button type="submit" variant="primary" fullWidth>
                Sign In
            </Button>
        </form>
    );
}


// ============================================
// 3. SIGN UP PAGE USING REUSABLE COMPONENTS
// ============================================
'use client';

import { useState } from 'react';
import { Input, PasswordInput, Button, Checkbox } from '@/components/ui';
import { AuthHeader, AuthFooter, SocialLogin } from '@/components/features/login';

export default function SignUpPage() {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Sign up data:', formData);
        // Handle signup logic
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full">
                <AuthHeader
                    title="Create Account"
                    subtitle="Sign up to get started"
                />

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        type="text"
                        name="fullName"
                        label="Full Name"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        type="email"
                        name="email"
                        label="Email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <PasswordInput
                        name="password"
                        label="Password"
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <PasswordInput
                        name="confirmPassword"
                        label="Confirm Password"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />

                    <Checkbox
                        name="agreeToTerms"
                        label="I agree to the Terms & Conditions"
                        checked={formData.agreeToTerms}
                        onChange={handleChange}
                    />

                    <Button type="submit" variant="primary" fullWidth>
                        Create Account
                    </Button>
                </form>

                <SocialLogin />

                <AuthFooter
                    message="Already have an account?"
                    linkText="Sign In"
                    linkHref="/login"
                />
            </div>
        </div>
    );
}


// ============================================
// 4. PASSWORD RESET PAGE
// ============================================
'use client';

import { useState } from 'react';
import { Input, Button } from '@/components/ui';
import { AuthHeader, AuthFooter } from '@/components/features/login';

export default function PasswordResetPage() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Reset email:', email);
        setSubmitted(true);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full">
                <AuthHeader
                    title="Reset Password"
                    subtitle="Enter your email to receive reset instructions"
                />

                {submitted ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <p className="text-green-700">
                            Check your email for password reset instructions.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <Input
                            type="email"
                            label="Email Address"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <Button type="submit" variant="primary" fullWidth>
                            Send Reset Link
                        </Button>
                    </form>
                )}

                <AuthFooter
                    message="Remember your password?"
                    linkText="Back to Sign In"
                    linkHref="/login"
                />
            </div>
        </div>
    );
}


// ============================================
// 5. ACCESSING FORM DATA FROM CHILD COMPONENTS
// ============================================
'use client';

import { useCallback } from 'react';
import { Input } from '@/components/ui';

interface FormFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

export function FormField({ label, value, onChange, error }: FormFieldProps) {
    return (
        <div>
            <Input
                label={label}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
}

// Usage in parent component:
export function ParentForm() {
    const [fields, setFields] = useState({
        username: '',
        email: '',
    });

    const handleFieldChange = useCallback((fieldName: string, value: string) => {
        setFields((prev) => ({
            ...prev,
            [fieldName]: value,
        }));
    }, []);

    return (
        <div>
            <FormField
                label="Username"
                value={fields.username}
                onChange={(value) => handleFieldChange('username', value)}
            />
            <FormField
                label="Email"
                value={fields.email}
                onChange={(value) => handleFieldChange('email', value)}
            />
        </div>
    );
}
