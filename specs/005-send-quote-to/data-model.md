# Phase 1: Data Model

**Feature**: Send Quote to Vendor  
**Date**: 2025-10-13  
**Purpose**: Define database schema changes, entity relationships, and data validation rules

---

## 1. Schema Changes

### 1.1 Quote Model - Add sentAt Field

**Change Type**: Non-breaking addition (nullable field)

**Current Schema** (prisma/schema.prisma):
```prisma
model Quote {
  id             String        @id @default(cuid())
  userId         String?
  user           User?         @relation(fields: [userId], references: [id], onDelete: SetNull)
  status         QuoteStatus   @default(draft)
  currency       String        @db.Char(3)
  total          Decimal       @default(0) @db.Decimal(12, 2)
  validUntil     DateTime?
  contactPhone   String?       // Existing field - now required for 'sent' status
  
  // Project information (structured address fields)
  projectName       String? @db.VarChar(100)
  projectStreet     String? @db.VarChar(200)
  projectCity       String? @db.VarChar(100)
  projectState      String? @db.VarChar(100)
  projectPostalCode String? @db.VarChar(20)

  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  items       QuoteItem[]
  adjustments Adjustment[]

  @@index([userId, status])
  @@index([userId, createdAt(sort: Desc)])
  @@index([userId, validUntil])
}
```

**New Schema** (after migration):
```prisma
model Quote {
  id             String        @id @default(cuid())
  userId         String?
  user           User?         @relation(fields: [userId], references: [id], onDelete: SetNull)
  status         QuoteStatus   @default(draft)
  currency       String        @db.Char(3)
  total          Decimal       @default(0) @db.Decimal(12, 2)
  validUntil     DateTime?
  contactPhone   String?
  
  // Project information
  projectName       String? @db.VarChar(100)
  projectStreet     String? @db.VarChar(200)
  projectCity       String? @db.VarChar(100)
  projectState      String? @db.VarChar(100)
  projectPostalCode String? @db.VarChar(20)

  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  sentAt      DateTime?                         // ✨ NEW FIELD
  items       QuoteItem[]
  adjustments Adjustment[]

  @@index([userId, status])
  @@index([userId, createdAt(sort: Desc)])
  @@index([userId, validUntil])
}
```

**Field Details**:
- **Name**: `sentAt`
- **Type**: `DateTime?` (nullable)
- **Default**: `null`
- **Purpose**: Timestamp when quote was sent to vendor
- **Populated**: Only when status transitions to 'sent'
- **Immutable**: Once set, should not be changed (audit trail)

**Migration Strategy**:
1. Add nullable `sentAt` field (non-breaking)
2. Existing records keep `sentAt = null`
3. New submissions populate `sentAt` when status → 'sent'
4. No data backfill needed (existing 'sent' quotes stay null)

---

## 2. Entity Relationships

### 2.1 Existing Relationships (No Changes)

```
User (1) ──────< (N) Quote
  │
  └─ userId: String? (nullable - quotes can exist without user)

Quote (1) ──────< (N) QuoteItem
  │
  └─ quoteId: String (required)

QuoteItem (N) ─────> (1) Model
  │
  └─ modelId: String (required, onDelete: Restrict)

QuoteItem (N) ─────> (1) GlassType
  │
  └─ glassTypeId: String (required, onDelete: Restrict)

TenantConfig (1)
  └─ Singleton (id = "1")
     Contains: businessName, currency, quoteValidityDays, contactEmail, contactPhone
```

**Key Points**:
- No new relations added
- `sentAt` is a scalar field, not a relation
- TenantConfig contact info accessed via utility functions (no FK)

---

## 3. Data Validation Rules

### 3.1 Application-Level Validation (Zod + tRPC)

**Quote Submission Constraints**:
```typescript
// Status transition validation
- Current status MUST be 'draft'
- After submission, status MUST be 'sent'
- sentAt MUST be populated when status → 'sent'
- sentAt MUST remain immutable after first set

// Contact information validation
- contactPhone MUST match regex: /^\+?[1-9]\d{9,14}$/
- contactPhone MUST be provided at submission time
- contactPhone length: 10-15 characters (international format)

// Business logic validation
- Quote MUST have at least 1 item (items.length > 0)
- Quote MUST belong to authenticated user (userId === session.user.id)
- Quote total MUST be > 0
```

### 3.2 Database-Level Constraints

**Existing Constraints** (no changes):
```sql
-- Quote table
ALTER TABLE "Quote" 
  ADD CONSTRAINT "Quote_status_check" 
  CHECK (status IN ('draft', 'sent', 'canceled'));

-- Indexes for performance
CREATE INDEX "Quote_userId_status_idx" ON "Quote"("userId", "status");
CREATE INDEX "Quote_userId_createdAt_idx" ON "Quote"("userId", "createdAt" DESC);
```

**New Field** (nullable, no constraints):
```sql
-- sentAt: DateTime?
-- No NOT NULL constraint (nullable field)
-- No CHECK constraint (application validates)
-- No default value (remains NULL until sent)
```

---

## 4. State Transitions

### 4.1 Quote Status State Machine

```
┌─────────┐
│  draft  │ ──────────────────────────────────┐
└─────────┘                                    │
     │                                         │
     │ (user clicks "Enviar Cotización")      │
     │                                         │
     ▼                                         │
┌─────────┐                                    │
│  sent   │ ◄──────────────────────────────────┘
└─────────┘
     │
     │ (admin cancels - future feature)
     │
     ▼
┌──────────┐
│ canceled │
└──────────┘
```

**Transitions**:
1. **draft → sent**: ✅ Allowed (this feature)
   - Triggered by: User submits quote
   - Side effects: `sentAt = NOW()`, `contactPhone` populated
   
2. **sent → draft**: ❌ NOT allowed (immutable)
   - Users cannot "unsend" quotes
   - Vendor must handle cancellation externally

3. **sent → canceled**: ❌ Out of scope (admin feature)
   - Requires admin portal
   - Post-MVP functionality

4. **draft → canceled**: ❌ Out of scope (user deletion feature)
   - Users cannot cancel draft quotes in MVP
   - Can create new quotes instead

**Validation Logic**:
```typescript
async function sendQuoteToVendor(quoteId: string, userId: string) {
  // 1. Fetch current quote
  const quote = await db.quote.findUnique({
    where: { id: quoteId },
    select: { status: true, userId: true, items: true },
  });

  // 2. Validate ownership
  if (quote.userId !== userId) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'No autorizado' });
  }

  // 3. Validate status (only draft can be sent)
  if (quote.status !== 'draft') {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Solo las cotizaciones en borrador pueden ser enviadas',
    });
  }

  // 4. Validate quote has items
  if (quote.items.length === 0) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'La cotización debe tener al menos un producto',
    });
  }

  // 5. Execute state transition
  const updated = await db.quote.update({
    where: { id: quoteId },
    data: {
      status: 'sent',
      sentAt: new Date(), // Immutable timestamp
    },
  });

  return updated;
}
```

---

## 5. Data Access Patterns

### 5.1 Read Patterns (Queries)

**Pattern 1: Get Single Quote with Status**
```typescript
// Use case: Quote detail page
const quote = await db.quote.findUnique({
  where: { id: quoteId },
  select: {
    id: true,
    status: true,
    sentAt: true,  // ✨ New field
    total: true,
    validUntil: true,
    contactPhone: true,
    createdAt: true,
    items: {
      include: {
        model: { select: { name: true, imageUrl: true } },
        glassType: { select: { name: true } },
      },
    },
  },
});

// Usage
if (quote.status === 'sent' && quote.sentAt) {
  console.log(`Enviada el ${formatDate(quote.sentAt)}`);
}
```

**Pattern 2: List User Quotes Filtered by Status**
```typescript
// Use case: My Quotes page with filter
const quotes = await db.quote.findMany({
  where: {
    userId: session.user.id,
    status: filterStatus, // 'draft' | 'sent' | 'canceled'
  },
  select: {
    id: true,
    status: true,
    sentAt: true,  // ✨ New field for sorting
    total: true,
    validUntil: true,
    createdAt: true,
    _count: { select: { items: true } },
  },
  orderBy: [
    { sentAt: 'desc' },  // ✨ Sort sent quotes by submission date
    { createdAt: 'desc' },
  ],
  take: limit,
  skip: (page - 1) * limit,
});
```

**Pattern 3: Check if Quote Can Be Sent**
```typescript
// Use case: UI conditional rendering
const canBeSent = quote.status === 'draft' && 
                  quote.items.length > 0 &&
                  quote.total > 0;

{canBeSent && <SendQuoteButton />}
```

### 5.2 Write Patterns (Mutations)

**Pattern 1: Send Quote (Status Transition)**
```typescript
// tRPC procedure: quote.send-to-vendor
const updated = await db.quote.update({
  where: { id: input.quoteId },
  data: {
    status: 'sent',
    sentAt: new Date(),           // ✨ Set immutable timestamp
    contactPhone: input.contactPhone,
  },
});

logger.info('Quote sent to vendor', {
  quoteId: updated.id,
  userId: ctx.session.user.id,
  sentAt: updated.sentAt,
});
```

**Pattern 2: Update Quote (Preserve sentAt)**
```typescript
// Updating other fields MUST NOT change sentAt
const updated = await db.quote.update({
  where: { id: quoteId },
  data: {
    projectName: 'New Name',
    // ❌ DO NOT update sentAt (audit trail)
  },
});
```

---

## 6. Indexes and Performance

### 6.1 Existing Indexes (Sufficient)

```prisma
@@index([userId, status])              // Filtering by user + status ✅
@@index([userId, createdAt(sort: Desc)]) // Sorting by creation date ✅
@@index([userId, validUntil])          // Expired quotes ✅
```

**Analysis**:
- ✅ `[userId, status]` supports filtering sent quotes
- ✅ `createdAt` index covers sorting (sentAt optional)
- ❌ No new index needed for `sentAt` (low cardinality, nullable)

**Query Performance**:
```sql
-- Efficient query (uses existing index)
SELECT * FROM "Quote"
WHERE "userId" = $1 AND "status" = 'sent'
ORDER BY "createdAt" DESC
LIMIT 20;

-- Explain: Uses Quote_userId_status_idx
```

### 6.2 No New Indexes Required

**Rationale**:
- `sentAt` is nullable (NULL values not indexed efficiently)
- Sorting by `sentAt` is rare (users sort by `createdAt`)
- Filtering by `status = 'sent'` already indexed
- Adding `sentAt` index would slow down inserts with marginal benefit

---

## 7. Migration Script

### 7.1 Prisma Migration

**File**: `prisma/migrations/20251013_add_quote_sent_at/migration.sql`

```sql
-- AlterTable
ALTER TABLE "Quote" ADD COLUMN "sentAt" TIMESTAMP(3);

-- Comment
COMMENT ON COLUMN "Quote"."sentAt" IS 'Timestamp when quote was sent to vendor. NULL for draft quotes.';
```

**Migration Steps**:
1. Run: `pnpm prisma migrate dev --name add_quote_sent_at`
2. Prisma generates migration file automatically
3. Apply migration: `pnpm prisma migrate deploy`
4. Generate Prisma Client: `pnpm prisma generate`

### 7.2 Rollback Strategy

**If Migration Fails**:
```sql
-- Rollback script (if needed)
ALTER TABLE "Quote" DROP COLUMN "sentAt";
```

**Safe Rollback**:
- ✅ No data loss (field is nullable)
- ✅ No FK constraints to drop
- ✅ Application code backward compatible (checks for `sentAt` existence)

---

## 8. Type Definitions (Generated by Prisma)

### 8.1 Updated Quote Type

```typescript
// Generated: node_modules/.prisma/client/index.d.ts
export type Quote = {
  id: string;
  userId: string | null;
  status: QuoteStatus; // 'draft' | 'sent' | 'canceled'
  currency: string;
  total: Prisma.Decimal;
  validUntil: Date | null;
  contactPhone: string | null;
  projectName: string | null;
  projectStreet: string | null;
  projectCity: string | null;
  projectState: string | null;
  projectPostalCode: string | null;
  createdAt: Date;
  updatedAt: Date;
  sentAt: Date | null; // ✨ NEW FIELD
};
```

### 8.2 tRPC Output Schema

```typescript
// src/server/api/routers/quote/quote.schemas.ts
export const getQuoteByIdOutput = z.object({
  id: z.string(),
  status: z.enum(['draft', 'sent', 'canceled']),
  total: z.number(),
  validUntil: z.date().nullable(),
  contactPhone: z.string().nullable(),
  createdAt: z.date(),
  sentAt: z.date().nullable(), // ✨ NEW FIELD
  items: z.array(quoteItemSchema),
});

export type GetQuoteByIdOutput = z.infer<typeof getQuoteByIdOutput>;
```

---

## 9. Data Consistency Rules

### 9.1 Invariants (MUST Always Be True)

1. **Status-sentAt Consistency**:
   ```typescript
   // If status === 'sent', sentAt MUST be non-null
   // If status === 'draft', sentAt MUST be null
   const isValid = 
     (quote.status === 'sent' && quote.sentAt !== null) ||
     (quote.status === 'draft' && quote.sentAt === null);
   ```

2. **Immutability of sentAt**:
   ```typescript
   // Once sentAt is set, it MUST NOT change
   if (existingQuote.sentAt !== null) {
     // ❌ DO NOT allow updates to sentAt
     throw new Error('sentAt cannot be modified after submission');
   }
   ```

3. **Temporal Ordering**:
   ```typescript
   // sentAt MUST be >= createdAt
   if (quote.sentAt && quote.sentAt < quote.createdAt) {
     throw new Error('Invalid sentAt: cannot be before createdAt');
   }
   ```

### 9.2 Validation Checks (Application Layer)

```typescript
// Pre-submission validation
function validateQuoteForSubmission(quote: Quote) {
  if (quote.status !== 'draft') {
    throw new ValidationError('Only draft quotes can be sent');
  }
  
  if (quote.items.length === 0) {
    throw new ValidationError('Quote must have at least one item');
  }
  
  if (quote.total <= 0) {
    throw new ValidationError('Quote total must be greater than zero');
  }
  
  if (!quote.contactPhone || quote.contactPhone.trim().length === 0) {
    throw new ValidationError('Contact phone is required');
  }
}

// Post-submission validation
function validateSentQuote(quote: Quote) {
  if (quote.status !== 'sent') {
    throw new ValidationError('Quote status must be sent');
  }
  
  if (!quote.sentAt) {
    throw new ValidationError('Sent quotes must have sentAt timestamp');
  }
  
  if (quote.sentAt > new Date()) {
    throw new ValidationError('sentAt cannot be in the future');
  }
}
```

---

## 10. Backward Compatibility

### 10.1 Existing Code Compatibility

**✅ Safe Changes**:
- Adding nullable `sentAt` field does not break existing queries
- Existing `Quote` type still valid (sentAt optional)
- No changes to existing relations or indexes

**✅ Code That Works Without Changes**:
```typescript
// Existing code that doesn't use sentAt
const quote = await db.quote.findUnique({
  where: { id: quoteId },
  select: { id: true, status: true, total: true }, // Works fine
});

// Existing code that creates quotes
const quote = await db.quote.create({
  data: {
    userId: session.user.id,
    status: 'draft',
    // sentAt not provided - defaults to null ✅
  },
});
```

**🔧 Code That Needs Updates**:
```typescript
// Quote detail view - ADD sentAt display
- const { id, status, total, createdAt } = quote;
+ const { id, status, total, createdAt, sentAt } = quote;

// Quote list sorting - OPTIONALLY sort by sentAt
- orderBy: { createdAt: 'desc' }
+ orderBy: [{ sentAt: 'desc' }, { createdAt: 'desc' }]
```

---

## Summary

### Changes Made
- ✅ Added `sentAt: DateTime?` field to Quote model
- ✅ No new relations or indexes
- ✅ No breaking changes to existing schema
- ✅ Backward compatible with existing code

### Migration Steps
1. Update `prisma/schema.prisma` (add `sentAt` field)
2. Run `pnpm prisma migrate dev --name add_quote_sent_at`
3. Run `pnpm prisma generate`
4. Deploy migration to production

### Data Validation
- Application-level validation in tRPC procedures (Zod)
- State transition validation (draft → sent only)
- Temporal consistency (sentAt >= createdAt)
- Immutability enforcement (sentAt cannot be updated)

### Performance Impact
- ✅ Minimal: Nullable field, no new indexes
- ✅ Existing indexes cover filtering and sorting
- ✅ No additional query overhead

**Data model is complete and ready for implementation.**
