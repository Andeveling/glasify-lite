'use server';

import { signOut } from '@/server/auth';

/**
 * Server Action to handle user sign out
 * Redirects to catalog page after successful sign out
 */
export async function handleSignOut() {
  await signOut({ redirectTo: '/catalog' });
}
