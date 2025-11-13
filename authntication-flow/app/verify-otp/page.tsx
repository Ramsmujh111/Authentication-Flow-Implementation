import Image from 'next/image';
import { AuthHeader, AuthFooter, VerifyOtpForm } from '@/components/features/login';
// import VerifyOtpForm from '@/components/features/login/VerifyOtpForm';

export const metadata = {
  title: 'Verify OTP | Daily Inventory',
  description: 'Verify your identity with OTP code',
  keywords: ['otp', 'verify', 'authentication', 'inventory'],
};

export default function VerifyOtpPage() {
  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-white">
      {/* LEFT PANEL */}
      <div className="flex items-center justify-center px-6 sm:px-8 md:px-16 lg:px-20 py-8 sm:py-10 bg-white">
        <div className="w-full max-w-md">
          
          <AuthHeader
            title="Verify OTP"
            subtitle="Enter the 4-digit code sent to your email"
          />

          <VerifyOtpForm />

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
          <h2 className="text-2xl sm:text-3xl font-semibold mb-4">Secure Verification</h2>
          <p className="text-sm sm:text-base text-slate-200 mb-10 leading-relaxed">
            We&apos;ve sent a verification code to your email. Enter it below to
            complete your authentication and access your inventory dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
