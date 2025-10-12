'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SignInModal } from '@/components/signin-modal';

export function SignInPageClient() {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // When modal closes, redirect to catalog
      router.push('/catalog');
    }
  };

  // Ensure modal opens on mount
  useEffect(() => {
    setOpen(true);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30">
      <SignInModal onOpenChange={handleOpenChange} open={open} />
    </div>
  );
}
