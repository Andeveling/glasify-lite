import { redirect } from 'next/navigation';
import { auth } from '@/server/auth';

/**
 * Auth callback page that redirects users based on their role
 * - Admins → /dashboard
 * - Regular users → /my-quotes
 *
 * This page always redirects and never renders content
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
