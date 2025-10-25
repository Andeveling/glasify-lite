# Catalog Router

Router de tRPC para operaciones relacionadas con el catálogo de modelos de cristal.

## 📁 Estructura de Archivos

```
catalog/
├── README.md              # Esta guía
├── index.ts              # Router principal (barrel file)
├── catalog.schemas.ts    # Schemas de Zod para validación
├── catalog.queries.ts    # Procedimientos de lectura (queries)
├── catalog.mutations.ts  # Procedimientos de escritura (mutations) - NO EN USO
└── catalog.utils.ts      # Funciones helper (serialización Decimal)
```

## 🎯 Propósito

Este router maneja **solo operaciones de lectura (READ)** del catálogo:
- ✅ Listar modelos con filtros y paginación
- ✅ Obtener detalles de un modelo específico
- ✅ Listar fabricantes para filtros

**Nota**: Las operaciones de escritura (crear/editar modelos) son exclusivas del **admin router** y requieren autenticación.

## 🔄 Flujo de Usuario

```
Usuario → /catalog (lista de modelos)
       ↓
       Selecciona modelo
       ↓
       /catalog/[modelId] (vista de parametrización)
       ├─ Columna 1: Info del modelo (contexto)
       └─ Columna 2: Formulario de configuración
            ├─ Ancho (mm)
            ├─ Alto (mm)
            ├─ Cantidad
            └─ Servicios adicionales
            ↓
            [Añadir a Cotización] → Quote Router
```

## 📋 Procedures Disponibles

### `list-models`
Lista modelos con filtros, búsqueda, ordenamiento y paginación.

**Tipo**: `publicProcedure.query`

**Input**:
```typescript
{
  search?: string;           // Búsqueda por nombre
  manufacturerId?: string;   // Filtrar por fabricante
  page?: number;            // Página actual (default: 1)
  limit?: number;           // Items por página (default: 20, max: 100)
  sort?: 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc'; // Default: 'name-asc'
}
```

**Output**:
```typescript
{
  items: ModelSummary[];    // Array de modelos serializados
  total: number;           // Total de items (para paginación)
}
```

**Ejemplo de uso**:
```typescript
// Client Component
const { data } = api.catalog['list-models'].useQuery({
  search: 'Guardian',
  manufacturerId: 'clxx123',
  page: 1,
  limit: 20,
  sort: 'price-asc',
});

// Server Component
const { items, total } = await api.catalog['list-models']({
  search: searchQuery,
  page: currentPage,
});
```

---

### `get-model-by-id`
Obtiene los detalles completos de un modelo específico (incluye info completa del fabricante).

**Tipo**: `publicProcedure.query`

**Input**:
```typescript
{
  modelId: string;  // CUID del modelo
}
```

**Output**:
```typescript
{
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
  manufacturer: {
    id: string;
    name: string;
    currency: string;
    quoteValidityDays: number;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}
```

**Ejemplo de uso**:
```typescript
// Client Component
const { data: model } = api.catalog['get-model-by-id'].useQuery({
  modelId: params.modelId,
});

// Server Component
const model = await api.catalog['get-model-by-id']({
  modelId: params.modelId,
});
```

---

### `list-manufacturers`
Lista todos los fabricantes disponibles (para filtros).

**Tipo**: `publicProcedure.query`

**Input**: Ninguno

**Output**:
```typescript
Array<{
  id: string;
  name: string;
}>
```

**Ejemplo de uso**:
```typescript
// Server Component
const manufacturers = await api.catalog['list-manufacturers']();

// Client Component
const { data: manufacturers } = api.catalog['list-manufacturers'].useQuery();
```

## 🛠️ Utilities

### `serializeDecimalFields`
Convierte campos `Decimal` de Prisma a `number` para serialización JSON.

**Uso interno**: Llamado automáticamente en los procedures para manejar campos de precios y dimensiones.

```typescript
// Prisma retorna Decimal, pero JSON necesita number
const model = await ctx.db.model.findUnique({...});
const serialized = serializeDecimalFields(model);
// serialized.basePrice es number, no Decimal
```

## 📝 Schemas Reutilizables

Los schemas de Zod exportados en `catalog.schemas.ts` pueden reutilizarse en:

### ✅ Validación de Formularios (React Hook Form)

```typescript
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { modelParametrizationSchema } from '@/server/api/routers/catalog';

const form = useForm({
  resolver: zodResolver(modelParametrizationSchema),
  defaultValues: {
    modelId: model.id,
    widthMm: 1000,
    heightMm: 1500,
    quantity: 1,
  },
});
```

### ✅ Extensión de Schemas

```typescript
import { z } from 'zod';
import { modelDetailOutput } from '@/server/api/routers/catalog';

// Extender schema existente
const modelWithCalculation = modelDetailOutput.extend({
  totalPrice: z.number(),
  estimatedDeliveryDays: z.number(),
});

// Hacer campos opcionales para edición
const updateModelSchema = modelDetailOutput.partial();

// Seleccionar solo campos necesarios
const modelPreviewSchema = modelDetailOutput.pick({
  id: true,
  name: true,
  basePrice: true,
});
```

## 🚨 Reglas Importantes

### ✅ DO (Hacer)
- **Siempre** validar inputs con Zod schemas
- **Siempre** serializar campos Decimal antes de retornar
- **Siempre** filtrar por `status: 'published'` en queries públicas
- **Siempre** usar logging estructurado con Winston
- **Siempre** manejar errores con mensajes en español para usuarios

### ❌ DON'T (No Hacer)
- **Nunca** exponer modelos en estado `draft` en procedures públicos
- **Nunca** retornar campos Decimal sin serializar (causará error de JSON)
- **Nunca** usar `any` en tipos (usar tipos específicos de Prisma)
- **Nunca** agregar mutations aquí (pertenecen al admin router)
- **Nunca** hardcodear IDs en queries (siempre usar parámetros)

## 🔒 Seguridad

- **Procedures públicos**: Solo lectura, modelos publicados únicamente
- **Validación estricta**: Todos los inputs validados con Zod
- **Error handling**: Mensajes genéricos al usuario, detalles en logs
- **SQL Injection**: Prevenido por Prisma ORM (queries parametrizadas)

## 🧪 Testing

```typescript
// tests/integration/catalog/catalog.router.test.ts
import { appRouter } from '@/server/api/root';
import { createInnerTRPCContext } from '@/server/api/trpc';

describe('catalog.router', () => {
  it('should list published models only', async () => {
    const ctx = await createInnerTRPCContext({ session: null });
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.catalog['list-models']({
      page: 1,
      limit: 20,
    });
    
    expect(result.items.every(m => m.status === 'published')).toBe(true);
  });

  it('should get model by id with manufacturer info', async () => {
    const ctx = await createInnerTRPCContext({ session: null });
    const caller = appRouter.createCaller(ctx);
    
    const model = await caller.catalog['get-model-by-id']({
      modelId: 'clxx123',
    });
    
    expect(model.manufacturer).toBeDefined();
    expect(model.manufacturer?.currency).toBeDefined();
  });
});
```

## 📚 Referencias

- [tRPC v11 Documentation](https://trpc.io/docs/v11)
- [Zod Schema Documentation](https://zod.dev)
- [Prisma Decimal Type](https://www.prisma.io/docs/concepts/components/prisma-client/field-types#decimal)
- [React Hook Form with Zod](https://react-hook-form.com/get-started#SchemaValidation)

## 🔄 Arquitectura SOLID

Este router sigue los principios SOLID:

- **Single Responsibility**: Cada archivo tiene una responsabilidad clara
  - `index.ts`: Combinar procedures
  - `catalog.schemas.ts`: Definir validaciones
  - `catalog.queries.ts`: Lógica de lectura
  - `catalog.utils.ts`: Funciones helper puras

- **Open/Closed**: Extensible sin modificar código existente
  - Los schemas se pueden extender con `.extend()`, `.pick()`, `.omit()`
  - Nuevas queries se agregan sin modificar las existentes

- **Liskov Substitution**: Los schemas son intercambiables
  - `modelSummaryOutput` puede reemplazar a `modelDetailOutput` en contextos básicos

- **Interface Segregation**: Schemas específicos para cada caso
  - `modelSummaryOutput` para listas (campos mínimos)
  - `modelDetailOutput` para detalles (campos completos)

- **Dependency Inversion**: Depende de abstracciones
  - Router depende de `createTRPCRouter`, no de implementación concreta
  - Procedures usan `ctx.db` (abstracción), no Prisma directamente

## 📝 Notas Adicionales

### Barrel File Exception
El archivo `index.ts` está exceptuado de la regla `noBarrelFile` de Biome porque:
- Es necesario para combinar procedures en tRPC
- Es un patrón arquitectónico válido en este contexto
- No afecta tree-shaking porque tRPC optimiza el bundle

### Decimal Serialization
Los campos `Decimal` de Prisma deben convertirse a `number`:
```typescript
// ❌ MAL: Retornar Decimal directamente
return model;

// ✅ BIEN: Serializar antes de retornar
return serializeDecimalFields(model);
```

### Status Filtering
Siempre filtrar por `status: 'published'` en procedures públicos:
```typescript
where: {
  status: 'published', // Solo modelos publicados
}
```

---

**Última actualización**: 5 de octubre de 2025
**Autor**: Glasify Development Team
**Versión**: 1.0.0
