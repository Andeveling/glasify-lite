# Research: Role-Based Access Control System

**Feature**: 009-role-based-access  
**Date**: 14 de octubre de 2025  
**Status**: Complete

---

## Research Overview

This document consolidates research findings for implementing role-based access control in Glasify Lite. The research focuses on best practices for Next.js 15 middleware authorization, tRPC role-based procedures, Prisma enum migrations, and conditional rendering patterns in React Server Components.

---

## 1. Next.js 15 Middleware Role Authorization

### Decision: Enhanced Middleware with Session-Based Role Checks

**Rationale**:
- Next.js 15 middleware runs on Edge Runtime before page rendering
- NextAuth.js v5 session cookies are available in middleware via `request.cookies`
- Current middleware already checks session presence; we extend it to check `session.user.role`
- Middleware is the FIRST line of defense (before any component renders)

**Implementation Pattern**:

```typescript
// src/middleware.ts
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth'; // NextAuth v5 auth helper

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get session (includes user.role from NextAuth callback)
  const session = await auth();
  const userRole = session?.user?.role;
  
  // Define route access rules
  const adminRoutes = pathname.startsWith('/dashboard');
  const sellerRoutes = pathname.startsWith('/quotes') && !pathname.startsWith('/my-quotes');
  
  // Authorization checks
  if (adminRoutes && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/my-quotes', request.url));
  }
  
  if (sellerRoutes && !['admin', 'seller'].includes(userRole || '')) {
    return NextResponse.redirect(new URL('/my-quotes', request.url));
  }
  
  return NextResponse.next();
}
```

**Alternatives Considered**:

1. **Layout-based authorization** (check in `layout.tsx`):
   - ❌ Rejected: Page partially renders before redirect (poor UX, SEO issues)
   - ❌ Doesn't prevent API route access via direct requests

2. **Client-side route guards** (useEffect redirect):
   - ❌ Rejected: Security risk (client code can be bypassed)
   - ❌ Flash of unauthorized content (FOUC)

3. **tRPC-only authorization** (no middleware):
   - ❌ Rejected: Pages still render before API call fails
   - ❌ Doesn't protect static pages or assets

**Best Practices Applied**:
- ✅ Authorization happens server-side (Edge Runtime)
- ✅ Redirect before rendering (no FOUC)
- ✅ Performance: middleware is lightweight (<10ms overhead)
- ✅ Complements tRPC authorization (defense in depth)

**References**:
- [Next.js 15 Middleware Docs](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [NextAuth.js v5 Middleware Guide](https://authjs.dev/getting-started/session-management/protecting)
- Existing implementation: `docs/fixes/role-based-auth-redirect.md`

---

## 2. tRPC Role-Based Procedures and Data Filtering

### Decision: Procedure Helpers (adminProcedure, sellerProcedure) + Query Filtering

**Rationale**:
- tRPC procedures are the data access layer; authorization MUST happen here
- Middleware protects routes, but procedures protect data (defense in depth)
- Procedure helpers (middleware pattern) centralize authorization logic
- Query filtering ensures users only see their own data (data isolation)

**Implementation Pattern**:

```typescript
// src/server/api/trpc.ts
import { TRPCError } from '@trpc/server';

// Admin-only procedure helper
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.role !== 'admin') {
    throw new TRPCError({ 
      code: 'FORBIDDEN', 
      message: 'Admin access required' 
    });
  }
  return next({ ctx });
});

// Seller or Admin procedure helper
export const sellerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!['admin', 'seller'].includes(ctx.session.user.role)) {
    throw new TRPCError({ 
      code: 'FORBIDDEN', 
      message: 'Seller or admin access required' 
    });
  }
  return next({ ctx });
});

// Role-based data filtering helper
export function getQuoteFilter(session: Session) {
  if (session.user.role === 'admin') {
    return {}; // Admins see all
  }
  return { userId: session.user.id }; // Others see only theirs
}
```

**Usage in Routers**:

```typescript
// src/server/api/routers/quote.ts
export const quoteRouter = createTRPCRouter({
  'list': protectedProcedure
    .input(z.object({ status: z.enum(['draft', 'sent', 'canceled']).optional() }))
    .query(async ({ ctx, input }) => {
      const filter = getQuoteFilter(ctx.session);
      
      return await ctx.db.quote.findMany({
        where: {
          ...filter,
          status: input.status,
        },
        include: { items: true },
      });
    }),
  
  'list-all': adminProcedure // Admin-only endpoint
    .query(async ({ ctx }) => {
      return await ctx.db.quote.findMany({
        include: { user: true, items: true },
      });
    }),
});
```

**Alternatives Considered**:

1. **Check role in every procedure manually**:
   - ❌ Rejected: Code duplication, error-prone
   - ❌ Easy to forget authorization check

2. **Single procedure with role parameter**:
   - ❌ Rejected: Client can manipulate role parameter
   - ❌ Security through obscurity (bad practice)

3. **Database-level Row Level Security (RLS)**:
   - ❌ Rejected: PostgreSQL RLS adds complexity
   - ❌ Harder to debug and test
   - ❌ Not supported natively by Prisma

**Best Practices Applied**:
- ✅ Authorization centralized in procedure helpers
- ✅ Data filtering based on verified session role
- ✅ Explicit admin-only endpoints (clear intent)
- ✅ Type-safe with TypeScript (compile-time checks)

**References**:
- [tRPC Authorization Guide](https://trpc.io/docs/server/authorization)
- [tRPC Middleware Pattern](https://trpc.io/docs/server/middlewares)
- Existing implementation: `src/server/api/routers/admin.ts`

---

## 3. Prisma User Role Enum Migration

### Decision: Add `role` Enum Field with Safe Migration Strategy

**Rationale**:
- Enums provide type safety and constraint enforcement at DB level
- Default value `'user'` ensures backward compatibility (existing users become clients)
- Index on `role` field enables efficient filtering for admin/seller queries
- Migration must be reversible (rollback script required by constitution)

**Migration Strategy**:

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
  role              UserRole                @default(user) // NEW
  accounts          Account[]
  sessions          Session[]
  quotes            Quote[]
  // ... other fields
  
  @@index([role]) // Performance optimization for role-based queries
}
```

**Migration SQL** (auto-generated by Prisma, reviewed):

```sql
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'seller', 'user');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'user';

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- Optional: Set admin role for existing ADMIN_EMAIL user
-- UPDATE "User" SET "role" = 'admin' WHERE "email" = 'admin@example.com';
```

**Rollback Script** (`prisma/migrations/[timestamp]_add_user_role/rollback.sql`):

```sql
-- DropIndex
DROP INDEX IF EXISTS "User_role_idx";

-- AlterTable
ALTER TABLE "User" DROP COLUMN IF EXISTS "role";

-- DropEnum
DROP TYPE IF EXISTS "UserRole";
```

**Alternatives Considered**:

1. **String field instead of enum**:
   - ❌ Rejected: No database-level constraint enforcement
   - ❌ Typos possible ('admim' instead of 'admin')
   - ❌ Harder to validate and maintain

2. **Separate Roles table (many-to-many)**:
   - ❌ Rejected: Over-engineering for 3 roles
   - ❌ Adds query complexity (joins)
   - ❌ Not needed for current scale (constitution: simplicity first)

3. **Boolean flags (isAdmin, isSeller)**:
   - ❌ Rejected: User could have multiple flags (ambiguous)
   - ❌ Harder to extend (need new boolean for each role)

**Best Practices Applied**:
- ✅ Enum for type safety
- ✅ Safe default value ('user')
- ✅ Index for query performance
- ✅ Reversible migration with rollback script
- ✅ Compatible with existing `ADMIN_EMAIL` check (dual verification)

**References**:
- [Prisma Enum Types](https://www.prisma.io/docs/concepts/components/prisma-schema/data-model#defining-enums)
- [Prisma Migrations Guide](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- Existing schema: `prisma/schema.prisma`

---

## 4. React Server Components Conditional Rendering

### Decision: Server Component Guards (`<AdminOnly>`, `<SellerOnly>`)

**Rationale**:
- Server Components can access session via `auth()` without client-side code
- Guards render conditionally before HTML is sent to client (security + performance)
- No JavaScript shipped to client for hidden elements (smaller bundle)
- Complements server-side authorization (UX enhancement, NOT security)

**Implementation Pattern**:

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

**Usage Example**:

```tsx
// Server Component (page.tsx or layout.tsx)
import { AdminOnly } from '@/app/_components/admin-only';

export default async function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      <AdminOnly>
        <Link href="/dashboard/settings">⚙️ Configuración del Sistema</Link>
      </AdminOnly>
      
      <AdminOnly fallback={<p>Acceso limitado</p>}>
        <Button onClick={deleteAllQuotes}>Eliminar Todas las Cotizaciones</Button>
      </AdminOnly>
    </div>
  );
}
```

**Alternatives Considered**:

1. **Client Component with useSession()**:
   - ❌ Rejected: Requires client-side JavaScript (larger bundle)
   - ❌ Flash of content before role check (FOUC)
   - ❌ Not secure (client code can be bypassed)

2. **Inline role checks in every component**:
   - ❌ Rejected: Code duplication
   - ❌ Harder to maintain and audit

3. **CSS display:none based on role**:
   - ❌ Rejected: HTML still sent to client (security risk)
   - ❌ Can be bypassed with DevTools

**Best Practices Applied**:
- ✅ Server Components for zero client JavaScript
- ✅ Session checked server-side (secure)
- ✅ Reusable guard components (DRY)
- ✅ Fallback support for better UX
- ✅ Constitution compliance: Server-First Architecture

**References**:
- [React Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)
- [Next.js 15 Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- Constitution: "Server-First Architecture (Next.js 15)"

---

## 5. Role-Based Navigation Menu

### Decision: Dynamic Navigation with Server Component + Client Toggle

**Rationale**:
- Navigation structure determined by role (server-side for security)
- Interactive menu (mobile toggle) requires Client Component
- Pattern: Server Component passes role-filtered links to Client Component
- Best of both worlds: security + interactivity

**Implementation Pattern**:

```typescript
// src/app/_components/role-based-nav.tsx (Server Component)
import { auth } from '@/server/auth';
import { NavigationMenu } from './navigation-menu'; // Client Component

type NavLink = {
  href: string;
  label: string;
  icon?: React.ComponentType;
};

async function getNavLinksForRole(role: string | undefined): Promise<NavLink[]> {
  const publicLinks: NavLink[] = [
    { href: '/catalog', label: 'Catálogo' },
  ];
  
  const userLinks: NavLink[] = [
    { href: '/my-quotes', label: 'Mis Cotizaciones' },
  ];
  
  const sellerLinks: NavLink[] = [
    { href: '/quotes', label: 'Mis Cotizaciones' },
    { href: '/catalog', label: 'Catálogo' },
  ];
  
  const adminLinks: NavLink[] = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/models', label: 'Modelos' },
    { href: '/dashboard/quotes', label: 'Cotizaciones' },
    { href: '/dashboard/settings', label: 'Configuración' },
  ];
  
  switch (role) {
    case 'admin':
      return [...adminLinks, ...publicLinks];
    case 'seller':
      return sellerLinks;
    case 'user':
    default:
      return [...userLinks, ...publicLinks];
  }
}

export async function RoleBasedNav() {
  const session = await auth();
  const links = await getNavLinksForRole(session?.user?.role);
  
  return <NavigationMenu links={links} />;
}
```

```typescript
// src/app/_components/navigation-menu.tsx (Client Component)
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';

type NavLink = {
  href: string;
  label: string;
};

type NavigationMenuProps = {
  links: NavLink[];
};

export function NavigationMenu({ links }: NavigationMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <nav>
      <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
        <Menu />
      </button>
      
      <ul className={`${isOpen ? 'block' : 'hidden'} md:flex`}>
        {links.map(link => (
          <li key={link.href}>
            <Link href={link.href}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

**Alternatives Considered**:

1. **Fully client-side navigation with useSession()**:
   - ❌ Rejected: Requires client bundle for navigation logic
   - ❌ Flash of wrong menu items before role loads

2. **Static navigation with hidden items (CSS)**:
   - ❌ Rejected: All links sent to client (HTML bloat)
   - ❌ Can be inspected/bypassed

3. **Separate navigation components per role**:
   - ❌ Rejected: Code duplication
   - ❌ Harder to maintain consistent styles

**Best Practices Applied**:
- ✅ Server Component determines links (security)
- ✅ Client Component handles interactivity (mobile menu)
- ✅ Props drilling from Server to Client (clear data flow)
- ✅ No role logic in client code (only receives filtered links)

**References**:
- [Next.js Server and Client Components Composition](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns)
- Existing implementation: `src/app/(dashboard)/_components/sidebar.tsx`

---

## 6. Seller Role Implementation Strategy

### Decision: Seller Role as "Limited Admin" with Own Dashboard

**Rationale**:
- Sellers need quote management without system configuration access
- Separate route group `(seller)` for organizational clarity
- Reuse quote components from admin dashboard (DRY)
- Data isolation via tRPC filtering (sellers see only their quotes)

**Key Design Decisions**:

1. **Route Structure**:
   - `/quotes` → Seller dashboard (their quotes only)
   - `/dashboard/quotes` → Admin dashboard (all quotes)
   - Middleware allows sellers to access `/quotes` but blocks `/dashboard/*`

2. **Data Access**:
   - `quote.list` procedure filters by `userId` for sellers
   - `quote.list-all` procedure (admin-only) returns all quotes
   - Sellers can create quotes (via `/catalog`)
   - Sellers cannot delete/modify quotes from other sellers

3. **UI Components**:
   - Reuse `<QuotesTable>` component (shared between admin and seller)
   - Seller dashboard has simplified metrics (only their stats)
   - No access to model management or tenant configuration

**Implementation Notes**:
- Seller role is middle ground between user and admin
- Future enhancement: Seller-specific permissions (e.g., approve quotes)
- Current scope: Read/create own quotes, search catalog

**References**:
- Feature spec: User Story 2 (Seller/Commercial Role Access Control)

---

## Summary of Research Findings

| Aspect                | Decision                                  | Key Technology             |
| --------------------- | ----------------------------------------- | -------------------------- |
| Route Authorization   | Next.js 15 Middleware with session checks | NextAuth.js v5             |
| API Authorization     | tRPC procedure helpers                    | tRPC 11, Zod 4             |
| Database Schema       | Enum field with migration/rollback        | Prisma 6.16, PostgreSQL    |
| Conditional Rendering | Server Component guards                   | React 19 Server Components |
| Navigation            | Server-filtered links + Client menu       | Next.js 15 composition     |
| Data Isolation        | Query filtering by role                   | Prisma + tRPC              |
| Seller Implementation | Separate route group, filtered procedures | Next.js App Router         |

---

## Unresolved Questions

**None** - All technical decisions have been made based on existing project architecture and best practices.

---

## Next Steps

Proceed to **Phase 1: Design & Contracts** to create:
1. `data-model.md` - User role entity model and relationships
2. `contracts/` - API contracts for admin/seller procedures
3. `quickstart.md` - Developer guide for role-based features
4. Update agent context with new patterns
