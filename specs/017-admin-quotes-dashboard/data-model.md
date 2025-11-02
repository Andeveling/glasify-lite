# Data Model: Admin Quotes Dashboard

**Feature**: 001-admin-quotes-dashboard  
**Phase**: 1 (Design & Contracts)  
**Date**: 2025-11-02

## Overview

This document describes the data model for the Admin Quotes Dashboard. Since this feature is primarily a UI/UX refactor using existing database schema, this document focuses on the data structures used in the application layer rather than database changes.

**Key Point**: **NO database schema changes required**. All entities already exist in Prisma schema.

---

## Existing Database Entities

### Quote

**Source**: `prisma/schema.prisma` (lines 393-440)

```prisma
model Quote {
  id             String      @id @default(cuid())
  userId         String?
  user           User?       @relation(fields: [userId], references: [id], onDelete: SetNull)
  status         QuoteStatus @default(draft)
  currency       String      @db.Char(3)
  total          Decimal     @default(0) @db.Decimal(12, 4)
  validUntil     DateTime?
  contactPhone   String?
  projectName    String?     @db.VarChar(100)
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
  sentAt         DateTime?
  items          QuoteItem[]
  adjustments    Adjustment[]
  projectAddress ProjectAddress?
  
  // Indexes for performance
  @@index([userId])
  @@index([userId, status])
  @@index([userId, createdAt(sort: Desc)])
  @@index([projectName])
  @@index([status])
  @@index([createdAt(sort: Desc)])
}
```

**Attributes Used in Dashboard**:
- `id` - Unique identifier
- `userId` - Creator reference (nullable for deleted users)
- `user` - Relation to User (for name, email, phone, role)
- `status` - QuoteStatus enum (draft/sent/canceled)
- `projectName` - Project title for search
- `total` - Total amount for display
- `validUntil` - Expiration date for badge logic
- `createdAt` - Creation date for sorting
- `sentAt` - Send timestamp for display
- `_count.items` - Item count via Prisma aggregation

**State Transitions**:
```
draft → sent     (quote is sent to customer)
draft → canceled (quote abandoned before sending)
sent → canceled  (quote rejected after sending)
```

**Validation Rules** (enforced in tRPC):
- `projectName`: Optional, max 100 chars
- `status`: Must be one of enum values
- `total`: Non-negative decimal
- `validUntil`: Must be future date when set

---

### User

**Source**: `prisma/schema.prisma`

```prisma
model User {
  id        String   @id @default(cuid())
  name      String?
  email     String   @unique
  role      UserRole @default(user)
  phone     String?  // Added assumption based on clarifications
  quotes    Quote[]
  // ... other fields
}
```

**Attributes Used in Dashboard**:
- `id` - Unique identifier
- `name` - Display name (nullable - fallback to email)
- `email` - Contact email (required, unique)
- `role` - UserRole enum (admin/seller/user)
- `phone` - Contact phone (optional)

**Role Enum**:
```prisma
enum UserRole {
  admin   // Full access
  seller  // Sales team (future v2.0)
  user    // Regular customers
}
```

**Business Rules**:
- Admin can see all quotes regardless of creator
- Seller badge only shown in v2.0 (not in scope for v1)
- User role doesn't get badge in list view

---

### QuoteStatus Enum

**Source**: `prisma/schema.prisma` (lines 37-43)

```prisma
enum QuoteStatus {
  draft     // Generated from cart, pending review/send
  sent      // Sent to vendor/client, awaiting response
  canceled  // Canceled and no longer active
}
```

**Display Mapping** (Spanish):
- `draft` → "Borrador"
- `sent` → "Enviada"
- `canceled` → "Cancelada"

---

## Application-Layer Types

### QuoteListItem

**Purpose**: Lightweight DTO for list view

**Source**: Based on tRPC `quote.list-all` output (line ~832)

```typescript
// src/app/(dashboard)/admin/quotes/_types/quote-list.types.ts

export type QuoteListItem = {
  id: string;
  status: 'draft' | 'sent' | 'canceled';
  projectName: string;
  total: number;
  currency: string;
  validUntil: Date | null;
  createdAt: Date;
  sentAt: Date | null;
  itemCount: number; // From _count.items
  isExpired: boolean; // Computed: validUntil < now
  user: {
    id: string;
    name: string | null;
    email: string;
    role: 'admin' | 'seller' | 'user';
  } | null; // null if user was deleted
};
```

**Derivation Rules**:
- `isExpired`: `validUntil !== null && validUntil < new Date()`
- `user`: May be null if user deleted (onDelete: SetNull)
- `itemCount`: Computed via Prisma `_count.items`

---

### QuoteListFilters

**Purpose**: URL search params for filtering/sorting

```typescript
export type QuoteListFilters = {
  status?: 'draft' | 'sent' | 'canceled';
  search?: string; // Searches projectName OR user.name
  sortBy?: 'createdAt' | 'total' | 'validUntil';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
};
```

**Default Values**:
- `status`: undefined (show all)
- `search`: undefined (no filter)
- `sortBy`: 'createdAt'
- `sortOrder`: 'desc'
- `page`: 1
- `limit`: 10

**Validation** (Zod schema - already exists in tRPC):
```typescript
const listAllQuotesInput = z.object({
  status: z.enum(['draft', 'sent', 'canceled']).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'total', 'validUntil']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});
```

---

### QuoteListResponse

**Purpose**: Paginated response from tRPC

```typescript
export type QuoteListResponse = {
  quotes: QuoteListItem[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};
```

---

### UserContactInfo

**Purpose**: User contact details for quote detail view

```typescript
export type UserContactInfo = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: 'admin' | 'seller' | 'user';
};
```

**Display Rules**:
- If `name` is null: Display email as name
- If `phone` is null: Don't show phone field
- Role badge only for admin/seller (not user)

---

## Data Flow

### List View Flow

```
1. User navigates to /admin/quotes?status=draft&page=2
   ↓
2. Server Component reads search params
   ↓
3. Server Component calls api.quote['list-all']({
     status: 'draft',
     page: 2,
     limit: 10,
     sortBy: 'createdAt',
     sortOrder: 'desc'
   })
   ↓
4. tRPC procedure queries database:
   SELECT quotes.*, users.*, COUNT(items) as itemCount
   FROM quotes
   LEFT JOIN users ON quotes.userId = users.id
   WHERE quotes.status = 'draft'
   ORDER BY quotes.createdAt DESC
   LIMIT 10 OFFSET 10
   ↓
5. Transform to QuoteListResponse
   ↓
6. Server Component passes data to Client Components
   ↓
7. Client Components render:
   - QuoteListItem (each quote)
   - QuoteStatusBadge (status indicator)
   - QuoteRoleBadge (user role)
   - QuotesExpiration Badge (if expired)
```

### Search Flow

```
1. User types "Torre" in search box
   ↓
2. Client Component updates URL: ?search=Torre
   ↓
3. Server Component re-renders with new params
   ↓
4. tRPC query with:
   WHERE (
     projectName ILIKE '%Torre%' OR
     user.name ILIKE '%Torre%'
   )
   ↓
5. Results filtered on server, returned to client
```

### Detail View Flow

```
1. User clicks "Ver detalles" on quote
   ↓
2. Navigate to /admin/quotes/[quoteId]
   ↓
3. Server Component calls api.quote['get-by-id']({ id })
   ↓
4. tRPC returns full quote with:
   - All quote fields
   - User details (name, email, phone, role)
   - Items array
   - Services array
   ↓
5. Server Component renders:
   - QuoteDetailView (existing component)
   - UserContactInfo (NEW component)
```

---

## Computed Fields & Derived State

### isExpired (Quote)

**Logic**: 
```typescript
const isExpired = quote.validUntil 
  ? quote.validUntil < new Date() 
  : false;
```

**Used for**: Showing expiration badge

### userName Fallback

**Logic**:
```typescript
const displayName = user?.name || user?.email || 'Usuario desconocido';
```

**Used for**: Displaying user name when name field is null

### shouldShowRoleBadge

**Logic**:
```typescript
const showRoleBadge = user?.role === 'admin' || user?.role === 'seller';
```

**Used for**: Conditionally rendering role badge (v2.0 for seller)

---

## Performance Optimization

### Database Indexes (Already Exist)

Relevant indexes from schema:
```prisma
@@index([userId, status])        // Filter by user + status
@@index([projectName])            // Search by project
@@index([status])                 // Filter by status only
@@index([createdAt(sort: Desc)])  // Sort by creation date
```

**Query Performance**:
- Filtering by status: Uses `@@index([status])`
- Searching by project: Uses `@@index([projectName])`
- Sorting by date: Uses `@@index([createdAt(sort: Desc)])`
- User relation: Single LEFT JOIN (no N+1)

### Pagination Strategy

- **Server-side**: LIMIT/OFFSET via Prisma
- **Total count**: Separate COUNT query (no JOIN needed)
- **Page size**: Default 10, max 100

---

## Data Constraints & Validation

### Business Rules

1. **Admin Access Only**: Enforced in middleware + tRPC
2. **Deleted Users**: Quote preserved (userId nullable, onDelete: SetNull)
3. **Expiration Logic**: `validUntil` is optional (some quotes don't expire)
4. **Status Transitions**: No enforced constraints (admin can change any status)

### Display Rules

1. **Empty States**:
   - No quotes: "No hay cotizaciones"
   - No results from filter: "No se encontraron cotizaciones con los filtros aplicados"
   - Deleted user: "Usuario desconocido"

2. **Badge Rules**:
   - Status: Always shown
   - Role: Only admin/seller (not user)
   - Expiration: Only if validUntil exists and is past

---

## Migration Considerations

**From**: `/dashboard/quotes`  
**To**: `/admin/quotes`

**Data Impacts**:
- ✅ No database changes
- ✅ No data migration needed
- ✅ Existing tRPC procedures compatible
- ✅ URL bookmarks handled via redirect

**Backward Compatibility**:
- Old route redirects to new route
- Search params preserved in redirect
- Quote IDs remain unchanged

---

## Summary

**Database Changes**: None  
**New Entities**: None  
**New Enums**: None  
**New Indexes**: None  

**Application Types**:
- QuoteListItem (DTO for list view)
- QuoteListFilters (URL params)
- QuoteListResponse (paginated response)
- UserContactInfo (detail view contact section)

**Key Data Flows**:
1. List view: Server Component → tRPC → Prisma → Client Components
2. Search: Client input → URL → Server re-render → tRPC filter
3. Detail: Route param → tRPC → Full quote + user → Components

**Next**: Phase 1 - API Contracts
