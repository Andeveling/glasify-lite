# Data Model: Role-Based Access Control System

**Feature**: 009-role-based-access  
**Date**: 14 de octubre de 2025  
**Status**: Complete

---

## Overview

This document defines the data model changes and relationships for the role-based access control system. The primary change is adding a `role` field to the existing `User` model, with cascading effects on authorization logic.

---

## Entity Changes

### 1. User (Modified)

**Description**: Existing user entity extended with role-based access control.

#### Schema

```prisma
enum UserRole {
  admin   // Full system access: manage models, view all quotes, configure tenant
  seller  // Limited access: create/view own quotes, search catalog
  user    // Client access: view own quotes, browse catalog (existing MVP)
}

model User {
  // Existing fields
  id                String                  @id @default(cuid())
  name              String?
  email             String?                 @unique
  emailVerified     DateTime?
  image             String?
  
  // NEW: Role field
  role              UserRole                @default(user)
  
  // Existing relationships
  accounts          Account[]
  sessions          Session[]
  quotes            Quote[]
  priceChanges      ModelPriceHistory[]
  glassPriceChanges GlassTypePriceHistory[]
  
  // NEW: Index for performance
  @@index([role])
}
```

#### Field Validations

| Field  | Type     | Required | Default | Constraints                   |
| ------ | -------- | -------- | ------- | ----------------------------- |
| `role` | UserRole | Yes      | `user`  | Enum: admin \| seller \| user |

#### Business Rules

1. **Default Role**: New users automatically receive `user` role (clients)
2. **Role Assignment**: Only admins can change user roles (via future admin UI)
3. **Admin Email Override**: If user email matches `ADMIN_EMAIL` env var, role is overridden to `admin` in session (backward compatibility)
4. **Immutability**: Users cannot change their own role (must be done by admin)
5. **Session Sync**: Role changes require logout/login to take effect (session contains cached role)

#### State Transitions

```
[New User] --signup--> [role: user] (default)
                             |
                             |--admin assigns--> [role: seller]
                             |--admin assigns--> [role: admin]
                             
[role: seller] --admin downgrades--> [role: user]
[role: admin] --admin downgrades--> [role: seller | user]
```

**Validation**: Role can only change through admin procedures, never self-service.

---

### 2. Quote (Existing - Behavior Changes)

**Description**: Existing quote entity with NEW role-based filtering rules.

#### Schema (Unchanged)

```prisma
model Quote {
  id          String      @id @default(cuid())
  userId      String      // Foreign key to User
  status      QuoteStatus
  items       QuoteItem[]
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  // ... other fields
}
```

#### NEW Query Filtering Rules

| User Role | Query Behavior                                        |
| --------- | ----------------------------------------------------- |
| `admin`   | Can query ALL quotes (no filter)                      |
| `seller`  | Can query ONLY quotes where `userId = currentUser.id` |
| `user`    | Can query ONLY quotes where `userId = currentUser.id` |

**Implementation**: Filtering happens in tRPC procedures via `getQuoteFilter()` helper.

---

### 3. Session (NextAuth - Extended Type)

**Description**: NextAuth session object extended to include user role.

#### TypeScript Type

```typescript
// src/server/auth/config.ts
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: 'admin' | 'seller' | 'user'; // NEW
    } & DefaultSession['user'];
  }

  interface User {
    role?: 'admin' | 'seller' | 'user'; // NEW
  }
}
```

#### Session Callback (Role Assignment)

```typescript
callbacks: {
  session: ({ session, user }) => {
    // Determine role: DB field OR ADMIN_EMAIL check (fallback)
    const isAdminEmail = user.email?.toLowerCase() === env.ADMIN_EMAIL?.toLowerCase();
    const role = user.role || (isAdminEmail ? 'admin' : 'user');
    
    return {
      ...session,
      user: {
        ...session.user,
        id: user.id,
        role: role,
      },
    };
  },
}
```

**Validation**: Role is determined server-side during session creation, never sent from client.

---

## Relationships

### User ↔ Quote (Existing, Enhanced Filtering)

- **Relationship**: One-to-Many (User has many Quotes)
- **Foreign Key**: `Quote.userId` references `User.id`
- **Cascade**: `onDelete: Cascade` (deleting user deletes their quotes)

**NEW Behavior**:
- Sellers can only access quotes where they are the creator (`userId = seller.id`)
- Admins can access all quotes regardless of creator
- Users (clients) can only access their own quotes

### User ↔ Session (NextAuth, Enhanced)

- **Relationship**: One-to-Many (User has many Sessions)
- **Foreign Key**: `Session.userId` references `User.id`
- **Cascade**: `onDelete: Cascade` (deleting user invalidates sessions)

**NEW Behavior**:
- Session object includes `user.role` field
- Role is cached in session (changes require logout/login)
- Middleware reads role from session cookies

---

## Data Access Patterns

### 1. Admin Access Pattern

```typescript
// Admin can access all data without filters
const allQuotes = await db.quote.findMany({
  include: { user: true, items: true },
});

const allUsers = await db.user.findMany({
  select: { id: true, name: true, email: true, role: true },
});
```

### 2. Seller Access Pattern

```typescript
// Seller can only access their own quotes
const myQuotes = await db.quote.findMany({
  where: { userId: session.user.id }, // Filter by current user
  include: { items: true },
});

// Sellers can still read catalog (no user-specific data)
const models = await db.model.findMany({
  where: { status: 'published' },
});
```

### 3. User (Client) Access Pattern

```typescript
// Same as seller: only own quotes
const myQuotes = await db.quote.findMany({
  where: { userId: session.user.id },
  include: { items: true },
});

// Can browse public catalog
const models = await db.model.findMany({
  where: { status: 'published' },
});
```

---

## Indexing Strategy

### 1. User.role Index

**Purpose**: Optimize queries filtering by role (e.g., "get all sellers")

```prisma
model User {
  // ...
  @@index([role])
}
```

**Query Example**:
```typescript
// Efficient query for all sellers
const sellers = await db.user.findMany({
  where: { role: 'seller' },
}); // Uses index on role
```

**Performance**: B-tree index allows O(log n) lookups for role-based queries.

### 2. Quote.userId Index (Existing)

**Purpose**: Optimize seller/user queries for "my quotes"

```prisma
model Quote {
  // ...
  @@index([userId])
}
```

**Query Example**:
```typescript
// Efficient query for seller's quotes
const myQuotes = await db.quote.findMany({
  where: { userId: sellerId },
}); // Uses existing index on userId
```

---

## Migration Strategy

### Forward Migration

```sql
-- Step 1: Create enum type
CREATE TYPE "UserRole" AS ENUM ('admin', 'seller', 'user');

-- Step 2: Add role column with default
ALTER TABLE "User" 
ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'user';

-- Step 3: Create index for performance
CREATE INDEX "User_role_idx" ON "User"("role");

-- Step 4 (Optional): Set admin role for ADMIN_EMAIL user
-- UPDATE "User" 
-- SET "role" = 'admin' 
-- WHERE LOWER("email") = LOWER('admin@example.com');
```

### Rollback Migration

```sql
-- Step 1: Drop index
DROP INDEX IF EXISTS "User_role_idx";

-- Step 2: Remove role column
ALTER TABLE "User" DROP COLUMN IF EXISTS "role";

-- Step 3: Drop enum type
DROP TYPE IF EXISTS "UserRole";
```

### Zero-Downtime Considerations

1. **Default Value**: New column has `DEFAULT 'user'` to prevent null errors
2. **Backward Compatibility**: Session callback falls back to `ADMIN_EMAIL` check
3. **Existing Users**: Automatically get `user` role (safe default)
4. **Admin Setup**: After migration, manually set admin roles via SQL or seed script

---

## Validation Rules

### Database Level

- ✅ `role` field constrained to enum values only (PostgreSQL enforces)
- ✅ `role` field NOT NULL (default value ensures no nulls)
- ✅ Index on `role` for efficient filtering

### Application Level (Zod Schemas)

```typescript
// src/server/api/routers/user.ts
const updateUserRoleInput = z.object({
  userId: z.cuid('Invalid user ID'),
  role: z.enum(['admin', 'seller', 'user'], {
    errorMap: () => ({ message: 'Rol debe ser admin, seller o user' }),
  }),
});
```

### Business Logic Level

```typescript
// src/server/api/routers/user.ts (admin procedure)
export const userRouter = createTRPCRouter({
  'update-role': adminProcedure
    .input(updateUserRoleInput)
    .mutation(async ({ ctx, input }) => {
      // Validation: Admin cannot demote themselves
      if (input.userId === ctx.session.user.id && input.role !== 'admin') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No puedes cambiar tu propio rol de admin',
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

## Data Integrity Constraints

### 1. Self-Demotion Prevention

**Rule**: Admins cannot remove their own admin role (prevent lockout)

**Enforcement**: Application-level check in `update-role` procedure

### 2. Last Admin Protection

**Rule**: System must have at least one admin user at all times

**Enforcement**: Application-level check before role change

```typescript
// Pseudo-code for future implementation
const adminCount = await db.user.count({ where: { role: 'admin' } });
if (adminCount === 1 && targetUser.role === 'admin' && newRole !== 'admin') {
  throw new Error('No se puede eliminar el último administrador del sistema');
}
```

### 3. Quote Ownership Immutability

**Rule**: Quotes remain associated with original creator even if their role changes

**Enforcement**: Database foreign key + no userId update endpoint

---

## Query Performance Estimates

| Query Type                         | Without Index | With Index | Improvement |
| ---------------------------------- | ------------- | ---------- | ----------- |
| Find all sellers                   | O(n)          | O(log n)   | ~1000x      |
| Filter quotes by userId (existing) | O(n)          | O(log n)   | ~1000x      |
| Count users by role                | O(n)          | O(log n)   | ~1000x      |

**Assumption**: 10,000 users in database (n = 10,000)

---

## Related Documents

- [research.md](./research.md) - Prisma enum migration research
- [spec.md](./spec.md) - Functional requirements (FR-001 to FR-012)
- `/prisma/schema.prisma` - Current database schema

---

## Next Steps

1. Create API contracts in `/contracts/` directory
2. Generate Prisma migration files
3. Update `quickstart.md` with role management examples
4. Implement tRPC procedures with role filtering
