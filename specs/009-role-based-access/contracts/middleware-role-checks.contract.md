# Contract: Middleware Role Checks

**Type**: Authorization Contract  
**Feature**: 009-role-based-access  
**Date**: 14 de octubre de 2025  
**Version**: 1.0.0

---

## Overview

This contract defines the middleware authorization logic for role-based route protection in Next.js 15. The middleware intercepts requests before rendering and enforces role-based access control.

---

## Middleware Signature

```typescript
// src/middleware.ts
import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest): Promise<NextResponse>;

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

---

## Route Authorization Rules

### Admin Routes (`/dashboard/*`)

**Access Rule**: Only users with `role === 'admin'`

**Routes Protected**:
- `/dashboard` - Main admin dashboard
- `/dashboard/models` - Model management
- `/dashboard/quotes` - All quotes view
- `/dashboard/settings` - Tenant configuration
- `/dashboard/users` - User management (future)

**Unauthorized Behavior**:
```typescript
if (pathname.startsWith('/dashboard') && session?.user?.role !== 'admin') {
  return NextResponse.redirect(new URL('/my-quotes', request.url));
}
```

---

### Seller Routes (`/quotes`)

**Access Rule**: Users with `role === 'admin'` OR `role === 'seller'`

**Routes Protected**:
- `/quotes` - Seller quotes dashboard
- `/quotes/[id]` - Individual quote details (if seller is creator)

**Unauthorized Behavior**:
```typescript
if (pathname.startsWith('/quotes') && 
    !['admin', 'seller'].includes(session?.user?.role || '')) {
  return NextResponse.redirect(new URL('/my-quotes', request.url));
}
```

---

### User Routes (`/my-quotes`, `/catalog`)

**Access Rule**: Any authenticated user (all roles)

**Routes**:
- `/my-quotes` - User's own quotes
- `/catalog` - Public catalog browsing
- `/catalog/[modelId]` - Model details

**Behavior**: No role restriction, only authentication check

---

### Public Routes

**Access Rule**: No authentication required

**Routes**:
- `/` - Homepage
- `/catalog` - Public catalog (if not authenticated)
- `/signin` - Sign in page
- `/auth/callback` - OAuth callback

---

## Implementation Contract

### Input

```typescript
interface MiddlewareInput {
  request: NextRequest;
  // NextRequest includes:
  // - request.nextUrl.pathname: string
  // - request.cookies: RequestCookies
}
```

### Session Retrieval

```typescript
import { auth } from '@/server/auth';

const session = await auth(); // NextAuth v5 helper

// Session structure:
interface Session {
  user: {
    id: string;
    email: string;
    name: string;
    image: string;
    role: 'admin' | 'seller' | 'user';
  };
  expires: string;
}
```

### Output

```typescript
type MiddlewareOutput = 
  | NextResponse              // Allow request
  | NextResponse.redirect()   // Redirect to authorized route
```

---

## Authorization Logic

### Pseudo-Code

```typescript
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await auth();
  const userRole = session?.user?.role;
  const isLoggedIn = !!session;

  // 1. Protected routes require authentication
  const isProtectedRoute = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/quotes') || 
    pathname.startsWith('/my-quotes');

  if (isProtectedRoute && !isLoggedIn) {
    const signinUrl = new URL('/signin', request.url);
    signinUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signinUrl);
  }

  // 2. Admin-only routes
  if (pathname.startsWith('/dashboard') && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/my-quotes', request.url));
  }

  // 3. Seller or Admin routes
  if (pathname.startsWith('/quotes') && 
      pathname !== '/my-quotes' &&
      !['admin', 'seller'].includes(userRole || '')) {
    return NextResponse.redirect(new URL('/my-quotes', request.url));
  }

  // 4. Logged-in users trying to access signin page
  const isAuthRoute = pathname.startsWith('/signin');
  const isAuthCallback = pathname === '/auth/callback';
  
  if (isAuthRoute && isLoggedIn && !isAuthCallback) {
    return NextResponse.redirect(new URL('/auth/callback', request.url));
  }

  // 5. Allow all other requests
  return NextResponse.next();
}
```

---

## Authorization Matrix

| Route Pattern  | No Auth    | User (Client) | Seller        | Admin        |
| -------------- | ---------- | ------------- | ------------- | ------------ |
| `/`            | ✅ Allow    | ✅ Allow       | ✅ Allow       | ✅ Allow      |
| `/catalog`     | ✅ Allow    | ✅ Allow       | ✅ Allow       | ✅ Allow      |
| `/signin`      | ✅ Allow    | ❌ → callback  | ❌ → callback  | ❌ → callback |
| `/my-quotes`   | ❌ → signin | ✅ Allow       | ✅ Allow       | ✅ Allow      |
| `/quotes`      | ❌ → signin | ❌ → my-quotes | ✅ Allow       | ✅ Allow      |
| `/dashboard/*` | ❌ → signin | ❌ → my-quotes | ❌ → my-quotes | ✅ Allow      |

---

## Error Handling

### No Session (Unauthenticated)

```typescript
if (isProtectedRoute && !session) {
  const signinUrl = new URL('/signin', request.url);
  signinUrl.searchParams.set('callbackUrl', pathname);
  return NextResponse.redirect(signinUrl);
}
```

**User Experience**:
1. User redirected to `/signin?callbackUrl=/dashboard`
2. After successful login, redirected back to original URL

---

### Insufficient Permissions

```typescript
if (pathname.startsWith('/dashboard') && userRole !== 'admin') {
  // Log unauthorized access attempt (audit trail)
  logger.warn('Unauthorized dashboard access attempt', {
    userId: session.user.id,
    userRole: session.user.role,
    attemptedPath: pathname,
  });
  
  return NextResponse.redirect(new URL('/my-quotes', request.url));
}
```

**User Experience**:
1. User redirected to their authorized dashboard (`/my-quotes`)
2. Optional: Toast notification "Acceso denegado" (implemented in layout)

---

## Performance Considerations

### Edge Runtime

```typescript
export const config = {
  runtime: 'edge', // Optional: Run on Edge for <10ms latency
};
```

**Benefits**:
- Sub-10ms authorization checks
- Deployed globally (low latency worldwide)
- No cold starts

### Caching

**Session Cookies**: Already cached by NextAuth (no additional DB query)

**Performance Target**: <10ms middleware overhead (constitution requirement)

---

## Security Considerations

### 1. Server-Side Authorization

✅ **CORRECT**: Middleware runs on server (Edge Runtime)
❌ **WRONG**: Client-side route guards (can be bypassed)

### 2. Defense in Depth

Middleware is **first line of defense**, not the only one:

1. **Middleware** (route-level): Blocks unauthorized page access
2. **tRPC Procedures** (data-level): Blocks unauthorized API calls
3. **Server Components** (UI-level): Hides unauthorized UI elements

### 3. Audit Logging

```typescript
// Log access denials for security monitoring
if (pathname.startsWith('/dashboard') && userRole !== 'admin') {
  logger.warn('Unauthorized access attempt', {
    userId: session.user.id,
    role: session.user.role,
    path: pathname,
    timestamp: new Date().toISOString(),
  });
}
```

**Use Case**: Detect potential account compromise or privilege escalation attempts

---

## Testing Contract

### Unit Tests (Middleware Logic)

```typescript
// tests/unit/middleware-role.test.ts
import { describe, expect, it } from 'vitest';
import { shouldAllowAccess } from '@/middleware'; // Extract logic to helper

describe('Middleware Role Authorization', () => {
  it('allows admin to access dashboard', () => {
    expect(shouldAllowAccess('/dashboard', 'admin')).toBe(true);
  });

  it('blocks seller from dashboard', () => {
    expect(shouldAllowAccess('/dashboard', 'seller')).toBe(false);
  });

  it('blocks user from dashboard', () => {
    expect(shouldAllowAccess('/dashboard', 'user')).toBe(false);
  });

  it('allows seller to access quotes', () => {
    expect(shouldAllowAccess('/quotes', 'seller')).toBe(true);
  });

  it('blocks user from seller quotes', () => {
    expect(shouldAllowAccess('/quotes', 'user')).toBe(false);
  });

  it('allows all roles to access my-quotes', () => {
    expect(shouldAllowAccess('/my-quotes', 'user')).toBe(true);
    expect(shouldAllowAccess('/my-quotes', 'seller')).toBe(true);
    expect(shouldAllowAccess('/my-quotes', 'admin')).toBe(true);
  });
});
```

### Integration Tests (Full Middleware Flow)

```typescript
// tests/integration/middleware-auth.test.ts
import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';

describe('Middleware Integration', () => {
  it('redirects unauthenticated user to signin', async () => {
    const req = new NextRequest(new URL('http://localhost:3000/dashboard'));
    const res = await middleware(req);

    expect(res.status).toBe(307); // Redirect
    expect(res.headers.get('location')).toContain('/signin');
  });

  it('redirects non-admin to my-quotes when accessing dashboard', async () => {
    // Mock session with seller role
    const req = new NextRequest(new URL('http://localhost:3000/dashboard'));
    // ... set session cookie
    const res = await middleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/my-quotes');
  });
});
```

### E2E Tests (User Flows)

```typescript
// e2e/admin-authorization.spec.ts
import { test, expect } from '@playwright/test';

test('non-admin cannot access dashboard', async ({ page }) => {
  // Login as regular user
  await page.goto('/signin');
  // ... perform login as user

  // Attempt to access dashboard
  await page.goto('/dashboard');

  // Should be redirected to my-quotes
  await expect(page).toHaveURL('/my-quotes');
});

test('admin can access dashboard', async ({ page }) => {
  // Login as admin
  await page.goto('/signin');
  // ... perform login as admin

  // Access dashboard
  await page.goto('/dashboard');

  // Should stay on dashboard
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('h1')).toContainText('Dashboard');
});
```

---

## Migration Path

### Phase 1: Add Role Checks (Non-Breaking)

```typescript
// Existing middleware continues to work
// Add role checks AFTER authentication checks
```

**Backward Compatible**: All existing users default to `user` role

### Phase 2: Enforce Seller Routes

```typescript
// New seller routes protected by role check
// Existing user routes unaffected
```

---

## Version History

| Version | Date       | Changes                          | Author      |
| ------- | ---------- | -------------------------------- | ----------- |
| 1.0.0   | 2025-10-14 | Initial middleware authorization | AI Planning |

---

## Related Contracts

- [user-role-enum.contract.md](./user-role-enum.contract.md) - Role enum definition
- [trpc-admin-procedures.contract.md](./trpc-admin-procedures.contract.md) - tRPC authorization

---

## Approval Status

- [ ] Security Team Review
- [ ] Backend Team Review
- [ ] Performance Testing (Edge Runtime <10ms)
- [ ] E2E Tests Pass (all roles)

---

## References

- [Next.js 15 Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [NextAuth.js v5 Middleware Auth](https://authjs.dev/getting-started/session-management/protecting)
- Existing implementation: `src/middleware.ts`
