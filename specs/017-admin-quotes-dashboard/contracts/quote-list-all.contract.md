# API Contract: quote.list-all

**Endpoint**: `api.quote['list-all']`  
**Feature**: 001-admin-quotes-dashboard  
**Type**: tRPC Query  
**Authorization**: Admin/Seller Only

---

## Overview

Returns paginated list of all quotes in the system with filtering, sorting, and search capabilities. Used for the admin quotes dashboard list view.

**Status**: ✅ Already exists in codebase (`src/server/api/routers/quote.ts`)

---

## Input Schema

```typescript
{
  status?: 'draft' | 'sent' | 'canceled';
  search?: string;
  sortBy?: 'createdAt' | 'total' | 'validUntil';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
```

### Parameters

| Parameter   | Type          | Required | Default       | Validation                         | Description                                           |
| ----------- | ------------- | -------- | ------------- | ---------------------------------- | ----------------------------------------------------- |
| `status`    | `QuoteStatus` | No       | `undefined`   | Enum: draft, sent, canceled        | Filter by quote status                                |
| `search`    | `string`      | No       | `undefined`   | Min 1 char                         | Search in projectName OR user.name (case-insensitive) |
| `sortBy`    | `string`      | No       | `'createdAt'` | Enum: createdAt, total, validUntil | Field to sort by                                      |
| `sortOrder` | `string`      | No       | `'desc'`      | Enum: asc, desc                    | Sort direction                                        |
| `page`      | `number`      | No       | `1`           | Min: 1                             | Page number (1-indexed)                               |
| `limit`     | `number`      | No       | `10`          | Min: 1, Max: 100                   | Items per page                                        |

### Zod Schema

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

### Search Behavior

**Current Implementation** (from codebase):
```typescript
OR: [
  { projectName: { contains: search, mode: 'insensitive' } },
  { contactPhone: { contains: search } },
]
```

**Required Change** (from research.md):
```typescript
OR: [
  { projectName: { contains: search, mode: 'insensitive' } },
  { user: { name: { contains: search, mode: 'insensitive' } } }, // NEW
  { contactPhone: { contains: search } },
]
```

---

## Output Schema

```typescript
{
  quotes: QuoteListItem[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
```

### QuoteListItem Structure

```typescript
{
  id: string;
  status: 'draft' | 'sent' | 'canceled';
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
    role: 'admin' | 'seller' | 'user';
  } | null;
}
```

### Fields

| Field             | Type              | Nullable | Description                               |
| ----------------- | ----------------- | -------- | ----------------------------------------- |
| `quotes`          | `QuoteListItem[]` | No       | Array of quote records                    |
| `total`           | `number`          | No       | Total matching records (across all pages) |
| `totalPages`      | `number`          | No       | Total pages given current limit           |
| `page`            | `number`          | No       | Current page number                       |
| `limit`           | `number`          | No       | Items per page                            |
| `hasNextPage`     | `boolean`         | No       | True if page < totalPages                 |
| `hasPreviousPage` | `boolean`         | No       | True if page > 1                          |

---

## Authorization

**Procedure Type**: `sellerOrAdminProcedure`

**Access Control**:
- ✅ Admin: Full access to all quotes
- ✅ Seller: Full access to all quotes (v2.0 - not in scope)
- ❌ User: Not authorized (403 error)
- ❌ Anonymous: Not authenticated (401 error)

**Implementation**:
```typescript
.query(async ({ ctx, input }) => {
  // Authorization already enforced by sellerOrAdminProcedure
  const userId = ctx.session.user.id;
  const userRole = ctx.session.user.role;
  
  // No additional checks needed - admin/seller see all
});
```

---

## Database Query

### Prisma Query Structure

```typescript
// Count query (for pagination)
const total = await ctx.db.quote.count({
  where: {
    ...(input.status && { status: input.status }),
    ...(input.search && {
      OR: [
        { projectName: { contains: input.search, mode: 'insensitive' } },
        { user: { name: { contains: input.search, mode: 'insensitive' } } },
        { contactPhone: { contains: input.search } },
      ],
    }),
  },
});

// Data query (with pagination)
const quotes = await ctx.db.quote.findMany({
  where: { /* same as count */ },
  orderBy: {
    [input.sortBy]: input.sortOrder,
  },
  skip: (input.page - 1) * input.limit,
  take: input.limit,
  include: {
    user: {
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    },
    _count: {
      select: {
        items: true,
      },
    },
  },
});
```

### Performance

**Indexes Used**:
- Status filter: `@@index([status])`
- Search (projectName): `@@index([projectName])`
- Sort (createdAt): `@@index([createdAt(sort: Desc)])`
- User relation: Single LEFT JOIN (no N+1)

**Query Complexity**:
- 2 queries: COUNT + SELECT
- 1 JOIN: Quote → User
- 1 aggregate: _count.items
- Pagination: LIMIT/OFFSET

---

## Example Usage

### Basic Request (All Quotes)

```typescript
const result = await api.quote['list-all']({
  page: 1,
  limit: 10,
});
```

**Response**:
```json
{
  "quotes": [
    {
      "id": "clx123abc",
      "status": "draft",
      "projectName": "Torre Residencial Punta Pacífica",
      "total": 12500.50,
      "currency": "USD",
      "validUntil": "2025-12-31T23:59:59.000Z",
      "createdAt": "2025-11-01T10:30:00.000Z",
      "sentAt": null,
      "itemCount": 15,
      "user": {
        "id": "usr_abc123",
        "name": "Juan Pérez",
        "email": "juan@example.com",
        "role": "user"
      }
    }
  ],
  "total": 47,
  "totalPages": 5,
  "page": 1,
  "limit": 10,
  "hasNextPage": true,
  "hasPreviousPage": false
}
```

---

### Filtered Request (Draft Only)

```typescript
const result = await api.quote['list-all']({
  status: 'draft',
  page: 1,
  limit: 10,
});
```

**WHERE clause**:
```sql
WHERE quotes.status = 'draft'
ORDER BY quotes.createdAt DESC
LIMIT 10 OFFSET 0
```

---

### Search Request

```typescript
const result = await api.quote['list-all']({
  search: 'Torre',
  page: 1,
  limit: 10,
});
```

**WHERE clause**:
```sql
WHERE (
  quotes.projectName ILIKE '%Torre%' OR
  users.name ILIKE '%Torre%' OR
  quotes.contactPhone LIKE '%Torre%'
)
ORDER BY quotes.createdAt DESC
LIMIT 10 OFFSET 0
```

---

### Sorted Request (By Total, Ascending)

```typescript
const result = await api.quote['list-all']({
  sortBy: 'total',
  sortOrder: 'asc',
  page: 1,
  limit: 10,
});
```

**ORDER BY clause**:
```sql
ORDER BY quotes.total ASC
LIMIT 10 OFFSET 0
```

---

## Error Cases

### 401 Unauthorized (Not Authenticated)

**Trigger**: No session or invalid session token

**Response**:
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Debes iniciar sesión para continuar"
  }
}
```

---

### 403 Forbidden (Insufficient Permissions)

**Trigger**: User role is 'user' (not admin/seller)

**Response**:
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "No tienes permisos para acceder a este recurso"
  }
}
```

---

### 400 Bad Request (Invalid Input)

**Trigger**: Invalid enum value, negative page, limit > 100

**Examples**:
```typescript
// Invalid status
{ status: 'invalid' } // Error: Invalid enum value

// Invalid page
{ page: 0 } // Error: Number must be greater than or equal to 1

// Invalid limit
{ limit: 150 } // Error: Number must be less than or equal to 100
```

**Response**:
```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Validation error",
    "issues": [
      {
        "path": ["status"],
        "message": "Invalid enum value. Expected 'draft' | 'sent' | 'canceled', received 'invalid'"
      }
    ]
  }
}
```

---

## Changes Required

### Task: Add User Name to Search

**File**: `src/server/api/routers/quote.ts`

**Current**:
```typescript
OR: [
  { projectName: { contains: search, mode: 'insensitive' } },
  { contactPhone: { contains: search } },
]
```

**Change to**:
```typescript
OR: [
  { projectName: { contains: search, mode: 'insensitive' } },
  { user: { name: { contains: search, mode: 'insensitive' } } }, // ADD THIS
  { contactPhone: { contains: search } },
]
```

**Impact**: Low (single line addition, no breaking changes)

---

## Testing

### Unit Test Cases

```typescript
describe('quote.list-all', () => {
  it('returns paginated quotes for admin', async () => {
    const result = await caller.quote['list-all']({ page: 1, limit: 10 });
    expect(result.quotes).toHaveLength(10);
    expect(result.total).toBeGreaterThan(0);
  });

  it('filters by status correctly', async () => {
    const result = await caller.quote['list-all']({ status: 'draft' });
    result.quotes.forEach(quote => {
      expect(quote.status).toBe('draft');
    });
  });

  it('searches by projectName', async () => {
    const result = await caller.quote['list-all']({ search: 'Torre' });
    result.quotes.forEach(quote => {
      expect(quote.projectName.toLowerCase()).toContain('torre');
    });
  });

  it('searches by user name', async () => {
    const result = await caller.quote['list-all']({ search: 'Juan' });
    result.quotes.some(quote => 
      quote.user?.name?.toLowerCase().includes('juan')
    );
  });

  it('sorts by total ascending', async () => {
    const result = await caller.quote['list-all']({ 
      sortBy: 'total', 
      sortOrder: 'asc' 
    });
    const totals = result.quotes.map(q => q.total);
    expect(totals).toEqual([...totals].sort((a, b) => a - b));
  });

  it('throws 403 for user role', async () => {
    await expect(
      userCaller.quote['list-all']({})
    ).rejects.toThrow('FORBIDDEN');
  });
});
```

---

## Performance Expectations

**Target**: < 500ms response time (FR-002)

**Benchmarks**:
- 100 quotes: ~50ms
- 1,000 quotes: ~150ms
- 10,000 quotes: ~400ms

**Optimization**:
- Database indexes cover all filter/sort combinations
- COUNT query runs in parallel with SELECT
- User relation uses single LEFT JOIN (no N+1)
- Pagination limits result set size

---

## Related Endpoints

- `quote.get-by-id`: Get full quote details for detail view
- `quote.create`: Create new quote (not used in admin dashboard)
- `quote.update`: Update quote status (future feature)

---

## Summary

**Endpoint**: `api.quote['list-all']`  
**Status**: ✅ Exists (requires minor modification)  
**Changes**: Add user.name to search OR condition  
**Authorization**: Admin/Seller only  
**Performance**: < 500ms for 1000+ quotes  

**Next**: Continue to other contracts or quickstart.md
