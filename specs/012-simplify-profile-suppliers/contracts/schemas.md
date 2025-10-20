# Validation Schemas: Profile Suppliers

**Feature**: 012-simplify-profile-suppliers  
**Phase**: 1 (Design & Contracts)  
**Date**: 2025-01-20

## Overview

Validation schemas are defined using Zod 4.1.1 and located at `/src/lib/validations/admin/profile-supplier.schema.ts`. These schemas are used for:

1. **tRPC input validation** (server-side)
2. **React Hook Form validation** (client-side via @hookform/resolvers/zod)

**Note**: This file already exists and requires NO changes for the refactoring.

---

## Constants

```typescript
export const MIN_NAME_LENGTH = 3;
export const MAX_NAME_LENGTH = 100;
export const MAX_NOTES_LENGTH = 500;
```

**Usage**:
- Consistent validation across client and server
- Used in error messages
- Used for UI character counters

---

## Create Schema

### createProfileSupplierSchema

**Purpose**: Validate input when creating a new profile supplier

```typescript
import { z } from 'zod';

export const createProfileSupplierSchema = z.object({
  name: z
    .string({
      required_error: 'El nombre es requerido',
      invalid_type_error: 'El nombre debe ser un texto',
    })
    .min(MIN_NAME_LENGTH, {
      message: `El nombre debe tener al menos ${MIN_NAME_LENGTH} caracteres`,
    })
    .max(MAX_NAME_LENGTH, {
      message: `El nombre no puede exceder ${MAX_NAME_LENGTH} caracteres`,
    })
    .trim(),
  
  materialType: z.enum(['PVC', 'ALUMINUM', 'WOOD', 'MIXED'], {
    required_error: 'El tipo de material es requerido',
    invalid_type_error: 'Tipo de material inválido',
  }),
  
  notes: z
    .string()
    .max(MAX_NOTES_LENGTH, {
      message: `Las notas no pueden exceder ${MAX_NOTES_LENGTH} caracteres`,
    })
    .optional(),
  
  isActive: z.boolean().default(true),
});

export type CreateProfileSupplierInput = z.infer<typeof createProfileSupplierSchema>;
```

**Field Validation**:

| Field | Required | Min | Max | Transform | Default |
|-------|----------|-----|-----|-----------|---------|
| name | ✅ Yes | 3 | 100 | trim() | - |
| materialType | ✅ Yes | - | - | - | - |
| notes | ❌ No | - | 500 | - | undefined |
| isActive | ❌ No | - | - | - | true |

**Error Messages** (Spanish):
- `name` required: "El nombre es requerido"
- `name` too short: "El nombre debe tener al menos 3 caracteres"
- `name` too long: "El nombre no puede exceder 100 caracteres"
- `materialType` required: "El tipo de material es requerido"
- `materialType` invalid: "Tipo de material inválido"
- `notes` too long: "Las notas no pueden exceder 500 caracteres"

**Usage in tRPC**:
```typescript
create: adminProcedure
  .input(createProfileSupplierSchema)
  .mutation(async ({ ctx, input }) => {
    // input is validated here
  });
```

**Usage in React Hook Form**:
```typescript
const form = useForm<FormValues>({
  resolver: zodResolver(createProfileSupplierSchema),
  defaultValues: {
    name: '',
    materialType: 'PVC',
    notes: '',
    isActive: true,
  },
});
```

---

## Update Schema

### updateProfileSupplierSchema

**Purpose**: Validate input when updating an existing profile supplier

```typescript
export const updateProfileSupplierSchema = z.object({
  id: z.string().cuid({
    message: 'ID de proveedor inválido',
  }),
  
  name: z
    .string({
      required_error: 'El nombre es requerido',
      invalid_type_error: 'El nombre debe ser un texto',
    })
    .min(MIN_NAME_LENGTH, {
      message: `El nombre debe tener al menos ${MIN_NAME_LENGTH} caracteres`,
    })
    .max(MAX_NAME_LENGTH, {
      message: `El nombre no puede exceder ${MAX_NAME_LENGTH} caracteres`,
    })
    .trim(),
  
  materialType: z.enum(['PVC', 'ALUMINUM', 'WOOD', 'MIXED'], {
    required_error: 'El tipo de material es requerido',
    invalid_type_error: 'Tipo de material inválido',
  }),
  
  notes: z
    .string()
    .max(MAX_NOTES_LENGTH, {
      message: `Las notas no pueden exceder ${MAX_NOTES_LENGTH} caracteres`,
    })
    .optional(),
  
  isActive: z.boolean({
    required_error: 'El estado es requerido',
    invalid_type_error: 'El estado debe ser verdadero o falso',
  }),
});

export type UpdateProfileSupplierInput = z.infer<typeof updateProfileSupplierSchema>;
```

**Key Differences from Create Schema**:
- **id**: Required (CUID validation)
- **isActive**: Required (no default, explicit choice)

**Field Validation**:

| Field | Required | Min | Max | Transform | Default |
|-------|----------|-----|-----|-----------|---------|
| id | ✅ Yes | - | - | - | - |
| name | ✅ Yes | 3 | 100 | trim() | - |
| materialType | ✅ Yes | - | - | - | - |
| notes | ❌ No | - | 500 | - | undefined |
| isActive | ✅ Yes | - | - | - | - |

**Usage in tRPC**:
```typescript
update: adminProcedure
  .input(updateProfileSupplierSchema)
  .mutation(async ({ ctx, input }) => {
    // input.id is validated here
  });
```

**Usage in React Hook Form**:
```typescript
const form = useForm<FormValues>({
  resolver: zodResolver(updateProfileSupplierSchema),
  defaultValues: {
    id: defaultValues?.id,
    name: defaultValues?.name ?? '',
    materialType: defaultValues?.materialType ?? 'PVC',
    notes: defaultValues?.notes ?? '',
    isActive: defaultValues?.isActive ?? true,
  },
});
```

---

## List Schema

### listProfileSuppliersSchema

**Purpose**: Validate query parameters for list endpoint

```typescript
export const listProfileSuppliersSchema = z.object({
  page: z.number().int().positive().default(1),
  
  search: z.string().optional(),
  
  materialType: z.enum(['PVC', 'ALUMINUM', 'WOOD', 'MIXED']).optional(),
  
  isActive: z.boolean().optional(),
});

export type ListProfileSuppliersInput = z.infer<typeof listProfileSuppliersSchema>;
```

**Field Validation**:

| Field | Required | Type | Validation | Default |
|-------|----------|------|------------|---------|
| page | ❌ No | number | Positive integer | 1 |
| search | ❌ No | string | Any | undefined |
| materialType | ❌ No | enum | One of 4 values | undefined |
| isActive | ❌ No | boolean | - | undefined |

**Usage in tRPC**:
```typescript
list: adminProcedure
  .input(listProfileSuppliersSchema)
  .query(async ({ ctx, input }) => {
    // input.page defaults to 1 if not provided
  });
```

---

## Delete Schema

### deleteProfileSupplierSchema

**Purpose**: Validate input when deleting a profile supplier

```typescript
export const deleteProfileSupplierSchema = z.object({
  id: z.string().cuid({
    message: 'ID de proveedor inválido',
  }),
});

export type DeleteProfileSupplierInput = z.infer<typeof deleteProfileSupplierSchema>;
```

**Field Validation**:

| Field | Required | Type | Validation |
|-------|----------|------|------------|
| id | ✅ Yes | string | CUID format |

**Usage in tRPC**:
```typescript
delete: adminProcedure
  .input(deleteProfileSupplierSchema)
  .mutation(async ({ ctx, input }) => {
    // input.id is validated as CUID
  });
```

---

## Get By ID Schema

### getByIdSchema

**Purpose**: Validate input when fetching a single supplier

```typescript
export const getByIdSchema = z.object({
  id: z.string().cuid({
    message: 'ID de proveedor inválido',
  }),
});

export type GetByIdInput = z.infer<typeof getByIdSchema>;
```

**Field Validation**:

| Field | Required | Type | Validation |
|-------|----------|------|------------|
| id | ✅ Yes | string | CUID format |

**Usage in tRPC**:
```typescript
getById: adminProcedure
  .input(getByIdSchema)
  .query(async ({ ctx, input }) => {
    // input.id is validated as CUID
  });
```

---

## Material Type Options

### Helper Constant

```typescript
export const MATERIAL_TYPE_OPTIONS: { label: string; value: MaterialType }[] = [
  { label: 'PVC', value: 'PVC' },
  { label: 'Aluminio', value: 'ALUMINUM' },
  { label: 'Madera', value: 'WOOD' },
  { label: 'Mixto', value: 'MIXED' },
];
```

**Usage in UI**:
```typescript
// In dialog component
<Select>
  {MATERIAL_TYPE_OPTIONS.map((option) => (
    <SelectItem key={option.value} value={option.value}>
      {option.label}
    </SelectItem>
  ))}
</Select>
```

**Purpose**:
- Consistent labels across all forms
- Spanish UI text (label) with English enum values (value)
- Reusable in Select, Radio, or other input components

---

## Client-Side Validation (React Hook Form)

### Error Display Pattern

```typescript
<FormField
  control={form.control}
  name="name"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Nombre</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormDescription>
        Nombre del proveedor ({MIN_NAME_LENGTH}-{MAX_NAME_LENGTH} caracteres)
      </FormDescription>
      <FormMessage />  {/* Zod error message displayed here */}
    </FormItem>
  )}
/>
```

**Error Message Flow**:
1. User submits form
2. React Hook Form validates with Zod resolver
3. Zod returns Spanish error message
4. `<FormMessage />` displays error below input
5. Input shows red border (via Tailwind error classes)

### Real-Time Validation

```typescript
const form = useForm({
  resolver: zodResolver(createProfileSupplierSchema),
  mode: 'onChange', // Validate on every change
});
```

**Validation Modes**:
- `onSubmit`: Validate only when submit button clicked (default)
- `onChange`: Validate on every keystroke (better UX for immediate feedback)
- `onBlur`: Validate when field loses focus (balance between UX and performance)

**Recommendation**: Use `onChange` for profile suppliers form (simple form, fast validation).

---

## Server-Side Validation (tRPC)

### Error Handling Pattern

```typescript
create: adminProcedure
  .input(createProfileSupplierSchema)
  .mutation(async ({ ctx, input }) => {
    try {
      // input is already validated by Zod
      return await ctx.db.profileSupplier.create({
        data: input,
      });
    } catch (error) {
      // Handle Prisma errors (e.g., unique constraint)
      if (error.code === 'P2002') {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Ya existe un proveedor con este nombre',
        });
      }
      throw error;
    }
  });
```

**Validation Order**:
1. Zod schema validation (automatic via `.input()`)
2. Business logic validation (in mutation handler)
3. Database constraint validation (Prisma)

---

## Testing Validation

### Unit Tests (Zod Schemas)

```typescript
// tests/unit/validations/profile-supplier.test.ts
import { describe, it, expect } from 'vitest';
import { createProfileSupplierSchema } from '@/lib/validations/admin/profile-supplier.schema';

describe('createProfileSupplierSchema', () => {
  it('accepts valid input', () => {
    const result = createProfileSupplierSchema.safeParse({
      name: 'Rehau',
      materialType: 'PVC',
      notes: 'Test notes',
      isActive: true,
    });
    expect(result.success).toBe(true);
  });

  it('rejects name shorter than 3 characters', () => {
    const result = createProfileSupplierSchema.safeParse({
      name: 'AB',
      materialType: 'PVC',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('El nombre debe tener al menos 3 caracteres');
    }
  });

  it('rejects invalid material type', () => {
    const result = createProfileSupplierSchema.safeParse({
      name: 'Rehau',
      materialType: 'STEEL', // Invalid
    });
    expect(result.success).toBe(false);
  });

  it('trims whitespace from name', () => {
    const result = createProfileSupplierSchema.parse({
      name: '  Rehau  ',
      materialType: 'PVC',
    });
    expect(result.name).toBe('Rehau');
  });

  it('defaults isActive to true', () => {
    const result = createProfileSupplierSchema.parse({
      name: 'Rehau',
      materialType: 'PVC',
    });
    expect(result.isActive).toBe(true);
  });
});
```

### Integration Tests (tRPC + Zod)

```typescript
// tests/integration/profile-supplier-validation.test.ts
describe('Profile Supplier Validation Integration', () => {
  it('rejects invalid input at tRPC layer', async () => {
    await expect(
      caller.admin['profile-supplier'].create({
        name: 'AB', // Too short
        materialType: 'PVC',
      })
    ).rejects.toThrow('El nombre debe tener al menos 3 caracteres');
  });
});
```

---

## Summary

**Total Schemas**: 5 (create, update, list, delete, getById)  
**Validation Library**: Zod 4.1.1  
**Error Messages**: Spanish (es-LA)  
**Client Integration**: React Hook Form + @hookform/resolvers/zod  
**Server Integration**: tRPC `.input()` validation  
**Existing Implementation**: YES (no changes needed)

All validation schemas already exist and are battle-tested. This refactoring reuses them without modifications.
