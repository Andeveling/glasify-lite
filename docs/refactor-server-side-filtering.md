# Refactorización: Filtrado Server-Side con URL Search Params

**Fecha**: 2025-10-18  
**Tipo**: Refactorización  
**Alcance**: Sistema de filtrado de modelos (admin)

## Resumen

Se migró de **filtrado client-side** (limitado a 100 modelos) a **filtrado server-side** usando URL search params, siguiendo el patrón Next.js 15 oficial. Esto elimina la limitación de 100 modelos y habilita deep linking.

## Arquitectura

### Flujo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuario cambia filtro (Estado, Proveedor)                │
│    → ServerFilters component                                 │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. useServerFilters hook actualiza URL                      │
│    → router.push('/admin/models?status=draft&page=1')       │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Next.js detecta cambio de URL                            │
│    → Page (Server Component) se re-renderiza                │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Page lee searchParams y hace fetch al servidor           │
│    → api.admin.model.list({ status: 'draft', page: 1 })     │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. tRPC filtra en base de datos                             │
│    → WHERE { status: 'draft' } LIMIT 20 OFFSET 0            │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Page pasa datos filtrados a ModelList                    │
│    → <ModelList initialData={filtered} />                   │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. DataTable renderiza + búsqueda client-side instantánea   │
│    → Búsqueda solo sobre los 20 resultados de la página     │
└─────────────────────────────────────────────────────────────┘
```

### Separación de Responsabilidades

| Componente           | Tipo             | Responsabilidad                          |
| -------------------- | ---------------- | ---------------------------------------- |
| **page.tsx**         | Server Component | Lee URL params, fetch de datos filtrados |
| **ServerFilters**    | Client Component | Controles que actualizan URL             |
| **useServerFilters** | Custom Hook      | Lógica de actualización de URL           |
| **ModelList**        | Client Component | Orquestación y lógica de delete          |
| **DataTable**        | Client Component | Tabla + búsqueda client-side             |

## Archivos Creados

### 1. useServerFilters Hook

**Ubicación**: `src/app/(dashboard)/admin/models/_hooks/use-server-filters.ts`

```typescript
export function useServerFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === 'all' || value === '' || !value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    
    // Reset to page 1 when filtering
    if (key !== 'page') {
      params.delete('page');
    }
    
    router.push(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams]);

  const getFilterValue = useCallback(
    (key: string, defaultValue = 'all') => searchParams.get(key) ?? defaultValue,
    [searchParams]
  );

  return { updateFilter, getFilterValue, updatePage };
}
```

**Características**:
- ✅ Type-safe filter updates
- ✅ Resets to page 1 on filter change
- ✅ Removes params with default values
- ✅ Triggers server-side refetch via router.push

### 2. ServerFilters Component

**Ubicación**: `src/app/(dashboard)/admin/models/_components/server-filters.tsx`

```typescript
export function ServerFilters({ suppliers }: ServerFiltersProps) {
  const { getFilterValue, updateFilter } = useServerFilters();

  return (
    <div className="flex flex-wrap items-end gap-4">
      {/* Status Filter */}
      <Select 
        value={getFilterValue('status')}
        onValueChange={(value) => updateFilter('status', value)}
      >
        <SelectItem value="all">Todos</SelectItem>
        <SelectItem value="draft">Borrador</SelectItem>
        <SelectItem value="published">Publicado</SelectItem>
      </Select>

      {/* Supplier Filter */}
      <Select 
        value={getFilterValue('profileSupplierId')}
        onValueChange={(value) => updateFilter('profileSupplierId', value)}
      >
        <SelectItem value="all">Todos</SelectItem>
        {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
      </Select>

      {/* Create Button */}
      <Button asChild>
        <Link href="/admin/models/new">Nuevo Modelo</Link>
      </Button>
    </div>
  );
}
```

**Características**:
- ✅ Lee estado actual de URL
- ✅ Actualiza URL en onChange
- ✅ Sincronizado automáticamente

## Archivos Modificados

### 1. page.tsx (Server Component)

**Antes**:
```typescript
// Fetch all, filter client-side
const initialData = await api.admin.model.list({
  limit: 100, // Limited by schema
  page: 1,
});
```

**Después**:
```typescript
// Parse URL params
const params = await searchParams;
const page = Number(params.page) || 1;
const status = params.status === 'all' ? undefined : params.status;
const profileSupplierId = params.profileSupplierId === 'all' ? undefined : params.profileSupplierId;

// Server-side filtering
const initialData = await api.admin.model.list({
  limit: 20, // Items per page
  page,
  status,
  profileSupplierId,
  sortBy: 'name',
  sortOrder: 'asc',
});
```

### 2. ModelList (Client Component)

**Antes**:
```typescript
// Client-side filter config for TanStack Table
const filterConfig = [
  { key: 'status', options: [...] },
  { key: 'profileSupplierId', options: [...] }
];

<DataTable filterConfig={filterConfig} toolbarActions={createButton} />
```

**Después**:
```typescript
// Server-side filters separate from table
<ServerFilters suppliers={suppliers} />

<Card>
  <CardContent>
    <DataTable 
      columns={columns} 
      data={models}
      searchKey="name"
    />
  </CardContent>
</Card>
```

### 3. DataTable (Client Component)

**Antes**:
```typescript
interface DataTableProps {
  filterConfig?: FilterConfig[];
  toolbarActions?: React.ReactNode;
}

// Integrated filters in toolbar
<div className="flex gap-4">
  {searchKey && <Input />}
  {filterConfig.map(filter => <Select />)}
  {toolbarActions}
</div>
```

**Después**:
```typescript
interface DataTableProps {
  toolbarSlot?: React.ReactNode; // For server filters
}

// Toolbar slot + simple search
{toolbarSlot}

{searchKey && (
  <Input 
    onChange={(e) => table.getColumn(searchKey)?.setFilterValue(e.target.value)}
  />
)}
```

## Comparación: Antes vs Después

| Aspecto             | Client-Side (Antes)          | Server-Side (Después)       |
| ------------------- | ---------------------------- | --------------------------- |
| **Límite de datos** | 100 modelos (MAX_PAGE_LIMIT) | Sin límite (filtra en DB)   |
| **Filtrado**        | TanStack Table (client)      | Prisma WHERE (server)       |
| **Paginación**      | Client-side (sobre 100)      | Server-side (20 per page)   |
| **Deep linking**    | ❌ No                         | ✅ Sí (/models?status=draft) |
| **Performance**     | Instantáneo (pero limitado)  | Muy rápido (optimizado DB)  |
| **Escalabilidad**   | ≤100 modelos                 | ∞ modelos                   |
| **Búsqueda**        | Sobre 100 modelos            | Sobre página actual (20)    |

## Ventajas de Server-Side

### ✅ Sin Límite de Escalabilidad

- El servidor filtra antes de devolver datos
- Solo se transfieren 20 modelos por página
- Funciona con catálogos de 10, 100, 1000+ modelos

### ✅ Deep Linking

```
/admin/models?status=draft&profileSupplierId=clxx123&page=2
```

- Los filtros se reflejan en la URL
- Se puede compartir URL con filtros aplicados
- Navegación back/forward preserva filtros

### ✅ Performance Optimizada

- Filtrado en base de datos (índices, WHERE clause)
- Menor carga en cliente (solo 20 items)
- Mejor Core Web Vitals

### ✅ SEO y Analytics

- URLs únicas por combinación de filtros
- Trackeable en Google Analytics
- Mejor para auditorías

## Desventajas (Mitigadas)

### ⚠️ Latencia de Red

**Problema**: Cada cambio de filtro hace un request al servidor

**Mitigación**: 
- Next.js 15 hace prefetch automático
- Transiciones rápidas con loading states
- Búsqueda instantánea (client-side) para texto

### ⚠️ Pérdida de Búsqueda Global

**Problema**: Búsqueda solo sobre página actual (20 items)

**Solución futura**: 
- Agregar parámetro `search` a URL
- Servidor filtra por nombre en DB
- Debounce de 300ms para evitar requests excesivos

## Patrón Next.js 15

Este refactor sigue el patrón oficial de Next.js 15:

### Server Component (page.tsx)

```typescript
export default async function Page({ searchParams }: Props) {
  const params = await searchParams;
  
  // Server-side data fetching with filters
  const data = await api.list({
    filter1: params.filter1,
    filter2: params.filter2,
  });
  
  return <ClientComponent initialData={data} />;
}
```

### Client Component (filters)

```typescript
'use client';

export function Filters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set(key, value);
    router.push(`${pathname}?${params}`);
  };
  
  return <Select onValueChange={value => updateFilter('status', value)} />;
}
```

## Testing

### Manual Testing

```bash
# 1. Start dev server
pnpm dev

# 2. Navegar a /admin/models

# 3. Cambiar filtro Estado → URL debe cambiar
/admin/models?status=draft

# 4. Cambiar filtro Proveedor → URL debe actualizarse
/admin/models?status=draft&profileSupplierId=clxx123

# 5. Buscar por nombre → Sin cambio en URL (client-side)

# 6. Copiar URL y abrir en nueva pestaña → Filtros deben preservarse
```

### Unit Tests (Futuro)

```typescript
describe('useServerFilters', () => {
  it('should update URL on filter change', () => {
    const { result } = renderHook(() => useServerFilters());
    act(() => result.current.updateFilter('status', 'draft'));
    expect(mockRouter.push).toHaveBeenCalledWith('/admin/models?status=draft');
  });

  it('should reset to page 1 when filter changes', () => {
    const { result } = renderHook(() => useServerFilters(), {
      searchParams: new URLSearchParams('page=3&status=published')
    });
    act(() => result.current.updateFilter('status', 'draft'));
    expect(mockRouter.push).toHaveBeenCalledWith('/admin/models?status=draft');
  });
});
```

### E2E Tests (Futuro)

```typescript
test('should filter models by status via URL', async ({ page }) => {
  await page.goto('/admin/models');
  
  // Change filter
  await page.selectOption('[id="status"]', 'draft');
  
  // Verify URL updated
  await expect(page).toHaveURL(/\/admin\/models\?status=draft/);
  
  // Verify only draft models shown
  const rows = page.locator('[data-testid="model-row"]');
  for (let i = 0; i < await rows.count(); i++) {
    await expect(rows.nth(i).locator('text=Borrador')).toBeVisible();
  }
});

test('should preserve filters on page refresh', async ({ page }) => {
  await page.goto('/admin/models?status=draft&profileSupplierId=clxx123');
  await page.reload();
  
  // Filters should still be applied
  await expect(page.locator('[id="status"]')).toHaveValue('draft');
  await expect(page.locator('[id="profileSupplierId"]')).toHaveValue('clxx123');
});
```

## Próximos Pasos

1. ✅ **COMPLETADO**: Migración a server-side filtering
2. ⏳ **Agregar búsqueda server-side**: Parámetro `search` en URL + debounce
3. ⏳ **Paginación visual**: Componente de paginación con números de página
4. ⏳ **Loading states**: Skeleton loaders durante transiciones
5. ⏳ **Tests E2E**: Validar filtrado y deep linking

## Referencias

- [Next.js 15 - useSearchParams](https://nextjs.org/docs/app/api-reference/functions/use-search-params)
- [Next.js 15 - useRouter](https://nextjs.org/docs/app/api-reference/functions/use-router)
- [TanStack Table - Server-Side](https://tanstack.com/table/latest/docs/guide/column-filtering#server-side-filtering)
- Documentación anterior: `docs/refactor-datatable-integrated-filters.md`

## Autor

- **Fecha**: 2025-10-18
- **Versión**: Next.js 15.2.3
- **Branch**: `011-admin-catalog-management`
