# Research: Budget Cart Workflow with Authentication

**Feature**: Budget Cart Workflow  
**Date**: 2025-10-09  
**Status**: Complete

## Overview

This document consolidates research findings for implementing a hybrid tRPC + Server Actions architecture for the budget cart workflow. The research covers tRPC Server Actions patterns, client-side cart state management, progressive enhancement strategies, and schema design decisions.

## Key Research Areas

### 1. tRPC Server Actions Architecture

**Decision**: Use tRPC v11 `experimental_caller` with `experimental_nextAppDirCaller` for Server Actions

**Rationale**:
- Provides input/output validation with Zod (consistent with existing tRPC procedures)
- Supports progressive enhancement (works without JavaScript via form `action` prop)
- Enables middleware reuse (auth, logging, rate limiting) across both actions and procedures
- Maintains type safety end-to-end (client → server)
- Compatible with React 19's `useActionState` hook

**Alternatives Considered**:
1. **Native Next.js Server Actions** (without tRPC)
   - ❌ No built-in validation (would need manual Zod validation in each action)
   - ❌ No middleware pattern (would duplicate auth/logging logic)
   - ❌ Less consistent with existing codebase (all current mutations use tRPC)

2. **Traditional tRPC mutations** (without Server Actions)
   - ❌ No progressive enhancement (requires JavaScript)
   - ❌ Doesn't leverage React 19 `useActionState` for optimistic updates
   - ❌ Missing form `action` attribute benefits (browser validation, no-JS fallback)

3. **next-safe-action** library
   - ❌ Introduces new abstraction when tRPC already provides similar functionality
   - ❌ Would maintain two validation patterns (tRPC + next-safe-action)

**Implementation Reference**: [tRPC Server Actions Blog Post](https://trpc.io/blog/trpc-actions)

### 2. Cart State Management

**Decision**: Client-side state with `sessionStorage` persistence + custom `useCart` hook

**Rationale**:
- **Performance**: Instant cart updates (no network latency for add/remove operations)
- **UX**: Cart persists during session but clears on browser close (expected e-commerce behavior)
- **Simplicity**: No server-side session management needed until quote generation
- **Offline**: Cart operations work without network connection
- **Cost**: Reduces database writes (only writes on quote generation, not every cart action)

**Alternatives Considered**:
1. **Server-Side Cart (database-backed)**
   - ❌ Requires authentication for cart operations (conflicts with FR-022: "no auth needed for browsing/adding")
   - ❌ Network latency for every add/remove/update (conflicts with SC-004: "< 500ms updates")
   - ❌ More database writes (unnecessary until quote generation)
   - ✅ Pro: Cart persists across devices (not a requirement for MVP)

2. **localStorage** instead of sessionStorage
   - ❌ Cart persists forever (confusing UX: stale items from previous sessions)
   - ❌ Potential for data staleness (prices may have changed since last session)
   - ✅ Pro: Cart survives browser restart (not a requested feature)

3. **React Context** only (no persistence)
   - ❌ Cart lost on page refresh (unacceptable UX)
   - ❌ Cart lost during OAuth redirect flow (breaks authentication flow)

**Implementation Pattern**:
```typescript
// useCart hook manages both memory state and sessionStorage
const useCart = () => {
  const [items, setItems] = useState<CartItem[]>(() => {
    // Hydrate from sessionStorage on mount
    const stored = sessionStorage.getItem('glasify_cart');
    return stored ? JSON.parse(stored) : [];
  });

  const addItem = (item: CartItem) => {
    const updated = [...items, item];
    setItems(updated);
    sessionStorage.setItem('glasify_cart', JSON.stringify(updated));
  };

  // ... other cart operations
};
```

### 3. Item Name Generation Strategy

**Decision**: Extract model name prefix + sequential counter per model type

**Rationale**:
- **"Don't Make Me Think" UX**: Auto-generated names reduce cognitive load
- **Editable**: Users can customize names in cart if desired
- **Uniqueness**: Sequential numbering prevents duplicates
- **Clarity**: Prefix identifies model at a glance (e.g., "VEKA-001", "GUARDIAN-001")

**Algorithm**:
```typescript
function generateItemName(modelName: string, existingItems: CartItem[]): string {
  // Extract prefix (first word of model name)
  const prefix = modelName.split(' ')[0].toUpperCase();
  
  // Find highest sequence number for this prefix
  const sameModelItems = existingItems.filter(item => 
    item.name.startsWith(prefix)
  );
  
  const sequences = sameModelItems.map(item => {
    const match = item.name.match(/-(\d+)$/);
    return match ? parseInt(match[1], 10) : 0;
  });
  
  const nextSequence = Math.max(0, ...sequences) + 1;
  
  return `${prefix}-${String(nextSequence).padStart(3, '0')}`;
}
```

**Examples**:
- Model: "VEKA Premium" → Cart items: "VEKA-001", "VEKA-002"
- Model: "Guardian Clear" → Cart items: "GUARDIAN-001", "GUARDIAN-002"

**Alternatives Considered**:
1. **UUID or cuid** (e.g., "Item-clk7x...")
   - ❌ Not human-readable
   - ❌ Harder to reference in conversations ("the cuid item" vs "VEKA-001")

2. **Full model name** (e.g., "VEKA Premium (1)", "VEKA Premium (2)")
   - ❌ Longer names clutter UI
   - ❌ Parentheses look less professional

3. **User-defined names only** (no auto-generation)
   - ❌ Requires user input for every item (friction)
   - ❌ May result in blank/duplicate names

### 4. Quote Generation Transaction Design

**Decision**: Single Prisma transaction with all quote + items + services + adjustments creation

**Rationale**:
- **Atomicity**: All-or-nothing quote generation (no partial quotes on error)
- **Consistency**: Total calculated once and validated against sum of items
- **Performance**: Single database round-trip (batch inserts)
- **Error Handling**: Automatic rollback on any failure

**Transaction Flow**:
```typescript
await db.$transaction(async (tx) => {
  // 1. Get manufacturer for currency + validity days
  const manufacturer = await tx.manufacturer.findUnique(...);
  
  // 2. Create Quote record
  const quote = await tx.quote.create({
    data: {
      userId: session.user.id,
      manufacturerId: manufacturer.id,
      currency: manufacturer.currency,
      validUntil: add(new Date(), { days: manufacturer.quoteValidityDays }),
      total: cartTotal,
      projectName, projectStreet, projectCity, projectState, projectPostalCode
    }
  });
  
  // 3. Create QuoteItems (batch)
  for (const cartItem of cartItems) {
    const quoteItem = await tx.quoteItem.create({
      data: {
        quoteId: quote.id,
        modelId: cartItem.modelId,
        glassTypeId: cartItem.glassTypeId,
        name: cartItem.name,  // Preserve user-edited name
        widthMm: cartItem.widthMm,
        heightMm: cartItem.heightMm,
        quantity: cartItem.quantity,
        subtotal: cartItem.subtotal
      }
    });
    
    // 4. Create QuoteItemServices (batch)
    for (const service of cartItem.services) {
      await tx.quoteItemService.create(...)
    }
  }
  
  return quote;
});
```

**Alternatives Considered**:
1. **Separate transactions** (quote first, then items)
   - ❌ Risk of partial data if items fail (orphaned quote)
   - ❌ More database round-trips (slower)

2. **Optimistic creation** (create without validation)
   - ❌ Risk of data inconsistency (total mismatch)
   - ❌ Harder to debug production issues

### 5. Progressive Enhancement Strategy

**Decision**: Form-based submission with JavaScript enhancement + useActionState

**Rationale**:
- **Accessibility**: Works for users with JavaScript disabled
- **Performance**: Browser handles submission during JavaScript load time
- **Resilience**: Graceful degradation if JavaScript fails to load
- **Modern**: Leverages React 19 `useActionState` for optimistic UI

**Implementation Pattern**:
```tsx
'use client';

import { useActionState } from 'react';
import { generateQuoteAction } from '@/app/_actions/quote.actions';

function QuoteForm({ cartItems }) {
  const [state, action, isPending] = useActionState(
    generateQuoteAction,
    { success: false }
  );

  return (
    <form action={action}>
      {/* Form inputs */}
      <button type="submit" disabled={isPending}>
        {isPending ? 'Generando...' : 'Generar Cotización'}
      </button>
      {state.error && <ErrorMessage>{state.error}</ErrorMessage>}
    </form>
  );
}
```

### 6. Authentication Flow Design

**Decision**: Next.js middleware for route protection + OAuth redirect

**Rationale**:
- **Centralized**: Single auth check in middleware (DRY)
- **Consistent**: All protected routes use same logic
- **Secure**: Runs on server (no client-side auth bypass)
- **UX**: Preserves intended destination after login (`callbackUrl`)

**Middleware Pattern**:
```typescript
// src/middleware.ts
export async function middleware(request: NextRequest) {
  const session = await auth();
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/quotes');
  
  if (isProtectedRoute && !session) {
    const signInUrl = new URL('/api/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(signInUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/quotes/:path*']
};
```

**Alternatives Considered**:
1. **Page-level auth checks** (in each page.tsx)
   - ❌ Duplicated logic across multiple pages
   - ❌ Easy to forget protection on new routes
   - ❌ More code to maintain

2. **Higher-order components** (withAuth)
   - ❌ Doesn't work well with Server Components
   - ❌ Client-side redirect (flash of unauthenticated content)

### 7. Schema Design Decisions

**Decision**: Extend existing Quote + QuoteItem models with minimal changes

**Rationale**:
- **Backward Compatibility**: Existing quotes continue to work
- **Migration Safety**: Nullable fields allow gradual rollout
- **Data Integrity**: Foreign keys preserve referential integrity

**Schema Changes**:
```prisma
model Quote {
  // ... existing fields ...
  
  // NEW: Project information (all nullable for backward compat)
  projectName        String?
  projectStreet      String?
  projectCity        String?
  projectState       String?
  projectPostalCode  String?
  
  // DEPRECATED: Will eventually replace with structured fields
  contactAddress     String?
}

model QuoteItem {
  // ... existing fields ...
  
  // NEW: User-editable name + quantity
  name     String    // Auto-generated but editable
  quantity Int       @default(1)
}
```

**Migration Strategy**:
1. Add new fields as nullable (allows deployment without data migration)
2. Update quote generation to populate new fields
3. Future: Migrate old quotes to new structure (optional)
4. Future: Make fields required + remove deprecated `contactAddress`

## Risk Mitigation

### Risk: Cart data loss during OAuth redirect

**Mitigation**: 
- Store cart in sessionStorage (survives navigation)
- Test OAuth flow with full cart in E2E tests
- Add warning before redirect if cart is populated

### Risk: Price changes between cart add and quote generation

**Mitigation**:
- Document clearly that prices lock at quote generation, not cart add
- Show "last updated" timestamp in cart
- Recalculate prices on quote generation (use current prices)

### Risk: Large cart causing performance issues

**Mitigation**:
- Add cart item limit (20 items max) with user-friendly message
- Optimize quote generation transaction (batch inserts)
- Monitor quote generation time in production (logging)

### Risk: Browser compatibility for sessionStorage

**Mitigation**:
- Feature detection with graceful fallback to memory-only state
- Show warning if storage unavailable
- E2E tests on multiple browsers (Chrome, Firefox, Safari)

## Technology-Specific Notes

### tRPC Server Actions Setup (v11)

Required configuration in `src/server/api/trpc.ts`:

```typescript
import { experimental_nextAppDirCaller } from '@trpc/server/adapters/next-app-dir';

interface ActionMeta {
  span: string; // For observability
}

export const t = initTRPC.meta<ActionMeta>().create({
  transformer: superjson
});

export const serverActionProcedure = t.procedure
  .experimental_caller(
    experimental_nextAppDirCaller({
      pathExtractor: (meta: ActionMeta) => meta.span,
    })
  )
  .use(async (opts) => {
    // Inject session context (same as existing procedures)
    const session = await auth();
    return opts.next({ ctx: { ...opts.ctx, session } });
  });

export const protectedAction = serverActionProcedure
  .use((opts) => {
    if (!opts.ctx.session?.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    return opts.next({
      ctx: {
        ...opts.ctx,
        session: { ...opts.ctx.session, user: opts.ctx.session.user }
      }
    });
  });
```

### Next.js 15 App Router Considerations

- Server Actions files must have `"use server"` directive at top
- Actions placed in `app/_actions/` directory (convention)
- useActionState requires React 19 (already configured)
- Forms with `action` prop get progressive enhancement automatically

### Prisma Migration Strategy

```bash
# Generate migration for Quote project fields
pnpm prisma migrate dev --name add_quote_project_fields

# Generate migration for QuoteItem name + quantity
pnpm prisma migrate dev --name add_quote_item_name_and_quantity

# Both migrations will be tested in dev before production deployment
```

## References

1. [tRPC Server Actions Blog Post](https://trpc.io/blog/trpc-actions) - Official guide for tRPC v11 Server Actions
2. [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations) - Official Next.js documentation
3. [React useActionState](https://react.dev/reference/react/useActionState) - React 19 hook for Server Actions
4. [Prisma Transactions](https://www.prisma.io/docs/orm/prisma-client/queries/transactions) - Interactive transaction guide
5. [Don't Make Me Think](https://sensible.com/dont-make-me-think/) - UX principles referenced in spec

## Conclusion

All technical uncertainties have been resolved through research. The hybrid tRPC + Server Actions approach provides the best balance of type safety, progressive enhancement, and consistency with the existing codebase. Cart state management via sessionStorage meets performance requirements while maintaining simplicity. Schema extensions are minimal and backward compatible.

**Status**: ✅ Ready for Phase 1 (Data Model + Contracts)
