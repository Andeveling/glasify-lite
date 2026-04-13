'use client'

import SignInForm from '@/app/(auth)/_components/signin-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// ============================================================================
// Types
// ============================================================================

type SignInModalProps = {
  /** Whether the modal is open */
  open: boolean

  /** Callback when modal open state changes */
  onOpenChangeAction: (open: boolean) => void

  /** Callback URL after successful sign-in (defaults to /catalog) */
  callbackUrl?: string
}

// ============================================================================
// Component
// ============================================================================

export function SignInModal({ open, onOpenChangeAction }: SignInModalProps) {
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
            <DialogDescription className="text-base">Ingresa tus credenciales</DialogDescription>
          </div>
        </DialogHeader>

        <SignInForm />
      </DialogContent>
    </Dialog>
  )
}
