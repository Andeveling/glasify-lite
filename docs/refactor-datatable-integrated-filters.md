# Refactorización: Filtros Integrados en DataTable

**Fecha**: 2025-10-18  
**Tipo**: Refactorización  
**Alcance**: Componente DataTable y ModelList

## Resumen

Se refactorizó el componente `DataTable` para integrar filtros dentro del mismo, siguiendo patrones de **TanStack Table v8** para filtrado de columnas. Anteriormente, los filtros estaban en un componente separado (`NativeFilters`) que usaba URL search params.

## Cambios Principales

### 1. DataTable con Filtros Integrados

**Archivo**: `src/app/(dashboard)/admin/models/_components/data-table.tsx`

#### Nuevas Props

```typescript
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  // 🆕 Nuevas props
  filterConfig?: {
    key: string;
    label: string;
    options: { label: string; value: string }[];
    placeholder?: string;
  }[];
  toolbarActions?: React.ReactNode;
}
```

#### Características

- **Filtrado Global**: Búsqueda de texto en columna específica
- **Filtrado por Columna**: Select filters para columnas específicas
- **Toolbar Actions**: Slot para acciones adicionales (botones)
- **Client-Side**: Todo el filtrado se realiza en el cliente usando TanStack Table

### 2. Columnas con accessorFn

**Archivo**: `src/app/(dashboard)/admin/models/_components/columns.tsx`

Se actualizó la columna de proveedor para usar `accessorFn` en lugar de solo `id`:

```typescript
{
  accessorFn: (row) => row.profileSupplier?.id ?? '',
  cell: ({ row }) => {
    const supplier = row.original.profileSupplier;
    return (
      <span className="text-sm">
        {supplier?.name || <span className="text-muted-foreground">Sin proveedor</span>}
      </span>
    );
  },
  enableSorting: false,
  header: 'Proveedor',
  id: 'profileSupplierId',
}
```

Esto permite que el filtro de columna funcione correctamente al acceder al ID del proveedor anidado.

### 3. ModelList Simplificado

**Archivo**: `src/app/(dashboard)/admin/models/_components/model-list.tsx`

#### Cambios

- ❌ Eliminado: Componente `NativeFilters` separado
- ✅ Agregado: `filterConfig` y `toolbarActions` para `DataTable`
- ✅ Simplificado: Props (eliminado `searchParams`)

#### Configuración de Filtros

```typescript
const filterConfig = [
  {
    key: 'status',
    label: 'Estado',
    options: [
      { label: 'Todos', value: 'all' },
      { label: 'Borrador', value: 'draft' },
      { label: 'Publicado', value: 'published' },
    ],
  },
  {
    key: 'profileSupplierId',
    label: 'Proveedor de Perfiles',
    options: [
      { label: 'Todos', value: 'all' },
      ...suppliers.map((supplier) => ({
        label: supplier.name,
        value: supplier.id,
      })),
    ],
  },
];
```

#### Toolbar Actions

```typescript
const toolbarActions = (
  <Button asChild>
    <Link href="/admin/models/new">
      <Plus className="mr-2 size-4" />
      Nuevo Modelo
    </Link>
  </Button>
);
```

### 4. Page Simplificado

**Archivo**: `src/app/(dashboard)/admin/models/page.tsx`

#### Cambios

- ❌ Eliminado: Parsing de `searchParams` para filtros
- ❌ Eliminado: Paginación server-side
- ✅ Simplificado: Fetch de todos los modelos (limit: 1000)
- ✅ Filtrado: Ahora es 100% client-side

```typescript
// Antes: Server-side filtering
const initialData = await api.admin.model.list({
  limit: 20,
  page,
  profileSupplierId,
  sortBy: 'name',
  sortOrder: 'asc',
  status,
});

// Después: Fetch max allowed, filter client-side
const initialData = await api.admin.model.list({
  limit: 100, // Max allowed by schema validation (MAX_PAGE_LIMIT)
  page: 1,
  sortBy: 'name',
  sortOrder: 'asc',
});
```

## Ventajas

### ✅ Cohesión

- Filtros y tabla en un solo componente
- Menos props drilling
- Componente `DataTable` más completo y reutilizable

### ✅ Rendimiento Client-Side

- Filtrado instantáneo sin round-trips al servidor
- Mejor UX para datasets pequeños/medianos (≤100 items)
- TanStack Table optimizado para filtrado client-side

### ✅ Simplicidad

- Menos componentes (eliminado `NativeFilters`)
- Menos gestión de URL search params
- Código más limpio y mantenible

### ✅ Reutilizable

- `DataTable` ahora acepta configuración de filtros
- Fácil agregar filtros a otras tablas
- Pattern consistente en toda la aplicación

## Limitaciones Importantes

### 🚨 MAX_PAGE_LIMIT = 100

El schema de validación de tRPC (`catalog.schemas.ts`) impone un límite máximo de **100 items por request**:

```typescript
// src/server/api/routers/catalog/catalog.schemas.ts
export const MAX_PAGE_LIMIT = 100;

export const listModelsInput = z.object({
  limit: z.number().min(MIN_PAGE_LIMIT).max(MAX_PAGE_LIMIT).default(DEFAULT_PAGE_LIMIT),
  // ...
});
```

**Impacto**:
- ✅ Perfecto para catálogos con ≤100 modelos (filtrado client-side completo)
- ⚠️ Para catálogos con >100 modelos, solo se verán los primeros 100
- ❌ No se puede aumentar `limit` a 1000 sin modificar el schema

**Opciones de Solución**:

1. **Corto plazo**: Incrementar `MAX_PAGE_LIMIT` a 500 si se espera crecimiento
   ```typescript
   export const MAX_PAGE_LIMIT = 500; // Permite hasta 500 modelos
   ```

2. **Mediano plazo**: Implementar paginación híbrida
   - Fetch server-side por páginas de 100
   - Filtrado client-side dentro de cada página
   - Auto-fetch next page cuando se aplican filtros

3. **Largo plazo**: Volver a server-side filtering para catálogos muy grandes
   - URL search params para deep linking
   - Server-side filtering, sorting, pagination
   - Client-side solo para búsqueda instantánea (debounced)

## Desventajas

### ⚠️ Escalabilidad (Mitigada)

- **Limitación actual**: Fetch limitado a 100 items por MAX_PAGE_LIMIT
- **Cuándo es problema**: Catálogos con >100 modelos
- **Estado actual**: Suficiente para MVP y primeras etapas
- **Solución futura**: Ver sección "Limitaciones Importantes" arriba

### ⚠️ Deep Linking

- Los filtros no se reflejan en URL
- No se puede compartir URL con filtros aplicados
- **Mitigación**: Para casos donde se necesite, agregar sincronización con URL

## Patrón TanStack Table

Este refactor sigue el patrón oficial de TanStack Table:

### Filtrado Global

```typescript
// Búsqueda en columna específica
table.getColumn(searchKey)?.setFilterValue(value)
```

### Filtrado por Columna

```typescript
// Filtro en columna específica
table.getColumn(filterKey)?.setFilterValue(value === 'all' ? undefined : value)
```

### Estado de Filtros

```typescript
const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

const table = useReactTable({
  // ...
  onColumnFiltersChange: setColumnFilters,
  getFilteredRowModel: getFilteredRowModel(),
  state: {
    columnFilters,
    // ...
  },
});
```

## Referencia

- [TanStack Table - Global Filtering](https://tanstack.com/table/latest/docs/guide/global-filtering)
- [TanStack Table - Column Filtering](https://tanstack.com/table/latest/docs/guide/column-filtering)
- [TanStack Table - Client-Side vs Server-Side](https://tanstack.com/table/latest/docs/guide/column-filtering#client-side-vs-server-side-filtering)

## Próximos Pasos

1. ✅ Aplicar pattern a otras tablas (Profile Suppliers, Users, etc.)
2. ⏳ Agregar sincronización con URL si se necesita deep linking
3. ⏳ Implementar paginación client-side para datasets grandes
4. ⏳ Agregar ordenamiento persistente (localStorage)

## Testing

### Unit Tests

```typescript
describe('DataTable', () => {
  it('should filter by search key', () => {
    // Test global filter
  });

  it('should filter by column', () => {
    // Test column filter
  });

  it('should render toolbar actions', () => {
    // Test toolbar slot
  });
});
```

### E2E Tests

```typescript
test('should filter models by status', async ({ page }) => {
  await page.goto('/admin/models');
  await page.selectOption('[id="status"]', 'published');
  await expect(page.getByTestId('model-row')).toHaveCount(/* published count */);
});
```

## Autor

- **Fecha**: 2025-10-18
- **Versión**: Next.js 15.2.3, TanStack Table 8.x
