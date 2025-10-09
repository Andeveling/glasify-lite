# Budget Cart Workflow - Quickstart Guide

This guide helps developers quickly set up and test the Budget Cart Workflow feature.

## Prerequisites

Before starting, ensure you have:

- **Node.js 20+** and **pnpm** installed
- **PostgreSQL 17** running locally or in Docker
- **Git** configured and authenticated
- **VS Code** (recommended) with TypeScript extensions

## Environment Setup

### 1. Database Configuration

Ensure your `.env` file has the correct database connection:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/glasify_dev"
```

### 2. Run Migrations

Apply the schema changes for Quote and QuoteItem extensions:

```bash
# Generate Prisma Client with new schema
pnpm db:generate

# Create and apply migrations
pnpm db:migrate:dev --name add-quote-project-fields
```

**Expected Migration Steps:**

1. Add nullable fields to `Quote` table:
   - `projectName` (VARCHAR 100)
   - `projectStreet` (VARCHAR 200)
   - `projectCity` (VARCHAR 100)
   - `projectState` (VARCHAR 100)
   - `projectPostalCode` (VARCHAR 20)

2. Add fields to `QuoteItem` table:
   - `name` (VARCHAR 50, required)
   - `quantity` (INT, default 1)

3. Run data backfill script (if existing quotes exist):
   ```bash
   # Backfill projectName from contactAddress
   pnpm tsx scripts/backfill-quote-project-fields.ts
   
   # Backfill QuoteItem names
   pnpm tsx scripts/backfill-quote-item-names.ts
   ```

4. Make fields required (after backfill):
   ```bash
   pnpm db:migrate:dev --name make-quote-fields-required
   ```

### 3. Verify Schema

Check that Prisma Client regenerated correctly:

```bash
# Open Prisma Studio
pnpm db:studio

# Navigate to Quote model
# Verify new fields: projectName, projectStreet, projectCity, projectState, projectPostalCode

# Navigate to QuoteItem model
# Verify new fields: name, quantity
```

## Development Workflow

### 1. Start Development Server

```bash
# Start Next.js with Turbopack
pnpm dev

# Server will be available at http://localhost:3000
```

### 2. Test Cart Functionality

**Manual Testing Steps:**

1. **Add Item to Cart**
   - Navigate to `/catalog`
   - Select a model (e.g., "VEKA Softline 70")
   - Configure dimensions: 1000mm × 1500mm
   - Select glass type: "Templado 6mm"
   - Click "Agregar al Carrito"
   - ✅ Verify toast notification: "Item agregado al carrito"
   - ✅ Verify cart icon badge shows "1"

2. **View Cart**
   - Click cart icon in navbar
   - Navigate to `/cart`
   - ✅ Verify item appears with auto-generated name: "VEKA-001"
   - ✅ Verify dimensions, price, quantity displayed correctly

3. **Edit Cart Item**
   - Change item name to "Ventana Principal"
   - Increment quantity to 2
   - ✅ Verify subtotal recalculates (unitPrice × 2)

4. **Remove Cart Item**
   - Click "Remove" button
   - Confirm deletion in dialog
   - ✅ Verify item disappears, cart updates

5. **Generate Quote (Unauthenticated)**
   - Click "Generar Cotización" with 1+ items in cart
   - ✅ Verify redirect to `/auth/signin?callbackUrl=/cart`
   - Sign in with Google OAuth
   - ✅ Verify redirect back to `/cart` with preserved cart state

6. **Generate Quote (Authenticated)**
   - Fill project details form:
     - Project Name: "Edificio Torres del Sol"
     - Street: "Av. Providencia 1234"
     - City: "Santiago"
     - State: "Región Metropolitana"
     - Postal Code: "7500000"
   - Click "Generar Cotización"
   - ✅ Verify redirect to `/quotes/[quoteId]`
   - ✅ Verify cart cleared (sessionStorage empty)

7. **View Quote History**
   - Navigate to `/quotes`
   - ✅ Verify created quote appears in list
   - ✅ Verify pagination works (if 10+ quotes exist)
   - ✅ Verify filters (status, search) work

8. **View Quote Details**
   - Click on a quote from history
   - Navigate to `/quotes/[quoteId]`
   - ✅ Verify all project details displayed
   - ✅ Verify all items with custom names, quantities, subtotals
   - ✅ Verify total price correct

### 3. Test Progressive Enhancement (No JavaScript)

**Disable JavaScript in Browser:**

1. Chrome DevTools → Settings → Debugger → Disable JavaScript
2. Or use Lighthouse "Simulated throttling"

**Test Server Actions:**

1. Add item to cart → ✅ Form submits via POST, page reloads with cart updated
2. Generate quote → ✅ Form submits, redirects to quote detail page
3. Update quote status → ✅ Form action triggers, page reloads with updated status

### 4. Run Automated Tests

**Unit Tests (Vitest):**

```bash
# Run all unit tests
pnpm test

# Run cart-specific tests
pnpm test cart

# Run with coverage
pnpm test:coverage
```

**E2E Tests (Playwright):**

```bash
# Run E2E tests (headless)
pnpm test:e2e

# Run with UI (debug mode)
pnpm test:e2e:ui

# Run specific test file
pnpm test:e2e e2e/cart/add-to-cart.spec.ts
```

**Expected Test Coverage:**

- `tests/unit/hooks/use-cart.test.ts` - Cart state management
- `tests/unit/lib/generate-item-name.test.ts` - Item naming algorithm
- `tests/contract/api/cart-actions.test.ts` - Server Action contracts
- `e2e/cart/add-to-cart.spec.ts` - Full cart workflow E2E
- `e2e/quotes/generate-quote.spec.ts` - Quote generation flow E2E

## Debugging

### Common Issues

**1. Cart State Not Persisting After Auth Redirect**

**Symptom:** Cart empties after Google OAuth login

**Fix:** Verify sessionStorage key matches:

```typescript
// src/hooks/use-cart.ts
const STORAGE_KEY = 'glasify_cart'; // Must match across all components
```

**2. Price Mismatch Between Cart and Quote**

**Symptom:** Item price different when generating quote

**Root Cause:** Price calculated at different times (cart vs quote generation)

**Expected Behavior:** Quote locks price at generation time (documented in spec.md)

**3. Generated Item Name Collision**

**Symptom:** Multiple items with same name (e.g., "VEKA-001")

**Fix:** Check `generateItemName` algorithm in `src/lib/utils/generate-item-name.ts`:

```typescript
// Should increment sequence for same prefix
const sequences = existingItems
  .filter(item => item.name.startsWith(prefix))
  .map(item => parseInt(item.name.match(/-(\d+)$/)?.[1] || '0'));
const nextSequence = Math.max(0, ...sequences) + 1;
```

**4. tRPC Server Actions Not Working**

**Symptom:** `experimental_caller is not a function`

**Fix:** Verify tRPC version is 11.0.0+:

```bash
pnpm list @trpc/server
# Should show 11.0.0 or higher
```

**Fix:** Check `server/api/trpc.ts` has:

```typescript
export const serverActionProcedure = t.procedure
  .experimental_caller(experimental_nextAppDirCaller({ 
    pathExtractor: (meta) => meta.span 
  }))
  .use(async (opts) => {
    // Inject session, logging, etc.
  });
```

### Logging

**Enable Debug Logging:**

```bash
# Set in .env.local
LOG_LEVEL=debug
```

**View Cart Action Logs:**

```bash
# Logs will appear in terminal with structured format (Winston)
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "info",
  "message": "Cart item added",
  "span": "cart.add-to-cart",
  "userId": "clr1234567890",
  "itemId": "clr0987654321",
  "modelId": "clm1234567890",
  "price": 25000
}
```

**Check Browser Console:**

```javascript
// View sessionStorage cart state
console.log(JSON.parse(sessionStorage.getItem('glasify_cart')));

// Manually clear cart (for testing)
sessionStorage.removeItem('glasify_cart');
```

## Next Steps

After completing this quickstart:

1. ✅ Schema migrations applied successfully
2. ✅ Manual testing completed (all 8 scenarios)
3. ✅ Progressive enhancement verified (no-JS mode)
4. ✅ Automated tests passing

**You're ready to:**

- Implement custom cart UI components
- Add advanced features (cart sharing, auto-save)
- Extend quote workflow (approval, PDF export)
- Optimize performance (React Query caching)

## Resources

- **Feature Spec:** `/specs/002-budget-cart-workflow/spec.md`
- **Implementation Plan:** `/specs/002-budget-cart-workflow/plan.md`
- **Research Decisions:** `/specs/002-budget-cart-workflow/research.md`
- **Data Model:** `/specs/002-budget-cart-workflow/data-model.md`
- **Contract Schemas:** `/specs/002-budget-cart-workflow/contracts/`

## Support

If you encounter issues not covered here:

1. Check the [implementation plan](/specs/002-budget-cart-workflow/plan.md) for architectural context
2. Review [research decisions](/specs/002-budget-cart-workflow/research.md) for technical rationale
3. Search logs (`logs/` directory) for error traces
4. Ask in #engineering Slack channel with error logs

---

**Last Updated:** 2024-01-15  
**Author:** Glasify Engineering Team  
**Status:** Phase 1 Complete ✅
