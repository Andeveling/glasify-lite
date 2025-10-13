import { Spinner } from '@/components/ui/spinner';
/**
 * Loading state for auth callback
 * Shown while the page determines where to redirect the user
 */
export default function AuthCallbackLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner />
        <p className="text-muted-foreground text-sm">Redirigiendo...</p>
      </div>
    </div>
  );
}
