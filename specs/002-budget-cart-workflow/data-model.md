# Data Model: Budget Cart Workflow

**Feature**: Budget Cart Workflow with Authentication  
**Date**: 2025-10-09  
**Status**: Complete

## Overview

This document defines the data structures, relationships, and validation rules for the cart and quote management system. The design extends existing Prisma models with minimal changes to maintain backward compatibility.

## Entities

### 1. CartItem (Client-Side Only - No Database Table)

**Purpose**: Temporary storage for configured window items before quote generation.

**Lifecycle**: Created when user clicks "Add to Cart", persisted in sessionStorage, deleted after quote generation.

**TypeScript Interface**:
```typescript
interface CartItem {
  id: string;                    // cuid generated client-side
  modelId: string;               // Reference to Model
  modelName: string;             // Denormalized for display
  glassTypeId: string;           // Reference to GlassType
  glassTypeName: string;         // Denormalized for display
  solutionId?: string;           // Optional reference to GlassSolution
  solutionName?: string;         // Denormalized for display
  widthMm: number;               // Configured width
  heightMm: number;              // Configured height
  quantity: number;              // Number of units (default: 1)
  additionalServiceIds: string[]; // References to Service[]
  name: string;                  // User-editable name (auto-generated: "VEKA-001")
  unitPrice: number;             // Price per unit (calculated)
  subtotal: number;              // unitPrice * quantity
  createdAt: string;             // ISO timestamp
}
```

**Validation Rules** (Zod Schema):
```typescript
const cartItemSchema = z.object({
  id: z.string().cuid(),
  modelId: z.string().cuid(),
  modelName: z.string().min(1),
  glassTypeId: z.string().cuid(),
  glassTypeName: z.string().min(1),
  solutionId: z.string().cuid().optional(),
  solutionName: z.string().optional(),
  widthMm: z.number().int().positive(),
  heightMm: z.number().int().positive(),
  quantity: z.number().int().positive().default(1),
  additionalServiceIds: z.array(z.string().cuid()).default([]),
  name: z.string().min(1).max(50),
  unitPrice: z.number().nonnegative(),
  subtotal: z.number().nonnegative(),
  createdAt: z.string().datetime(),
});
```

**State Transitions**:
1. User configures model → CartItem created (in-memory)
2. User clicks "Add to Cart" → CartItem saved to sessionStorage
3. User edits name/quantity → CartItem updated in sessionStorage
4. User removes item → CartItem deleted from sessionStorage
5. User generates quote → All CartItems converted to QuoteItems → sessionStorage cleared

**Business Rules**:
- `name` must be unique within cart (enforced in `useCart` hook)
- `quantity` must be ≥ 1
- `subtotal` must equal `unitPrice * quantity` (validated on quote generation)
- Cart limited to 20 items (prevents performance issues)

---

### 2. Quote (Database - Extended Existing Model)

**Purpose**: Formal quote document with time-bound validity.

**Prisma Schema Changes**:
```prisma
model Quote {
  id             String       @id @default(cuid())
  manufacturerId String
  manufacturer   Manufacturer @relation(fields: [manufacturerId], references: [id], onDelete: Cascade)
  userId         String?
  user           User?        @relation(fields: [userId], references: [id], onDelete: SetNull)
  status         QuoteStatus  @default(draft)
  currency       String       @db.Char(3)
  total          Decimal      @default(0) @db.Decimal(12, 2)
  validUntil     DateTime?
  contactPhone   String?
  
  // NEW: Project information (structured address)
  projectName        String?  @db.VarChar(100)
  projectStreet      String?  @db.VarChar(200)
  projectCity        String?  @db.VarChar(100)
  projectState       String?  @db.VarChar(100)
  projectPostalCode  String?  @db.VarChar(20)
  
  // DEPRECATED: Will be removed in v2.0
  contactAddress String?
  
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  items          QuoteItem[]
  adjustments    Adjustment[]

  @@index([manufacturerId, status])
  @@index([userId])  // NEW: For filtering user's quotes
}
```

**Validation Rules** (Zod Schema):
```typescript
const quoteProjectInput = z.object({
  projectName: z.string().max(100).optional(),
  projectStreet: z.string().min(1, 'Calle es requerida').max(200),
  projectCity: z.string().min(1, 'Ciudad es requerida').max(100),
  projectState: z.string().min(1, 'Estado/Provincia es requerida').max(100),
  projectPostalCode: z.string().min(1, 'Código postal es requerido').max(20),
});
```

**State Transitions**:
```
draft → sent → canceled
  ↑_____↓
```

**Business Rules**:
- `validUntil` = `createdAt` + `manufacturer.quoteValidityDays` (default 15)
- `total` must equal sum of all `QuoteItem.subtotal` (validated in transaction)
- `userId` required (cannot generate quote without authentication)
- `status` can only transition: draft → sent, draft → canceled, sent → canceled
- Quote is "expired" if `validUntil` < current date (read-only, no status change)

---

### 3. QuoteItem (Database - Extended Existing Model)

**Purpose**: Individual configured window within a quote.

**Prisma Schema Changes**:
```prisma
model QuoteItem {
  id               String             @id @default(cuid())
  quoteId          String
  quote            Quote              @relation(fields: [quoteId], references: [id], onDelete: Cascade)
  modelId          String
  model            Model              @relation(fields: [modelId], references: [id], onDelete: Restrict)
  glassTypeId      String
  glassType        GlassType          @relation(fields: [glassTypeId], references: [id], onDelete: Restrict)
  
  // NEW: User-editable name and quantity
  name             String             @db.VarChar(50)
  quantity         Int                @default(1)
  
  widthMm          Int
  heightMm         Int
  accessoryApplied Boolean            @default(false)
  subtotal         Decimal            @db.Decimal(12, 2)
  createdAt        DateTime           @default(now())
  updatedAt        DateTime           @updatedAt
  services         QuoteItemService[]
  adjustments      Adjustment[]

  @@index([quoteId])
}
```

**Validation Rules** (Zod Schema):
```typescript
const quoteItemInput = z.object({
  name: z.string().min(1, 'Nombre es requerido').max(50),
  quantity: z.number().int().positive('Cantidad debe ser mayor a 0'),
  modelId: z.string().cuid(),
  glassTypeId: z.string().cuid(),
  widthMm: z.number().int().positive(),
  heightMm: z.number().int().positive(),
  subtotal: z.number().nonnegative(),
  accessoryApplied: z.boolean().default(false),
});
```

**Relationships**:
- **Belongs To**: Quote (cascade delete)
- **References**: Model (restrict delete - preserve history)
- **References**: GlassType (restrict delete - preserve history)
- **Has Many**: QuoteItemService (cascade delete)
- **Has Many**: Adjustment (cascade delete)

**Business Rules**:
- `name` inherited from CartItem (user may have edited)
- `quantity` ≥ 1 (validated on create)
- `subtotal` includes: base price + glass cost + services - discounts
- Cannot modify after quote status = 'sent' (immutable pricing)

---

### 4. User (Existing - No Schema Changes)

**Purpose**: Authenticated user via Google OAuth.

**Extended Usage**:
- Owner of Quotes (`quotes` relation)
- Used for quote filtering (`Quote.userId` index)
- Session provides authentication context

**Relevant Fields**:
```prisma
model User {
  id             String    @id @default(cuid())
  name           String?
  email          String?   @unique
  emailVerified  DateTime?
  image          String?
  
  // Relations
  quotes         Quote[]   // NEW: Filter user's quotes
  // ... other existing relations
}
```

---

## Relationships Diagram

```
┌─────────────┐
│    User     │
│ (existing)  │
└──────┬──────┘
       │ 1:N
       ▼
┌─────────────┐
│    Quote    │
│  (extended) │
└──────┬──────┘
       │ 1:N
       ▼
┌─────────────┐
│  QuoteItem  │
│  (extended) │
└──────┬──────┘
       │ 1:N
       ▼
┌─────────────┐
│QuoteItem-   │
│  Service    │
│ (existing)  │
└─────────────┘

Client-Side Only:
┌─────────────┐
│  CartItem   │
│(sessionStore│
└─────────────┘
```

## Data Flow

### Add to Cart Flow

```
1. User configures model in form
   ↓
2. User clicks "Add to Cart"
   ↓
3. Generate item name (e.g., "VEKA-001")
   ↓
4. Calculate price via tRPC: catalog.calculate-price
   ↓
5. Create CartItem object
   ↓
6. Save to sessionStorage['glasify_cart']
   ↓
7. Update UI (cart indicator shows count)
```

### Quote Generation Flow

```
1. User navigates to /quote/new
   ↓
2. Middleware checks authentication
   ↓ (if not authenticated)
3. Redirect to /api/auth/signin?callbackUrl=/quote/new
   ↓
4. User authenticates with Google OAuth
   ↓
5. Redirect back to /quote/new
   ↓
6. Load cart from sessionStorage
   ↓
7. User fills project address form
   ↓
8. User submits → tRPC Server Action: generateQuoteFromCart
   ↓
9. Transaction begins:
   a. Validate cart items exist
   b. Create Quote record
   c. Create QuoteItems (batch)
   d. Create QuoteItemServices (batch)
   e. Calculate total
   f. Commit transaction
   ↓
10. Clear sessionStorage['glasify_cart']
   ↓
11. Redirect to /quotes/[quoteId]
```

### Quote Viewing Flow

```
1. User navigates to /quotes
   ↓
2. Middleware checks authentication
   ↓ (if authenticated)
3. Load quotes via tRPC: quote.list-user-quotes
   ↓
4. Display list with status, validity, total
   ↓
5. User clicks "View" on quote
   ↓
6. Navigate to /quotes/[quoteId]
   ↓
7. Load quote details via tRPC: quote.get-quote-by-id
   ↓
8. Display items, services, totals, project info
```

## Migration Strategy

### Phase 1: Add Nullable Fields (Backward Compatible)

```sql
-- Migration: add_quote_project_fields
ALTER TABLE "Quote" 
  ADD COLUMN "projectName" VARCHAR(100),
  ADD COLUMN "projectStreet" VARCHAR(200),
  ADD COLUMN "projectCity" VARCHAR(100),
  ADD COLUMN "projectState" VARCHAR(100),
  ADD COLUMN "projectPostalCode" VARCHAR(20);

CREATE INDEX "Quote_userId_idx" ON "Quote"("userId");
```

```sql
-- Migration: add_quote_item_name_and_quantity
ALTER TABLE "QuoteItem" 
  ADD COLUMN "name" VARCHAR(50) NOT NULL DEFAULT 'Item',
  ADD COLUMN "quantity" INTEGER NOT NULL DEFAULT 1;
```

### Phase 2: Data Backfill (Optional - Future)

```sql
-- Backfill old quotes with default project name
UPDATE "Quote" 
SET "projectName" = 'Proyecto sin nombre'
WHERE "projectName" IS NULL AND "createdAt" < '2025-10-09';

-- Backfill old quote items with generated names
UPDATE "QuoteItem" qi
SET "name" = (
  SELECT UPPER(SPLIT_PART(m.name, ' ', 1)) || '-' || 
         LPAD(ROW_NUMBER() OVER (PARTITION BY qi."quoteId" ORDER BY qi."createdAt")::TEXT, 3, '0')
  FROM "Model" m
  WHERE m.id = qi."modelId"
)
WHERE qi."name" = 'Item';
```

### Phase 3: Make Fields Required (Future - v2.0)

```sql
-- After all quotes migrated
ALTER TABLE "Quote" 
  ALTER COLUMN "projectStreet" SET NOT NULL,
  ALTER COLUMN "projectCity" SET NOT NULL,
  ALTER COLUMN "projectState" SET NOT NULL,
  ALTER COLUMN "projectPostalCode" SET NOT NULL;

-- Drop deprecated field
ALTER TABLE "Quote" DROP COLUMN "contactAddress";
```

## Performance Considerations

### Indexes

**Existing Indexes** (maintained):
- `Quote.manufacturerId + status` - For filtering quotes by manufacturer and status
- `QuoteItem.quoteId` - For fetching items by quote

**New Indexes**:
- `Quote.userId` - For filtering user's quotes in `/quotes` page

### Query Optimization

**Quote List Query** (uses index):
```typescript
await db.quote.findMany({
  where: { userId: session.user.id },
  orderBy: { createdAt: 'desc' },
  select: {
    id: true,
    createdAt: true,
    total: true,
    status: true,
    validUntil: true,
    projectName: true,
    _count: { select: { items: true } }
  }
});
```

**Quote Detail Query** (minimal joins):
```typescript
await db.quote.findUnique({
  where: { id: quoteId },
  include: {
    items: {
      include: {
        model: { select: { name: true } },
        glassType: { select: { name: true } },
        services: {
          include: {
            service: { select: { name: true, unit: true } }
          }
        }
      }
    }
  }
});
```

## Validation Summary

### Client-Side Validation (React Hook Form + Zod)
- Form inputs (project address, quantity adjustments)
- Cart operations (name uniqueness, item limits)
- Real-time feedback (field-level errors)

### Server-Side Validation (tRPC + Zod)
- All Server Action inputs
- All query inputs
- Database constraints (foreign keys, types)

### Business Logic Validation (Service Layer)
- Total matches sum of items
- User owns the quote being accessed
- Quote not expired for certain operations
- Model/GlassType exist and are compatible

## Security Considerations

### Data Access Control
- Quotes: User can only see their own (`userId` filter)
- Quote modification: Only draft quotes can be edited
- Cart: Client-side only (no server persistence until quote)

### Input Sanitization
- All string inputs validated with Zod
- SQL injection prevented by Prisma parameterized queries
- XSS prevented by React's automatic escaping

### Authorization
- Quote generation: Requires authenticated user
- Quote viewing: Middleware enforces authentication
- Quote modification: Service layer checks ownership

---

**Status**: ✅ Complete - Ready for contracts generation (Phase 1)
