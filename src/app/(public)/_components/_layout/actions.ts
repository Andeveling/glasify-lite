'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/server/auth';

/**
 * Server Action to handle user sign out
 * Redirects to catalog page after successful sign out
 */
export async function handleSignOut() {
  await auth.api.signOut({
    headers: await headers(),
  });
  redirect('/catalog');
}
