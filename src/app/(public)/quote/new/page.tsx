import { redirect } from 'next/navigation';
import logger from '@/lib/logger';
import { auth } from '@/server/auth';

/**
 * Quote Generation Page (Deprecated - Redirects to Cart)
 *
 * This page is deprecated. Quote generation is now handled via a drawer
 * in the cart page for better UX (no separate page needed).
 *
 * This redirect ensures old bookmarks/links still work.
 *
 * @route /quote/new
 * @deprecated Use cart page with drawer instead
 */
export default async function QuoteGenerationPage() {
  const session = await auth();

  logger.info('[QuoteGenerationPage] Redirecting to cart (deprecated route)', {
    isAuthenticated: !!session?.user,
  });

  // Redirect authenticated users to cart
  // Redirect unauthenticated users to sign-in → cart
  if (session?.user) {
    redirect('/cart');
  } else {
    redirect('/api/auth/signin?callbackUrl=/cart');
  }
}
