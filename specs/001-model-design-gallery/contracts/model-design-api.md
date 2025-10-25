# API Contracts: Model Design Router

**Feature**: 001-model-design-gallery  
**Date**: 2025-01-25  
**Router**: `admin.model-design`

---

## Overview

tRPC router para gestión de diseños de modelos (ModelDesign). Admin-only endpoints para:
- Listar diseños disponibles (con filtros)
- Obtener diseño por ID
- Crear nuevo diseño (future)
- Actualizar diseño existente (future)
- Activar/desactivar diseño

---

## Endpoints

### `list`

Lista diseños disponibles con filtros y paginación.

**Access**: Admin only (`adminProcedure`)

**Input**:
```typescript
{
  // Filtros
  type?: ModelType;           // Filtrar por tipo de modelo
  isActive?: boolean | 'all'; // 'all' | true | false
  search?: string;            // Búsqueda por nombre o descripción
  
  // Paginación
  page?: number;              // Default: 1
  limit?: number;             // Default: 20, Max: 100
  
  // Ordenamiento
  sortBy?: 'name' | 'nameEs' | 'createdAt' | 'displayOrder';
  sortOrder?: 'asc' | 'desc'; // Default: 'asc'
}
```

**Output**:
```typescript
{
  items: Array<{
    id: string;
    name: string;
    nameEs: string;
    description: string | null;
    type: ModelType;
    thumbnailUrl: string | null;
    isActive: boolean;
    displayOrder: number;
    createdAt: Date;
    updatedAt: Date;
    
    // Stats
    _count: {
      models: number; // Cuántos modelos usan este diseño
    };
  }>;
  
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

**Example**:
```typescript
const designs = await trpc.admin['model-design'].list.query({
  type: 'fixed_window',
  isActive: true,
  page: 1,
  limit: 20,
  sortBy: 'displayOrder',
  sortOrder: 'asc',
});
```

---

### `get-by-id`

Obtiene un diseño completo por ID, incluyendo config JSON full.

**Access**: Admin only (`adminProcedure`)

**Input**:
```typescript
{
  id: string; // ModelDesign ID
}
```

**Output**:
```typescript
{
  id: string;
  name: string;
  nameEs: string;
  description: string | null;
  type: ModelType;
  config: StoredDesignConfig; // Full JSON structure
  thumbnailUrl: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Related models
  models: Array<{
    id: string;
    name: string;
    type: ModelType | null;
  }>;
} | null
```

**Example**:
```typescript
const design = await trpc.admin['model-design']['get-by-id'].query({
  id: 'clx123...',
});
```

**Errors**:
- Returns `null` if design not found (no throw)

---

### `get-by-ids`

Obtiene múltiples diseños por IDs (para batch fetching en formularios).

**Access**: Admin only (`adminProcedure`)

**Input**:
```typescript
{
  ids: string[]; // Array of ModelDesign IDs (max 50)
}
```

**Output**:
```typescript
Array<{
  id: string;
  name: string;
  nameEs: string;
  description: string | null;
  type: ModelType;
  config: StoredDesignConfig;
  thumbnailUrl: string | null;
  isActive: boolean;
}>
```

**Example**:
```typescript
const designs = await trpc.admin['model-design']['get-by-ids'].query({
  ids: ['clx123...', 'clx456...'],
});
```

---

### `toggle-active`

Activa o desactiva un diseño (soft delete protection).

**Access**: Admin only (`adminProcedure`)

**Input**:
```typescript
{
  id: string;
  isActive: boolean;
}
```

**Output**:
```typescript
{
  id: string;
  name: string;
  isActive: boolean;
  modelsAffected: number; // Cuántos modelos usan este diseño
}
```

**Business Rules**:
- Si `isActive = false` y diseño tiene modelos asociados → warning en respuesta pero permite operación
- Modelos mantienen `designId` incluso si diseño se desactiva

**Example**:
```typescript
const result = await trpc.admin['model-design']['toggle-active'].mutate({
  id: 'clx123...',
  isActive: false,
});

if (result.modelsAffected > 0) {
  toast.warning(`${result.modelsAffected} modelos aún usan este diseño`);
}
```

---

## Extension to Existing `admin.model` Router

### Modified: `list`

Extender respuesta para incluir diseño asociado.

**Output Change** (agregado):
```typescript
{
  items: Array<{
    // ... campos existentes
    
    // NEW: Design information
    design: {
      id: string;
      name: string;
      nameEs: string;
      type: ModelType;
    } | null;
  }>;
}
```

---

### Modified: `get-by-id`

Extender respuesta para incluir diseño completo.

**Output Change** (agregado):
```typescript
{
  // ... campos existentes
  
  // NEW: Full design data
  design: {
    id: string;
    name: string;
    nameEs: string;
    description: string | null;
    type: ModelType;
    config: StoredDesignConfig;
    thumbnailUrl: string | null;
  } | null;
}
```

---

### Modified: `create` & `update`

Extender input para aceptar tipo y diseño.

**Input Change** (agregado):
```typescript
{
  // ... campos existentes
  
  // NEW: Optional type and design
  type?: ModelType;
  designId?: string | null;
}
```

**Validation Rules**:
1. Si `designId` es proporcionado:
   - `type` DEBE estar definido (no puede ser null)
   - Design con `designId` DEBE existir y estar activo
   - Design `type` DEBE coincidir con Model `type`
   
2. Si `type` cambia y `designId` está set:
   - Validar compatibilidad
   - Si NO compatible → resetear `designId` a null automáticamente

**Error Responses**:
```typescript
// Design not found
throw new TRPCError({
  code: 'NOT_FOUND',
  message: 'Diseño no encontrado',
});

// Type required for design
throw new TRPCError({
  code: 'BAD_REQUEST',
  message: 'Debes definir el tipo de modelo antes de asignar un diseño',
});

// Incompatible type
throw new TRPCError({
  code: 'BAD_REQUEST',
  message: `El diseño "${design.nameEs}" es para ${design.type}, pero el modelo es ${model.type}`,
});
```

---

## Public Catalog Endpoint

### `catalog.list` (Modified)

Extender endpoint público de catálogo para incluir diseño serializado.

**Output Change**:
```typescript
{
  items: Array<{
    // ... campos existentes
    
    // NEW: Serialized design for rendering
    design: {
      id: string;
      type: ModelType;
      config: StoredDesignConfig;
    } | null;
    
    // Material for color mapping
    profileSupplier: {
      materialType: MaterialType;
    } | null;
  }>;
}
```

**Performance Consideration**:
- Design `config` JSON puede ser grande (hasta 50KB)
- Considerar pagination y caching (30s ISR)
- Lazy loading de diseños en cliente (solo renderizar visibles)

---

## Zod Validation Schemas

```typescript
// src/server/api/routers/admin/model-design.ts

import { z } from 'zod';
import { ModelType } from '@prisma/client';
import { storedDesignConfigSchema } from '@/lib/design/validation';

// List input
export const listDesignsInput = z.object({
  type: z.nativeEnum(ModelType).optional(),
  isActive: z.union([z.boolean(), z.literal('all')]).optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.enum(['name', 'nameEs', 'createdAt', 'displayOrder']).default('displayOrder'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Get by ID input
export const getDesignByIdInput = z.object({
  id: z.string().cuid(),
});

// Get by IDs input
export const getDesignsByIdsInput = z.object({
  ids: z.array(z.string().cuid()).max(50),
});

// Toggle active input
export const toggleDesignActiveInput = z.object({
  id: z.string().cuid(),
  isActive: z.boolean(),
});

// Extended model create/update input
export const modelWithDesignInput = z.object({
  // ... existing model fields
  
  type: z.nativeEnum(ModelType).optional(),
  designId: z.string().cuid().nullable().optional(),
}).refine(
  (data) => {
    // If designId is set, type must be defined
    if (data.designId && !data.type) {
      return false;
    }
    return true;
  },
  {
    message: 'Model type is required when assigning a design',
    path: ['type'],
  }
);
```

---

## Security & Authorization

All endpoints require:
- ✅ Authenticated user (`ctx.session.user`)
- ✅ Admin role (`ctx.session.user.role === 'admin'`)
- ✅ Used via `adminProcedure` (enforces both)

Public catalog endpoint (`catalog.list`):
- ✅ No authentication required
- ✅ Only returns published models (`status: 'published'`)
- ✅ Only returns active designs (`isActive: true`)

---

## Error Handling

### Standard Error Codes

| Code                    | When                    | Message (Spanish)                       |
| ----------------------- | ----------------------- | --------------------------------------- |
| `UNAUTHORIZED`          | No session              | "Debes iniciar sesión"                  |
| `FORBIDDEN`             | Not admin               | "Acceso denegado. Solo administradores" |
| `NOT_FOUND`             | Design not found        | "Diseño no encontrado"                  |
| `BAD_REQUEST`           | Validation fail         | Specific validation message             |
| `CONFLICT`              | Business rule violation | Specific conflict message               |
| `INTERNAL_SERVER_ERROR` | Unexpected error        | "Error interno del servidor"            |

### Validation Error Examples

```typescript
// Missing type when assigning design
{
  code: 'BAD_REQUEST',
  message: 'Debes definir el tipo de modelo antes de asignar un diseño',
  path: ['type'],
}

// Incompatible design type
{
  code: 'BAD_REQUEST',
  message: 'El diseño "Ventana Fija Simple" es para fixed_window, pero el modelo es sliding_door',
  path: ['designId'],
}

// Invalid design config JSON
{
  code: 'BAD_REQUEST',
  message: 'Configuración de diseño inválida: shapes array must have at least 1 item',
  path: ['config', 'shapes'],
}
```

---

## Caching Strategy

### Server-Side (tRPC)
- `list` query: No cache (siempre fresh para admin)
- `get-by-id`: No cache (config puede cambiar)

### Client-Side (TanStack Query)
- `list`: `staleTime: 30s` (admin puede ver cambios recientes)
- `get-by-id`: `staleTime: 5min` (config raramente cambia)

### Page-Level (Next.js ISR)
- Catalog page: `revalidate: 30` (semi-static)
- Admin pages: `dynamic: 'force-dynamic'` (always fresh)

---

## Next Steps

1. ✅ API contracts defined
2. → Create quickstart guide
3. → Update agent context
4. → Implement tRPC routers
