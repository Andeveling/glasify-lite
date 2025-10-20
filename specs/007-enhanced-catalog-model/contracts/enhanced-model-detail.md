# tRPC API Contract: Enhanced Model Detail

**Procedure**: `catalog.get-model-by-id`  
**Type**: Query (read-only)  
**Access**: Public (no authentication required)  
**Version**: 2.0 (extended with ProfileSupplier.materialType)

---

## Overview

This contract documents the enhanced `get-model-by-id` tRPC procedure that now includes `materialType` in the `ProfileSupplier` relationship. This enables clients to display material-specific benefits and specifications in the catalog sidebar.

**Change Summary**:
- ✅ Added `materialType` field to `profileSupplier` object in response
- ✅ Backwards compatible (new field in existing optional object)
- ❌ No breaking changes (clients ignoring new field continue to work)

---

## Request Schema

### Input Parameters

```yaml
GetModelByIdInput:
  type: object
  required:
    - modelId
  properties:
    modelId:
      type: string
      format: cuid
      description: Unique identifier of the window/door model
      example: 'cmgpu1gfv00125ip736s2tnfm'
      pattern: '^c[a-z0-9]{24}$'
```

### TypeScript Type

```typescript
type GetModelByIdInput = {
  modelId: string; // cuid format
};
```

### Validation Rules

- `modelId` MUST be a valid CUID (26 characters, starts with 'c')
- Empty string, null, or undefined values will be rejected by Zod
- Invalid CUID format returns `400 Bad Request`

---

## Response Schema

### Output (Enhanced)

```yaml
ModelDetailOutput:
  type: object
  required:
    - id
    - name
    - status
    - basePrice
    - costPerMmWidth
    - costPerMmHeight
    - minWidthMm
    - maxWidthMm
    - minHeightMm
    - maxHeightMm
    - compatibleGlassTypeIds
    - createdAt
    - updatedAt
  properties:
    id:
      type: string
      format: cuid
      description: Model unique identifier
      
    name:
      type: string
      description: Model name (e.g., "Koncept Serie 100", "REHAU Prestige")
      example: 'Deceuninck LEGEND 76mm'
      
    status:
      type: string
      enum: [draft, published]
      description: Publication status (only published models returned)
      
    basePrice:
      type: number
      format: decimal
      description: Base price in configured currency (from TenantConfig)
      example: 250000.00
      minimum: 0
      
    costPerMmWidth:
      type: number
      format: decimal
      description: Additional cost per mm of width
      example: 125.50
      minimum: 0
      
    costPerMmHeight:
      type: number
      format: decimal
      description: Additional cost per mm of height
      example: 115.75
      minimum: 0
      
    accessoryPrice:
      type: number
      format: decimal
      nullable: true
      description: Optional accessory package price
      example: 45000.00
      
    minWidthMm:
      type: integer
      description: Minimum allowed width in millimeters
      example: 600
      minimum: 1
      
    maxWidthMm:
      type: integer
      description: Maximum allowed width in millimeters
      example: 2400
      minimum: 1
      
    minHeightMm:
      type: integer
      description: Minimum allowed height in millimeters
      example: 800
      minimum: 1
      
    maxHeightMm:
      type: integer
      description: Maximum allowed height in millimeters
      example: 2200
      minimum: 1
      
    compatibleGlassTypeIds:
      type: array
      items:
        type: string
        format: cuid
      description: IDs of compatible glass types for this model
      example: ['clx1...', 'clx2...', 'clx3...']
      
    profileSupplier:
      type: object
      nullable: true
      description: Profile manufacturer information
      required:
        - id
        - name
        - materialType  # ✅ NEW FIELD
      properties:
        id:
          type: string
          format: cuid
          description: Supplier unique identifier
          example: 'clsupplier123'
          
        name:
          type: string
          description: Supplier name
          example: 'Deceuninck'
          enum: [Deceuninck, REHAU, Alumina, VEKA, Azembla]
          
        materialType:  # ✅ NEW IN v2.0
          type: string
          description: Primary material type supplied by this manufacturer
          enum: [PVC, ALUMINUM, WOOD, MIXED]
          example: 'PVC'
          
    createdAt:
      type: string
      format: date-time
      description: Model creation timestamp
      example: '2025-01-15T10:30:00.000Z'
      
    updatedAt:
      type: string
      format: date-time
      description: Last update timestamp
      example: '2025-10-14T15:45:00.000Z'
```

### TypeScript Type

```typescript
type ModelDetailOutput = {
  id: string;
  name: string;
  status: 'draft' | 'published';
  basePrice: number;
  costPerMmWidth: number;
  costPerMmHeight: number;
  accessoryPrice: number | null;
  minWidthMm: number;
  maxWidthMm: number;
  minHeightMm: number;
  maxHeightMm: number;
  compatibleGlassTypeIds: string[];
  profileSupplier: {
    id: string;
    name: string;
    materialType: 'PVC' | 'ALUMINUM' | 'WOOD' | 'MIXED'; // ✅ NEW
  } | null;
  createdAt: Date;
  updatedAt: Date;
};
```

---

## Example Request/Response

### Request

```typescript
// tRPC Client
const model = await trpc.catalog['get-model-by-id'].query({
  modelId: 'cmgpu1gfv00125ip736s2tnfm',
});
```

### Response (Success - 200 OK)

```json
{
  "id": "cmgpu1gfv00125ip736s2tnfm",
  "name": "Deceuninck LEGEND 76mm",
  "status": "published",
  "basePrice": 285000.00,
  "costPerMmWidth": 135.50,
  "costPerMmHeight": 125.75,
  "accessoryPrice": 52000.00,
  "minWidthMm": 600,
  "maxWidthMm": 2400,
  "minHeightMm": 800,
  "maxHeightMm": 2200,
  "compatibleGlassTypeIds": [
    "clglass001",
    "clglass002",
    "clglass003"
  ],
  "profileSupplier": {
    "id": "clsupplier01",
    "name": "Deceuninck",
    "materialType": "PVC"
  },
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-10-14T15:45:00.000Z"
}
```

### Response (Model without Supplier)

```json
{
  "id": "cmgpu1gfv00125ip736s2tnfm",
  "name": "Generic Window Model",
  "status": "published",
  "basePrice": 180000.00,
  "costPerMmWidth": 95.00,
  "costPerMmHeight": 85.00,
  "accessoryPrice": null,
  "minWidthMm": 500,
  "maxWidthMm": 1800,
  "minHeightMm": 600,
  "maxHeightMm": 1800,
  "compatibleGlassTypeIds": ["clglass001"],
  "profileSupplier": null,
  "createdAt": "2025-02-10T08:15:00.000Z",
  "updatedAt": "2025-02-10T08:15:00.000Z"
}
```

---

## Error Responses

### Model Not Found (404)

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "El modelo solicitado no existe o no está disponible."
  }
}
```

**Conditions**:
- Model ID does not exist in database
- Model exists but `status = 'draft'` (unpublished)

### Invalid Input (400)

```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid input: modelId must be a valid CUID",
    "issues": [
      {
        "path": ["modelId"],
        "message": "Invalid CUID format"
      }
    ]
  }
}
```

**Conditions**:
- Invalid CUID format
- Missing `modelId` parameter

### Server Error (500)

```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "No se pudo cargar el modelo. Intente nuevamente."
  }
}
```

**Conditions**:
- Database connection failure
- Unexpected Prisma errors
- Zod validation failure on server response (data integrity issue)

---

## Backwards Compatibility

### v1.0 → v2.0 Migration

**Breaking Changes**: ✅ NONE

**Additive Changes**:
1. `profileSupplier.materialType` added as required field (when supplier exists)

**Client Impact**:
- ✅ Clients ignoring `materialType` continue to work
- ✅ Clients accessing `profileSupplier.name` unaffected
- ✅ No changes to request format
- ✅ No changes to error handling

**Recommended Client Update**:
```typescript
// Old client code (still works)
const supplierName = model.profileSupplier?.name;

// New client code (enhanced)
const supplierName = model.profileSupplier?.name;
const materialType = model.profileSupplier?.materialType; // ✅ NEW
const benefits = materialType ? MATERIAL_BENEFITS[materialType] : [];
```

---

## Usage Guidelines

### Client-Side Consumption

**Component Pattern**:
```tsx
'use client';

export function ModelSidebar({ model }: { model: ModelDetailOutput }) {
  const profileSupplier = model.profileSupplier;

  return (
    <div className="space-y-4">
      {/* Handle null supplier gracefully */}
      {profileSupplier ? (
        <ProfileSupplierCard
          name={profileSupplier.name}
          materialType={profileSupplier.materialType}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          Proveedor de perfiles no especificado
        </p>
      )}

      {/* Material-based features */}
      {profileSupplier && (
        <ModelFeatures
          features={MATERIAL_BENEFITS[profileSupplier.materialType]}
        />
      )}
    </div>
  );
}
```

### Server-Side Query

**tRPC Procedure Implementation**:
```typescript
// src/server/api/routers/catalog/catalog.queries.ts
'get-model-by-id': publicProcedure
  .input(getModelByIdInput)
  .output(modelDetailOutput)
  .query(async ({ ctx, input }) => {
    const model = await ctx.db.model.findUnique({
      select: {
        id: true,
        name: true,
        status: true,
        basePrice: true,
        costPerMmWidth: true,
        costPerMmHeight: true,
        accessoryPrice: true,
        minWidthMm: true,
        maxWidthMm: true,
        minHeightMm: true,
        maxHeightMm: true,
        compatibleGlassTypeIds: true,
        profileSupplier: {
          select: {
            id: true,
            name: true,
            materialType: true, // ✅ ADD THIS LINE
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      where: {
        id: input.modelId,
        status: 'published',
      },
    });

    if (!model) {
      throw new Error('El modelo solicitado no existe o no está disponible.');
    }

    return serializeDecimalFields(model);
  }),
```

---

## Performance Considerations

**Query Complexity**: O(1) - Single Prisma query with relation select

**Data Size**:
- Typical response: ~500-800 bytes (JSON)
- Added by `materialType`: ~15 bytes
- Negligible impact on network transfer

**Caching Strategy**:
- Models are relatively static (infrequent updates)
- Consider ISR with `revalidate: 3600` (1 hour)
- Edge caching safe (no user-specific data)

**Database Load**:
- No additional JOIN (profileSupplier already selected)
- Index on `Model.profileSupplierId` (existing)
- Index on `Model.status` (existing)

---

## Testing Contract

### Unit Tests

```typescript
// Test Zod schema validation
describe('modelDetailOutput schema', () => {
  it('validates correct response with materialType', () => {
    const validData = {
      id: 'cmgpu1gfv00125ip736s2tnfm',
      name: 'Test Model',
      status: 'published',
      profileSupplier: {
        id: 'clsupplier01',
        name: 'Deceuninck',
        materialType: 'PVC', // ✅ NEW FIELD
      },
      // ... other required fields
    };

    expect(() => modelDetailOutput.parse(validData)).not.toThrow();
  });

  it('rejects invalid materialType enum value', () => {
    const invalidData = {
      // ... valid fields
      profileSupplier: {
        id: 'clsupplier01',
        name: 'Test',
        materialType: 'STEEL', // ❌ Invalid enum
      },
    };

    expect(() => modelDetailOutput.parse(invalidData)).toThrow();
  });

  it('allows null profileSupplier', () => {
    const validData = {
      // ... valid fields
      profileSupplier: null, // ✅ Nullable
    };

    expect(() => modelDetailOutput.parse(validData)).not.toThrow();
  });
});
```

### Integration Tests

```typescript
// Test tRPC procedure with real database
describe('catalog.get-model-by-id', () => {
  it('returns materialType when supplier assigned', async () => {
    const result = await caller.catalog['get-model-by-id']({
      modelId: 'test-model-with-supplier',
    });

    expect(result.profileSupplier).toBeDefined();
    expect(result.profileSupplier?.materialType).toMatch(/^(PVC|ALUMINUM|WOOD|MIXED)$/);
  });

  it('handles null supplier gracefully', async () => {
    const result = await caller.catalog['get-model-by-id']({
      modelId: 'test-model-without-supplier',
    });

    expect(result.profileSupplier).toBeNull();
    // Should not throw error
  });
});
```

### E2E Tests

```typescript
// Test UI rendering with enhanced data
test('displays material-specific benefits for PVC model', async ({ page }) => {
  await page.goto('/catalog/pvc-model-id');

  await expect(page.getByText('Deceuninck')).toBeVisible();
  await expect(page.getByText('PVC')).toBeVisible();
  await expect(page.getByText('Excelente aislamiento térmico')).toBeVisible();
});

test('shows fallback message when supplier missing', async ({ page }) => {
  await page.goto('/catalog/model-without-supplier');

  await expect(page.getByText('Proveedor de perfiles no especificado')).toBeVisible();
});
```

---

## Contract Versioning

**Current Version**: 2.0  
**Previous Version**: 1.0 (without materialType)  
**Breaking Change**: No  
**Deprecated Fields**: None  

**Version History**:
- v1.0 (2025-01-15): Initial release with basic model details
- v2.0 (2025-10-14): Added `profileSupplier.materialType` for material-based benefits

---

**Contract Status**: ✅ Approved  
**Implementation**: Pending (Phase 2)  
**Next Step**: Generate quickstart.md
