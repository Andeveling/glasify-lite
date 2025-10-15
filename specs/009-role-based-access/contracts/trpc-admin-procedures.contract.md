# Contract: tRPC Admin Procedures

**Type**: API Authorization Contract  
**Feature**: 009-role-based-access  
**Date**: 14 de octubre de 2025  
**Version**: 1.0.0

---

## Overview

This contract defines the tRPC procedure helpers for role-based authorization and data filtering. These helpers centralize authorization logic and ensure data isolation between roles.

---

## Procedure Helper Signatures

### 1. adminProcedure

**Purpose**: Restricts procedure execution to users with `admin` role only.

```typescript
// src/server/api/trpc.ts
import { TRPCError } from '@trpc/server';

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.role !== 'admin') {
    throw new TRPCError({ 
      code: 'FORBIDDEN', 
      message: 'Acceso denegado. Se requiere rol de administrador.' 
    });
  }
  
  return next({ ctx });
});
```

**Input Context**:
```typescript
interface Context {
  session: {
    user: {
      id: string;
      role: 'admin' | 'seller' | 'user';
      email: string;
    };
  };
  db: PrismaClient;
}
```

**Output**: Either proceeds with `next({ ctx })` or throws `TRPCError` with code `FORBIDDEN`.

**Error Response**:
```typescript
{
  error: {
    code: 'FORBIDDEN',
    message: 'Acceso denegado. Se requiere rol de administrador.',
  }
}
```

---

### 2. sellerProcedure

**Purpose**: Restricts procedure execution to users with `seller` OR `admin` role.

```typescript
// src/server/api/trpc.ts
export const sellerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!['admin', 'seller'].includes(ctx.session.user.role)) {
    throw new TRPCError({ 
      code: 'FORBIDDEN', 
      message: 'Acceso denegado. Se requiere rol de vendedor o administrador.' 
    });
  }
  
  return next({ ctx });
});
```

**Allowed Roles**: `['admin', 'seller']`

---

### 3. getQuoteFilter (Data Filtering Helper)

**Purpose**: Returns Prisma `where` clause based on user role for quote queries.

```typescript
// src/server/api/routers/quote.ts (or shared lib)
import type { Session } from 'next-auth';
import type { Prisma } from '@prisma/client';

export function getQuoteFilter(session: Session): Prisma.QuoteWhereInput {
  // Admins see all quotes
  if (session.user.role === 'admin') {
    return {};
  }
  
  // Sellers and users see only their own quotes
  return { userId: session.user.id };
}
```

**Return Type**: `Prisma.QuoteWhereInput` (type-safe Prisma filter)

**Usage Example**:
```typescript
const filter = getQuoteFilter(ctx.session);

const quotes = await ctx.db.quote.findMany({
  where: {
    ...filter,
    status: 'sent', // Additional filters
  },
});
```

---

## Procedure Authorization Matrix

| Procedure Type       | Allowed Roles       | Error Code   | Use Case                  |
| -------------------- | ------------------- | ------------ | ------------------------- |
| `publicProcedure`    | All (no auth)       | N/A          | Catalog browsing          |
| `protectedProcedure` | Authenticated users | UNAUTHORIZED | My quotes, profile        |
| `sellerProcedure`    | seller, admin       | FORBIDDEN    | Create quotes for clients |
| `adminProcedure`     | admin               | FORBIDDEN    | Model CRUD, tenant config |

---

## Admin Router Procedures

### User Management

```typescript
// src/server/api/routers/user.ts
export const userRouter = createTRPCRouter({
  // List all users (admin only)
  'list-all': adminProcedure
    .input(z.object({
      role: z.enum(['admin', 'seller', 'user']).optional(),
      search: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.user.findMany({
        where: {
          role: input.role,
          OR: input.search ? [
            { name: { contains: input.search, mode: 'insensitive' } },
            { email: { contains: input.search, mode: 'insensitive' } },
          ] : undefined,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          emailVerified: true,
          _count: { select: { quotes: true } },
        },
      });
    }),

  // Update user role (admin only)
  'update-role': adminProcedure
    .input(z.object({
      userId: z.cuid('ID de usuario inválido'),
      role: z.enum(['admin', 'seller', 'user'], {
        errorMap: () => ({ message: 'Rol debe ser admin, seller o user' }),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      // Validation: Admin cannot demote themselves
      if (input.userId === ctx.session.user.id && input.role !== 'admin') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No puedes cambiar tu propio rol de administrador',
        });
      }

      return await ctx.db.user.update({
        where: { id: input.userId },
        data: { role: input.role },
      });
    }),
});
```

---

### Quote Management (Admin)

```typescript
// src/server/api/routers/quote.ts
export const quoteRouter = createTRPCRouter({
  // List quotes (role-based filtering)
  'list': protectedProcedure
    .input(z.object({
      status: z.enum(['draft', 'sent', 'canceled']).optional(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const filter = getQuoteFilter(ctx.session); // Role-based filter

      const quotes = await ctx.db.quote.findMany({
        where: {
          ...filter,
          status: input.status,
        },
        include: {
          items: true,
          user: { select: { id: true, name: true, email: true } },
        },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      });

      const total = await ctx.db.quote.count({
        where: { ...filter, status: input.status },
      });

      return { items: quotes, total, page: input.page, limit: input.limit };
    }),

  // List ALL quotes (admin only - no filtering)
  'list-all': adminProcedure
    .input(z.object({
      status: z.enum(['draft', 'sent', 'canceled']).optional(),
      userId: z.cuid().optional(), // Filter by specific user
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const quotes = await ctx.db.quote.findMany({
        where: {
          status: input.status,
          userId: input.userId,
        },
        include: {
          items: true,
          user: { select: { id: true, name: true, email: true, role: true } },
        },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
        orderBy: { createdAt: 'desc' },
      });

      const total = await ctx.db.quote.count({
        where: { status: input.status, userId: input.userId },
      });

      return { items: quotes, total, page: input.page, limit: input.limit };
    }),

  // Delete quote (admin only)
  'delete': adminProcedure
    .input(z.object({ id: z.cuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.quote.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
```

---

### Model Management (Admin)

```typescript
// src/server/api/routers/admin.ts (existing, ensure adminProcedure used)
export const adminRouter = createTRPCRouter({
  'model-create': adminProcedure
    .input(modelUpsertInput)
    .mutation(async ({ ctx, input }) => {
      // ... existing model creation logic
    }),

  'model-update': adminProcedure
    .input(z.object({ id: z.cuid(), ...modelUpsertInput.shape }))
    .mutation(async ({ ctx, input }) => {
      // ... existing model update logic
    }),

  'model-delete': adminProcedure
    .input(z.object({ id: z.cuid() }))
    .mutation(async ({ ctx, input }) => {
      // ... existing model delete logic
    }),

  'tenant-config-update': adminProcedure
    .input(tenantConfigInput)
    .mutation(async ({ ctx, input }) => {
      // ... existing tenant config update logic
    }),
});
```

---

## Data Filtering Logic

### Quote Filtering by Role

| Role     | Filter Applied  | SQL WHERE Clause   |
| -------- | --------------- | ------------------ |
| `admin`  | None (see all)  | `WHERE 1=1`        |
| `seller` | Own quotes only | `WHERE userId = ?` |
| `user`   | Own quotes only | `WHERE userId = ?` |

### Implementation

```typescript
export function getQuoteFilter(session: Session): Prisma.QuoteWhereInput {
  if (session.user.role === 'admin') {
    return {}; // No filter - admin sees all
  }
  
  return { userId: session.user.id }; // Filter by current user
}
```

---

## Error Handling

### 1. Unauthorized Access (FORBIDDEN)

```typescript
// Non-admin trying to call adminProcedure
{
  error: {
    code: 'FORBIDDEN',
    message: 'Acceso denegado. Se requiere rol de administrador.',
    data: {
      code: 'FORBIDDEN',
      httpStatus: 403,
      path: 'admin.model-delete',
    },
  },
}
```

**Client Handling**:
```typescript
// Client code
try {
  await api.admin['model-delete'].mutate({ id: modelId });
} catch (error) {
  if (error.data?.code === 'FORBIDDEN') {
    toast.error('No tienes permisos para realizar esta acción');
  }
}
```

---

### 2. Self-Demotion Prevention (BAD_REQUEST)

```typescript
// Admin trying to remove their own admin role
{
  error: {
    code: 'BAD_REQUEST',
    message: 'No puedes cambiar tu propio rol de administrador',
    data: {
      code: 'BAD_REQUEST',
      httpStatus: 400,
      path: 'user.update-role',
    },
  },
}
```

---

## Security Considerations

### 1. Authorization Before Query

✅ **CORRECT**: Check role in procedure middleware BEFORE database query

```typescript
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN' }); // Early return
  }
  return next({ ctx }); // Only proceed if authorized
});
```

❌ **WRONG**: Query first, check role after

```typescript
// DON'T DO THIS
const data = await ctx.db.quote.findMany(); // Query executed
if (ctx.session.user.role !== 'admin') throw new Error(); // Too late
```

---

### 2. Data Filtering in Query

✅ **CORRECT**: Apply filter in Prisma query

```typescript
const filter = getQuoteFilter(ctx.session);
const quotes = await ctx.db.quote.findMany({ where: filter });
```

❌ **WRONG**: Fetch all, filter in memory

```typescript
const allQuotes = await ctx.db.quote.findMany(); // Fetches all quotes (performance + security issue)
const filtered = allQuotes.filter(q => q.userId === ctx.session.user.id); // Too late
```

---

### 3. Audit Logging

```typescript
export const adminProcedure = protectedProcedure.use(({ ctx, next, path }) => {
  if (ctx.session.user.role !== 'admin') {
    logger.warn('Unauthorized admin procedure call', {
      userId: ctx.session.user.id,
      userRole: ctx.session.user.role,
      procedurePath: path,
    });
    throw new TRPCError({ code: 'FORBIDDEN' });
  }

  logger.info('Admin procedure called', {
    userId: ctx.session.user.id,
    procedurePath: path,
  });

  return next({ ctx });
});
```

---

## Testing Contract

### Unit Tests

```typescript
// tests/unit/trpc-admin-auth.test.ts
import { describe, expect, it } from 'vitest';
import { adminProcedure } from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';

describe('adminProcedure Authorization', () => {
  it('allows admin role', async () => {
    const mockCtx = {
      session: { user: { id: '1', role: 'admin' as const } },
      db: mockDb,
    };

    await expect(
      adminProcedure({ ctx: mockCtx, next: () => Promise.resolve({}), /* ... */ })
    ).resolves.not.toThrow();
  });

  it('blocks seller role', async () => {
    const mockCtx = {
      session: { user: { id: '2', role: 'seller' as const } },
      db: mockDb,
    };

    await expect(
      adminProcedure({ ctx: mockCtx, next: () => Promise.resolve({}), /* ... */ })
    ).rejects.toThrow(TRPCError);
  });

  it('blocks user role', async () => {
    const mockCtx = {
      session: { user: { id: '3', role: 'user' as const } },
      db: mockDb,
    };

    await expect(
      adminProcedure({ ctx: mockCtx, next: () => Promise.resolve({}), /* ... */ })
    ).rejects.toThrow(TRPCError);
  });
});
```

### Integration Tests

```typescript
// tests/integration/trpc-quote-filtering.test.ts
import { describe, expect, it, beforeEach } from 'vitest';
import { createCaller } from '@/server/api/routers/quote';
import { db } from '@/server/db';

describe('Quote Filtering by Role', () => {
  beforeEach(async () => {
    // Seed: 2 users, each with 5 quotes
    await seedTestData();
  });

  it('admin sees all quotes', async () => {
    const adminSession = { user: { id: 'admin1', role: 'admin' as const } };
    const caller = createCaller({ session: adminSession, db });

    const result = await caller['list']({});

    expect(result.items.length).toBe(10); // All quotes
  });

  it('seller sees only own quotes', async () => {
    const sellerSession = { user: { id: 'seller1', role: 'seller' as const } };
    const caller = createCaller({ session: sellerSession, db });

    const result = await caller['list']({});

    expect(result.items.length).toBe(5); // Only seller's quotes
    expect(result.items.every(q => q.userId === 'seller1')).toBe(true);
  });

  it('user sees only own quotes', async () => {
    const userSession = { user: { id: 'user1', role: 'user' as const } };
    const caller = createCaller({ session: userSession, db });

    const result = await caller['list']({});

    expect(result.items.length).toBe(5); // Only user's quotes
    expect(result.items.every(q => q.userId === 'user1')).toBe(true);
  });
});
```

---

## Version History

| Version | Date       | Changes                         | Author      |
| ------- | ---------- | ------------------------------- | ----------- |
| 1.0.0   | 2025-10-14 | Initial admin/seller procedures | AI Planning |

---

## Related Contracts

- [user-role-enum.contract.md](./user-role-enum.contract.md) - Role enum definition
- [middleware-role-checks.contract.md](./middleware-role-checks.contract.md) - Route-level auth

---

## Approval Status

- [ ] Backend Team Review
- [ ] Security Team Review
- [ ] Integration Tests Pass
- [ ] Performance Testing (N+1 query check)

---

## References

- [tRPC Authorization Guide](https://trpc.io/docs/server/authorization)
- [tRPC Middleware](https://trpc.io/docs/server/middlewares)
- [tRPC Error Handling](https://trpc.io/docs/server/error-handling)
- Existing implementation: `src/server/api/routers/admin.ts`
