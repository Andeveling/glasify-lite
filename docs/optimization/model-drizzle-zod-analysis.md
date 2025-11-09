# Análisis: Optimización de Model Module con drizzle-zod

**Status**: ✅ **CHECKEADO**  
**Fecha**: 2025-11-08  
**Conclusión**: El módulo `model` YA ESTÁ optimizado con drizzle-zod

---

## 🎯 Resumen Ejecutivo

El módulo `model` **ya implementa correctamente drizzle-zod** en los esquemas base (`/src/server/db/schemas/`):

✅ **Bien hecho**:
- Usa `createSelectSchema`, `createInsertSchema`, `createUpdateSchema`
- Las tablas Drizzle (models, modelCostBreakdowns) generan esquemas automáticamente
- Los tipos se infieren con `z.infer<>`
- Evita duplicación manual

⚠️ **Oportunidades de mejora**:
- El módulo de API router (`/src/server/api/routers/admin/model/`) no aprovecha 100% el patrón
- Hay duplicación parcial en output schemas
- Podría simplificarse la composición de schemas

---

## 📊 Análisis Detallado

### 1️⃣ Esquemas Base (BD) - ✅ CORRECTO

**Ubicación**: `/src/server/db/schemas/model.schema.ts`

```typescript
// ✅ Auto-generados con drizzle-zod
export const modelSelectSchema = createSelectSchema(models, {
  // Conversiones de tipos (NUMERIC string → number)
  minWidthMm: z.number().int().positive(),
  maxWidthMm: z.number().int().positive(),
  basePrice: z.number().nonnegative(),
  costPerMmWidth: z.number().nonnegative(),
  costPerMmHeight: z.number().nonnegative(),
  // ...
});

export const modelInsertSchema = createInsertSchema(models, {
  // Override para validaciones de negocio
  name: z.string().max(FIELD_LENGTHS.MODEL.NAME).min(1),
  // ...
}).omit({ createdAt: true, updatedAt: true });

export const modelUpdateSchema = createUpdateSchema(models, {
  // ...
}).partial().omit({ id: true, createdAt: true, updatedAt: true });

// ✅ Tipos inferidos automáticamente
export type Model = typeof models.$inferSelect;
export type NewModel = typeof models.$inferInsert;
```

**Análisis**:
- ✅ Los esquemas base están bien generados
- ✅ Conversiones de tipos correctas (NUMERIC → number)
- ✅ Validaciones de negocio agregadas apropiadamente
- ✅ Zero duplicación en esquemas base

---

### 2️⃣ Esquemas en API Router - ⚠️ PARCIALMENTE OPTIMIZADO

**Ubicación**: `/src/server/api/routers/admin/model/model.schemas.ts`

#### ❌ Problema 1: Duplicación de Output Schemas

```typescript
// ACTUAL (líneas 119-150) - DUPLICA definiciones
export const modelOutput = z.object({
  id: z.string(),
  name: z.string(),
  imageUrl: z.string(),
  status: z.enum(["draft", "published"]),
  minWidthMm: z.string(),  // ⚠️ String en lugar de number
  maxWidthMm: z.string(),  // ⚠️ String en lugar de number
  basePrice: z.string(),   // ⚠️ String en lugar de number
  costPerMmWidth: z.string(), // ⚠️ String en lugar de number
  // ... 15+ campos más replicados
});

// MEJOR: Reutilizar esquema base
export const modelOutput = modelSelectSchema.extend({
  // Solo agregar/transformar campos de relaciones
  profileSupplier: z.object({
    id: z.string(),
    name: z.string(),
    materialType: z.string(),
  }).nullable(),
  // costBreakdowns, priceHistory, etc.
});
```

**Impacto**:
- 📊 Líneas innecesarias: ~30
- 🐛 Riesgo de desincronización: Alto
- 🔧 Mantenimiento: 2x trabajo

#### ❌ Problema 2: Input Schemas Manuales

```typescript
// ACTUAL (línea 59-70)
export const createModelInput = modelInsertSchema
  .pick({
    name: true,
    profileSupplierId: true,
    basePrice: true,
    // ... campos individuales
  })
  .extend({
    compatibleGlassTypeIds: z.array(z.string()).default([]),
    status: z.enum(["draft", "published"]).default("draft"),
  });

// El esquema base ya tiene estas validaciones
// Pero se redefinen aquí parcialmente
```

**Impacto**:
- 📊 Redefinición de validaciones: Yes
- 🐛 Desincronización: Posible si esquema base cambia

---

### 3️⃣ Repository - ✅ CORRECTO

**Ubicación**: `/src/server/api/routers/admin/model/repositories/model-repository.ts`

```typescript
// ✅ Correctamente devuelve tipos raw de Drizzle
export async function findModelById(client: DbClient, modelId: string) {
  return await client
    .select({
      id: models.id,
      name: models.name,
      basePrice: models.basePrice, // ✅ string (NUMERIC)
      costPerMmWidth: models.costPerMmWidth, // ✅ string (NUMERIC)
      // ...
    })
    .from(models)
    // ...
}

// ✅ Sin transformaciones (job del service)
```

---

### 4️⃣ Service - ✅ CORRECTO

```typescript
// ✅ Convierte NUMERIC string → number para API
function buildModelUpdateData(data: {
  basePrice?: number;
  costPerMmWidth?: number;
  // ...
}) {
  if (data.basePrice !== undefined) {
    updateData.basePrice = data.basePrice.toString(); // number → string
  }
  // ...
}

// ✅ Serialización correcta
return {
  ...item,
  basePrice: Number.parseFloat(item.basePrice), // string → number
  // ...
};
```

---

## 🔧 Oportunidades de Mejora

### Mejora 1: Reutilizar Esquemas Base en Output

**Antes**:
```typescript
// 30+ líneas duplicando definiciones
export const modelOutput = z.object({
  id: z.string(),
  name: z.string(),
  basePrice: z.string(),
  // ... todo replicado del esquema base
});
```

**Después**:
```typescript
// Importar esquema base
import { modelSelectSchema } from "@/server/db/schemas/model.schema";

// Extender solo con relaciones
export const modelOutput = modelSelectSchema.extend({
  profileSupplier: z.object({
    id: z.string(),
    name: z.string(),
    materialType: z.string(),
  }).nullable(),
});

export type ModelOutput = z.infer<typeof modelOutput>;
```

**Beneficio**:
- 📉 30 líneas → 10 líneas (-67%)
- 🔄 Auto-sincronización con tabla
- ✅ Single source of truth

---

### Mejora 2: Simplificar Input Schemas

**Antes**:
```typescript
export const createModelInput = modelInsertSchema
  .pick({ name: true, basePrice: true, /* ... */ })
  .extend({
    compatibleGlassTypeIds: z.array(z.string()).default([]),
    status: z.enum(["draft", "published"]).default("draft"),
  });
```

**Después**:
```typescript
// El schema base ya tiene las validaciones correctas
export const createModelInput = modelInsertSchema
  .pick({
    name: true,
    profileSupplierId: true,
    basePrice: true,
    costPerMmWidth: true,
    costPerMmHeight: true,
    compatibleGlassTypeIds: true,
    status: true,
  });

// Validaciones de negocio ya están en schema base
export type CreateModelInput = z.infer<typeof createModelInput>;
```

**Beneficio**:
- 📉 Líneas de código reducidas
- 🔄 Validaciones centralizadas en BD schemas
- ✅ Single source of truth

---

### Mejora 3: Consolidar Output Types

**Antes** (actual):
```typescript
// Múltiples schemas sin relación clara
export const modelOutput = z.object({ /* ... */ });
export const modelDetailOutput = z.object({ /* ... */ }); // ¿Diferencia?)
export const listModelsOutput = z.object({ /* ... */ });
```

**Después**:
```typescript
// Composición clara y reutilizable
export const modelWithRelations = modelSelectSchema.extend({
  profileSupplier: z.object({ /* ... */ }).nullable(),
  costBreakdowns: z.array(costBreakdownOutput),
  priceHistory: z.array(priceHistoryOutput),
});

export const modelListOutput = z.object({
  items: z.array(
    modelSelectSchema.extend({
      profileSupplierName: z.string().nullable(),
    })
  ),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
});

export type ModelWithRelations = z.infer<typeof modelWithRelations>;
export type ModelListOutput = z.infer<typeof modelListOutput>;
```

**Beneficio**:
- 📊 Consistencia en composición
- 🔄 Reutilización de tipos
- ✅ Más legible

---

## 📋 Checklist de Optimización

### Fase 1: Refactorización de Schemas (15 min)

- [ ] **model.schemas.ts**
  - [ ] Importar `modelSelectSchema` desde DB schemas
  - [ ] Reemplazar `modelOutput` manual con `modelSelectSchema.extend()`
  - [ ] Revisar `modelDetailOutput` (¿diferencia con modelOutput?)
  - [ ] Simplificar `createModelInput` (ya validado en BD)
  - [ ] Consolidar output types (model, modelDetail, list)

- [ ] **Validar tipos**
  - [ ] Verificar que z.infer<> genere tipos correctos
  - [ ] Revisar que conversiones NUMERIC funcionen

- [ ] **Biome check**
  - [ ] `pnpm biome check --fix src/server/api/routers/admin/model`

### Fase 2: Actualizar Queries/Mutations (5 min)

- [ ] Verificar que `.input()` y `.output()` usen nuevos schemas
- [ ] No cambios en lógica (solo referencias de schemas)

### Fase 3: Testing (10 min)

- [ ] `pnpm vitest src/server/api/routers/admin/model`
- [ ] Verificar que output schemas validen correctamente

---

## 🚀 Implementación Recomendada

```typescript
// 1. Actualizar imports
import {
  modelSelectSchema,
  modelInsertSchema,
  modelUpdateSchema,
} from "@/server/db/schemas/model.schema";
import {
  modelCostBreakdownSelectSchema,
  modelCostBreakdownInsertSchema,
} from "@/server/db/schemas/model-cost-breakdown.schema";

// 2. Composición clara
export const modelOutput = modelSelectSchema.extend({
  profileSupplier: z.object({
    id: z.string(),
    name: z.string(),
    materialType: z.string(),
  }).nullable(),
});

export const modelDetailOutput = modelSelectSchema.extend({
  profileSupplier: z.object({
    id: z.string(),
    name: z.string(),
    materialType: z.string(),
  }).nullable(),
  costBreakdowns: z.array(
    modelCostBreakdownSelectSchema.extend({
      unitCost: z.number(), // NUMERIC → number
    })
  ),
  priceHistory: z.array(z.object({
    // ...
  })),
});

export const modelListOutput = z.object({
  items: z.array(
    modelSelectSchema.pick({
      id: true,
      name: true,
      status: true,
      basePrice: true,
    }).extend({
      profileSupplierName: z.string().nullable(),
    })
  ),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
});

// 3. Input schemas - reutilizar directamente
export const createModelInput = modelInsertSchema
  .pick({
    name: true,
    profileSupplierId: true,
    basePrice: true,
    costPerMmWidth: true,
    costPerMmHeight: true,
    compatibleGlassTypeIds: true,
    status: true,
  });

export const updateModelInput = z.object({
  id: z.string().uuid(),
  data: modelUpdateSchema,
});

// 4. Type exports
export type ModelOutput = z.infer<typeof modelOutput>;
export type ModelDetailOutput = z.infer<typeof modelDetailOutput>;
export type ModelListOutput = z.infer<typeof modelListOutput>;
export type CreateModelInput = z.infer<typeof createModelInput>;
export type UpdateModelInput = z.infer<typeof updateModelInput>;
```

---

## 📊 Reducción Estimada

| Aspecto            | Actual | Optimizado | Reducción |
| ------------------ | ------ | ---------- | --------- |
| **Líneas schemas** | 233    | ~150       | -35%      |
| **Duplicación**    | Alto   | Cero       | 100%      |
| **Tipo safety**    | Manual | Auto-infer | ✅         |
| **Sincronización** | Manual | Auto       | ✅         |
| **Mantenimiento**  | 3x     | 1x         | -67%      |

---

## 🎓 Conclusión

**Status**: ✅ El módulo **ya está en buen camino**, pero hay oportunidades claras de optimización.

**Recomendación**: Aplicar mejoras Phase 1 (15 min) para:
- Reducir 35% de líneas
- Eliminar duplicación
- Mejorar type safety
- Centralizar validaciones

**Referencia**: Usar pattern de `glass-solution` y `address` como template.

---

**Creado**: 2025-11-08  
**Por**: Análisis de drizzle-zod optimization
