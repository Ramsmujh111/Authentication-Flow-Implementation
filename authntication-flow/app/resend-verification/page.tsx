import { Suspense } from 'react';
import ResendVerificationContent from './resend-verification-content';
// import ResendVerificationContent from './resend-verification-content';

export default function ResendVerificationPage() {
  return (
    <Suspense fallback={<ResendVerificationLoading />}>
      <ResendVerificationContent />
    </Suspense>
  );
}

function ResendVerificationLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    </div>
  );
}
