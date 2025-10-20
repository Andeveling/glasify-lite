# API Contracts: Profile Suppliers

**Feature**: 012-simplify-profile-suppliers  
**Phase**: 1 (Design & Contracts)  
**Date**: 2025-01-20

## Overview

All API operations are exposed via tRPC router at `/src/server/api/routers/admin/profile-supplier.ts`. All procedures require admin authentication (enforced by `adminProcedure`).

**Base Path**: `api.admin['profile-supplier']`  
**Authorization**: Admin role only (checked server-side)  
**Protocol**: tRPC over HTTP POST  
**Content-Type**: application/json

---

## Procedures

### list - List Profile Suppliers

**Purpose**: Retrieve paginated list of profile suppliers with optional filters

**Endpoint**: `api.admin['profile-supplier'].list`  
**Method**: tRPC query  
**Authorization**: adminProcedure

**Input Schema**:
```typescript
{
  page?: number;           // Page number (1-indexed), default: 1
  search?: string;         // Search term (matches name), optional
  materialType?: MaterialType;  // Filter by material, optional
  isActive?: boolean;      // Filter by status, optional
}
```

**Output Schema**:
```typescript
{
  items: ProfileSupplier[];  // Array of suppliers for current page
  total: number;             // Total count (all pages)
  page: number;              // Current page number
  totalPages: number;        // Total number of pages
}
```

**Example Request**:
```typescript
const { items, total } = await api.admin['profile-supplier'].list({
  page: 1,
  search: 'rehau',
  materialType: 'PVC',
  isActive: true,
});
```

**Example Response**:
```json
{
  "items": [
    {
      "id": "clxyz123",
      "name": "Rehau Colombia",
      "materialType": "PVC",
      "notes": "Proveedor líder...",
      "isActive": true,
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "totalPages": 1
}
```

**Business Rules**:
- Page size: 10 items per page (hardcoded)
- Search: Case-insensitive LIKE match on `name` field
- Default sort: `name ASC`
- Empty results: Returns `{ items: [], total: 0, page: 1, totalPages: 0 }`

**Error Cases**:
- Invalid page number: Returns page 1
- Invalid materialType: Zod validation error
- Unauthorized: FORBIDDEN error (not admin)

---

### create - Create Profile Supplier

**Purpose**: Create a new profile supplier

**Endpoint**: `api.admin['profile-supplier'].create`  
**Method**: tRPC mutation  
**Authorization**: adminProcedure

**Input Schema**:
```typescript
{
  name: string;                  // 3-100 characters, required
  materialType: MaterialType;    // Enum value, required
  notes?: string;                // Max 500 characters, optional
  isActive?: boolean;            // Default true
}
```

**Output Schema**:
```typescript
ProfileSupplier  // Complete supplier object with id, timestamps
```

**Example Request**:
```typescript
const supplier = await api.admin['profile-supplier'].create.mutate({
  name: 'Rehau Colombia',
  materialType: 'PVC',
  notes: 'Proveedor líder en sistemas de ventanas',
  isActive: true,
});
```

**Example Response**:
```json
{
  "id": "clxyz123",
  "name": "Rehau Colombia",
  "materialType": "PVC",
  "notes": "Proveedor líder en sistemas de ventanas",
  "isActive": true,
  "createdAt": "2025-01-20T14:30:00.000Z",
  "updatedAt": "2025-01-20T14:30:00.000Z"
}
```

**Business Rules**:
- Name must be unique (database constraint)
- Name is automatically trimmed
- Empty notes converted to null
- Default isActive: true

**Error Cases**:
- Duplicate name: CONFLICT error "Ya existe un proveedor con este nombre"
- Invalid input: BAD_REQUEST with field-specific errors
- Unauthorized: FORBIDDEN error (not admin)

**Logging**:
```typescript
logger.info('Profile supplier created', {
  supplierId: result.id,
  name: input.name,
  userId: ctx.session.user.id,
});
```

---

### update - Update Profile Supplier

**Purpose**: Update an existing profile supplier

**Endpoint**: `api.admin['profile-supplier'].update`  
**Method**: tRPC mutation  
**Authorization**: adminProcedure

**Input Schema**:
```typescript
{
  id: string;                    // CUID, required
  name: string;                  // 3-100 characters, required
  materialType: MaterialType;    // Enum value, required
  notes?: string;                // Max 500 characters, optional
  isActive: boolean;             // Required (explicit choice)
}
```

**Output Schema**:
```typescript
ProfileSupplier  // Updated supplier object
```

**Example Request**:
```typescript
const updated = await api.admin['profile-supplier'].update.mutate({
  id: 'clxyz123',
  name: 'Rehau Colombia S.A.',
  materialType: 'PVC',
  notes: 'Updated notes',
  isActive: true,
});
```

**Example Response**:
```json
{
  "id": "clxyz123",
  "name": "Rehau Colombia S.A.",
  "materialType": "PVC",
  "notes": "Updated notes",
  "isActive": true,
  "createdAt": "2025-01-20T14:30:00.000Z",
  "updatedAt": "2025-01-20T16:45:00.000Z"
}
```

**Business Rules**:
- Name uniqueness checked (excluding current record)
- `updatedAt` automatically set by Prisma
- Can change materialType (no restrictions)
- Can toggle isActive

**Error Cases**:
- Not found: NOT_FOUND error "Proveedor no encontrado"
- Duplicate name: CONFLICT error "Ya existe un proveedor con este nombre"
- Invalid input: BAD_REQUEST with field-specific errors
- Unauthorized: FORBIDDEN error (not admin)

**Logging**:
```typescript
logger.info('Profile supplier updated', {
  supplierId: input.id,
  changes: { name, materialType, notes, isActive },
  userId: ctx.session.user.id,
});
```

---

### delete - Delete Profile Supplier

**Purpose**: Hard delete a profile supplier (or soft delete if has relationships)

**Endpoint**: `api.admin['profile-supplier'].delete`  
**Method**: tRPC mutation  
**Authorization**: adminProcedure

**Input Schema**:
```typescript
{
  id: string;  // CUID, required
}
```

**Output Schema**:
```typescript
void  // No return value on success
```

**Example Request**:
```typescript
await api.admin['profile-supplier'].delete.mutate({
  id: 'clxyz123',
});
```

**Example Response**:
```json
null
```

**Business Rules**:
- Check for related profiles before deleting
- If profiles exist: Throw error suggesting soft delete
- If no profiles: Hard delete allowed
- Cascading delete: RESTRICT (cannot delete with relationships)

**Error Cases**:
- Not found: NOT_FOUND error "Proveedor no encontrado"
- Has relationships: BAD_REQUEST "No se puede eliminar el proveedor porque tiene X perfiles asociados. Desactívalo en su lugar."
- Unauthorized: FORBIDDEN error (not admin)

**Example Error Response (has profiles)**:
```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "No se puede eliminar el proveedor porque tiene 5 perfiles asociados. Desactívalo en su lugar."
  }
}
```

**Logging**:
```typescript
logger.warn('Profile supplier delete attempt with relationships', {
  supplierId: input.id,
  profileCount: count,
  userId: ctx.session.user.id,
});

// Or on success:
logger.info('Profile supplier deleted', {
  supplierId: input.id,
  userId: ctx.session.user.id,
});
```

---

### getById - Get Profile Supplier by ID

**Purpose**: Fetch a single profile supplier by ID (used for edit mode)

**Endpoint**: `api.admin['profile-supplier'].getById`  
**Method**: tRPC query  
**Authorization**: adminProcedure

**Input Schema**:
```typescript
{
  id: string;  // CUID, required
}
```

**Output Schema**:
```typescript
ProfileSupplier | null  // Supplier object or null if not found
```

**Example Request**:
```typescript
const supplier = await api.admin['profile-supplier'].getById({
  id: 'clxyz123',
});
```

**Example Response**:
```json
{
  "id": "clxyz123",
  "name": "Rehau Colombia",
  "materialType": "PVC",
  "notes": "Proveedor líder...",
  "isActive": true,
  "createdAt": "2025-01-15T10:00:00.000Z",
  "updatedAt": "2025-01-15T10:00:00.000Z"
}
```

**Business Rules**:
- Returns null if not found (not an error)
- Used primarily for edit mode initialization

**Error Cases**:
- Unauthorized: FORBIDDEN error (not admin)

**Note**: This procedure is NOT needed for dialog modal pattern (supplier data comes from list). Included for completeness.

---

## Error Handling

### tRPC Error Codes

| Code | HTTP Status | Usage |
|------|-------------|-------|
| FORBIDDEN | 403 | User is not admin |
| BAD_REQUEST | 400 | Invalid input or business rule violation |
| NOT_FOUND | 404 | Supplier not found by ID |
| CONFLICT | 409 | Unique constraint violation (duplicate name) |
| INTERNAL_SERVER_ERROR | 500 | Unexpected server error |

### Error Response Format

```typescript
{
  error: {
    code: 'BAD_REQUEST',
    message: 'El nombre es requerido',
    data?: {
      // Optional: field-specific errors
      fieldErrors: {
        name: ['El nombre debe tener al menos 3 caracteres'],
      }
    }
  }
}
```

### Client-Side Error Handling

```typescript
// In mutations hook
const createMutation = api.admin['profile-supplier'].create.useMutation({
  onError: (error) => {
    // Display Spanish error message to user
    toast.error('Error al crear proveedor', {
      description: error.message || 'Ocurrió un error inesperado',
    });
  },
});
```

---

## Performance Considerations

### Query Optimization

- **list**: Uses database indexes on `name`, `materialType`, `isActive`
- **Pagination**: Limits result set to 10 items per page
- **Search**: ILIKE operator (case-insensitive) on indexed column

### Caching Strategy

- **Server-Side**: No caching (admin data changes frequently)
- **Client-Side**: TanStack Query cache with manual invalidation
- **SSR**: force-dynamic (no ISR for admin routes)

### Rate Limiting

No rate limiting currently implemented (admin-only routes, trusted users).

---

## Security

### Authorization

All procedures use `adminProcedure` middleware:

```typescript
export const adminProcedure = protectedProcedure.use(async (opts) => {
  if (opts.ctx.session.user.role !== 'admin') {
    logger.warn('Non-admin attempted admin procedure', {
      userId: opts.ctx.session.user.id,
      role: opts.ctx.session.user.role,
    });
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'No tienes permisos de administrador',
    });
  }
  return opts.next();
});
```

### Input Validation

All inputs validated with Zod schemas before database operations:

```typescript
.input(createProfileSupplierSchema)
.mutation(async ({ ctx, input }) => {
  // input is guaranteed to be valid here
});
```

### Audit Logging

All mutations logged with Winston (server-side only):

```typescript
logger.info('Profile supplier created', {
  supplierId: result.id,
  name: input.name,
  userId: ctx.session.user.id,
  timestamp: new Date().toISOString(),
});
```

---

## Testing

### Contract Tests

Validate that tRPC procedures match their schemas:

```typescript
// tests/contract/profile-supplier.contract.test.ts
describe('ProfileSupplier API Contracts', () => {
  it('list procedure returns paginated results', async () => {
    const result = await caller.admin['profile-supplier'].list({ page: 1 });
    expect(result).toHaveProperty('items');
    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('page');
    expect(result).toHaveProperty('totalPages');
    expect(Array.isArray(result.items)).toBe(true);
  });

  it('create procedure validates input schema', async () => {
    await expect(
      caller.admin['profile-supplier'].create({
        name: 'AB', // Too short
        materialType: 'PVC',
      })
    ).rejects.toThrow('El nombre debe tener al menos 3 caracteres');
  });
});
```

### Integration Tests

Test tRPC procedures with real database:

```typescript
// tests/integration/profile-supplier.integration.test.ts
describe('ProfileSupplier Integration', () => {
  it('creates and retrieves supplier', async () => {
    const created = await caller.admin['profile-supplier'].create({
      name: 'Test Supplier',
      materialType: 'PVC',
    });
    
    const retrieved = await caller.admin['profile-supplier'].getById({
      id: created.id,
    });
    
    expect(retrieved?.name).toBe('Test Supplier');
  });
});
```

---

## Appendix: Type Definitions

```typescript
// From Prisma schema
type ProfileSupplier = {
  id: string;
  name: string;
  materialType: MaterialType;
  notes: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type MaterialType = 'PVC' | 'ALUMINUM' | 'WOOD' | 'MIXED';

// From Zod schemas
type CreateProfileSupplierInput = {
  name: string;
  materialType: MaterialType;
  notes?: string;
  isActive?: boolean;
};

type UpdateProfileSupplierInput = {
  id: string;
  name: string;
  materialType: MaterialType;
  notes?: string;
  isActive: boolean;
};

type ListProfileSuppliersInput = {
  page?: number;
  search?: string;
  materialType?: MaterialType;
  isActive?: boolean;
};

type ListProfileSuppliersOutput = {
  items: ProfileSupplier[];
  total: number;
  page: number;
  totalPages: number;
};
```

---

## Summary

**Total Procedures**: 5 (list, create, update, delete, getById)  
**Authorization**: adminProcedure (all procedures)  
**Validation**: Zod schemas (all inputs)  
**Logging**: Winston (all mutations)  
**Existing Implementation**: YES (no API changes needed)

All contracts are already implemented and tested. This refactoring only changes the UI layer (separate pages → dialog modal).
