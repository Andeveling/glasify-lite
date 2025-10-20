# Fix: TRPCError - Limit Too Big (MAX_PAGE_LIMIT)

**Fecha**: 2025-10-18  
**Error Original**: `Too big: expected number to be <=100`  
**Ubicación**: `src/app/(dashboard)/admin/models/page.tsx`

## Problema

Al intentar implementar filtrado client-side, se configuró el fetch inicial con `limit: 1000`:

```typescript
const initialData = await api.admin.model.list({
  limit: 1000, // ❌ ERROR: Excede MAX_PAGE_LIMIT
  // ...
});
```

Esto causó un **TRPCError** porque el schema de validación tiene un límite máximo:

```typescript
// src/server/api/routers/catalog/catalog.schemas.ts
export const MAX_PAGE_LIMIT = 100;

export const listModelsInput = z.object({
  limit: z.number().min(MIN_PAGE_LIMIT).max(MAX_PAGE_LIMIT).default(DEFAULT_PAGE_LIMIT),
  // ...
});
```

## Solución Aplicada

### 1. Ajustar Límite al Máximo Permitido

```typescript
// src/app/(dashboard)/admin/models/page.tsx
const initialData = await api.admin.model.list({
  limit: 100, // ✅ Max allowed by schema validation
  page: 1,
  sortBy: 'name',
  sortOrder: 'asc',
});
```

### 2. Documentar Limitación

Se agregaron comentarios en archivos relevantes:

```typescript
/**
 * Scalability Note:
 * - Current limit: 100 models (MAX_PAGE_LIMIT from schema validation)
 * - For >100 models: Consider increasing MAX_PAGE_LIMIT or implementing
 *   hybrid pagination (server-side fetch + client-side filtering)
 */
```

### 3. Actualizar Documentación

Se actualizó `docs/refactor-datatable-integrated-filters.md` con:
- Sección "Limitaciones Importantes"
- Opciones de solución a corto, mediano y largo plazo
- Impacto en escalabilidad

## Alcance de la Solución

### ✅ Funciona Perfectamente Para:
- Catálogos con ≤100 modelos
- Filtrado client-side completo
- Sorting y paginación instantáneos
- MVP y primeras etapas del producto

### ⚠️ Limitaciones:
- Solo se pueden cargar 100 modelos a la vez
- Para catálogos más grandes, se verán solo los primeros 100
- Filtros pueden no mostrar todos los resultados si hay >100 modelos

## Opciones Futuras

### Opción 1: Incrementar MAX_PAGE_LIMIT (Corto Plazo)

```typescript
// src/server/api/routers/catalog/catalog.schemas.ts
export const MAX_PAGE_LIMIT = 500; // Aumentar límite
```

**Pros**:
- Solución rápida
- Mantiene filtrado client-side

**Contras**:
- Aumenta carga en servidor
- No escala infinitamente

### Opción 2: Paginación Híbrida (Mediano Plazo)

```typescript
// Implementar auto-fetch de siguientes páginas
const [allModels, setAllModels] = useState(initialData.items);
const [hasMore, setHasMore] = useState(initialData.total > 100);

useEffect(() => {
  if (hasMore) {
    // Fetch next pages in background
    fetchNextPage();
  }
}, [hasMore]);
```

**Pros**:
- Carga progresiva
- Mejor UX para catálogos grandes

**Contras**:
- Mayor complejidad
- Múltiples requests

### Opción 3: Server-Side Filtering (Largo Plazo)

Volver al patrón original con mejoras:
- URL search params (deep linking)
- Server-side filtering, sorting, pagination
- Client-side solo para búsqueda instantánea (debounced)

**Pros**:
- Escala infinitamente
- Menor carga client-side
- Deep linking

**Contras**:
- Más round-trips al servidor
- Pierde filtrado instantáneo

## Recomendación

Para el **MVP actual**:
- ✅ Mantener límite de 100 (solución implementada)
- ✅ Monitorear crecimiento del catálogo
- ⏳ Si se acerca a 100 modelos, implementar Opción 1 (incrementar a 500)
- ⏳ Si supera 500 modelos, considerar Opción 2 o 3

## Testing

### Verificar que Funciona:

```bash
# 1. Start dev server
pnpm dev

# 2. Navegar a /admin/models
# 3. Verificar que se cargan modelos
# 4. Probar filtros (Estado, Proveedor, Búsqueda)
# 5. Verificar paginación client-side
```

### Tests a Agregar:

```typescript
// Unit test
describe('ModelsPage', () => {
  it('should fetch maximum allowed models', async () => {
    const data = await api.admin.model.list({ limit: 100 });
    expect(data.items).toHaveLength(Math.min(100, data.total));
  });

  it('should throw error if limit exceeds MAX_PAGE_LIMIT', async () => {
    await expect(
      api.admin.model.list({ limit: 101 })
    ).rejects.toThrow('Too big');
  });
});
```

## Archivos Modificados

- ✅ `src/app/(dashboard)/admin/models/page.tsx` - Límite ajustado a 100
- ✅ `src/app/(dashboard)/admin/models/_components/data-table.tsx` - Comentarios añadidos
- ✅ `docs/refactor-datatable-integrated-filters.md` - Documentación actualizada

## Referencias

- [TanStack Table - Column Filtering](https://tanstack.com/table/latest/docs/guide/column-filtering)
- [Zod - Max Validation](https://zod.dev/?id=numbers)
- Schema: `src/server/api/routers/catalog/catalog.schemas.ts`
