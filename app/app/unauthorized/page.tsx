'use client';

import { useRouter } from 'next/navigation';
import { UnauthorizedError } from '@/components/ui/error-states';

export default function UnauthorizedPage() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <UnauthorizedError onLogin={handleGoBack} />
      </div>
    </div>
  );
}
