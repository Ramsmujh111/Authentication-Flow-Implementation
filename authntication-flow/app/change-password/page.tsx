import Image from 'next/image';
import { AuthHeader } from '@/components/features/login';
import ChangePasswordForm from '@/components/features/login/ChangePasswordForm';

export const metadata = {
  title: 'Change Password | Daily Inventory',
  description: 'Set your new password',
  keywords: ['change password', 'reset', 'password', 'inventory'],
};

export default function ChangePasswordPage() {
  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-white">
      {/* LEFT PANEL */}
      <div className="flex items-center justify-center px-6 sm:px-8 md:px-16 lg:px-20 py-8 sm:py-10 bg-white">
        <div className="w-full max-w-md">
          <AuthHeader
            title="Set New Password"
            subtitle="Create a strong password to secure your account"
          />

          <ChangePasswordForm />
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
          <h2 className="text-2xl sm:text-3xl font-semibold mb-4">Secure Your Account</h2>
          <p className="text-sm sm:text-base text-slate-200 mb-10 leading-relaxed">
            Create a new strong password to protect your account. Make sure it&apos;s unique
            and contains a mix of letters, numbers, and special characters for maximum security.
          </p>
        </div>
      </div>
    </div>
  );
}
