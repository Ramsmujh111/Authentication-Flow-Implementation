import Image from "next/image";
import { LoginForm, SocialLogin, AuthHeader, AuthFooter } from "@/components/features/login";

export const metadata = {
    title: "Login | Daily Inventory",
    description:
        "Login to Daily Inventory to manage your inventory, improve efficiency, and track analytics.",
    keywords: ["login", "inventory", "management", "daily", "dashboard"],
    openGraph: {
        title: "Daily Inventory Login",
        description: "Secure login portal for Daily Inventory Management System.",
    },
};

export default function LoginPage() {
    return (
        <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-white">
            {/* LEFT PANEL */}
            <div className="flex items-center justify-center px-6 sm:px-8 md:px-16 lg:px-20 py-8 sm:py-10 bg-white">
                <div className="w-full max-w-md">

                    <AuthHeader
                        title="Welcome Back!"
                        subtitle="Please enter log in details below"
                    />

                    <LoginForm />

                    {/* <SocialLogin /> */}

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
                    <h2 className="text-2xl sm:text-3xl font-semibold mb-4">Inventory Management</h2>
                    <p className="text-sm sm:text-base text-slate-200 mb-10 leading-relaxed">
                        Join our platform to streamline your inventory processes, reduce
                        costs, and enhance productivity.
                    </p>
                </div>
            </div>
        </div>
    );
}
