# Quickstart Guide: Role-Based Access Control

**Feature**: 009-role-based-access  
**Date**: 14 de octubre de 2025  
**Audience**: Developers implementing or extending RBAC features

---

## Overview

This guide provides practical examples for working with the role-based access control system in Glasify Lite. It covers common development tasks from database migrations to UI conditional rendering.

---

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- Prisma CLI installed (`pnpm add -D prisma`)
- NextAuth.js v5 configured
- tRPC v11 routers set up

---

## Quick Reference

### Role Hierarchy

```
admin (highest)
  ├─ Full system access
  ├─ Can manage users, models, tenant config
  └─ Sees all quotes
  
seller
  ├─ Limited access
  ├─ Can create/view own quotes
  └─ Cannot manage system settings
  
user (lowest)
  ├─ Client access
  ├─ Can view own quotes
  └─ Can browse catalog
```

---

## 1. Database Setup

### Step 1: Update Prisma Schema

Add the `UserRole` enum and `role` field to `User` model:

```prisma
// prisma/schema.prisma

enum UserRole {
  admin
  seller
  user
}

model User {
  id                String                  @id @default(cuid())
  name              String?
  email             String?                 @unique
  emailVerified     DateTime?
  image             String?
  role              UserRole                @default(user)  // ADD THIS
  accounts          Account[]
  sessions          Session[]
  quotes            Quote[]
  priceChanges      ModelPriceHistory[]
  glassPriceChanges GlassTypePriceHistory[]
  
  @@index([role])  // ADD THIS
}
```

### Step 2: Generate Migration

```bash
# Create migration
pnpm prisma migrate dev --name add_user_role

# Alternatively, generate SQL first (review before applying)
pnpm prisma migrate dev --create-only --name add_user_role
# Review prisma/migrations/[timestamp]_add_user_role/migration.sql
pnpm prisma migrate dev
```

### Step 3: Set Admin Role for Existing User

```sql
-- Run in PostgreSQL or Prisma Studio
UPDATE "User" 
SET "role" = 'admin' 
WHERE LOWER("email") = LOWER('your-admin@example.com');
```

Or via seed script:

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Set admin role for specific email
  await prisma.user.updateMany({
    where: { email: { equals: process.env.ADMIN_EMAIL, mode: 'insensitive' } },
    data: { role: 'admin' },
  });
  
  console.log('✅ Admin role assigned');
}

main();
```

```bash
# Run seed
pnpm prisma db seed
```

### Step 4: Generate Prisma Client

```bash
pnpm prisma generate
```

---

## 2. NextAuth Configuration

### Update Session Callback

```typescript
// src/server/auth/config.ts
import { PrismaAdapter } from '@auth/prisma-adapter';
import type { DefaultSession, NextAuthConfig } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { env } from '@/env';
import { db } from '@/server/db';

// Extend NextAuth types
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: 'admin' | 'seller' | 'user';  // ADD THIS
    } & DefaultSession['user'];
  }

  interface User {
    role?: 'admin' | 'seller' | 'user';  // ADD THIS
  }
}

// Helper: Check if email is admin
const isAdmin = (email: string | null | undefined): boolean => {
  if (!email || !env.ADMIN_EMAIL) return false;
  return email.toLowerCase() === env.ADMIN_EMAIL.toLowerCase();
};

export const authConfig = {
  adapter: PrismaAdapter(db),
  callbacks: {
    // ADD THIS: Include role in session
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
        role: user.role || (isAdmin(user.email) ? 'admin' : 'user'),
      },
    }),
  },
  pages: {
    signIn: '/signin',
  },
  providers: [GoogleProvider],
} satisfies NextAuthConfig;
```

---

## 3. Middleware Authorization

### Update Middleware

```typescript
// src/middleware.ts
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import logger from '@/lib/logger';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session (includes role)
  const session = await auth();
  const isLoggedIn = !!session;
  const userRole = session?.user?.role;

  // Define route patterns
  const isProtectedRoute =
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/quotes') || 
    pathname.startsWith('/my-quotes');
  
  const isAdminRoute = pathname.startsWith('/dashboard');
  const isSellerRoute = pathname.startsWith('/quotes') && pathname !== '/my-quotes';
  const isAuthRoute = pathname.startsWith('/signin');
  const isAuthCallback = pathname === '/auth/callback';

  // 1. Redirect unauthenticated users
  if (isProtectedRoute && !isLoggedIn) {
    const signinUrl = new URL('/signin', request.url);
    signinUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signinUrl);
  }

  // 2. Block non-admin from admin routes
  if (isAdminRoute && userRole !== 'admin') {
    logger.warn('Unauthorized dashboard access', {
      userId: session?.user?.id,
      role: userRole,
      path: pathname,
    });
    return NextResponse.redirect(new URL('/my-quotes', request.url));
  }

  // 3. Block non-seller from seller routes
  if (isSellerRoute && !['admin', 'seller'].includes(userRole || '')) {
    return NextResponse.redirect(new URL('/my-quotes', request.url));
  }

  // 4. Redirect logged-in users away from signin
  if (isAuthRoute && isLoggedIn && !isAuthCallback) {
    return NextResponse.redirect(new URL('/auth/callback', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

---

## 4. tRPC Procedure Helpers

### Create Procedure Helpers

```typescript
// src/server/api/trpc.ts
import { TRPCError } from '@trpc/server';
import type { Session } from 'next-auth';
import type { Prisma } from '@prisma/client';

// Admin-only procedure
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.role !== 'admin') {
    throw new TRPCError({ 
      code: 'FORBIDDEN', 
      message: 'Acceso denegado. Se requiere rol de administrador.' 
    });
  }
  return next({ ctx });
});

// Seller or Admin procedure
export const sellerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!['admin', 'seller'].includes(ctx.session.user.role)) {
    throw new TRPCError({ 
      code: 'FORBIDDEN', 
      message: 'Acceso denegado. Se requiere rol de vendedor o administrador.' 
    });
  }
  return next({ ctx });
});

// Helper: Get quote filter based on role
export function getQuoteFilter(session: Session): Prisma.QuoteWhereInput {
  if (session.user.role === 'admin') {
    return {}; // Admin sees all
  }
  return { userId: session.user.id }; // Others see only theirs
}
```

### Use in Routers

```typescript
// src/server/api/routers/quote.ts
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, adminProcedure, getQuoteFilter } from '../trpc';

export const quoteRouter = createTRPCRouter({
  // Role-based filtering (auto-applies to all roles)
  'list': protectedProcedure
    .input(z.object({ status: z.enum(['draft', 'sent', 'canceled']).optional() }))
    .query(async ({ ctx, input }) => {
      const filter = getQuoteFilter(ctx.session);
      
      return await ctx.db.quote.findMany({
        where: { ...filter, status: input.status },
        include: { items: true },
      });
    }),

  // Admin-only: See all quotes without filtering
  'list-all': adminProcedure
    .query(async ({ ctx }) => {
      return await ctx.db.quote.findMany({
        include: { user: true, items: true },
        orderBy: { createdAt: 'desc' },
      });
    }),
});
```

---

## 5. Server Component Guards

### Create Guard Components

```typescript
// src/app/_components/admin-only.tsx
import { auth } from '@/server/auth';

type AdminOnlyProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export async function AdminOnly({ children, fallback = null }: AdminOnlyProps) {
  const session = await auth();
  
  if (session?.user?.role !== 'admin') {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}
```

```typescript
// src/app/_components/seller-only.tsx
import { auth } from '@/server/auth';

type SellerOnlyProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export async function SellerOnly({ children, fallback = null }: SellerOnlyProps) {
  const session = await auth();
  
  if (!['admin', 'seller'].includes(session?.user?.role || '')) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}
```

### Use in Pages

```tsx
// src/app/(dashboard)/dashboard/page.tsx
import { AdminOnly } from '@/app/_components/admin-only';
import Link from 'next/link';

export default async function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      <AdminOnly>
        <Link href="/dashboard/settings">⚙️ Configuración del Sistema</Link>
      </AdminOnly>
      
      <AdminOnly fallback={<p>Acceso restringido</p>}>
        <button onClick={dangerousAction}>Acción Peligrosa</button>
      </AdminOnly>
    </div>
  );
}
```

---

## 6. Role-Based Navigation

### Server Component with Role-Filtered Links

```typescript
// src/app/_components/role-based-nav.tsx
import { auth } from '@/server/auth';
import { NavigationMenu } from './navigation-menu'; // Client component

type NavLink = { href: string; label: string };

async function getNavLinksForRole(role: string | undefined): Promise<NavLink[]> {
  const adminLinks: NavLink[] = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/models', label: 'Modelos' },
    { href: '/dashboard/quotes', label: 'Cotizaciones' },
  ];
  
  const sellerLinks: NavLink[] = [
    { href: '/quotes', label: 'Mis Cotizaciones' },
    { href: '/catalog', label: 'Catálogo' },
  ];
  
  const userLinks: NavLink[] = [
    { href: '/my-quotes', label: 'Mis Cotizaciones' },
    { href: '/catalog', label: 'Catálogo' },
  ];
  
  switch (role) {
    case 'admin': return adminLinks;
    case 'seller': return sellerLinks;
    default: return userLinks;
  }
}

export async function RoleBasedNav() {
  const session = await auth();
  const links = await getNavLinksForRole(session?.user?.role);
  
  return <NavigationMenu links={links} />;
}
```

---

## 7. Testing

### Unit Test: Role Validation

```typescript
// tests/unit/auth-helpers.test.ts
import { describe, expect, it } from 'vitest';
import { getQuoteFilter } from '@/server/api/trpc';

describe('getQuoteFilter', () => {
  it('returns empty filter for admin', () => {
    const session = { user: { id: '1', role: 'admin' as const } };
    expect(getQuoteFilter(session)).toEqual({});
  });

  it('returns userId filter for seller', () => {
    const session = { user: { id: '2', role: 'seller' as const } };
    expect(getQuoteFilter(session)).toEqual({ userId: '2' });
  });

  it('returns userId filter for user', () => {
    const session = { user: { id: '3', role: 'user' as const } };
    expect(getQuoteFilter(session)).toEqual({ userId: '3' });
  });
});
```

### E2E Test: Admin Dashboard Access

```typescript
// e2e/admin-dashboard.spec.ts
import { test, expect } from '@playwright/test';

test('admin can access dashboard', async ({ page }) => {
  // Login as admin
  await page.goto('/signin');
  await page.click('text=Sign in with Google');
  // ... complete OAuth flow

  // Navigate to dashboard
  await page.goto('/dashboard');
  
  // Verify access
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('h1')).toContainText('Dashboard');
});

test('non-admin redirected from dashboard', async ({ page }) => {
  // Login as regular user
  await page.goto('/signin');
  // ... login as user

  // Attempt dashboard access
  await page.goto('/dashboard');

  // Should redirect
  await expect(page).toHaveURL('/my-quotes');
});
```

---

## 8. Common Tasks

### Change User Role (Admin)

```typescript
// Via tRPC procedure
const updateRole = api.user['update-role'].useMutation();

await updateRole.mutateAsync({
  userId: 'user-cuid-here',
  role: 'seller',
});
```

### Check Current User Role (Client)

```typescript
'use client';

import { useSession } from 'next-auth/react';

export function RoleDisplay() {
  const { data: session } = useSession();
  
  return <p>Tu rol: {session?.user?.role}</p>;
}
```

### Check Current User Role (Server)

```typescript
// Server Component or Server Action
import { auth } from '@/server/auth';

export default async function ProfilePage() {
  const session = await auth();
  const role = session?.user?.role;
  
  return <p>Tu rol: {role}</p>;
}
```

---

## 9. Troubleshooting

### Issue: User role is always 'user' after migration

**Solution**: Run role assignment for admin:

```sql
UPDATE "User" SET "role" = 'admin' WHERE email = 'your-admin@example.com';
```

Then logout and login again (session needs refresh).

---

### Issue: "FORBIDDEN" error when calling admin procedure

**Check**:
1. User has `admin` role in database
2. Session includes updated role (logout/login)
3. Procedure uses `adminProcedure` helper

**Debug**:
```typescript
// Add logging in procedure
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  console.log('Session role:', ctx.session.user.role);
  // ... rest of code
});
```

---

### Issue: Middleware redirects in a loop

**Check**: Ensure `/auth/callback` is excluded from admin route check:

```typescript
const isAuthCallback = pathname === '/auth/callback';
if (isAuthRoute && isLoggedIn && !isAuthCallback) {
  return NextResponse.redirect(new URL('/auth/callback', request.url));
}
```

---

## 10. Environment Variables

### Required Variables

```bash
# .env
ADMIN_EMAIL="admin@example.com"  # Fallback admin (optional if using DB roles)
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
DATABASE_URL="postgresql://..."
```

---

## Next Steps

- Implement user management UI for role assignment
- Add audit logging for role changes
- Create admin dashboard with metrics
- Build seller-specific features

---

## Related Documents

- [spec.md](./spec.md) - Feature specification
- [research.md](./research.md) - Technical research
- [data-model.md](./data-model.md) - Database schema
- [contracts/](./contracts/) - API contracts
