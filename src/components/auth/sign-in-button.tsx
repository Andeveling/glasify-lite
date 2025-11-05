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

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth-client";

// ============================================================================
// Types
// ============================================================================

export type SignInButtonProps = {
  /** URL to redirect to after successful sign-in */
  callbackUrl?: string;

  /** Custom button text (default: 'Iniciar sesión con Google') */
  children?: React.ReactNode;

  /** Button variant */
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";

  /** Button size */
  size?: "default" | "sm" | "lg" | "icon";

  /** Custom CSS class */
  className?: string;
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
  callbackUrl = "/dashboard",
  children = "Iniciar sesión con Google",
  variant = "default",
  size = "default",
  className,
}: SignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handle Google OAuth sign-in
   */
  const handleSignIn = async () => {
    try {
      setIsLoading(true);

      // Trigger Google OAuth flow
      await signIn.social({
        callbackURL: callbackUrl,
        provider: "google",
      });
    } catch {
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
      {isLoading ? "Iniciando sesión..." : children}
    </Button>
  );
}
