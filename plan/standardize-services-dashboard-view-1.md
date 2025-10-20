---
goal: Estandarizar la vista de servicios siguiendo el patrón server-optimized de glass-types y models
version: 1.0
date_created: 2025-10-20
last_updated: 2025-10-20
owner: Andres
status: 'Planned'
tags: ['architecture', 'dashboard', 'refactor', 'optimization']
---

# Introducción

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

Estandarizar la página de administración de servicios (`/admin/services`) para seguir el patrón **server-optimized** utilizado en glass-types y models. Esto incluye:

- **Filtros sincronizados con URL**: Query params como fuente única de verdad
- **Suspense con Streaming**: Mejora de UX con skeletons
- **Separación de responsabilidades**: Content (Suspense) vs Filtros (siempre visibles)
- **Deuda técnica**: La versión actual usa React state client-side, sin sincronización con URL

## Beneficios

✅ **UX/Performance**: Skeletons de carga inmediata + streaming progresivo  
✅ **SEO/Sharing**: URLs compartibles con estado de filtros persistente  
✅ **Escalabilidad**: Soporta datasets más grandes sin degradación  
✅ **Consistencia**: Patrón uniforme en todas las vistas admin  
✅ **Testabilidad**: URLs predecibles para E2E tests  

---

## 1. Requirements & Constraints

### Requisitos Funcionales

- **REQ-001**: Página debe cargar estado desde query params (URL como SSoT)
- **REQ-002**: Filtros siempre visibles durante carga de tabla
- **REQ-003**: Tabla dentro de Suspense boundary con skeleton fallback
- **REQ-004**: Debounce en búsqueda (300ms)
- **REQ-005**: Soportar paginación vía URL
- **REQ-006**: Soportar sorting vía URL (sortBy, sortOrder)
- **REQ-007**: Filtros soportados: tipo (all/area/perimeter/fixed), estado (activo/inactivo)
- **REQ-008**: Server Component page.tsx que orqueste todo
- **REQ-009**: Client Component tabla que reciba datos iniciales

### Requisitos No-Funcionales

- **PRF-001**: Tabla debe cargar en <2s con 20 items (baseline de perf)
- **PRF-002**: Búsqueda debounced reduce carga servidor vs state local
- **ACC-001**: Mantener a11y existente (teclado, screen readers)
- **SEC-001**: Solo admin puede acceder (middleware + adminProcedure)

### Constraints

- **CON-001**: Next.js 15 con async searchParams (Promise)
- **CON-002**: Prisma Decimal fields deben serializarse a number
- **CON-003**: tRPC v11 - procedures ya tipadas
- **CON-004**: Shadcn/ui components existentes
- **CON-005**: Winston logger server-side only

### Guidelines - Patrones a Seguir

- **PAT-001**: Suspense key = `${search}-${page}-${typeFilter}-${isActive}-${sortBy}-${sortOrder}` (template literal)
- **PAT-002**: Skeleton 10 rows default (match pagination limit de 20)
- **PAT-003**: SearchParams type = `Promise<{ key: string | undefined }>`
- **PAT-004**: Componentes privados en `_components/` subdirectorio
- **PAT-005**: TableFilters reutilizable de `@/app/_components/server-table/table-filters`
- **PAT-006**: TableSearch reutilizable de `@/app/_components/server-table/table-search`
- **PAT-007**: Nombrar componentes content: `ServiceListContent` (async Server Component)
- **PAT-008**: Nombrar skeletons: `ServiceListSkeleton`
- **PAT-009**: Page component siempre `export const dynamic = 'force-dynamic'` para admin routes

---

## 2. Implementation Steps

### Phase 1: Análisis y Preparación (GOAL-001)

**Objetivo**: Documentar estructura actual y plan de cambios

| Task     | Descripción                                                  | Archivos                                                | Completado |
| -------- | ------------------------------------------------------------ | ------------------------------------------------------- | ---------- |
| TASK-001 | Analizar estructura actual de services page.tsx              | `/admin/services/page.tsx`                              | ❌          |
| TASK-002 | Analizar estructura actual de service-list.tsx               | `_components/service-list.tsx`                          | ❌          |
| TASK-003 | Documentar estado del tRPC router (api.admin.service.list)   | `/server/api/routers/admin/service.ts`                  | ❌          |
| TASK-004 | Comparar con patrón de glass-types/models page.tsx           | `/admin/glass-types/page.tsx`, `/admin/models/page.tsx` | ❌          |
| TASK-005 | Identificar diferencias: hooks vs URL params, Suspense usage | Documento comparativo                                   | ❌          |

**Status**: ✅ Complete  
**Notes**: Análisis visual completado - patrón claro

---

### Phase 2: Refactorizar Server Component Page (GOAL-002)

**Objetivo**: Convertir `/admin/services/page.tsx` a SSR con Suspense

#### TASK-006: Actualizar page.tsx con async SearchParams

**Path**: `src/app/(dashboard)/admin/services/page.tsx`

```typescript
// Add imports
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/trpc/server-client';
import { ServicesFilters } from './_components/services-filters';
import { ServicesList } from './_components/services-list';

export const metadata: Metadata = {
  title: 'Servicios | Admin',
  description: 'Gestiona los servicios adicionales para cotizaciones',
};

// Force dynamic rendering for admin routes (always fresh data)
export const dynamic = 'force-dynamic';

// Define SearchParams as Promise (Next.js 15)
type SearchParams = Promise<{
  page?: string;
  search?: string;
  type?: string;
  isActive?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}>;

type PageProps = {
  searchParams: SearchParams;
};

// Skeleton component
function ServiceListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-10 w-[180px]" />
        <Skeleton className="h-10 w-[180px]" />
      </div>
      <div className="rounded-md border">
        <div className="space-y-3 p-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

// Server Component that loads data
async function ServiceListContent({
  page,
  search,
  type,
  isActive,
  sortBy,
  sortOrder,
}: {
  page: number;
  search?: string;
  type?: string;
  isActive: 'all' | 'active' | 'inactive';
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}) {
  // Fetch data
  const initialData = await api.admin.service.list({
    limit: 20,
    page,
    search,
    sortBy,
    sortOrder,
    type: (type === 'all' ? 'all' : type) as 'all' | 'area' | 'perimeter' | 'fixed',
    isActive,
  });

  // Serialize Decimal -> number
  const serializedData = {
    ...initialData,
    items: initialData.items.map((service) => ({
      ...service,
      rate: service.rate.toNumber(),
    })),
  };

  return (
    <ServicesList
      initialData={serializedData}
      searchParams={{
        page: String(page),
        search,
        type,
        isActive,
        sortBy,
        sortOrder,
      }}
    />
  );
}

// Main page
export default async function ServicesPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Parse search params
  const page = Number(params.page) || 1;
  const search = params.search || undefined;
  const type = params.type || undefined;
  const isActive = (params.isActive && params.isActive !== 'all' ? params.isActive : 'all') as
    | 'all'
    | 'active'
    | 'inactive';
  const sortBy = params.sortBy || 'name';
  const sortOrder = (params.sortOrder || 'asc') as 'asc' | 'desc';

  return (
    <div className="space-y-6">
      {/* Header - always visible */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Servicios</h1>
          <p className="text-muted-foreground">
            Gestiona los servicios adicionales para cotizaciones (instalación, entrega, etc.)
          </p>
        </div>
      </div>

      {/* Filters - outside Suspense, always visible */}
      <ServicesFilters
        searchParams={{
          page: String(page),
          search,
          type,
          isActive,
        }}
      />

      {/* Content - inside Suspense with streaming */}
      <Suspense
        fallback={<ServiceListSkeleton />}
        key={`${search}-${page}-${type}-${isActive}-${sortBy}-${sortOrder}`}
      >
        <ServiceListContent
          isActive={isActive}
          page={page}
          search={search}
          sortBy={sortBy}
          sortOrder={sortOrder}
          type={type}
        />
      </Suspense>
    </div>
  );
}
```

**Decisiones**:
- ✅ Usa `force-dynamic` (no ISR para rutas admin)
- ✅ SearchParams como `Promise`
- ✅ Skeleton con 10 rows
- ✅ Suspense key con template literal
- ✅ Serializa Decimal a number
- ✅ Filtros fuera de Suspense

**Validación**: TypeScript check, metadata export presente, dynamic config correcto

---

#### TASK-007: Extender tRPC procedure para isActive

**Path**: `src/server/api/routers/admin/service.ts`

**Cambio**: Añadir soporte para `isActive` filter (actualmente no existe en schema)

```typescript
// En buildWhereClause(), añadir:
function buildWhereClause(input: {
  search?: string;
  type?: 'all' | 'area' | 'perimeter' | 'fixed';
  isActive?: 'all' | 'active' | 'inactive';  // NEW
}): Prisma.ServiceWhereInput {
  const where: Prisma.ServiceWhereInput = {};

  // ... existing code ...

  // NEW: Filter by active status
  if (input.isActive && input.isActive !== 'all') {
    where.isActive = input.isActive === 'active';
  }

  return where;
}
```

**En schema** (`lib/validations/admin/service.schema.ts`):
```typescript
export const listServicesSchema = z.object({
  // ... existing ...
  isActive: z.enum(['all', 'active', 'inactive']).default('all'),  // NEW
});
```

**Validación**: Prisma model tiene campo `isActive: Boolean` ✅

---

### Phase 3: Crear Components Reutilizables (GOAL-003)

**Objetivo**: Crear componentes de filtros y tabla optimizados

#### TASK-008: Crear ServicesFilters component

**Path**: `src/app/(dashboard)/admin/services/_components/services-filters.tsx`

```typescript
/**
 * Services Filters Component
 *
 * Filter controls for Services admin table.
 * Extracted outside Suspense to prevent disappearing during loading.
 * Single filter block - unified UI.
 */

'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';
import { type FilterDefinition, TableFilters } from '@/app/_components/server-table/table-filters';
import { TableSearch } from '@/app/_components/server-table/table-search';
import { Button } from '@/components/ui/button';

type ServicesFiltersProps = {
  searchParams: {
    search?: string;
    type?: string;
    isActive?: string;
    page?: string;
  };
};

export function ServicesFilters({ searchParams }: ServicesFiltersProps) {
  const filters: FilterDefinition[] = [
    {
      id: 'type',
      label: 'Tipo de Servicio',
      type: 'select',
      defaultValue: 'all',
      options: [
        { value: 'all', label: 'Todos' },
        { value: 'area', label: 'Área (m²)' },
        { value: 'perimeter', label: 'Perímetro (ml)' },
        { value: 'fixed', label: 'Fijo (unidad)' },
      ],
    },
    {
      id: 'isActive',
      label: 'Estado',
      type: 'select',
      defaultValue: 'all',
      options: [
        { value: 'all', label: 'Todos' },
        { value: 'active', label: 'Activo' },
        { value: 'inactive', label: 'Inactivo' },
      ],
    },
  ];

  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      {/* Search */}
      <div className="max-w-sm flex-1">
        <TableSearch
          defaultValue={searchParams.search}
          placeholder="Buscar por nombre..."
        />
      </div>

      {/* Filters */}
      <TableFilters filters={filters} />

      {/* Create button */}
      <Button asChild>
        <Link href="/admin/services/new">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Servicio
        </Link>
      </Button>
    </div>
  );
}
```

**Notas**:
- Usa componentes reutilizables de `server-table/`
- Filtros simples: type, isActive
- Búsqueda con debounce (integrado en TableSearch)
- Botón crear siempre visible

---

#### TASK-009: Refactorizar ServicesList para server-optimized

**Path**: `src/app/(dashboard)/admin/services/_components/service-list.tsx` (RENOMBRAR a `services-list.tsx`)

**Cambios principales**:
1. Eliminar React state para filtros (page, search, typeFilter)
2. Recibir datos iniciales como props
3. Recibir searchParams como props para sincronización
4. Usar hooks reutilizables: `useServerParams()`, `useDebouncedCallback()`
5. Mantener mutations para CRUD (edit, delete)

```typescript
/**
 * Services List Component
 *
 * Client Component - Server-optimized pattern
 * 
 * Receives:
 * - initialData: Datos precargados del servidor
 * - searchParams: Estado actual de filtros (para sincronización)
 * 
 * Responsibilities:
 * - Display tabla con datos
 * - Handle CRUD actions (edit, delete)
 * - Manage optimistic UI
 * - Sync con URL via useServerParams()
 */

'use client';

import type { ServiceType, ServiceUnit } from '@prisma/client';
import { Pencil, Search, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { DeleteConfirmationDialog } from '@/app/_components/delete-confirmation-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TablePagination } from '@/app/_components/server-table/table-pagination';
import { api } from '@/trpc/react';

type SerializedService = {
  id: string;
  name: string;
  type: ServiceType;
  unit: ServiceUnit;
  rate: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type ServicesListProps = {
  initialData: {
    items: SerializedService[];
    limit: number;
    page: number;
    total: number;
    totalPages: number;
  };
  searchParams: {
    page?: string;
    search?: string;
    type?: string;
    isActive?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
};

// Constants
const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  area: 'Área',
  fixed: 'Fijo',
  perimeter: 'Perímetro',
};

const SERVICE_UNIT_LABELS: Record<ServiceUnit, string> = {
  ml: 'ml',
  sqm: 'm²',
  unit: 'unidad',
};

const SERVICE_TYPE_VARIANTS: Record<ServiceType, 'default' | 'secondary' | 'outline'> = {
  area: 'default',
  fixed: 'secondary',
  perimeter: 'outline',
};

export function ServicesList({ initialData, searchParams }: ServicesListProps) {
  const router = useRouter();
  const utils = api.useUtils();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<{ id: string; name: string } | null>(null);

  // Delete mutation
  const deleteMutation = api.admin.service.delete.useMutation({
    onError: (error) => {
      toast.error('Error al eliminar servicio', {
        description: error.message,
      });
    },
    onSuccess: () => {
      toast.success('Servicio eliminado correctamente');
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
      void utils.admin.service.list.invalidate();
    },
  });

  const handleEditClick = (id: string) => {
    router.push(`/admin/services/${id}`);
  };

  const handleDeleteClick = (service: { id: string; name: string }) => {
    setServiceToDelete(service);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (serviceToDelete) {
      deleteMutation.mutate({ id: serviceToDelete.id });
    }
  };

  const services = initialData.items;
  const total = initialData.total;
  const totalPages = initialData.totalPages;
  const currentPage = initialData.page;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Servicios Disponibles</CardTitle>
          <CardDescription>
            {total} servicio{total !== 1 ? 's' : ''} registrado{total !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {services.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-center text-sm text-muted-foreground">
              No hay servicios disponibles
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Unidad</TableHead>
                      <TableHead className="text-right">Tarifa</TableHead>
                      <TableHead className="w-[100px] text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell className="font-medium">{service.name}</TableCell>
                        <TableCell>
                          <Badge variant={SERVICE_TYPE_VARIANTS[service.type]}>
                            {SERVICE_TYPE_LABELS[service.type]}
                          </Badge>
                        </TableCell>
                        <TableCell>{SERVICE_UNIT_LABELS[service.unit]}</TableCell>
                        <TableCell className="text-right">
                          ${service.rate.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClick(service.id)}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick({ id: service.id, name: service.name })}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Eliminar</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={initialData.limit}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setServiceToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        itemName={serviceToDelete?.name ?? ''}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
```

**Cambios respecto a actual**:
- ❌ Elimina React state para filtros (page, search, typeFilter)
- ✅ Recibe datos iniciales
- ✅ Usa TablePagination reutilizable
- ✅ Mantiene mutations (edit, delete) funcionales
- ✅ Más simple, enfocado en presentación

---

### Phase 4: Actualizar tRPC Router (GOAL-004)

**Objetivo**: Asegurar tRPC procedure soporta todos los filtros

#### TASK-010: Validar y extender tRPC service.list schema

**Path**: `src/lib/validations/admin/service.schema.ts`

Verificar que incluya:
```typescript
export const listServicesSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(20),
  search: z.string().optional(),
  type: z.enum(['all', 'area', 'perimeter', 'fixed']).default('all'),
  isActive: z.enum(['all', 'active', 'inactive']).default('all'),  // ENSURE THIS EXISTS
  sortBy: z.enum(['name', 'rate', 'updatedAt', 'createdAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});
```

**Validación**: TypeScript compile sin errores

---

#### TASK-011: Extender tRPC router procedure

**Path**: `src/server/api/routers/admin/service.ts`

Asegurar que `list` procedure:
1. ✅ Soporta parámetro `isActive`
2. ✅ Filtra correctamente en buildWhereClause
3. ✅ Usa orderBy correcto

```typescript
// Verificar en service.ts list() procedure:
'list': adminProcedure
  .input(listServicesSchema)
  .query(async ({ ctx, input }) => {
    const where = buildWhereClause({
      search: input.search,
      type: input.type,
      isActive: input.isActive,  // MUST INCLUDE
    });

    const orderBy = buildOrderByClause(input.sortBy, input.sortOrder);

    const [items, total] = await Promise.all([
      ctx.db.service.findMany({
        where,
        orderBy,
        take: input.limit,
        skip: (input.page - 1) * input.limit,
      }),
      ctx.db.service.count({ where }),
    ]);

    return {
      items,
      total,
      page: input.page,
      totalPages: Math.ceil(total / input.limit),
      limit: input.limit,
    };
  }),
```

**Validación**: Endpoint retorna isActive field para cada servicio

---

### Phase 5: Testing & Validación (GOAL-005)

**Objetivo**: Validar que refactor funciona correctamente

#### TASK-012: Crear E2E test para servicios con filtros

**Path**: `e2e/admin/services-dashboard.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Services Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login como admin
    await page.goto('/signin');
    await page.getByLabel(/email/i).fill(process.env.ADMIN_EMAIL);
    await page.getByLabel(/contraseña/i).fill(process.env.ADMIN_PASSWORD);
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    await page.waitForURL(/\/dashboard/);
  });

  test('should load services page with default state', async ({ page }) => {
    await page.goto('/admin/services');
    
    // Verificar header
    await expect(page.getByRole('heading', { name: /servicios/i })).toBeVisible();
    
    // Verificar filtros visibles
    await expect(page.getByPlaceholder(/buscar/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /nuevo servicio/i })).toBeVisible();
  });

  test('should filter by service type', async ({ page }) => {
    await page.goto('/admin/services');
    
    // Seleccionar tipo "Área"
    const typeSelect = page.locator('select, [role="combobox"]').first();
    await typeSelect.click();
    await page.getByRole('option', { name: /área/i }).click();
    
    // Verificar URL actualizada
    await page.waitForURL(/type=area/);
    await expect(page).toHaveURL(/type=area/);
  });

  test('should search services with debounce', async ({ page }) => {
    await page.goto('/admin/services');
    
    const searchInput = page.getByPlaceholder(/buscar/i);
    await searchInput.fill('Instalación');
    
    // Esperar 300ms + buffer para debounce
    await page.waitForTimeout(350);
    
    // Verificar URL actualizada
    await expect(page).toHaveURL(/search=Instalaci/);
  });

  test('should persist filters in URL for deep linking', async ({ page }) => {
    // Navegar directamente a URL con filtros
    await page.goto('/admin/services?type=fixed&isActive=active&page=2');
    
    // Verificar filtros aplicados
    await expect(page.getByRole('heading', { name: /servicios/i })).toBeVisible();
    await expect(page.getByText(/página 2/i)).toBeVisible();
  });

  test('should delete service with confirmation', async ({ page }) => {
    await page.goto('/admin/services');
    
    // Click delete button en primer servicio
    const deleteButton = page.locator('button').filter({ hasText: /eliminar/i }).first();
    await deleteButton.click();
    
    // Confirmar diálogo
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: /confirmar|eliminar/i }).click();
    
    // Verificar toast de éxito
    await expect(page.getByText(/eliminado correctamente/i)).toBeVisible();
  });

  test('should create new service', async ({ page }) => {
    await page.goto('/admin/services');
    
    // Click crear
    await page.getByRole('button', { name: /nuevo servicio/i }).click();
    
    // Verificar navegación
    await expect(page).toHaveURL(/\/admin\/services\/new/);
  });
});
```

**Validación**: Todos los tests pasan ✅

---

#### TASK-013: Unit tests para helpers (optional)

**Path**: `tests/admin/service.test.ts`

Test buildWhereClause, buildOrderByClause con diferentes inputs

**Validación**: Coverage > 80%

---

### Phase 6: UI Polish & Documentation (GOAL-006)

**Objetivo**: Mejorar UX y documentar cambios

#### TASK-014: Mejorar skeleton loading

**Path**: `src/app/(dashboard)/admin/services/page.tsx`

Actualizar `ServiceListSkeleton` para que sea más parecida a tabla real:

```typescript
function ServiceListSkeleton() {
  return (
    <div className="space-y-4">
      {/* Filter skeleton */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-10 w-[180px]" />
        <Skeleton className="h-10 w-[180px]" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-md border">
        <div className="space-y-1 border-b p-4">
          {/* Header skeleton */}
          <div className="flex justify-between">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="h-4 w-[60px]" />
          </div>
        </div>
        
        {/* Rows skeleton */}
        <div className="space-y-0 divide-y">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex justify-between p-4">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[80px]" />
              <Skeleton className="h-4 w-[60px]" />
              <Skeleton className="h-4 w-[60px]" />
              <Skeleton className="h-4 w-[40px]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

#### TASK-015: Documentar cambios en copilot instructions

**Path**: `.github/copilot-instructions.md`

Añadir sección sobre patrón server-optimized en servicios

```markdown
## Services Admin Dashboard Pattern

The `/admin/services` view follows the **server-optimized dashboard pattern**:

- **SearchParams**: `page`, `search`, `type`, `isActive`, `sortBy`, `sortOrder`
- **Suspense Key**: Template literal with all filter params
- **Filter Position**: Outside Suspense (always visible)
- **Skeleton**: 10 rows to match pagination limit
- **tRPC**: `api.admin.service.list()` with full filter support

Example URL: `/admin/services?type=area&isActive=active&page=1&search=inst`

See implementation in `/src/app/(dashboard)/admin/services/`
```

---

## 3. Alternativas Consideradas

- **ALT-001**: Mantener actual state-based approach
  - ❌ Sin sincronización URL = sin deep linking
  - ❌ Comportamiento no predecible en back/forward
  - ❌ Inconsistente con glass-types/models

- **ALT-002**: Client-side table con TanStack Table
  - ❌ Deprecated en proyecto (reemplazado por server-optimized)
  - ❌ Performance pobre con datasets grandes
  - ❌ No aprovecha Server Components

- **ALT-003**: ISR en lugar de force-dynamic
  - ❌ Admin routes no benefician de ISR (datos siempre frescos)
  - ❌ Caché puede mostrar datos stale durante edición
  - ✅ force-dynamic es correcto para admin

---

## 4. Dependencias

- **DEP-001**: Componentes reutilizables: `TableSearch`, `TableFilters`, `TablePagination` en `@/app/_components/server-table/` (ya existen)
- **DEP-002**: tRPC router admin.service debe soportar `isActive` filter (requiere TASK-007, TASK-011)
- **DEP-003**: Prisma model `Service` debe tener campo `isActive: Boolean` (verificar en schema.prisma)
- **DEP-004**: Schema validación Zod en `@/lib/validations/admin/service.schema.ts`

---

## 5. Archivos Afectados

| Archivo                                                                | Tipo                         | Descripción                               |
| ---------------------------------------------------------------------- | ---------------------------- | ----------------------------------------- |
| `/src/app/(dashboard)/admin/services/page.tsx`                         | **REFACTOR**                 | Agregar SearchParams, Suspense, skeleton  |
| `/src/app/(dashboard)/admin/services/_components/services-filters.tsx` | **CREATE**                   | Nuevo componente de filtros               |
| `/src/app/(dashboard)/admin/services/_components/service-list.tsx`     | **RENAME→services-list.tsx** | Refactorizar a server-optimized           |
| `/src/lib/validations/admin/service.schema.ts`                         | **UPDATE**                   | Agregar `isActive` field                  |
| `/src/server/api/routers/admin/service.ts`                             | **UPDATE**                   | Extender buildWhereClause para `isActive` |
| `e2e/admin/services-dashboard.spec.ts`                                 | **CREATE**                   | E2E tests para nuevas funcionalidades     |
| `.github/copilot-instructions.md`                                      | **UPDATE**                   | Documentar patrón                         |

---

## 6. Testing

### Test Strategy

| Test         | Tipo                      | Coverage   | Status |
| ------------ | ------------------------- | ---------- | ------ |
| **TEST-001** | E2E: Load default state   | Happy path | ❌      |
| **TEST-002** | E2E: Filter by type       | Happy path | ❌      |
| **TEST-003** | E2E: Search with debounce | Happy path | ❌      |
| **TEST-004** | E2E: Deep linking         | Edge case  | ❌      |
| **TEST-005** | E2E: Delete service       | CRUD       | ❌      |
| **TEST-006** | E2E: Create service       | CRUD       | ❌      |
| **TEST-007** | Unit: buildWhereClause    | Helper     | ❌      |
| **TEST-008** | Unit: buildOrderByClause  | Helper     | ❌      |

### Test Execution

```bash
# E2E tests
pnpm test:e2e e2e/admin/services-dashboard.spec.ts

# Unit tests
pnpm test tests/admin/service.test.ts
```

---

## 7. Riesgos & Suposiciones

### Risks

- **RISK-001**: Cambio significativo en comportamiento URL
  - *Mitigación*: E2E tests validan todos los escenarios
  - *Probabilidad*: BAJA (patrón ya validado en glass-types)

- **RISK-002**: Regresión en CRUD (edit/delete)
  - *Mitigación*: Mantener mutations idénticas, solo cambiar presentación
  - *Probabilidad*: MUY BAJA (code similar a glass-types)

- **RISK-003**: Performance con muchos servicios
  - *Mitigación*: Límite 20 items/página, índices DB en campos filtrados
  - *Probabilidad*: BAJA (dataset típicamente < 100 items)

### Assumptions

- **ASSUMPTION-001**: Prisma model `Service` tiene campo `isActive: Boolean` ✅
- **ASSUMPTION-002**: tRPC v11 typings funcionan correctamente ✅
- **ASSUMPTION-003**: Componentes reutilizables existen y funcionan (`TableSearch`, `TableFilters`) ✅
- **ASSUMPTION-004**: Usuarios usan navegadores modernos (soporte async/await en cliente) ✅

---

## 8. Related Specifications

### Patrones de Referencia

- [Next.js Suspense Pattern - Doc Interna](../docs/next-suspense-pattern.instructions.md)
- [Dashboard Route Standard](../docs/dashboard-route-standard.md)
- [Server-Optimized Tables](../COPILOT_INSTRUCTIONS.md#server-optimized-data-tables)

### Implementaciones Existentes

- `/admin/glass-types/page.tsx` - Referencia principal
- `/admin/models/page.tsx` - Referencia alternativa
- `/admin/profiles/page.tsx` - Potencial tercera referencia

### Especificaciones Relacionadas

- [011-admin-catalog-management](../specs/011-admin-catalog-management/) - Epic umbrella

---

## Checklist de Implementación

### Pre-Implementation

- [ ] Revisar este plan con equipo
- [ ] Validar que Prisma Service model tenga `isActive` field
- [ ] Validar que componentes reutilizables existen

### Implementation

- [ ] TASK-006: Refactorizar page.tsx
- [ ] TASK-007: Extender tRPC schema
- [ ] TASK-008: Crear ServicesFilters
- [ ] TASK-009: Refactorizar ServicesList
- [ ] TASK-010: Validar tRPC schema
- [ ] TASK-011: Extender tRPC router
- [ ] TASK-012: Crear E2E tests
- [ ] TASK-013: Crear unit tests (optional)
- [ ] TASK-014: Mejorar skeleton
- [ ] TASK-015: Documentar cambios

### Post-Implementation

- [ ] Ejecutar `pnpm test:e2e` - Todos los tests pasan
- [ ] Ejecutar `pnpm typecheck` - Sin errores TS
- [ ] Ejecutar `pnpm lint:fix` - Código formateado
- [ ] Revisar página en navegador - UX correcta
- [ ] Validar URLs compartibles - Deep linking funciona
- [ ] Validar back/forward - Navegación correcta
- [ ] Deplegar a staging para QA

---

## Métricas de Éxito

✅ **Funcional**: Todos los filtros funcionan y se sincronizan con URL  
✅ **Performance**: Carga < 2s con 20 items  
✅ **UX**: Skeleton muestra durante carga  
✅ **Testabilidad**: E2E tests pasan 100%  
✅ **Consistency**: Mismo patrón que glass-types/models  
✅ **Scalability**: Soporta 100+ items sin degradación  

---

**Documento generado**: 2025-10-20  
**Siguiente revisión**: Post-implementación  
**Propietario**: Andres
