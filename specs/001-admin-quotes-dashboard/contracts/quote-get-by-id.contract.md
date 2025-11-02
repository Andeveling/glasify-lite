# API Contract: quote.get-by-id

**Endpoint**: `api.quote['get-by-id']`  
**Feature**: 001-admin-quotes-dashboard  
**Type**: tRPC Query  
**Authorization**: Owner or Admin

---

## Overview

Returns complete quote details including all items, services, adjustments, and user contact information. Used for the quote detail view at `/admin/quotes/[quoteId]`.

**Status**: ✅ Already exists in codebase (`src/server/api/routers/quote.ts`)

**Note**: This endpoint enforces ownership checks - admin can view any quote, regular users can only view their own.

---

## Input Schema

```typescript
{
  id: string;
}
```

### Parameters

| Parameter | Type     | Required | Validation         | Description             |
| --------- | -------- | -------- | ------------------ | ----------------------- |
| `id`      | `string` | Yes      | Must be valid CUID | Quote unique identifier |

### Zod Schema

```typescript
const getByIdInput = z.object({
  id: z.string().cuid(),
});
```

---

## Output Schema

```typescript
{
  id: string;
  userId: string | null;
  status: 'draft' | 'sent' | 'canceled';
  currency: string;
  total: number;
  validUntil: Date | null;
  contactPhone: string | null;
  projectName: string | null;
  createdAt: Date;
  updatedAt: Date;
  sentAt: Date | null;
  user: UserContactInfo | null;
  items: QuoteItem[];
  services: Service[];
  adjustments: Adjustment[];
  projectAddress: ProjectAddress | null;
}
```

### UserContactInfo Structure

```typescript
{
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: 'admin' | 'seller' | 'user';
}
```

**New in v1**: User details fully exposed for contact info display (FR-006)

---

## Authorization

**Procedure Type**: `protectedProcedure` with ownership check

**Access Control**:
- ✅ Admin: Can view ANY quote
- ✅ Owner: Can view their OWN quotes only
- ❌ Other users: Cannot view quotes they don't own (403)
- ❌ Anonymous: Not authenticated (401)

**Implementation**:
```typescript
.query(async ({ ctx, input }) => {
  const quote = await ctx.db.quote.findUnique({
    where: { id: input.id },
    include: { /* full relations */ },
  });

  if (!quote) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Cotización no encontrada',
    });
  }

  // Admin can see all, others only their own
  const isAdmin = ctx.session.user.role === 'admin';
  const isOwner = quote.userId === ctx.session.user.id;

  if (!isAdmin && !isOwner) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'No tienes permisos para ver esta cotización',
    });
  }

  return quote;
});
```

---

## Database Query

### Prisma Query Structure

```typescript
const quote = await ctx.db.quote.findUnique({
  where: { id: input.id },
  include: {
    user: {
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,  // NEW: Include phone for contact info
        role: true,
      },
    },
    items: {
      include: {
        glassType: true,
        glassColor: true,
        // ... other relations
      },
      orderBy: { createdAt: 'asc' },
    },
    services: {
      orderBy: { createdAt: 'asc' },
    },
    adjustments: {
      orderBy: { createdAt: 'asc' },
    },
    projectAddress: true,
  },
});
```

### Performance

**Indexes Used**:
- Primary key lookup: `@@id([id])` (extremely fast)

**Query Complexity**:
- 1 main query (findUnique)
- 5 included relations: user, items, services, adjustments, projectAddress
- Items have nested relations (glassType, glassColor, etc.)

**Expected Time**: < 100ms (single record by primary key)

---

## Example Usage

### Successful Request (Admin Viewing Any Quote)

```typescript
const quote = await api.quote['get-by-id']({ 
  id: 'clx123abc' 
});
```

**Response**:
```json
{
  "id": "clx123abc",
  "userId": "usr_abc123",
  "status": "sent",
  "currency": "USD",
  "total": 12500.50,
  "validUntil": "2025-12-31T23:59:59.000Z",
  "contactPhone": "+507 6123-4567",
  "projectName": "Torre Residencial Punta Pacífica",
  "createdAt": "2025-11-01T10:30:00.000Z",
  "updatedAt": "2025-11-01T14:20:00.000Z",
  "sentAt": "2025-11-01T14:20:00.000Z",
  "user": {
    "id": "usr_abc123",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "phone": "+507 6999-8888",
    "role": "user"
  },
  "items": [
    {
      "id": "item_001",
      "description": "Ventana fija 2m x 1.5m",
      "quantity": 5,
      "unitPrice": 450.00,
      "totalPrice": 2250.00,
      "glassType": { "name": "Templado" },
      "glassColor": { "name": "Claro" }
    }
  ],
  "services": [],
  "adjustments": [],
  "projectAddress": {
    "id": "addr_001",
    "street": "Calle 50",
    "city": "Ciudad de Panamá",
    "country": "PA"
  }
}
```

---

### Successful Request (User Viewing Own Quote)

Same as admin, but only works if `quote.userId === session.user.id`

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

### 403 Forbidden (Not Owner)

**Trigger**: User is not admin AND quote.userId !== session.user.id

**Request**:
```typescript
// User "usr_xyz" tries to view quote owned by "usr_abc"
await api.quote['get-by-id']({ id: 'clx123abc' });
```

**Response**:
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "No tienes permisos para ver esta cotización"
  }
}
```

---

### 404 Not Found

**Trigger**: Quote ID doesn't exist in database

**Request**:
```typescript
await api.quote['get-by-id']({ id: 'nonexistent_id' });
```

**Response**:
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Cotización no encontrada"
  }
}
```

---

### 400 Bad Request (Invalid CUID)

**Trigger**: Quote ID is not a valid CUID format

**Request**:
```typescript
await api.quote['get-by-id']({ id: 'invalid-format' });
```

**Response**:
```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Validation error",
    "issues": [
      {
        "path": ["id"],
        "message": "Invalid cuid"
      }
    ]
  }
}
```

---

## Changes Required

### Task: Include User Phone in Response

**File**: `src/server/api/routers/quote.ts`

**Current**:
```typescript
user: {
  select: {
    id: true,
    name: true,
    email: true,
    role: true,
  },
}
```

**Change to**:
```typescript
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

**Impact**: Very low (non-breaking addition to response)

**Note**: If `phone` field doesn't exist in User model, add it:
```prisma
model User {
  // ... existing fields
  phone String? // Optional contact phone
}
```

---

## UI Integration

### Detail View Layout

```tsx
// src/app/(dashboard)/admin/quotes/[quoteId]/page.tsx

export default async function QuoteDetailPage({ params }) {
  const quote = await api.quote['get-by-id']({ id: params.quoteId });

  return (
    <div>
      <QuoteDetailView quote={quote} />
      <UserContactInfo user={quote.user} /> {/* NEW COMPONENT */}
    </div>
  );
}
```

### Contact Info Component

```tsx
// src/app/(dashboard)/admin/quotes/[quoteId]/_components/user-contact-info.tsx

export function UserContactInfo({ user }: { user: UserContactInfo | null }) {
  if (!user) {
    return <Card>Usuario desconocido</Card>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información de Contacto</CardTitle>
      </CardHeader>
      <CardContent>
        <dl>
          <dt>Nombre</dt>
          <dd>{user.name || user.email}</dd>
          
          <dt>Email</dt>
          <dd>
            <a href={`mailto:${user.email}`}>{user.email}</a>
          </dd>
          
          {user.phone && (
            <>
              <dt>Teléfono</dt>
              <dd>
                <a href={`tel:${user.phone}`}>{user.phone}</a>
              </dd>
            </>
          )}
          
          {(user.role === 'admin' || user.role === 'seller') && (
            <>
              <dt>Rol</dt>
              <dd><RoleBadge role={user.role} /></dd>
            </>
          )}
        </dl>
      </CardContent>
    </Card>
  );
}
```

---

## Testing

### Unit Test Cases

```typescript
describe('quote.get-by-id', () => {
  it('returns full quote for admin', async () => {
    const quote = await adminCaller.quote['get-by-id']({ 
      id: testQuote.id 
    });
    expect(quote).toMatchObject({
      id: testQuote.id,
      user: expect.objectContaining({
        email: expect.any(String),
        phone: expect.any(String),
      }),
      items: expect.arrayContaining([]),
    });
  });

  it('returns quote for owner', async () => {
    const quote = await ownerCaller.quote['get-by-id']({ 
      id: ownQuote.id 
    });
    expect(quote.id).toBe(ownQuote.id);
  });

  it('throws 403 for non-owner', async () => {
    await expect(
      otherUserCaller.quote['get-by-id']({ id: ownQuote.id })
    ).rejects.toThrow('FORBIDDEN');
  });

  it('throws 404 for nonexistent quote', async () => {
    await expect(
      adminCaller.quote['get-by-id']({ id: 'clx_nonexistent' })
    ).rejects.toThrow('NOT_FOUND');
  });

  it('includes user phone in response', async () => {
    const quote = await adminCaller.quote['get-by-id']({ 
      id: testQuote.id 
    });
    expect(quote.user?.phone).toBeDefined();
  });
});
```

---

## Performance Expectations

**Target**: < 100ms response time

**Benchmarks**:
- Simple quote (few items): ~20ms
- Complex quote (20+ items): ~80ms
- With all relations: ~100ms

**Optimization**:
- Primary key lookup (no table scan)
- Single query with includes (no N+1)
- Relations loaded via JOINs (not separate queries)

---

## Related Endpoints

- `quote.list-all`: List all quotes for admin dashboard
- `quote.update`: Update quote status (future feature)
- `quote.delete`: Soft delete quote (future feature)

---

## Summary

**Endpoint**: `api.quote['get-by-id']`  
**Status**: ✅ Exists (requires adding phone to user select)  
**Changes**: Include `phone: true` in user relation select  
**Authorization**: Admin or owner only  
**Performance**: < 100ms for full quote with all relations  

**Next**: Generate quickstart.md or additional contracts if needed
