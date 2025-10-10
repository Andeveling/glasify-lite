/**
 * SignInButton Component
 *
 * Displays Google OAuth sign-in button with callbackUrl support.
 * Handles authentication redirect flow for quote generation.
 *
 * Features:
 * - Google OAuth integration
 * - callbackUrl preservation
 * - Loading states
 * - Error handling
 *
 * @module components/auth/sign-in-button
 */

'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import logger from '@/lib/logger';

// ============================================================================
// Types
// ============================================================================

export type SignInButtonProps = {
  /** URL to redirect to after successful sign-in */
  callbackUrl?: string;

  /** Custom button text (default: 'Iniciar sesión con Google') */
  children?: React.ReactNode;

  /** Button variant */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';

  /** Button size */
  size?: 'default' | 'sm' | 'lg' | 'icon';

  /** Custom CSS class */
  className?: string;

  /** Callback on sign-in success */
  onSuccess?: () => void;

  /** Callback on sign-in error */
  onError?: (error: Error) => void;
};

// ============================================================================
// Component
// ============================================================================

/**
 * Google OAuth sign-in button
 *
 * @example
 * ```tsx
 * <SignInButton callbackUrl="/quote/new">
 *   Iniciar sesión para continuar
 * </SignInButton>
 * ```
 */
export function SignInButton({
  callbackUrl = '/dashboard',
  children = 'Iniciar sesión con Google',
  variant = 'default',
  size = 'default',
  className,
  onSuccess,
  onError,
}: SignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handle Google OAuth sign-in
   */
  const handleSignIn = async () => {
    try {
      setIsLoading(true);

      logger.info('Initiating Google OAuth sign-in', {
        action: 'signin-start',
        callbackUrl,
        correlationId: crypto.randomUUID(),
      });

      // Trigger Google OAuth flow
      await signIn('google', {
        callbackUrl,
        redirect: true,
      });

      // Success callback (may not execute if redirect happens immediately)
      onSuccess?.();
    } catch (error) {
      logger.error('Sign-in failed', {
        action: 'signin-error',
        correlationId: crypto.randomUUID(),
        error,
      });

      // Error callback
      const errorObj = error instanceof Error ? error : new Error('Sign-in failed');
      onError?.(errorObj);

      setIsLoading(false);
    }
  };

  return (
    <Button
      className={className}
      disabled={isLoading}
      onClick={handleSignIn}
      size={size}
      type="button"
      variant={variant}
    >
      {isLoading ? 'Iniciando sesión...' : children}
    </Button>
  );
}
