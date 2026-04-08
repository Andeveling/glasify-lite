'use server'

import { headers } from 'next/headers'
import { auth } from '@/server/auth'

export async function handleSignOut() {
  await auth.api.signOut({
    headers: await headers(),
  })
}
