# RFC: Estrategia de Loaders y Suspense para Rutas del Dashboard

**Estado**: Implementado  
**Fecha**: 2025-10-20  
**Autor**: Equipo Glasify Lite  

## Resumen Ejecutivo

Este RFC define la estrategia oficial para el manejo de estados de carga en rutas administrativas del dashboard. La estrategia prioriza la visualización inmediata del contenido crítico (listas, filtros) mientras permite el streaming de componentes secundarios más lentos, sin sacrificar el TTI (Time to Interactive).

## Problema

En las rutas del dashboard (`/admin/services`, `/admin/profile-suppliers`, etc.), el uso indiscriminado de `loading.tsx` a nivel de ruta bloquea el renderizado del contenido esencial cuando hay partes lentas (tablas grandes, widgets de reportes, consultas complejas).

**Consecuencias actuales**:
- Usuarios ven pantalla blanca o skeleton completo hasta que TODA la ruta resuelva
- Filtros y controles desaparecen durante loading
- Formularios de crear/editar no pueden abrirse hasta que termine la carga
- TTI aumenta innecesariamente

## Objetivo

Definir una estrategia reproducible en Next.js 15 + React Server Components para que:

1. **Contenido crítico** (lista, filtros) se muestre de inmediato
2. **Formularios** de crear/editar se abran sin bloquear vista de lectura
3. **Partes lentas** se streameen con fallbacks granulares (skeletons)
4. **Mínimo coste** de hidratación del cliente

## Contexto del Repositorio

- **Framework**: Next.js 15.5.4 + React 19 + App Router
- **Patrón preferido**: Server-first (Server Components por defecto)
- **CRUD Pattern**: Dialog-based forms (modales para crear/editar)
- **Admin Routes**: Bajo `app/(dashboard)/admin/*`
- **Regla importante**: Admin routes DEBEN usar `export const dynamic = 'force-dynamic'`
- **Mutaciones**: Patrón two-step invalidation (`invalidate()` + `router.refresh()`)

## Decisión: Estrategia Adoptada

### Regla General

**Para rutas admin: Usar `<Suspense>` granular + dialog-based forms**

❌ **Evitar `loading.tsx`** en rutas que combinan:
- Contenido crítico (listas, filtros)
- Contenido secundario (widgets lentos, reportes)

✅ **Usar `loading.tsx`** SOLO cuando:
- Se desea bloquear intencionalmente toda la ruta
- TODA la ruta depende de una única petición crítica
- Es página de onboarding o transición completa

### Patrón Oficial: Server-First + Suspense Granular

```tsx
/**
 * Admin Page Pattern
 * 
 * Características:
 * - force-dynamic para SSR sin cache
 * - Filtros FUERA de Suspense (siempre visibles)
 * - Contenido crítico en Suspense con key dinámico
 * - Skeletons ligeros (HTML/CSS, sin lógica cliente)
 */

import { Suspense } from 'react'
import type { Metadata } from 'next'
import { api } from '@/trpc/server-client'

export const metadata: Metadata = {
  title: 'Feature | Admin',
  description: 'Descripción',
}

// IMPORTANTE: force-dynamic para admin routes
export const dynamic = 'force-dynamic'

type SearchParams = Promise<{
  page?: string
  search?: string
  // ... otros filtros
}>

// 1. Skeleton Component (ligero, sin JS cliente)
function FeatureTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-full max-w-sm" />
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
  )
}

// 2. Content Component (Server Component que carga datos)
async function FeatureTableContent({ 
  params 
}: { 
  params: Awaited<SearchParams> 
}) {
  const page = Number(params.page) || 1
  const search = params.search || undefined
  
  // Fetch data (dentro de Suspense)
  const data = await api.admin.feature.list({
    page,
    search,
    limit: 20,
  })
  
  // Transform Decimal fields si necesario
  const serializedData = {
    ...data,
    items: data.items.map(item => ({
      ...item,
      price: item.price.toNumber(),
    })),
  }
  
  return <FeatureTable initialData={serializedData} />
}

// 3. Page Component (orquestador)
export default async function FeaturePage({ 
  searchParams 
}: { 
  searchParams: SearchParams 
}) {
  const params = await searchParams
  
  return (
    <div className="space-y-6">
      {/* Header - static, se muestra inmediatamente */}
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Feature</h1>
        <p className="text-muted-foreground">Descripción</p>
      </div>
      
      {/* Filtros - FUERA de Suspense, siempre visibles */}
      <FeatureFilters searchParams={params} />
      
      {/* Tabla - DENTRO de Suspense, streaming */}
      <Suspense 
        key={JSON.stringify(params)}  // CRÍTICO: re-suspende con cambios
        fallback={<FeatureTableSkeleton />}
      >
        <FeatureTableContent params={params} />
      </Suspense>
    </div>
  )
}
```

## Dialog-Based CRUD Pattern

### Crear (Nuevo)

```tsx
'use client'

// En el client wrapper (ej: services-content.tsx)
export function ServicesContent({ initialData }) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  
  return (
    <>
      {/* Dialog se abre inmediatamente */}
      <ServiceDialog 
        mode="create" 
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
      
      {/* Botón en filtros */}
      <ServicesFilters 
        onCreateClick={() => setCreateDialogOpen(true)} 
      />
      
      <ServicesList initialData={initialData} />
    </>
  )
}
```

### Editar

**Opción A: Si la lista contiene todos los campos necesarios**

```tsx
'use client'

export function ServicesList({ initialData }) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  
  const handleEdit = (service) => {
    setSelectedService(service)
    setEditDialogOpen(true)
  }
  
  return (
    <>
      <ServiceDialog 
        mode="edit"
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        defaultValues={selectedService}  // Datos ya disponibles
      />
      
      {/* Tabla */}
      {initialData.items.map(service => (
        <TableRow key={service.id}>
          {/* ... */}
          <Button onClick={() => handleEdit(service)}>Editar</Button>
        </TableRow>
      ))}
    </>
  )
}
```

**Opción B: Si necesita fetch adicional**

```tsx
'use client'

export function ServiceDialog({ id, open, onOpenChange }) {
  // Fetch dentro del dialog
  const { data: details } = api.admin.service.getById.useQuery(
    { id },
    { enabled: !!id && open }
  )
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {details ? (
          <ServiceForm defaultValues={details} />
        ) : (
          <FormSkeleton />  // Skeleton mientras carga
        )}
      </DialogContent>
    </Dialog>
  )
}
```

### Mutaciones: Two-Step Invalidation (OBLIGATORIO en SSR)

```tsx
'use client'

import { useRouter } from 'next/navigation'

export function useServiceMutations() {
  const utils = api.useUtils()
  const router = useRouter()
  
  const createMutation = api.admin.service.create.useMutation({
    onSuccess: () => {
      toast.success('Servicio creado')
    },
    onSettled: () => {
      // Paso 1: Invalidar cache cliente
      void utils.admin.service.list.invalidate()
      
      // Paso 2: Forzar re-ejecución del Server Component
      router.refresh()  // ⚠️ CRÍTICO para SSR con force-dynamic
    },
  })
  
  return { createMutation }
}
```

**¿Por qué dos pasos?**
- `invalidate()`: Limpia cache de TanStack Query en cliente
- `router.refresh()`: Fuerza Next.js a re-ejecutar Server Component con datos frescos

## Árbol de Decisión

```
¿Necesitas cargar datos en una ruta admin?
│
├─ ¿Es contenido crítico que debe verse INMEDIATAMENTE?
│  ├─ SÍ → Fetch FUERA de Suspense
│  └─ NO → Fetch DENTRO de Suspense
│
├─ ¿Hay múltiples fuentes de latencia diferentes?
│  ├─ SÍ → Usar Suspense granular (un boundary por fuente)
│  └─ NO → ¿Es toda la ruta lenta?
│     ├─ SÍ → loading.tsx aceptable
│     └─ NO → Suspense granular para parte lenta
│
└─ ¿Hay formularios de crear/editar?
   ├─ SÍ → Dialog-based (no navigation-based)
   └─ NO → Continuar con patrón actual
```

## Casos de Uso Concretos

### Caso 1: Lista con Filtros (Lectura)

**Recomendación**: Suspense granular

- ✅ Header fuera de Suspense
- ✅ Filtros fuera de Suspense
- ✅ Tabla dentro de Suspense con key dinámico
- ✅ Skeleton ligero que replica estructura

**Ejemplo**: `/admin/services`, `/admin/profile-suppliers`

### Caso 2: Lista + Widget de Estadísticas Lento

**Recomendación**: Dos Suspense boundaries independientes

```tsx
<>
  <Filters />  {/* Fuera de Suspense */}
  
  <Suspense key={tableKey} fallback={<TableSkeleton />}>
    <TableContent />
  </Suspense>
  
  <Suspense fallback={<StatsSkeleton />}>
    <StatsWidget />  {/* Independiente, no bloquea tabla */}
  </Suspense>
</>
```

### Caso 3: Formulario de Creación

**Recomendación**: Dialog que abre inmediatamente

- ❌ NO: Navegación a `/new` que espera datos
- ✅ SÍ: Modal que abre sin fetch (o fetch mínimo dentro)

### Caso 4: Formulario de Edición

**Recomendación**: 

- Si datos en lista → Pasar defaultValues al dialog
- Si necesita fetch pesado → Fetch dentro del dialog con skeleton

### Caso 5: Layout con Header de Usuario

**Recomendación**: Aislar header si es lento

```tsx
// layout.tsx
export default function Layout({ children }) {
  return (
    <>
      <Suspense fallback={<HeaderSkeleton />}>
        <UserHeader />  {/* Fetch de usuario aquí */}
      </Suspense>
      
      {children}  {/* No bloqueado por header */}
    </>
  )
}
```

## Checklist de Implementación

Cuando implementes o audites una ruta admin:

- [ ] ✅ Usa `export const dynamic = 'force-dynamic'`
- [ ] ✅ Define `SearchParams` como `Promise<{...}>`
- [ ] ✅ Header estático fuera de Suspense
- [ ] ✅ Filtros fuera de Suspense (siempre visibles)
- [ ] ✅ Tabla/contenido crítico dentro de Suspense
- [ ] ✅ Suspense con `key={JSON.stringify(params)}`
- [ ] ✅ Skeleton ligero (sin lógica cliente)
- [ ] ✅ Dialog-based CRUD (no navigation-based)
- [ ] ✅ Mutaciones usan two-step invalidation
- [ ] ✅ E2E tests validan streaming behavior

## Anti-Patterns (❌ NO HACER)

### 1. loading.tsx que bloquea contenido crítico

```tsx
// ❌ BAD: Filtros desaparecen durante loading
// app/admin/services/loading.tsx
export default function Loading() {
  return <FullPageSkeleton />
}

// ✅ GOOD: Sin loading.tsx, usar Suspense granular
```

### 2. Contenido estático dentro de Suspense

```tsx
// ❌ BAD: Header espera datos innecesariamente
<Suspense fallback={<Skeleton />}>
  <h1>Servicios</h1>  {/* No necesita datos */}
  <ServicesList />
</Suspense>

// ✅ GOOD: Header fuera
<h1>Servicios</h1>
<Suspense fallback={<Skeleton />}>
  <ServicesList />
</Suspense>
```

### 3. Suspense sin key dinámico

```tsx
// ❌ BAD: No re-suspende con cambio de filtros
<Suspense fallback={<Skeleton />}>
  <TableContent params={params} />
</Suspense>

// ✅ GOOD: Re-suspende cuando cambian filtros
<Suspense key={JSON.stringify(params)} fallback={<Skeleton />}>
  <TableContent params={params} />
</Suspense>
```

### 4. Mutaciones sin router.refresh() en SSR

```tsx
// ❌ BAD: Cache invalidado pero Server Component no se actualiza
onSettled: () => {
  void utils.admin.service.list.invalidate()
  // Falta router.refresh()
}

// ✅ GOOD: Two-step invalidation
onSettled: () => {
  void utils.admin.service.list.invalidate()
  router.refresh()  // Re-ejecuta Server Component
}
```

### 5. Navigation-based forms en lugar de dialogs

```tsx
// ❌ BAD: Navegación bloquea interacción con lista
<Button onClick={() => router.push('/admin/services/new')}>
  Crear
</Button>

// ✅ GOOD: Dialog abre inmediatamente
<Button onClick={() => setDialogOpen(true)}>
  Crear
</Button>
```

## Implementación en el Proyecto

### Rutas Ya Implementadas

✅ **`/admin/models`** - Patrón completo
- Suspense granular con key dinámico
- Filtros fuera de Suspense
- Skeleton ligero
- Dialog-based CRUD

✅ **`/admin/glass-types`** - Patrón completo
- Suspense granular con key dinámico
- Filtros fuera de Suspense
- Skeleton ligero

### Rutas Actualizadas por este RFC

✅ **`/admin/services`** - Migrado a Suspense granular
- Antes: SSR sin Suspense (bloqueo completo)
- Después: Suspense granular + filtros siempre visibles

✅ **`/admin/profile-suppliers`** - Migrado a Suspense granular
- Antes: SSR sin Suspense (bloqueo completo)
- Después: Suspense granular + filtros siempre visibles

### Ejemplo Real: Services

Ver implementación completa en:
- `src/app/(dashboard)/admin/services/page.tsx`
- `src/app/(dashboard)/admin/services/_components/services-content.tsx`

## Testing Strategy

### E2E Tests (Playwright)

Los tests deben validar:

1. **Filtros siempre visibles durante loading**
   ```ts
   test('Filters should be visible during loading', async ({ page }) => {
     await page.goto('/admin/services')
     await expect(page.getByPlaceholder(/buscar/i)).toBeVisible()
   })
   ```

2. **Contenido crítico se muestra antes que secundario**
   ```ts
   test('Table should load independently of stats', async ({ page }) => {
     await page.goto('/admin/services')
     
     // Table debería estar visible primero
     await expect(page.locator('table')).toBeVisible()
     
     // Stats pueden tardar más (si existen)
     // No bloquean tabla
   })
   ```

3. **Dialogs abren inmediatamente**
   ```ts
   test('Create dialog should open immediately', async ({ page }) => {
     await page.goto('/admin/services')
     await page.getByRole('button', { name: /nuevo/i }).click()
     
     // Dialog visible en <200ms
     await expect(page.getByRole('dialog')).toBeVisible({ timeout: 200 })
   })
   ```

4. **Mutaciones actualizan vista SSR**
   ```ts
   test('Create should refresh list with new item', async ({ page }) => {
     await page.goto('/admin/services')
     
     // Crear servicio
     await page.getByRole('button', { name: /nuevo/i }).click()
     // ... llenar form y submit
     
     // Lista debe actualizarse (router.refresh)
     await expect(page.getByText('Nuevo Servicio')).toBeVisible()
   })
   ```

## Métricas de Éxito

- ✅ **TTI**: Reducción o neutralidad vs estado anterior
- ✅ **LCP**: Contenido crítico visible más rápido
- ✅ **CLS**: Sin layout shifts por loading tardío
- ✅ **UX**: Filtros siempre interactivos, dialogs instantáneos
- ✅ **Performance**: Queries paralelas donde aplicable

## Referencias

- [Next.js 15 Streaming](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
- [React Suspense](https://react.dev/reference/react/Suspense)
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- Implementación en: `src/app/(dashboard)/admin/models/page.tsx`
- Instrucciones: `.github/instructions/next-suspense-pattern.instructions.md`

## Changelog

- **2025-10-20**: RFC creado e implementado en `/admin/services` y `/admin/profile-suppliers`
