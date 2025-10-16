'use client';

import { ChevronRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Icons } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type SignInModalProps = {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  defaultEmail?: string;
};

export function SignInModal({ open, onOpenChangeAction, defaultEmail = '' }: SignInModalProps) {
  const [ isGoogleLoading, setIsGoogleLoading ] = useState(false);
  const [ isEmailLoading, setIsEmailLoading ] = useState(false);
  const [ email, setEmail ] = useState(defaultEmail);
  const searchParams = useSearchParams();

  // Get callbackUrl from query params, default to /catalog
  const callbackUrl = searchParams.get('callbackUrl') || '/catalog';

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      await signIn('google', { callbackUrl });
    } catch (_error) {
      // Error handling delegated to NextAuth
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleEmailContinue = () => {
    if (!email) return;

    try {
      setIsEmailLoading(true);
    } catch (_error) {
      // Error handling delegated to email provider
    } finally {
      setIsEmailLoading(false);
    }
  };

  const isLoading = isGoogleLoading || isEmailLoading;

  return (
    <Dialog onOpenChange={onOpenChangeAction} open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-4">
          {/* Logo/Icon */}
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <span className="font-bold text-2xl text-primary-foreground">G</span>
          </div>

          <div className="space-y-2 text-center">
            <DialogTitle className="text-2xl">Iniciar Sesión en Glasify</DialogTitle>
            <DialogDescription className="text-base">
              Bienvenido de nuevo! Por favor inicia sesión para continuar
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* OAuth Providers - Solo Google por ahora */}
          <Button
            className="w-full"
            disabled={isLoading}
            onClick={handleGoogleSignIn}
            size="lg"
            type="button"
            variant="outline"
          >
            {isGoogleLoading ? (
              <Icons.spinner className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Icons.google className="mr-2 h-5 w-5" />
            )}
            Continuar con Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">o</span>
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email">Dirección de email</Label>
            <Input
              autoComplete="email"
              disabled={isLoading}
              id="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingresa tu dirección de email"
              type="email"
              value={email}
            />
          </div>

          <Button className="w-full" disabled={isLoading || !email} onClick={handleEmailContinue} size="lg">
            {isEmailLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Continuar
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>

          <p className="text-center text-muted-foreground text-xs">
            ¿No tienes una cuenta?{' '}
            <button
              className="font-medium text-primary hover:underline"
              onClick={() => {
                // TODO: Implement signup flow
              }}
              type="button"
            >
              Regístrate
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
