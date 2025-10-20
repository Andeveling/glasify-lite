# RBAC Correction: Seller Access to All Quotes and Users

**Date**: 2025-01-15  
**Type**: Business Logic Correction  
**Reason**: Sellers need to see all customer quotes and users, not just their own

---

## Changes Made

### 1. Core Helper Functions

#### `getQuoteFilter` (src/server/api/trpc.ts)
**Before**:
```typescript
export function getQuoteFilter(session: Session): Prisma.QuoteWhereInput {
  if (session.user.role === 'admin') {
    return {};
  }
  return { userId: session.user.id }; // Sellers saw only own quotes
}
```

**After**:
```typescript
export function getQuoteFilter(session: Session): Prisma.QuoteWhereInput {
  // Admins and sellers see all quotes
  if (session.user.role === 'admin' || session.user.role === 'seller') {
    return {};
  }
  // Regular users see only their own quotes
  return { userId: session.user.id };
}
```

#### New Procedure: `sellerOrAdminProcedure`
```typescript
export const sellerOrAdminProcedure = sellerProcedure; // Alias for clarity
```

---

### 2. tRPC Procedures

#### `quote.list-all` (src/server/api/routers/quote/quote.ts)
**Before**: `adminProcedure` (admin-only)  
**After**: `sellerOrAdminProcedure` (admin + seller access)

#### `user.list-all` (src/server/api/routers/user.ts)
**Before**: `adminProcedure` (admin-only)  
**After**: `sellerOrAdminProcedure` (admin + seller access)

---

### 3. Middleware Routes (src/middleware.ts)

**Before**:
- `/dashboard/*` → Admin-only (blocked sellers)

**After**:
- `/dashboard/models` → Admin-only
- `/dashboard/settings` → Admin-only
- `/dashboard/quotes` → Admin + Seller
- `/dashboard/users` → Admin + Seller
- `/dashboard` (home) → Sellers redirect to `/dashboard/quotes`

---

### 4. Navigation (src/app/_components/role-based-nav.tsx)

**Before** (Seller Nav):
```tsx
[
  { href: '/my-quotes', label: 'Mis Cotizaciones' },
  { href: '/catalog', label: 'Catálogo' },
]
```

**After** (Seller Nav):
```tsx
[
  { href: '/dashboard/quotes', label: 'Cotizaciones' }, // All quotes
  { href: '/catalog', label: 'Catálogo' },
]
```

---

### 5. UI Guards

**New Component**: `seller-or-admin-only.tsx`
```tsx
export async function SellerOrAdminOnly({ children, fallback }) {
  const session = await auth();
  const role = session?.user?.role;

  if (role !== 'admin' && role !== 'seller') {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
```

---

### 6. Page Updates

#### `/app/(dashboard)/quotes/page.tsx`
**Before**: Only admins could see this page  
**After**: Admins and sellers can access (shows all quotes)

```tsx
const isSellerOrAdmin = session?.user?.role === 'admin' || session?.user?.role === 'seller';
const result = isSellerOrAdmin
  ? await api.quote['list-all']({ ... }) // All quotes
  : await api.quote['list-user-quotes']({ ... }); // Own quotes
```

#### `/app/(dashboard)/users/page.tsx`
**Before**: Admin-only placeholder  
**After**: Seller/Admin placeholder (sellers can view, only admins can modify roles)

---

## Updated Role Matrix

| Feature                | Admin | Seller | User | Guest |
| ---------------------- | ----- | ------ | ---- | ----- |
| View all quotes        | ✅     | ✅      | ❌    | ❌     |
| View all users         | ✅     | ✅      | ❌    | ❌     |
| `/dashboard/quotes`    | ✅     | ✅      | ❌    | ❌     |
| `/dashboard/users`     | ✅     | ✅      | ❌    | ❌     |
| `/dashboard/models`    | ✅     | ❌      | ❌    | ❌     |
| `/dashboard/settings`  | ✅     | ❌      | ❌    | ❌     |
| Update user roles      | ✅     | ❌      | ❌    | ❌     |
| Create/Edit models     | ✅     | ❌      | ❌    | ❌     |
| Modify tenant settings | ✅     | ❌      | ❌    | ❌     |

---

## Testing Checklist

### Seller Role Tests

- [ ] Seller logs in → Redirects to `/dashboard/quotes` (not `/my-quotes`)
- [ ] Seller visits `/dashboard/quotes` → Sees **all** quotes from all users
- [ ] Seller visits `/dashboard/users` → Sees **all** users
- [ ] Seller visits `/dashboard/models` → Blocked (403/redirect to `/dashboard/quotes`)
- [ ] Seller visits `/dashboard/settings` → Blocked (403/redirect to `/dashboard/quotes`)
- [ ] Seller tries to call `user.update-role` → tRPC FORBIDDEN error (admin-only procedure)
- [ ] Seller navigation shows: "Cotizaciones", "Catálogo" (no Models, no Settings)

### Admin Role Tests (Regression)

- [ ] Admin logs in → Redirects to `/dashboard`
- [ ] Admin can access `/dashboard/quotes` → Sees all quotes
- [ ] Admin can access `/dashboard/users` → Sees all users
- [ ] Admin can access `/dashboard/models` → Full CRUD access
- [ ] Admin can access `/dashboard/settings` → Can modify tenant config
- [ ] Admin can call `user.update-role` → Successfully changes roles
- [ ] Admin navigation shows: "Dashboard", "Modelos", "Cotizaciones", "Configuración"

### User Role Tests (Regression)

- [ ] User logs in → Redirects to `/my-quotes`
- [ ] User visits `/my-quotes` → Sees only their own quotes
- [ ] User visits `/dashboard/quotes` → Blocked (403/redirect)
- [ ] User visits `/dashboard/users` → Blocked (403/redirect)
- [ ] User navigation shows: "Catálogo", "Mis Cotizaciones"

---

## Documentation Updates

- ✅ `specs/009-role-based-access/IMPLEMENTATION_SUMMARY.md` - Updated seller permissions
- ✅ `specs/009-role-based-access/README.md` - Updated role matrix
- ✅ `specs/009-role-based-access/SELLER_CORRECTION.md` - This document
- ⏳ `CHANGELOG.md` - Pending update with correction details
- ⏳ `.github/copilot-instructions.md` - Update RBAC patterns section

---

## Migration Notes

**No database migration required** - Changes are purely authorization logic.

**Session Cache**: Users with active sessions will NOT see changes until they log out and log back in (NextAuth session cache).

**Deployment Steps**:
1. Deploy code changes
2. Notify sellers to log out and log back in
3. Verify seller access to `/dashboard/quotes` and `/dashboard/users`
4. Monitor Winston logs for unauthorized access attempts

---

## Rollback Procedure

If this change needs to be reverted:

1. Revert `getQuoteFilter`:
   ```typescript
   if (session.user.role === 'admin') return {};
   return { userId: session.user.id };
   ```

2. Revert procedures:
   - `quote.list-all` → `adminProcedure`
   - `user.list-all` → `adminProcedure`

3. Revert middleware:
   - `/dashboard/*` → Admin-only

4. Revert navigation:
   - Seller links → `/my-quotes`, `/catalog`

5. Delete `seller-or-admin-only.tsx`

---

**Status**: ✅ Complete  
**Next Steps**: Update E2E tests for new seller permissions, update CHANGELOG.md
