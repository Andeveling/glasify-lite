# Quickstart: Admin Quotes Dashboard

**Feature**: 001-admin-quotes-dashboard  
**Status**: Implementation Ready  
**Developer Setup Time**: ~10 minutes

---

## Overview

This guide helps developers get started with implementing and testing the Admin Quotes Dashboard feature. Follow these steps to set up your environment, understand the codebase, and begin implementation.

---

## Prerequisites

Before starting, ensure you have:

- ✅ Node.js 18+ installed
- ✅ PostgreSQL running locally or connection to remote instance
- ✅ Git repository cloned and up to date
- ✅ Dependencies installed (`pnpm install`)
- ✅ Database migrated (`pnpm prisma migrate dev`)
- ✅ Seed data loaded (`pnpm prisma db seed`)
- ✅ Admin user account created

**Branch**: `001-admin-quotes-dashboard`

---

## Quick Setup

### 1. Checkout Feature Branch

```bash
git checkout 001-admin-quotes-dashboard
```

If branch doesn't exist yet:
```bash
git checkout -b 001-admin-quotes-dashboard
```

---

### 2. Environment Setup

Ensure `.env` contains:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/glasify_lite"

# Authentication
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# Admin user (for testing)
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="secure-password"
```

---

### 3. Start Development Server

```bash
pnpm dev
```

Server starts at: `http://localhost:3000`

---

### 4. Create Admin User (if needed)

If no admin user exists, create one manually in database or via seed:

```typescript
// prisma/seed-tenant.ts
await prisma.user.create({
  data: {
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    // ... password hash
  },
});
```

Run seed:
```bash
pnpm prisma db seed
```

---

## Project Structure

### Files to Create

```
src/app/(dashboard)/admin/quotes/
├── _components/
│   ├── quote-list.tsx              # Main list container
│   ├── quote-list-item.tsx         # Individual quote card/row
│   ├── quote-status-badge.tsx      # Status indicator badge
│   ├── quote-role-badge.tsx        # User role badge
│   ├── quote-expiration-badge.tsx  # Expiration warning
│   ├── quotes-filters.tsx          # Status filter dropdown
│   ├── quotes-search.tsx           # Search input (debounced)
│   ├── quotes-pagination.tsx       # Pagination controls
│   └── quotes-empty-state.tsx      # No results state
├── _constants/
│   ├── quote-status.constants.ts   # Status labels, colors, icons
│   └── quote-filters.constants.ts  # Filter options
├── _types/
│   └── quote-list.types.ts         # TypeScript types
├── [quoteId]/
│   ├── _components/
│   │   └── user-contact-info.tsx   # Contact info card
│   └── page.tsx                    # Detail view Server Component
├── page.tsx                        # List view Server Component
└── layout.tsx                      # Shared admin layout (if needed)
```

### Files to Modify

```
src/server/api/routers/quote.ts
- Add user.name to search OR condition (line ~832)
- Add phone to user select in get-by-id (line ~XYZ)

src/app/(public)/quotes/page.tsx (DEPRECATED)
- Add redirect to /admin/quotes

src/app/(public)/dashboard/quotes/page.tsx (DEPRECATED)
- Add redirect to /admin/quotes
```

---

## Implementation Workflow

### Phase 1: API Modifications (15 min)

**Task 1.1**: Update search in `quote.list-all`

```typescript
// src/server/api/routers/quote.ts

// FIND this (line ~832):
OR: [
  { projectName: { contains: search, mode: 'insensitive' } },
  { contactPhone: { contains: search } },
]

// CHANGE to:
OR: [
  { projectName: { contains: search, mode: 'insensitive' } },
  { user: { name: { contains: search, mode: 'insensitive' } } }, // ADD
  { contactPhone: { contains: search } },
]
```

**Task 1.2**: Add phone to `quote.get-by-id`

```typescript
// src/server/api/routers/quote.ts

// FIND this:
user: {
  select: {
    id: true,
    name: true,
    email: true,
    role: true,
  },
}

// CHANGE to:
user: {
  select: {
    id: true,
    name: true,
    email: true,
    phone: true,  // ADD THIS
    role: true,
  },
}
```

**Verify**: 
```bash
pnpm run typecheck
```

---

### Phase 2: Constants & Types (10 min)

**Task 2.1**: Create status constants

```typescript
// src/app/(dashboard)/admin/quotes/_constants/quote-status.constants.ts

import { Clock, Send, X } from 'lucide-react';
import type { QuoteStatus } from '@prisma/client';

export const QUOTE_STATUS_CONFIG = {
  draft: {
    label: 'Borrador',
    variant: 'secondary' as const,
    icon: Clock,
  },
  sent: {
    label: 'Enviada',
    variant: 'default' as const,
    icon: Send,
  },
  canceled: {
    label: 'Cancelada',
    variant: 'outline' as const,
    icon: X,
  },
} satisfies Record<QuoteStatus, { label: string; variant: string; icon: any }>;
```

**Task 2.2**: Create TypeScript types

```typescript
// src/app/(dashboard)/admin/quotes/_types/quote-list.types.ts

import type { QuoteStatus, UserRole } from '@prisma/client';

export type QuoteListItem = {
  id: string;
  status: QuoteStatus;
  projectName: string;
  total: number;
  currency: string;
  validUntil: Date | null;
  createdAt: Date;
  sentAt: Date | null;
  itemCount: number;
  user: {
    id: string;
    name: string | null;
    email: string;
    role: UserRole;
  } | null;
};

export type QuoteListFilters = {
  status?: QuoteStatus;
  search?: string;
  sortBy?: 'createdAt' | 'total' | 'validUntil';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
};
```

---

### Phase 3: UI Components (60 min)

**Task 3.1**: Create badge components

Start with `quote-status-badge.tsx`:
```tsx
import { Badge } from '@/components/ui/badge';
import { QUOTE_STATUS_CONFIG } from '../_constants/quote-status.constants';
import type { QuoteStatus } from '@prisma/client';

export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  const config = QUOTE_STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant}>
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  );
}
```

**Task 3.2**: Create search component (debounced)

```tsx
// See research.md "Research Topic 3" for full implementation
```

**Task 3.3**: Create filter component

**Task 3.4**: Create pagination component

**Task 3.5**: Create list components

---

### Phase 4: Server Components (30 min)

**Task 4.1**: Create main list page

```tsx
// src/app/(dashboard)/admin/quotes/page.tsx

export const dynamic = 'force-dynamic';

export default async function AdminQuotesPage({ searchParams }) {
  const filters = {
    status: searchParams.status,
    search: searchParams.search,
    page: Number(searchParams.page) || 1,
    limit: 10,
  };

  const data = await api.quote['list-all'](filters);

  return (
    <div className="container mx-auto py-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Cotizaciones</h1>
        <p className="text-muted-foreground">
          Gestiona todas las cotizaciones del sistema
        </p>
      </header>

      <QuotesFilters />
      <QuotesSearch />

      <Suspense fallback={<QuoteListSkeleton />}>
        <QuoteList quotes={data.quotes} />
      </Suspense>

      <QuotesPagination pagination={data} />
    </div>
  );
}
```

**Task 4.2**: Create detail page with contact info

```tsx
// src/app/(dashboard)/admin/quotes/[quoteId]/page.tsx

export default async function QuoteDetailPage({ params }) {
  const quote = await api.quote['get-by-id']({ id: params.quoteId });

  return (
    <div className="container mx-auto py-6">
      <QuoteDetailView quote={quote} />
      <UserContactInfo user={quote.user} />
    </div>
  );
}
```

---

### Phase 5: Migration (10 min)

**Task 5.1**: Create redirect from old routes

```tsx
// src/app/(public)/quotes/page.tsx

import { redirect } from 'next/navigation';

export default function OldQuotesPage() {
  redirect('/admin/quotes');
}
```

**Task 5.2**: Same for `/dashboard/quotes`

---

## Testing Strategy

### Manual Testing Checklist

1. **Authentication**
   - [ ] Login as admin user
   - [ ] Navigate to `/admin/quotes`
   - [ ] Verify page loads without errors

2. **List View**
   - [ ] See all quotes (default: all statuses)
   - [ ] Filter by status (draft/sent/canceled)
   - [ ] Search by project name
   - [ ] Search by user name
   - [ ] Sort by date/total/expiration
   - [ ] Navigate between pages

3. **Badges**
   - [ ] Status badges show correct color/icon
   - [ ] Role badges only for admin/seller
   - [ ] Expiration badges for expired quotes

4. **Detail View**
   - [ ] Click "Ver detalles" opens detail page
   - [ ] Contact info shows email (mailto link)
   - [ ] Contact info shows phone if available
   - [ ] Contact info shows role badge

5. **Error States**
   - [ ] Empty state when no quotes
   - [ ] Empty state when filter returns nothing
   - [ ] 404 for nonexistent quote ID

6. **Migration**
   - [ ] `/quotes` redirects to `/admin/quotes`
   - [ ] `/dashboard/quotes` redirects to `/admin/quotes`
   - [ ] Search params preserved in redirect

---

### Unit Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test src/server/api/routers/quote.test.ts

# Run with coverage
pnpm test:coverage
```

**Test Files to Create**:
- `src/server/api/routers/quote.test.ts` (tRPC procedures)
- `src/app/(dashboard)/admin/quotes/_components/*.test.tsx` (components)

---

### E2E Tests

```bash
# Run Playwright tests
pnpm test:e2e

# Run in UI mode
pnpm playwright test --ui
```

**Test Files to Create**:
- `e2e/admin-quotes-dashboard.spec.ts`

**Example E2E Test**:
```typescript
test('admin can view all quotes', async ({ page }) => {
  await page.goto('/admin/quotes');
  await expect(page.getByRole('heading', { name: 'Cotizaciones' })).toBeVisible();
  await expect(page.getByText('Borrador')).toBeVisible();
});

test('admin can filter by status', async ({ page }) => {
  await page.goto('/admin/quotes');
  await page.getByRole('button', { name: 'Estado' }).click();
  await page.getByRole('option', { name: 'Enviada' }).click();
  await expect(page).toHaveURL('/admin/quotes?status=sent');
});
```

---

## Development Tools

### VS Code Extensions

Recommended extensions for this feature:

- **Prisma** (prisma.prisma)
- **Tailwind CSS IntelliSense** (bradlc.vscode-tailwindcss)
- **TypeScript Error Translator** (mattpocock.ts-error-translator)

---

### Debug Commands

**Check tRPC Endpoint**:
```bash
curl -X POST http://localhost:3000/api/trpc/quote.list-all \
  -H "Content-Type: application/json" \
  -d '{"status":"draft","page":1,"limit":10}'
```

**Check Database**:
```bash
pnpm prisma studio
```

**View Logs**:
```bash
tail -f logs/combined.log
```

---

## Common Issues & Solutions

### Issue: "Cannot find module '@/components/ui/badge'"

**Solution**: Install Shadcn Badge component
```bash
pnpm dlx shadcn@latest add badge
```

---

### Issue: "Property 'phone' does not exist on type 'User'"

**Solution**: Add `phone` field to User model
```prisma
model User {
  // ... existing fields
  phone String?
}
```

Then migrate:
```bash
pnpm prisma migrate dev --name add_user_phone
```

---

### Issue: Search not working for user names

**Solution**: Verify search OR condition includes `user.name`:
```typescript
user: { name: { contains: search, mode: 'insensitive' } }
```

---

### Issue: 403 Forbidden when accessing /admin/quotes

**Solution**: Ensure user has `admin` role:
```sql
UPDATE "User" SET role = 'admin' WHERE email = 'your-email@example.com';
```

---

## Performance Monitoring

### Check Query Performance

```typescript
// Enable Prisma query logging
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  log      = ["query", "info", "warn", "error"]
}
```

### Benchmark Queries

```bash
# Run benchmark script (if exists)
pnpm run benchmark:quotes
```

---

## Next Steps

After completing implementation:

1. **Code Review**: Create PR from feature branch
2. **Testing**: Run full test suite (`pnpm test:all`)
3. **Documentation**: Update user docs in `docs/`
4. **Deployment**: Deploy to staging environment
5. **QA**: Perform QA testing with real data

---

## Resources

### Documentation
- [Spec Document](./spec.md)
- [Implementation Plan](./plan.md)
- [Research Notes](./research.md)
- [Data Model](./data-model.md)
- [API Contracts](./contracts/)

### Related Files
- `/admin/models/page.tsx` - Reference implementation
- `src/server/api/routers/quote.ts` - tRPC router
- `prisma/schema.prisma` - Database schema

### External Resources
- [Next.js 16 Docs](https://nextjs.org/docs)
- [tRPC Docs](https://trpc.io/docs)
- [Shadcn/ui Components](https://ui.shadcn.com)
- [Prisma Docs](https://www.prisma.io/docs)

---

## Support

**Questions?** Check:
1. Spec document (`spec.md`)
2. Research decisions (`research.md`)
3. Codebase patterns (`/admin/models/`)
4. Project constitution (`.specify/memory/constitution.md`)

**Blocked?** Contact:
- Tech Lead: [Name]
- Product Owner: [Name]

---

## Summary

**Setup Time**: ~10 minutes  
**Implementation Time**: ~2-3 hours (experienced dev)  
**Testing Time**: ~1 hour  
**Total**: ~4 hours end-to-end  

**Critical Files**:
- `src/server/api/routers/quote.ts` (2 small changes)
- `src/app/(dashboard)/admin/quotes/page.tsx` (new Server Component)
- Badge components (new, ~50 lines each)

**Ready to Start**: ✅ All design decisions made, all contracts documented

---

**Next Phase**: Generate `tasks.md` via `/speckit.tasks` command
