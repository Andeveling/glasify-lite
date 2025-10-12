import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { auth } from '@/server/auth';
import AuthCard from '../_components/auth-card';
import SignInForm from '../_components/signin-form';

export const metadata: Metadata = {
  description: 'Inicia sesión en tu cuenta de Glasify para acceder al panel de administración.',
  title: 'Iniciar Sesión - Glasify',
};

export default async function SignInPage() {
  // Check if user is already authenticated
  const session = await auth();

  if (session?.user) {
    redirect('/auth/callback');
  }

  return (
    <AuthCard description="Ingresa a tu cuenta para acceder al panel de administración" title="Iniciar Sesión">
      <SignInForm />
    </AuthCard>
  );
}
