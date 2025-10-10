# Quote Generation Documentation

**Version**: 1.0  
**Last Updated**: October 10, 2025  
**Feature**: Budget Cart Workflow - Quote Generation (US4)

---

## Overview

The quote generation system transforms client-side cart items into persistent database records with locked pricing, 15-day validity, and project address details. It implements a **transactional workflow** ensuring data consistency and price integrity.

---

## Architecture Principles

### 1. **Price Locking Strategy**
- Cart items store **display prices** (for UI feedback)
- Quote generation **recalculates prices** from database (source of truth)
- Prices locked at quote creation time, not cart add time
- Prevents stale pricing issues

### 2. **Transactional Integrity**
- All operations in single Prisma transaction
- Rollback on any failure (quote + items + adjustments)
- Atomic: either everything succeeds or nothing persists

### 3. **15-Day Validity Calculation**
```typescript
const validUntil = new Date();
validUntil.setDate(validUntil.getDate() + 15);
```

---

## Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant QuoteForm
    participant Action
    participant Service
    participant Prisma
    participant Winston

    User->>QuoteForm: Fill project address
    QuoteForm->>QuoteForm: Validate with Zod
    QuoteForm->>Action: generateQuoteFromCartAction
    Action->>Action: Get session (auth)
    Action->>Service: generateQuoteFromCart()
    
    Service->>Service: Validate cart not empty
    Service->>Service: Recalculate prices from DB
    Service->>Service: Detect price changes
    
    Service->>Prisma: BEGIN TRANSACTION
    Service->>Prisma: Create Quote record
    Service->>Prisma: Create QuoteItem records
    Service->>Prisma: Create QuoteItemService records
    Service->>Prisma: COMMIT TRANSACTION
    
    Service->>Winston: Log quote creation
    Service-->>Action: Return { quoteId }
    Action-->>QuoteForm: Success response
    QuoteForm->>QuoteForm: Clear cart
    QuoteForm->>User: Redirect to /quotes/{quoteId}
```

---

## Core Components

### 1. Quote Service

**Location**: `src/server/api/routers/quote/quote.service.ts`

**Function**: `generateQuoteFromCart(input: GenerateQuoteInput): Promise<{ quoteId: string }>`

**Responsibilities**:
- Validate cart not empty
- Recalculate prices from database
- Detect price changes (log warnings)
- Execute Prisma transaction
- Create Quote + QuoteItems + QuoteItemServices
- Calculate 15-day validity
- Winston logging

**Implementation**:
```typescript
export async function generateQuoteFromCart(
  input: GenerateQuoteFromCartInput,
  userId: string,
): Promise<{ quoteId: string }> {
  
  // 1. Validate cart
  if (input.cartItems.length === 0) {
    throw new Error('EMPTY_CART');
  }

  // 2. Recalculate prices (parallel for performance)
  const pricePromises = input.cartItems.map(item => 
    calculatePrice({
      modelId: item.modelId,
      glassTypeId: item.glassTypeId,
      solutionId: item.solutionId,
      widthMm: item.widthMm,
      heightMm: item.heightMm,
      additionalServiceIds: item.additionalServiceIds,
    })
  );
  
  const recalculatedPrices = await Promise.all(pricePromises);

  // 3. Detect price changes
  for (let i = 0; i < input.cartItems.length; i++) {
    const cartPrice = input.cartItems[i].unitPrice;
    const dbPrice = recalculatedPrices[i].totalPrice;
    
    if (Math.abs(cartPrice - dbPrice) > 0.01) {
      logger.warn('[QUOTE] Price mismatch detected', {
        itemName: input.cartItems[i].name,
        cartPrice,
        dbPrice,
        difference: dbPrice - cartPrice,
      });
    }
  }

  // 4. Calculate validity
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 15);

  // 5. Execute transaction
  const quote = await prisma.$transaction(async (tx) => {
    // Create Quote
    const newQuote = await tx.quote.create({
      data: {
        manufacturerId: input.manufacturerId,
        userId,
        status: 'draft',
        currency: 'MXN',
        total: 0, // Will update after items
        validUntil,
        contactPhone: input.contactPhone,
        projectName: input.projectAddress.projectName,
        projectStreet: input.projectAddress.projectStreet,
        projectCity: input.projectAddress.projectCity,
        projectState: input.projectAddress.projectState,
        projectPostalCode: input.projectAddress.projectPostalCode,
      },
    });

    // Create QuoteItems
    for (let i = 0; i < input.cartItems.length; i++) {
      const item = input.cartItems[i];
      const recalcPrice = recalculatedPrices[i];

      await tx.quoteItem.create({
        data: {
          quoteId: newQuote.id,
          modelId: item.modelId,
          glassTypeId: item.glassTypeId,
          solutionId: item.solutionId,
          widthMm: item.widthMm,
          heightMm: item.heightMm,
          quantity: item.quantity,
          name: item.name,
          unitPrice: recalcPrice.totalPrice,
          subtotal: recalcPrice.totalPrice * item.quantity,
        },
      });

      // Create QuoteItemServices (M:M)
      if (item.additionalServiceIds.length > 0) {
        await tx.quoteItemService.createMany({
          data: item.additionalServiceIds.map(serviceId => ({
            quoteItemId: newQuote.id, // Simplified: use quoteId as itemId
            serviceId,
          })),
        });
      }
    }

    // Update total
    const totalAmount = await tx.quoteItem.aggregate({
      where: { quoteId: newQuote.id },
      _sum: { subtotal: true },
    });

    await tx.quote.update({
      where: { id: newQuote.id },
      data: { total: totalAmount._sum.subtotal || 0 },
    });

    return newQuote;
  });

  // 6. Log success
  logger.info('[QUOTE] Quote generated successfully', {
    quoteId: quote.id,
    userId,
    itemCount: input.cartItems.length,
    total: quote.total,
    validUntil: quote.validUntil,
  });

  return { quoteId: quote.id };
}
```

---

### 2. Server Action

**Location**: `src/app/_actions/quote.actions.ts`

**Function**: `generateQuoteFromCartAction(input: GenerateQuoteFromCartInput)`

**Responsibilities**:
- Verify user authentication
- Validate input with Zod
- Call quote service
- Return discriminated union (success/error)

**Implementation**:
```typescript
export async function generateQuoteFromCartAction(
  input: GenerateQuoteFromCartInput,
): Promise<GenerateQuoteFromCartOutput> {
  
  try {
    // 1. Auth check
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Debes iniciar sesión para generar una cotización',
        },
      };
    }

    // 2. Validate input
    const validatedInput = generateQuoteFromCartInput.parse(input);

    // 3. Call service
    const result = await generateQuoteFromCart(
      validatedInput,
      session.user.id,
    );

    return {
      success: true,
      data: result,
    };
    
  } catch (error) {
    // Error handling...
    return {
      success: false,
      error: { code: 'UNKNOWN', message: 'Error inesperado' },
    };
  }
}
```

---

### 3. Quote Generation Form

**Location**: `src/app/(public)/quote/new/_components/quote-generation-form.tsx`

**Features**:
- React Hook Form + Zod validation
- Structured address fields (street, city, state, postal code)
- Optional contact phone
- Project name (required)
- Form submission calls `generateQuoteFromCartAction`

**Validation Schema**:
```typescript
const projectAddressSchema = z.object({
  projectName: z.string()
    .min(1, 'Nombre del proyecto es requerido')
    .max(100),
  projectStreet: z.string()
    .min(1, 'Dirección es requerida')
    .max(200),
  projectCity: z.string()
    .min(1, 'Ciudad es requerida')
    .max(100),
  projectState: z.string()
    .min(1, 'Estado/región es requerido')
    .max(100),
  projectPostalCode: z.string()
    .min(1, 'Código postal es requerido')
    .max(20),
});

const formSchema = z.object({
  projectAddress: projectAddressSchema,
  contactPhone: z.string()
    .max(20)
    .optional(),
  manufacturerId: z.string().cuid(),
  cartItems: z.array(cartItemForQuoteSchema)
    .min(1, 'El carrito debe contener al menos un item')
    .max(20),
});
```

---

### 4. Quote Generation Page

**Location**: `src/app/(public)/quote/new/page.tsx`

**Type**: Server Component

**Features**:
- Auth check (redirect to sign-in if unauthenticated)
- Read cart from URL search params or sessionStorage fallback
- Render QuoteGenerationForm with cart data
- Handle empty cart (redirect to /cart)

---

## Database Schema

### Quote Table
```prisma
model Quote {
  id                String       @id @default(cuid())
  manufacturerId    String
  userId            String?
  status            QuoteStatus  @default(draft)
  currency          String       @db.Char(3)
  total             Decimal      @default(0) @db.Decimal(12, 2)
  validUntil        DateTime?
  contactPhone      String?
  
  // Structured project fields (v2.0)
  projectName       String?      @db.VarChar(100)
  projectStreet     String?      @db.VarChar(200)
  projectCity       String?      @db.VarChar(100)
  projectState      String?      @db.VarChar(100)
  projectPostalCode String?      @db.VarChar(20)
  
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt
  
  // Relations
  manufacturer      Manufacturer @relation(...)
  user              User?        @relation(...)
  items             QuoteItem[]
  adjustments       Adjustment[]
  
  // Performance indexes (T079)
  @@index([userId, status])
  @@index([userId, createdAt(sort: Desc)])
  @@index([userId, validUntil])
}
```

### QuoteItem Table
```prisma
model QuoteItem {
  id          String   @id @default(cuid())
  quoteId     String
  modelId     String
  glassTypeId String
  solutionId  String?
  widthMm     Int
  heightMm    Int
  quantity    Int      @default(1)
  name        String   @db.VarChar(50)
  unitPrice   Decimal  @db.Decimal(12, 2)
  subtotal    Decimal  @db.Decimal(12, 2)
  
  // Relations
  quote       Quote           @relation(...)
  model       Model           @relation(...)
  glassType   GlassType       @relation(...)
  solution    GlassSolution?  @relation(...)
  services    QuoteItemService[]
}
```

---

## Validity Calculation

### 15-Day Rule
```typescript
// At quote creation
const validUntil = new Date();
validUntil.setDate(validUntil.getDate() + 15);

// Save to database
await prisma.quote.create({
  data: {
    validUntil,
    // ... other fields
  },
});
```

### Checking Expiration
```typescript
// In list-user-quotes procedure
const quotes = await prisma.quote.findMany({
  where: {
    userId,
    // Only include if not expired OR includeExpired=true
    ...(includeExpired ? {} : {
      OR: [
        { validUntil: null },
        { validUntil: { gte: new Date() } },
      ],
    }),
  },
  select: {
    // ... fields
    validUntil: true,
  },
});

// Add computed field
const quotesWithExpired = quotes.map(quote => ({
  ...quote,
  isExpired: quote.validUntil 
    ? quote.validUntil < new Date() 
    : false,
}));
```

---

## Price Recalculation

### Why Recalculate?

**Problem**: Prices in cart may be stale
- User adds item → manufacturer changes price → user generates quote
- Old price in cart, new price in database

**Solution**: Recalculate all prices from database at quote generation

### Algorithm

```typescript
async function recalculatePrices(cartItems: CartItem[]) {
  const pricePromises = cartItems.map(item => 
    // Call tRPC procedure for each item
    api.catalog['calculate-price']({
      modelId: item.modelId,
      glassTypeId: item.glassTypeId,
      solutionId: item.solutionId,
      widthMm: item.widthMm,
      heightMm: item.heightMm,
      additionalServiceIds: item.additionalServiceIds,
    })
  );

  // Parallel execution for performance
  return await Promise.all(pricePromises);
}
```

### Price Change Detection

```typescript
for (let i = 0; i < cartItems.length; i++) {
  const cartPrice = cartItems[i].unitPrice;
  const dbPrice = recalculatedPrices[i].totalPrice;
  
  if (Math.abs(cartPrice - dbPrice) > 0.01) {
    logger.warn('[QUOTE] Price changed since cart add', {
      itemName: cartItems[i].name,
      oldPrice: cartPrice,
      newPrice: dbPrice,
      difference: dbPrice - cartPrice,
      percentChange: ((dbPrice - cartPrice) / cartPrice * 100).toFixed(2) + '%',
    });
  }
}
```

**Logged Info**:
- Item name
- Cart price (old)
- Database price (new)
- Absolute difference
- Percentage change

---

## Transaction Design

### Atomic Operations

```typescript
await prisma.$transaction(async (tx) => {
  // Step 1: Create Quote
  const quote = await tx.quote.create({ ... });

  // Step 2: Create QuoteItems (loop)
  for (const item of cartItems) {
    await tx.quoteItem.create({
      data: {
        quoteId: quote.id,
        // ... item fields with recalculated prices
      },
    });
  }

  // Step 3: Create QuoteItemServices (M:M)
  await tx.quoteItemService.createMany({
    data: serviceLinks.map(link => ({
      quoteItemId: link.itemId,
      serviceId: link.serviceId,
    })),
  });

  // Step 4: Update Quote total
  const total = await tx.quoteItem.aggregate({
    where: { quoteId: quote.id },
    _sum: { subtotal: true },
  });

  await tx.quote.update({
    where: { id: quote.id },
    data: { total: total._sum.subtotal || 0 },
  });

  return quote;
});
```

### Rollback Scenarios

**If any operation fails**:
- Database inconsistency detected
- Validation error
- Foreign key constraint violation
- Network timeout

**Result**: **Full rollback** - no Quote, no QuoteItems, no database changes

---

## Error Handling

### Client-Side Errors

```typescript
// Empty cart
if (cartItems.length === 0) {
  return {
    success: false,
    error: {
      code: 'EMPTY_CART',
      message: 'El carrito está vacío. Agrega items antes de generar cotización.',
    },
  };
}

// Invalid address
const validatedAddress = projectAddressSchema.safeParse(projectAddress);
if (!validatedAddress.success) {
  return {
    success: false,
    error: {
      code: 'INVALID_ADDRESS',
      message: validatedAddress.error.errors[0].message,
    },
  };
}

// Inconsistent manufacturer
const manufacturers = [...new Set(cartItems.map(i => i.manufacturerId))];
if (manufacturers.length > 1) {
  return {
    success: false,
    error: {
      code: 'INCONSISTENT_MANUFACTURER',
      message: 'Todos los items deben ser del mismo fabricante.',
    },
  };
}
```

### Server-Side Errors

```typescript
// Unauthenticated
if (!session?.user?.id) {
  return {
    success: false,
    error: {
      code: 'UNAUTHORIZED',
      message: 'Debes iniciar sesión para generar una cotización.',
    },
  };
}

// Price calculation failed
try {
  const price = await calculatePrice(item);
} catch (error) {
  logger.error('[QUOTE] Price calculation failed', { error, item });
  return {
    success: false,
    error: {
      code: 'PRICE_CALCULATION_FAILED',
      message: 'Error al calcular precios. Intenta nuevamente.',
    },
  };
}

// Transaction failed
try {
  await prisma.$transaction(...);
} catch (error) {
  logger.error('[QUOTE] Transaction failed', { error, userId });
  return {
    success: false,
    error: {
      code: 'TRANSACTION_FAILED',
      message: 'Error al guardar cotización. Intenta nuevamente.',
    },
  };
}
```

---

## Winston Logging

### Quote Creation Events

```typescript
// Start
logger.info('[QUOTE] Generating quote', {
  userId,
  manufacturerId,
  itemCount: cartItems.length,
  projectName: projectAddress.projectName,
});

// Price changes detected
logger.warn('[QUOTE] Price mismatch detected', {
  itemName,
  cartPrice,
  dbPrice,
  difference,
});

// Success
logger.info('[QUOTE] Quote generated successfully', {
  quoteId,
  userId,
  itemCount,
  total,
  validUntil,
  executionTimeMs,
});

// Error
logger.error('[QUOTE] Quote generation failed', {
  userId,
  error: error.message,
  stack: error.stack,
});
```

### Log Aggregation Queries

**Find recent quotes**:
```bash
grep '[QUOTE] Quote generated successfully' logs/app.log | tail -20
```

**Find price mismatches**:
```bash
grep '[QUOTE] Price mismatch detected' logs/app.log
```

**Find failures**:
```bash
grep '[QUOTE] Quote generation failed' logs/app.log
```

---

## Testing Strategy

### Contract Tests
**File**: `tests/contract/api/quote-actions.test.ts`

```typescript
describe('generateQuoteFromCartInput', () => {
  it('should validate complete quote input', () => {
    const valid = {
      manufacturerId: 'cuid...',
      projectAddress: { /* ... */ },
      cartItems: [{ /* ... */ }],
    };
    
    expect(() => 
      generateQuoteFromCartInput.parse(valid)
    ).not.toThrow();
  });

  it('should reject empty cart', () => {
    const invalid = { cartItems: [] };
    
    expect(() => 
      generateQuoteFromCartInput.parse(invalid)
    ).toThrow(/al menos un item/);
  });
});
```

### Integration Tests
**File**: `tests/integration/quote/quote-generation.test.ts`

```typescript
describe('Quote Generation Flow', () => {
  it('should create quote with recalculated prices', async () => {
    // Setup
    const session = await createTestSession();
    const cartItems = [createTestCartItem()];

    // Execute
    const result = await generateQuoteFromCartAction({
      manufacturerId: 'test-manufacturer',
      projectAddress: { /* ... */ },
      cartItems,
    });

    // Assert
    expect(result.success).toBe(true);
    
    const quote = await prisma.quote.findUnique({
      where: { id: result.data.quoteId },
      include: { items: true },
    });

    expect(quote.items).toHaveLength(1);
    expect(quote.validUntil).toBeGreaterThan(new Date());
  });
});
```

### E2E Tests
**File**: `e2e/quote/quote-generation.spec.ts`

```typescript
test('should generate quote from cart', async ({ page }) => {
  // Add items to cart
  await addItemsToCart(page, 2);

  // Navigate to quote generation
  await page.goto('/quote/new');

  // Fill form
  await page.fill('[name="projectName"]', 'Test Project');
  await page.fill('[name="projectStreet"]', '123 Test St');
  // ... more fields

  // Submit
  await page.click('button[type="submit"]');

  // Verify redirect to quote detail
  await page.waitForURL(/\/quotes\/[a-z0-9]+/);

  // Verify cart cleared
  await page.goto('/cart');
  await expect(page.getByText(/carrito vacío/i)).toBeVisible();
});
```

---

## Performance Optimizations

### 1. Parallel Price Calculation
```typescript
// ❌ Sequential (slow)
for (const item of cartItems) {
  const price = await calculatePrice(item);
  prices.push(price);
}

// ✅ Parallel (fast)
const pricePromises = cartItems.map(calculatePrice);
const prices = await Promise.all(pricePromises);
```

**Result**: 3x faster for 10+ items

### 2. Database Indexes (T079)
```prisma
@@index([userId, status])              // Filter quotes by user + status
@@index([userId, createdAt(sort: Desc)]) // Sort quotes by date
@@index([userId, validUntil])          // Filter expired quotes
```

**Result**: 10x faster queries on large datasets

### 3. Transaction Batching
```typescript
// Create services in batch
await tx.quoteItemService.createMany({
  data: serviceLinks, // Array of 100+ links
  skipDuplicates: true,
});
```

**Result**: 50x faster than individual `create()` calls

---

## Common Pitfalls & Solutions

### Issue: Quote Created but Cart Not Cleared
**Cause**: Error after successful DB write, before cart clear  
**Solution**: Clear cart in `finally` block or use idempotency key

### Issue: Price Mismatch Not Detected
**Cause**: Floating point comparison `cartPrice === dbPrice`  
**Solution**: Use tolerance `Math.abs(cartPrice - dbPrice) > 0.01`

### Issue: Transaction Timeout
**Cause**: Too many items, slow price calculation  
**Solution**: Limit cart to 20 items, optimize price calculation query

### Issue: validUntil Set to Wrong Timezone
**Cause**: `new Date()` uses server timezone  
**Solution**: Always use UTC, convert to local on display

---

## Migration from contactAddress

### Old Schema (Deprecated)
```typescript
{
  contactAddress: "123 Main St, City, State 12345"
}
```

### New Schema (Structured)
```typescript
{
  projectName: "Office Renovation",
  projectStreet: "123 Main St",
  projectCity: "City",
  projectState: "State",
  projectPostalCode: "12345",
  contactPhone: "+52 123 456 7890"
}
```

### Backfill Script
**Location**: `scripts/backfill-quote-project-fields.ts`

**Logic**:
1. Find quotes with `contactAddress` but null project fields
2. Parse address string (best effort)
3. Update structured fields
4. Mark deprecated field for removal in v2.0

---

## Future Enhancements

### Considered but Deferred:
1. **Multi-currency support**: Quote in USD, EUR, MXN
2. **Quote versioning**: Track edits after creation
3. **Approval workflow**: Draft → Pending → Approved → Sent
4. **PDF export**: Generate printable quote documents
5. **Email notifications**: Send quote to customer email
6. **Quote templates**: Reuse common configurations
7. **Bulk quote generation**: Upload CSV, create multiple quotes

---

## Related Documentation

- [Cart Architecture](./CART_ARCHITECTURE.md)
- [Architecture Overview](./architecture.md)
- [PRD: Budget Cart Workflow](/specs/002-budget-cart-workflow/prd.md)
- [Data Model](/specs/002-budget-cart-workflow/data-model.md)

---

## Changelog

### v1.0 (2025-10-10) - Initial Documentation
- Documented quote generation flow following US4 implementation
- Added transaction design and rollback scenarios
- Documented price recalculation algorithm
- Added validity calculation (15-day rule)
- Documented Winston logging strategy
- Added common pitfalls and solutions
