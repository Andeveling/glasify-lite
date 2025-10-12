import { Loader2 } from 'lucide-react';
import { redirect } from 'next/navigation';
import { auth } from '@/server/auth';

/**
 * Auth callback page that redirects users based on their role
 * - Admins → /dashboard
 * - Regular users → /my-quotes
 *
 * Shows a loading state while determining redirect destination
 */
export default async function AuthCallbackPage() {
  const session = await auth();

  if (!session?.user) {
    // Not authenticated, redirect to signin
    redirect('/signin');
  }

  // Redirect based on user role
  if (session.user.role === 'admin') {
    redirect('/dashboard');
  }

  // Regular users go to their quotes
  redirect('/my-quotes');
}

// Loading component (fallback, should redirect before rendering)
export function Loading() {
  return (
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground text-sm">Redirigiendo...</p>
    </div>
  );
}
