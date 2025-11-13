import Image from 'next/image';
import { AuthHeader, AuthFooter } from '@/components/features/login';
import RegisterForm from '@/components/features/register/RegisterForm';

export const metadata = {
  title: 'Sign Up | Daily Inventory',
  description:
    'Create a new account on Daily Inventory to manage your inventory, improve efficiency, and track analytics.',
  keywords: ['signup', 'register', 'inventory', 'management', 'daily', 'dashboard'],
  openGraph: {
    title: 'Daily Inventory Sign Up',
    description: 'Create your account for Daily Inventory Management System.',
  },
};

export default function SignupPage() {
  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-white">
      {/* LEFT PANEL */}
      <div className="flex items-center justify-center px-6 sm:px-8 md:px-16 lg:px-20 py-8 sm:py-10 bg-white">
        <div className="w-full max-w-md">
          <AuthHeader
            title="Create Account"
            subtitle="Join us and get started today"
          />

          <RegisterForm />

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
          <h2 className="text-2xl sm:text-3xl font-semibold mb-4">Start Your Journey</h2>
          <p className="text-sm sm:text-base text-slate-200 mb-10 leading-relaxed">
            Join our platform to streamline your inventory processes, reduce
            costs, and enhance productivity.
          </p>
        </div>
      </div>
    </div>
  );
}
