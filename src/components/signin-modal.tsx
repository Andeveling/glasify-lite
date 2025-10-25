'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Icons } from '@/components/ui/icons';
import { signIn } from '@/lib/auth-client';

// ============================================================================
// Types
// ============================================================================

type SignInModalProps = {
  /** Whether the modal is open */
  open: boolean;

  /** Callback when modal open state changes */
  onOpenChangeAction: (open: boolean) => void;

  /** Callback URL after successful sign-in (defaults to /catalog) */
  callbackUrl?: string;
};

// ============================================================================
// Component
// ============================================================================

export function SignInModal({
  open,
  onOpenChangeAction,
  callbackUrl: defaultCallbackUrl,
}: SignInModalProps) {
  const searchParams = useSearchParams();
  const [ isGoogleLoading, setIsGoogleLoading ] = useState(false);
  const [ error, setError ] = useState<string | null>(null);

  // Get callbackUrl from prop, query params, or default to /catalog
  const callbackUrl = defaultCallbackUrl || searchParams.get('callbackUrl') || '/catalog';

  /**
   * Handle Google OAuth sign-in
   */
  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      setError(null);

      await signIn.social({
        callbackURL: callbackUrl,
        provider: 'google',
      });
      // Note: User will be redirected by signIn, modal closes via redirect
    } catch {
      setError('Error al conectar con Google. Intenta nuevamente.');
      setIsGoogleLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={onOpenChangeAction} open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-4">
          {/* Logo/Icon */}
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <span className="font-bold text-2xl text-primary-foreground">G</span>
          </div>

          <div className="space-y-2 text-center">
            <DialogTitle className="text-2xl">Iniciar Sesión</DialogTitle>
            <DialogDescription className="text-base">
              Usa Google para acceder rápidamente
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Error message */}
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* OAuth Providers - Solo Google */}
          <Button
            className="w-full"
            disabled={isGoogleLoading}
            onClick={handleGoogleSignIn}
            size="lg"
            type="button"
          >
            {isGoogleLoading ? (
              <Icons.spinner className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Icons.google className="mr-2 h-5 w-5" />
            )}
            Continuar con Google
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
