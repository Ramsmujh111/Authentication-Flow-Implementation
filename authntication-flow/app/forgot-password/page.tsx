import Image from 'next/image';
import { AuthHeader, AuthFooter } from '@/components/features/login';
import ForgotPasswordForm from '@/components/features/login/ForgotPasswordForm';

export const metadata = {
  title: 'Forgot Password | Daily Inventory',
  description: 'Reset your password',
  keywords: ['forgot password', 'reset', 'password', 'inventory'],
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-white">
      {/* LEFT PANEL */}
      <div className="flex items-center justify-center px-6 sm:px-8 md:px-16 lg:px-20 py-8 sm:py-10 bg-white">
        <div className="w-full max-w-md">
          <AuthHeader
            title="Forgot Password?"
            subtitle="We&apos;ll help you reset it"
          />

          <ForgotPasswordForm />

          <AuthFooter
            message="Don't have an account?"
            linkText="Sign Up"
            linkHref="/signup"
          />
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="hidden lg:flex items-start justify-start bg-[#053C4E] text-white p-6 sm:p-8 md:p-10 relative overflow-hidden">
        
        {/* Background Image */}
        <Image
          src="/wallperSidebar.png"
          alt="Sidebar Background"
          fill
          className="object-cover absolute inset-0"
          priority
        />

        {/* Overlay for better text readability */}
        <div className="absolute inset-0 opacity-50 bg-[#053C4E]" />

        <div className="relative z-10 max-w-lg text-start">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-4">Account Recovery</h2>
          <p className="text-sm sm:text-base text-slate-200 mb-10 leading-relaxed">
            Don&apos;t worry! We&apos;ll help you recover your account quickly and securely.
            Enter your email address and we&apos;ll send you instructions to reset your password.
          </p>
        </div>
      </div>
    </div>
  );
}
