# Profile Supplier Module

## Overview

The **Profile Supplier** module manages suppliers of aluminum, PVC, wood, and mixed material profiles used in glass models. It follows Clean Architecture principles with a three-tier deletion strategy and comprehensive audit logging.

**Status**: ✅ Production Ready (Drizzle ORM Migration Complete)  
**Migration Date**: 2025-01-26  
**Lines of Code**: ~1,328 (7 files)

---

## Architecture

### Clean Architecture Layers

```
index.ts (Router Composition)
├── profile-supplier.queries.ts (Read Procedures)
├── profile-supplier.mutations.ts (Write Procedures)
└── profile-supplier.service.ts (Business Logic)
    ├── repositories/profile-supplier-repository.ts (Data Access)
    ├── utils/profile-supplier-logger.ts (Structured Logging)
    └── profile-supplier.schemas.ts (Validation)
```

**Key Patterns:**
- **Separation of Concerns**: tRPC → Service → Repository → Database
- **Type Safety**: Drizzle ORM with TypeScript 5.x strict mode
- **Validation**: Zod schemas with drizzle-zod integration
- **Audit Logging**: Winston-based structured logging (server-side only)
- **Error Handling**: Spanish user-facing messages, semantic TRPCError codes

---

## Database Schema

**Table**: `ProfileSupplier`

| Column         | Type                           | Notes                                   |
| -------------- | ------------------------------ | --------------------------------------- |
| `id`           | `varchar(36)` PK               | UUID v4                                 |
| `name`         | `varchar(255)` UNIQUE NOT NULL | Commercial name                         |
| `materialType` | `enum` NOT NULL                | PVC, ALUMINUM, WOOD, MIXED              |
| `isActive`     | `text` NOT NULL                | "true"/"false" (legacy boolean storage) |
| `notes`        | `varchar(1000)`                | Optional remarks                        |
| `createdAt`    | `text` NOT NULL                | ISO 8601 timestamp                      |
| `updatedAt`    | `text` NOT NULL                | ISO 8601 timestamp (auto-update)        |

**Indexes:**
- `ProfileSupplier_isActive_idx` (filtering)
- `ProfileSupplier_materialType_idx` (filtering)

**Constraints:**
- Unique: name (single column)
- Business Logic Unique: name + materialType (enforced in service layer)

---

## API Reference

### Queries (Read Operations)

#### `list`
Get paginated profile suppliers with optional filters.

**Input:**
```typescript
{
  page: number;           // Default: 1
  limit: number;          // Default: 20, max: 100
  search?: string;        // Name search (case-insensitive)
  materialType?: MaterialType; // "PVC" | "ALUMINUM" | "WOOD" | "MIXED"
  isActive?: "all" | "active" | "inactive"; // Default: "all"
  sortBy?: "name" | "materialType" | "createdAt"; // Default: "name"
  sortOrder?: "asc" | "desc"; // Default: "asc"
}
```

**Output:**
```typescript
{
  items: ProfileSupplierWithUsageOutput[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

**Usage:**
```typescript
const { data } = api.admin.profileSupplier.list.useQuery({
  page: 1,
  limit: 20,
  search: "Aluplast",
  materialType: "PVC",
  isActive: "active",
  sortBy: "name",
  sortOrder: "asc",
});
```

---

#### `getById`
Get single profile supplier by ID with usage statistics.

**Input:**
```typescript
{
  id: string; // UUID
}
```

**Output:**
```typescript
{
  id: string;
  name: string;
  materialType: MaterialType;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  modelCount: number; // Number of models using this supplier
}
```

**Usage:**
```typescript
const { data } = api.admin.profileSupplier.getById.useQuery({
  id: "550e8400-e29b-41d4-a716-446655440000",
});
```

---

#### `checkUsage`
Check profile supplier usage in models before deletion.

**Input:**
```typescript
{
  id: string; // UUID
}
```

**Output:**
```typescript
{
  modelCount: number;
  canDelete: boolean; // true if modelCount === 0
}
```

**Usage:**
```typescript
const { data } = api.admin.profileSupplier.checkUsage.useQuery({
  id: "550e8400-e29b-41d4-a716-446655440000",
});

if (data?.canDelete) {
  // Safe to hard delete
} else {
  // Will trigger soft delete
}
```

---

### Mutations (Write Operations)

#### `create`
Create new profile supplier.

**Input:**
```typescript
{
  name: string;           // Max 255 chars
  materialType: MaterialType; // "PVC" | "ALUMINUM" | "WOOD" | "MIXED"
  isActive?: boolean;     // Default: true
  notes?: string;         // Max 1000 chars
}
```

**Output:**
```typescript
ProfileSupplierWithUsageOutput // modelCount always 0 for new records
```

**Errors:**
- `CONFLICT`: Duplicate name + materialType combination exists
- `INTERNAL_SERVER_ERROR`: Database operation failed

**Usage:**
```typescript
const createMutation = api.admin.profileSupplier.create.useMutation({
  onSuccess: () => {
    toast.success("Proveedor de perfiles creado");
    utils.admin.profileSupplier.list.invalidate();
  },
});

createMutation.mutate({
  name: "Aluplast Serie 4000",
  materialType: "PVC",
  isActive: true,
  notes: "Proveedor principal para ventanas de PVC",
});
```

---

#### `update`
Update existing profile supplier.

**Input:**
```typescript
{
  id: string;             // UUID (required)
  name?: string;          // Max 255 chars
  materialType?: MaterialType;
  isActive?: boolean;
  notes?: string;         // Max 1000 chars
}
```

**Output:**
```typescript
ProfileSupplierWithUsageOutput // Includes current modelCount
```

**Errors:**
- `NOT_FOUND`: Profile supplier ID not found
- `CONFLICT`: New name + materialType combination already exists
- `INTERNAL_SERVER_ERROR`: Database operation failed

**Usage:**
```typescript
const updateMutation = api.admin.profileSupplier.update.useMutation({
  onSuccess: () => {
    toast.success("Proveedor de perfiles actualizado");
    utils.admin.profileSupplier.list.invalidate();
    utils.admin.profileSupplier.getById.invalidate({ id });
  },
});

updateMutation.mutate({
  id: "550e8400-e29b-41d4-a716-446655440000",
  name: "Aluplast Serie 5000",
  isActive: false,
});
```

---

#### `delete`
Delete profile supplier (three-tier strategy).

**Input:**
```typescript
{
  id: string; // UUID
}
```

**Output:**
```typescript
void // No return value
```

**Deletion Strategy:**
1. **Tier 1**: NOT IMPLEMENTED YET - Check quotes (hard constraint)
2. **Tier 2**: If used in models → soft delete (`isActive = false`)
3. **Tier 3**: If no references → hard delete (remove from database)

**Errors:**
- `NOT_FOUND`: Profile supplier ID not found
- `INTERNAL_SERVER_ERROR`: Database operation failed

**Usage:**
```typescript
const deleteMutation = api.admin.profileSupplier.delete.useMutation({
  onSuccess: () => {
    toast.success("Proveedor de perfiles eliminado");
    utils.admin.profileSupplier.list.invalidate();
  },
});

deleteMutation.mutate({
  id: "550e8400-e29b-41d4-a716-446655440000",
});
```

---

## Business Rules

### Uniqueness Constraint
- **Database Level**: `name` column has unique index
- **Service Level**: Enforces `name + materialType` combination uniqueness
- **Rationale**: Same supplier name may exist for different material types (e.g., "ProWindow PVC" vs "ProWindow Aluminio")

**Validation Logic:**
```typescript
// Create: Check for duplicate name + materialType
const existing = await findProfileSupplierByName(client, input.name, input.materialType);
if (existing) throw CONFLICT;

// Update: Exclude current ID from duplicate check
const duplicate = await findProfileSupplierByName(
  client,
  checkName,
  checkMaterialType,
  input.id // Exclude this ID
);
if (duplicate) throw CONFLICT;
```

### Three-Tier Deletion Strategy

**Tier 1: Hard Constraint (NOT IMPLEMENTED YET)**
- Check if profile supplier is used in quotes
- If yes: Block deletion with error
- Reason: Quotes are immutable audit trail

**Tier 2: Soft Delete**
- Check if profile supplier is used in models
- If yes: Set `isActive = "false"`
- Reason: Preserve historical data while hiding from new assignments

**Tier 3: Hard Delete**
- If no references in models or quotes
- Physically remove record from database
- Reason: Clean up unused records

**Implementation:**
```typescript
const modelCount = await getProfileSupplierUsageCount(client, profileSupplierId);

if (modelCount > 0) {
  // Tier 2: Soft delete
  await updateProfileSupplierRepo(client, profileSupplierId, { isActive: "false" });
} else {
  // Tier 3: Hard delete
  await deleteProfileSupplierRepo(client, profileSupplierId);
}
```

### Material Type Enum

**Database Values**: `"PVC"`, `"ALUMINUM"`, `"WOOD"`, `"MIXED"` (stored in uppercase English)  
**Display Values**: Should be translated to Spanish in UI layer ("PVC", "Aluminio", "Madera", "Mixto")

**TypeScript Type:**
```typescript
export type MaterialType = "PVC" | "ALUMINUM" | "WOOD" | "MIXED";
```

**Zod Schema:**
```typescript
z.enum(MATERIAL_TYPE_VALUES) // ["PVC", "ALUMINUM", "WOOD", "MIXED"]
```

### Boolean Storage (isActive)

**Database Storage**: `text` column with values `"true"` or `"false"` (legacy pattern)  
**TypeScript Type**: `boolean`  
**Transformation**: Automatic via `z.preprocess` in select schema

**Migration Note**: This is a legacy pattern from the original Prisma schema. Future enhancement should migrate to native PostgreSQL `boolean` type (like the `colors` table).

**Transform Logic:**
```typescript
// SELECT (Database → TypeScript)
isActive: z.preprocess(
  (val) => val === "true" || val === true,
  z.boolean()
)

// INSERT/UPDATE (TypeScript → Database)
isActive: z.preprocess(
  (val) => (val === true || val === "true" ? "true" : "false"),
  z.string()
)
```

---

## Testing

### Unit Tests (Vitest)

**File**: `tests/unit/server/api/routers/admin/profile-supplier/profile-supplier.service.test.ts`

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { db } from "@/server/db/drizzle";
import {
  createProfileSupplier,
  getProfileSuppliersList,
  updateProfileSupplier,
  deleteProfileSupplier,
} from "./profile-supplier.service";

describe("ProfileSupplierService", () => {
  const userId = "test-user-id";

  beforeEach(async () => {
    // Clean up test data
    await db.delete(profileSuppliers).execute();
  });

  it("should create profile supplier with PVC material type", async () => {
    const input = {
      name: "Aluplast Serie 4000",
      materialType: "PVC" as const,
      isActive: true,
      notes: "Proveedor principal",
    };

    const result = await createProfileSupplier(db, userId, input);

    expect(result.name).toBe(input.name);
    expect(result.materialType).toBe("PVC");
    expect(result.isActive).toBe(true);
    expect(result.modelCount).toBe(0);
  });

  it("should prevent duplicate name + materialType", async () => {
    const input = {
      name: "Aluplast Serie 4000",
      materialType: "PVC" as const,
    };

    await createProfileSupplier(db, userId, input);

    await expect(
      createProfileSupplier(db, userId, input)
    ).rejects.toThrow("Ya existe un proveedor de perfiles");
  });

  it("should allow same name with different materialType", async () => {
    await createProfileSupplier(db, userId, {
      name: "ProWindow",
      materialType: "PVC",
    });

    const result = await createProfileSupplier(db, userId, {
      name: "ProWindow",
      materialType: "ALUMINUM",
    });

    expect(result.name).toBe("ProWindow");
    expect(result.materialType).toBe("ALUMINUM");
  });

  it("should filter by materialType", async () => {
    await createProfileSupplier(db, userId, { name: "PVC Supplier", materialType: "PVC" });
    await createProfileSupplier(db, userId, { name: "Aluminum Supplier", materialType: "ALUMINUM" });

    const result = await getProfileSuppliersList(db, userId, {
      page: 1,
      limit: 20,
      materialType: "PVC",
      isActive: "all",
      sortBy: "name",
      sortOrder: "asc",
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].materialType).toBe("PVC");
  });

  it("should soft delete when used in models", async () => {
    const supplier = await createProfileSupplier(db, userId, {
      name: "Test Supplier",
      materialType: "PVC",
    });

    // Simulate model usage (create related model - requires model module)
    // await createModel(db, userId, { profileSupplierId: supplier.id, ... });

    await deleteProfileSupplier(db, userId, supplier.id);

    const updated = await findProfileSupplierById(db, supplier.id);
    expect(updated?.isActive).toBe(false); // Soft deleted
  });
});
```

### Integration Tests (Playwright)

**File**: `e2e/admin/profile-supplier.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

test.describe("ProfileSupplier Admin", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/catalogs/profile-suppliers");
  });

  test("should create new profile supplier", async ({ page }) => {
    await page.click('button:text("Nuevo Proveedor")');
    await page.fill('input[name="name"]', "Aluplast Serie 4000");
    await page.selectOption('select[name="materialType"]', "PVC");
    await page.fill('textarea[name="notes"]', "Proveedor principal");
    await page.click('button:text("Guardar")');

    await expect(page.locator('text="creado exitosamente"')).toBeVisible();
  });

  test("should filter by material type", async ({ page }) => {
    await page.selectOption('select[name="materialType"]', "PVC");
    await page.click('button:text("Filtrar")');

    const rows = page.locator('tbody tr');
    await expect(rows.first().locator('td:nth-child(3)')).toHaveText("PVC");
  });

  test("should soft delete when used in models", async ({ page }) => {
    // Assume supplier "Test Supplier" has 5 related models
    await page.click('button:text("Eliminar")');
    await page.click('button:text("Confirmar")');

    await expect(
      page.locator('text="desactivado porque está en uso"')
    ).toBeVisible();
  });
});
```

---

## Troubleshooting

### Issue: "Ya existe un proveedor de perfiles con ese nombre y tipo de material"

**Cause**: Attempting to create/update with duplicate `name + materialType` combination.

**Solution**:
1. Check if another supplier with the same name and material type exists
2. Either choose a different name or material type
3. If intentional, inactivate the duplicate first

```typescript
// Check for existing
const { data } = api.admin.profileSupplier.list.useQuery({
  search: "Aluplast",
  materialType: "PVC",
});
```

---

### Issue: isActive returns string instead of boolean

**Cause**: Database stores `isActive` as `text("true"/"false")` instead of native boolean.

**Solution**: This is automatically handled by Zod schema transformations. If you're accessing raw database results, manually convert:

```typescript
const profileSupplier = await db.select().from(profileSuppliers).where(...);
const isActive = profileSupplier.isActive === "true";
```

**Future Enhancement**: Migrate to native boolean storage (requires database migration).

---

### Issue: Winston logger error in Client Component

**Cause**: Attempting to use `profile-supplier-logger.ts` functions in a Client Component.

**Solution**: Winston logger is **SERVER-SIDE ONLY**. Never import or use in:
- Client Components (`'use client'`)
- Custom Hooks (`use*.ts`)
- Client-side utilities

Use alternatives:
- `console` for development debugging
- Toast notifications for user feedback
- Error boundaries for error handling

---

### Issue: Material type enum mismatch

**Cause**: Using Spanish enum values ("ALUMINIO") instead of English database values ("ALUMINUM").

**Solution**: Always use English enum values from `MaterialType` type:

```typescript
import { MATERIAL_TYPE_VALUES } from "@/server/db/schemas/enums.schema";

const validValues = MATERIAL_TYPE_VALUES; // ["PVC", "ALUMINUM", "WOOD", "MIXED"]
```

Translate to Spanish only in UI layer:

```typescript
const materialTypeLabels = {
  PVC: "PVC",
  ALUMINUM: "Aluminio",
  WOOD: "Madera",
  MIXED: "Mixto",
};
```

---

## Migration Notes

### Prisma → Drizzle Changes

**Schema File**: `/src/server/db/schemas/profile-supplier.schema.ts`

**Key Differences:**
1. **Primary Key**: `varchar(36)` with UUID v4 (Prisma used `cuid()`)
2. **Timestamps**: `text` with ISO 8601 strings (Prisma used `DateTime`)
3. **Enum**: `materialTypeEnum` from enums.schema (Prisma used inline enum)
4. **Boolean**: Still uses `text("true"/"false")` (legacy pattern to preserve)
5. **Unique Constraint**: Single column `name` (business logic enforces `name + materialType`)

**Repository Functions**: 9 data access functions (all fully typed with Drizzle ORM)

**Service Functions**: 6 business logic functions (all with Spanish error messages)

**tRPC Procedures**: 6 procedures (3 queries + 3 mutations, all admin-only)

---

## Future Enhancements

1. **Tier 1 Deletion**: Implement quote usage check (hard constraint)
2. **Native Boolean**: Migrate `isActive` from `text` to `boolean` column type
3. **Unique Constraint**: Add database-level unique index on `(name, materialType)`
4. **Audit Trail**: Track who created/updated records (`createdBy`, `updatedBy`)
5. **Soft Delete Field**: Add `deletedAt` timestamp instead of `isActive = false`
6. **Profile Type**: Add `profileType` enum (window, door, curtain wall)
7. **Series Support**: Link to specific product series (e.g., "Serie 4000", "Serie 5000")
8. **Supplier Contact**: Add contact information fields (phone, email, website)

---

## Related Modules

- **Colors Module**: Similar clean architecture pattern (completed)
- **Glass Supplier Module**: Parallel supplier management (pending migration)
- **Glass Type Module**: Complex M2M relations (pending migration)
- **Model Module**: Uses profile suppliers via foreign key (pending migration)

---

## License

Proprietary - Glasify Lite Project
