# tRPC API Contract: Address CRUD

**Feature**: 001-delivery-address  
**Router**: `src/server/api/routers/address.ts`  
**Purpose**: Create, read, update, delete delivery addresses for quotes

---

## Router: `address`

### Procedure: `create`

**Type**: Mutation (protected - requires authentication)  
**Authorization**: Admin or Seller roles only

**Input Schema**:
```typescript
{
  quoteId?: string;           // Optional: Associate with quote immediately
  label?: string;             // Optional: User tag (max 100 chars)
  country?: string;           // Optional: Country name (max 100)
  region?: string;            // Optional: Department/State (max 100)
  city?: string;              // Optional: City (max 100)
  district?: string;          // Optional: Neighborhood (max 100)
  street?: string;            // Optional: Street address (max 200)
  reference?: string;         // Optional: Landmarks (max 200)
  latitude?: number;          // Optional: -90 to +90 (7 decimals)
  longitude?: number;         // Optional: -180 to +180 (7 decimals)
  postalCode?: string;        // Optional: Postal code (max 20)
}

// Validation Rules:
// - At least one of: city, street, reference required
// - Coordinates: both present or both null
// - Latitude range: [-90, 90]
// - Longitude range: [-180, 180]
```

**Output Schema**:
```typescript
{
  id: string;                 // Generated cuid
  quoteId: string | null;
  label: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  district: string | null;
  street: string | null;
  reference: string | null;
  latitude: Decimal | null;   // Decimal string (e.g., "6.2476000")
  longitude: Decimal | null;
  postalCode: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

**Example Request**:
```typescript
const address = await trpc.address.create.mutate({
  city: 'Medellín',
  region: 'Antioquia',
  country: 'Colombia',
  latitude: 6.2476,
  longitude: -75.5658,
});
```

**Example Response**:
```json
{
  "id": "clx1234567890",
  "quoteId": null,
  "label": null,
  "country": "Colombia",
  "region": "Antioquia",
  "city": "Medellín",
  "district": null,
  "street": null,
  "reference": null,
  "latitude": "6.2476000",
  "longitude": "-75.5658000",
  "postalCode": null,
  "createdAt": "2025-11-01T10:30:00.000Z",
  "updatedAt": "2025-11-01T10:30:00.000Z"
}
```

**Errors**:
- `UNAUTHORIZED`: User not authenticated
- `FORBIDDEN`: User is not admin or seller
- `BAD_REQUEST`: Validation failed (missing required fields, invalid coordinates, coordinate pair mismatch)

---

### Procedure: `getById`

**Type**: Query (protected - requires authentication)  
**Authorization**: Admin, Seller, or User (owner of associated quote)

**Input Schema**:
```typescript
{
  id: string;  // ProjectAddress ID
}
```

**Output Schema**:
```typescript
{
  id: string;
  quoteId: string | null;
  label: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  district: string | null;
  street: string | null;
  reference: string | null;
  latitude: Decimal | null;
  longitude: Decimal | null;
  postalCode: string | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Optionally include related quote
  quote?: {
    id: string;
    userId: string | null;
    status: QuoteStatus;
    total: Decimal;
  } | null;
}
```

**Example Request**:
```typescript
const address = await trpc.address.getById.query({ id: 'clx1234567890' });
```

**Errors**:
- `UNAUTHORIZED`: User not authenticated
- `FORBIDDEN`: User is not admin/seller and doesn't own associated quote
- `NOT_FOUND`: Address with given ID doesn't exist

---

### Procedure: `update`

**Type**: Mutation (protected - requires authentication)  
**Authorization**: Admin, Seller, or User (owner of associated quote)

**Input Schema**:
```typescript
{
  id: string;                 // Address ID to update
  
  // All fields optional (partial update)
  label?: string | null;
  country?: string | null;
  region?: string | null;
  city?: string | null;
  district?: string | null;
  street?: string | null;
  reference?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  postalCode?: string | null;
}

// Validation Rules (same as create):
// - If updating, at least one of: city, street, reference must remain non-null
// - Coordinates: both present or both null after update
// - Ranges apply if coordinates provided
```

**Output Schema**:
```typescript
{
  id: string;
  // ...same as create response
  updatedAt: Date;  // Updated timestamp
}
```

**Example Request**:
```typescript
const updated = await trpc.address.update.mutate({
  id: 'clx1234567890',
  street: 'Calle 45 #23-10',
  reference: 'Edificio Torre Central',
});
```

**Errors**:
- `UNAUTHORIZED`: User not authenticated
- `FORBIDDEN`: User is not admin/seller and doesn't own associated quote
- `NOT_FOUND`: Address with given ID doesn't exist
- `BAD_REQUEST`: Validation failed (would result in no identifiers, invalid coordinate pairs)

---

### Procedure: `delete`

**Type**: Mutation (protected - requires authentication)  
**Authorization**: Admin or Seller only (users cannot delete addresses)

**Input Schema**:
```typescript
{
  id: string;  // Address ID to delete
}
```

**Output Schema**:
```typescript
{
  success: boolean;
  deletedId: string;
}
```

**Example Request**:
```typescript
const result = await trpc.address.delete.mutate({ id: 'clx1234567890' });
```

**Side Effects**:
- If address is associated with quote, set `Quote.projectAddressId` to null
- Cascade delete handled by database constraint

**Errors**:
- `UNAUTHORIZED`: User not authenticated
- `FORBIDDEN`: User is not admin or seller
- `NOT_FOUND`: Address with given ID doesn't exist

---

### Procedure: `listByQuote`

**Type**: Query (protected - requires authentication)  
**Authorization**: Admin, Seller, or User (owner of quote)

**Input Schema**:
```typescript
{
  quoteId: string;
}
```

**Output Schema**:
```typescript
{
  addresses: Array<{
    id: string;
    quoteId: string | null;
    // ...all address fields
  }>;
  count: number;
}
```

**Note**: Currently returns 0 or 1 addresses (one-to-one relationship). Future enhancement may support multiple addresses (billing vs delivery).

**Example Request**:
```typescript
const { addresses } = await trpc.address.listByQuote.query({ 
  quoteId: 'quote_123' 
});
```

**Errors**:
- `UNAUTHORIZED`: User not authenticated
- `FORBIDDEN`: User doesn't own quote and is not admin/seller
- `NOT_FOUND`: Quote doesn't exist

---

## Implementation Notes

### Authorization Helper

```typescript
// src/server/api/routers/address.ts
import { adminOrSellerProcedure, protectedProcedure } from '../trpc';

// For create/delete: admin or seller only
export const addressRouter = createTRPCRouter({
  create: adminOrSellerProcedure
    .input(projectAddressSchema)
    .mutation(async ({ ctx, input }) => {
      // Create address
    }),
  
  // For read/update: check ownership if user role
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const address = await ctx.db.projectAddress.findUnique({
        where: { id: input.id },
        include: { quote: true },
      });
      
      if (!address) throw new TRPCError({ code: 'NOT_FOUND' });
      
      // Check authorization
      if (ctx.session.user.role === 'user') {
        if (address.quote?.userId !== ctx.session.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
      }
      
      return address;
    }),
});
```

### Cache Invalidation

After mutations, invalidate relevant queries:

```typescript
// Client-side mutation handler
const createMutation = api.address.create.useMutation({
  onSettled: () => {
    void utils.address.getById.invalidate();
    void utils.quote.getById.invalidate();  // Refresh quote with new address
    router.refresh();  // Re-fetch server data (SSR pattern)
  },
});
```

---

## Testing Contract

### Unit Tests (tRPC Procedure)

```typescript
// tests/integration/address-crud.test.ts
import { appRouter } from '@/server/api/root';
import { createInnerTRPCContext } from '@/server/api/trpc';

describe('address.create', () => {
  it('creates address with valid coordinates', async () => {
    const ctx = await createInnerTRPCContext({ session: mockAdminSession });
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.address.create({
      city: 'Medellín',
      latitude: 6.2476,
      longitude: -75.5658,
    });
    
    expect(result.id).toBeDefined();
    expect(result.city).toBe('Medellín');
    expect(result.latitude?.toString()).toBe('6.2476000');
  });
  
  it('rejects coordinates without pair', async () => {
    const ctx = await createInnerTRPCContext({ session: mockAdminSession });
    const caller = appRouter.createCaller(ctx);
    
    await expect(
      caller.address.create({
        city: 'Medellín',
        latitude: 6.2476,
        // longitude missing
      })
    ).rejects.toThrow('Latitud y longitud deben estar ambos presentes');
  });
});
```

### Integration Tests (Full Stack)

```typescript
// e2e/delivery-address-crud.spec.ts
test('create and fetch address via API', async ({ page }) => {
  await page.goto('/admin/quotes/new');
  
  // Create address via UI
  await page.fill('[data-testid="address-search"]', 'Medellín');
  await page.click('text=Medellín, Antioquia, Colombia');
  
  // Verify API response
  const response = await page.waitForResponse(
    (res) => res.url().includes('address.create')
  );
  
  const data = await response.json();
  expect(data.result.data.city).toBe('Medellín');
});
```
