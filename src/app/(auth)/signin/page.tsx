import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { auth } from '@/server/auth';
import { SignInPageClient } from './_components/signin-page-client';

export const metadata: Metadata = {
  description: 'Inicia sesión en tu cuenta de Glasify.',
  title: 'Iniciar Sesión - Glasify',
};

export default async function SignInPage() {
  // Check if user is already authenticated
  const session = await auth();

  if (session?.user) {
    redirect('/auth/callback');
  }

  // Render client component with modal
  return <SignInPageClient />;
}
