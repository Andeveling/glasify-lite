# Patrón: Páginas Admin con Suspense y Streaming

Este documento describe el patrón oficial para páginas admin en Glasify Lite que necesitan cargar datos del servidor.

## Cuándo Usar Este Patrón

✅ **USA este patrón cuando**:
- Página necesita cargar datos del servidor
- Datos dependen de filtros en URL (searchParams)
- Quieres mostrar feedback de loading inmediato
- Múltiples consultas pueden ejecutarse en paralelo

❌ **NO uses este patrón cuando**:
- Página es completamente estática (sin datos dinámicos)
- Datos ya están disponibles en props (Server Component hijo)
- Loading state no es necesario (datos súper rápidos)

## Estructura Básica

```tsx
/**
 * [Feature] List Page
 *
 * Server Component with Suspense boundaries for streaming
 */

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { api } from '@/trpc/server-client';
import { FeatureTable } from './_components/feature-table';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Feature | Admin',
  description: 'Descripción de la página',
};

// Force dynamic rendering for searchParams-based pages
// This ensures page re-renders when URL params change
export const dynamic = 'force-dynamic';

// 1. Define tipos para searchParams (Promise en Next.js 15)
type SearchParams = Promise<{
  page?: string;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}>;

type PageProps = {
  searchParams: SearchParams;
};

// 2. Loading skeleton component
function FeatureTableSkeleton() {
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

// 3. Server Component que carga datos
async function FeatureTableContent({ params }: { params: Awaited<SearchParams> }) {
  // Parse search params
  const page = Number(params.page) || 1;
  const search = params.search || undefined;
  const status = params.status && params.status !== 'all' ? params.status : undefined;
  const sortBy = params.sortBy || 'createdAt';
  const sortOrder = params.sortOrder || 'desc';

  // ✅ Consultas en paralelo (más rápido)
  const [data, relatedData] = await Promise.all([
    api.feature.list({
      page,
      search,
      status,
      sortBy,
      sortOrder,
      limit: 20,
    }),
    api.feature.getRelatedData(),
  ]);

  // Transform Decimal fields si es necesario
  const serializedData = {
    ...data,
    items: data.items.map((item) => ({
      ...item,
      price: item.price.toNumber(),
    })),
  };

  return <FeatureTable initialData={serializedData} relatedData={relatedData} searchParams={params} />;
}

// 4. Página principal con Suspense boundary
export default async function FeaturePage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      {/* Header - se muestra inmediatamente */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Feature</h1>
        <p className="text-muted-foreground">Descripción de la funcionalidad</p>
      </div>

      {/* Suspense boundary - muestra skeleton hasta que datos estén listos */}
      <Suspense key={JSON.stringify(params)} fallback={<FeatureTableSkeleton />}>
        <FeatureTableContent params={params} />
      </Suspense>
    </div>
  );
}
```

## Componentes Clave

### 1. Loading Skeleton

**Propósito**: Mostrar estructura de la tabla mientras datos se cargan

```tsx
function FeatureTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Filters area */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-full max-w-sm" /> {/* Search */}
        <Skeleton className="h-10 w-[180px]" />      {/* Filter 1 */}
        <Skeleton className="h-10 w-[180px]" />      {/* Filter 2 */}
      </div>
      
      {/* Table area */}
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
```

**Tips**:
- Replica estructura visual de la tabla real
- Usa `Skeleton` de shadcn/ui
- Ajusta cantidad de rows según límite de paginación
- Incluye skeletons para filtros si aplica

### 2. Data Content Component

**Propósito**: Server Component que carga datos y renderiza tabla

```tsx
async function FeatureTableContent({ params }: { params: Awaited<SearchParams> }) {
  // 1. Parse searchParams
  const page = Number(params.page) || 1;
  const search = params.search || undefined;
  
  // 2. ✅ Consultas en paralelo
  const [data, relatedData] = await Promise.all([
    api.feature.list({ page, search }),
    api.feature.getRelatedData(),
  ]);
  
  // 3. Transform Prisma Decimal fields
  const serializedData = transformDecimals(data);
  
  // 4. Render table
  return <FeatureTable initialData={serializedData} relatedData={relatedData} />;
}
```

**Tips**:
- **SIEMPRE** usa `Promise.all` para consultas independientes
- Transform `Decimal` fields a `number` antes de pasar a Client Components
- Mantén lógica de parsing simple (delega a tRPC procedures si es complejo)
- Tipo `params` como `Awaited<SearchParams>` para TypeScript

### 3. Main Page Component

**Propósito**: Orquestador principal con Suspense boundary

```tsx
export default async function FeaturePage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      {/* ✅ Static content - se muestra inmediatamente */}
      <div>
        <h1>Feature</h1>
        <p>Description</p>
      </div>

      {/* ✅ Suspense boundary con key dinámico */}
      <Suspense 
        key={JSON.stringify(params)}  // Re-suspende cuando cambian filtros
        fallback={<FeatureTableSkeleton />}
      >
        <FeatureTableContent params={params} />
      </Suspense>
    </div>
  );
}
```

**Tips**:
- `key={JSON.stringify(params)}`: **CRÍTICO** para re-suspensión en cambio de filtros
- Contenido estático (headers) fuera de Suspense
- Un solo Suspense boundary por página (no anidar innecesariamente)

## Checklist de Implementación

Cuando crees una nueva página admin, verifica:

- [ ] ✅ Usa `export const dynamic = 'force-dynamic'` (necesario para searchParams)
- [ ] ✅ Define `SearchParams` como `Promise<{...}>`
- [ ] ✅ Crea `FeatureTableSkeleton` component
- [ ] ✅ Crea `FeatureTableContent` async Server Component
- [ ] ✅ Usa `Promise.all` para consultas paralelas
- [ ] ✅ Transform `Decimal` fields a `number`
- [ ] ✅ Wrap content en `<Suspense key={JSON.stringify(params)}>`
- [ ] ✅ Fallback apunta a skeleton component
- [ ] ✅ Header fuera de Suspense boundary

## Ejemplos Reales

### Ejemplo 1: Glass Types List

```tsx
// src/app/(dashboard)/admin/glass-types/page.tsx

async function GlassTypesTableContent({ params }: { params: Awaited<SearchParams> }) {
  const page = Number(params.page) || 1;
  const purpose = params.purpose && params.purpose !== 'all' ? params.purpose : undefined;
  const glassSupplierId = params.glassSupplierId && params.glassSupplierId !== 'all' ? params.glassSupplierId : undefined;
  const isActive = (params.isActive && params.isActive !== 'all' ? params.isActive : 'all') as 'all' | 'active' | 'inactive';

  // ✅ Consultas en paralelo
  const [initialData, suppliersData] = await Promise.all([
    api.admin['glass-type'].list({
      page,
      purpose,
      glassSupplierId,
      isActive,
      limit: 20,
    }),
    api.admin['glass-supplier'].list({
      isActive: 'active',
      limit: 100,
    }),
  ]);

  // ✅ Transform Decimal fields
  const serializedData = {
    ...initialData,
    items: initialData.items.map((glassType) => ({
      ...glassType,
      pricePerSqm: glassType.pricePerSqm.toNumber(),
      uValue: glassType.uValue?.toNumber() ?? null,
    })),
  };

  return <GlassTypesTable initialData={serializedData} suppliers={suppliersData.items} />;
}
```

### Ejemplo 2: Models List

```tsx
// src/app/(dashboard)/admin/models/page.tsx

async function ModelsTableContent({ params }: { params: Awaited<SearchParams> }) {
  const page = Number(params.page) || 1;
  const status = (params.status && params.status !== 'all' ? params.status : 'all') as 'all' | 'draft' | 'published';

  // ✅ Consultas en paralelo
  const [initialData, suppliersData] = await Promise.all([
    api.admin.model.list({ page, status, limit: 20 }),
    api.admin['profile-supplier'].list({ isActive: 'active' }),
  ]);

  // ✅ Transform Decimal fields
  const serializedData = {
    ...initialData,
    items: initialData.items.map((model) => ({
      ...model,
      basePrice: model.basePrice.toNumber(),
      costPerMmWidth: model.costPerMmWidth.toNumber(),
      costPerMmHeight: model.costPerMmHeight.toNumber(),
    })),
  };

  return <ModelsTable initialData={serializedData} suppliers={suppliersData.items} />;
}
```

## Anti-Patterns (❌ NO HACER)

### 1. NO omitas `force-dynamic` con searchParams

```tsx
// ❌ BAD - Página puede no actualizarse con cambios de filtros
export default async function Page({ searchParams }) {
  const data = await api.feature.list();
  return <FeatureTable data={data} />;
}

// ✅ GOOD - force-dynamic asegura re-renders
export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }) {
  return (
    <Suspense>
      <FeatureTableContent params={params} />
    </Suspense>
  );
}
```

**Por qué**: Next.js puede cachear la página con searchParams si no especificas `force-dynamic`, causando que los filtros no actualicen los datos.

### 2. NO hagas consultas secuenciales

```tsx
// ❌ BAD - Secuencial (lento)
const data = await api.feature.list();
const relatedData = await api.feature.getRelated();

// ✅ GOOD - Paralelo (rápido)
const [data, relatedData] = await Promise.all([
  api.feature.list(),
  api.feature.getRelated(),
]);
```

**Por qué**: Consultas independientes deben ejecutarse en paralelo.

### 3. NO olvides el key en Suspense

```tsx
// ❌ BAD - No re-suspende en cambio de filtros
<Suspense fallback={<Skeleton />}>
  <FeatureTableContent params={params} />
</Suspense>

// ✅ GOOD - Re-suspende cuando cambian filtros
<Suspense key={JSON.stringify(params)} fallback={<Skeleton />}>
  <FeatureTableContent params={params} />
</Suspense>
```

**Por qué**: Sin key, cambios de filtros no activan re-suspensión.

### 4. NO pongas contenido estático dentro de Suspense

```tsx
// ❌ BAD - Header también espera datos
<Suspense fallback={<Skeleton />}>
  <h1>Feature</h1>
  <FeatureTableContent params={params} />
</Suspense>

// ✅ GOOD - Header se muestra inmediatamente
<h1>Feature</h1>
<Suspense fallback={<Skeleton />}>
  <FeatureTableContent params={params} />
</Suspense>
```

**Por qué**: Contenido que no depende de datos debe mostrarse inmediatamente.

## Beneficios de Este Patrón

### Performance

- ⚡ **Navegación instantánea**: Loading skeleton se muestra sin espera
- ⚡ **Consultas paralelas**: Hasta 2-3x más rápido que secuencial
- ⚡ **Streaming**: Contenido progresivo, no bloqueante

### UX

- 👍 **Feedback inmediato**: Usuario sabe que algo está cargando
- 👍 **Interactividad temprana**: Puede usar navegación mientras carga
- 👍 **Estados claros**: Skeleton muestra estructura esperada

### Arquitectura

- 🏗️ **Patrón oficial Next.js 15**: Sigue mejores prácticas
- 🏗️ **Código testeable**: Componentes separados, fácil de mockear
- 🏗️ **Separación de concerns**: Loading, data, UI independientes

## Referencias

- [Next.js 15 Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [React Suspense](https://react.dev/reference/react/Suspense)
- [Streaming en Next.js](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)

## Ejemplos en el Proyecto

Ver implementaciones reales en:
- `/admin/glass-types/page.tsx`
- `/admin/models/page.tsx`
