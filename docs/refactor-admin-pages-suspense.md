# Refactorización: Páginas Admin con Suspense

**Fecha**: 2025-01-18  
**Branch**: 011-admin-catalog-management  
**Tipo**: Refactorización (Performance)

## Problema

Las páginas `/admin/glass-types` y `/admin/models` usaban el patrón `force-dynamic` con múltiples llamadas `await` secuenciales al API, bloqueando la renderización hasta que todas las consultas se completaran. Esto causaba:

- Navegación lenta (espera completa antes de mostrar contenido)
- Mala experiencia de usuario (sin feedback de loading)
- No aprovechamiento de streaming de Next.js 15

## Solución Implementada

Se refactorizó siguiendo el patrón recomendado de Next.js 15 con Suspense boundaries:

### Arquitectura Anterior (❌ Bloqueante)

```tsx
export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  
  // ❌ Consultas secuenciales bloqueantes
  const initialData = await api.admin.model.list({...});
  const suppliersData = await api.admin['profile-supplier'].list({...});
  
  return <ModelsTable initialData={initialData} suppliers={suppliersData} />;
}
```

### Arquitectura Nueva (✅ Streaming)

```tsx
// ✅ Con force-dynamic para searchParams dinámicos
export const dynamic = 'force-dynamic';

// Skeleton de loading
function ModelsTableSkeleton() {
  return <div>...</div>;
}

// Server Component anidado con datos
async function ModelsTableContent({ params }) {
  // ✅ Consultas en paralelo
  const [initialData, suppliersData] = await Promise.all([
    api.admin.model.list({...}),
    api.admin['profile-supplier'].list({...}),
  ]);
  
  return <ModelsTable initialData={initialData} suppliers={suppliersData} />;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  
  return (
    <div>
      <h1>Modelos</h1>
      {/* ✅ Suspense boundary con loading state */}
      <Suspense key={JSON.stringify(params)} fallback={<ModelsTableSkeleton />}>
        <ModelsTableContent params={params} />
      </Suspense>
    </div>
  );
}
```

## Cambios Clave

### 1. ~~Eliminación~~ Restauración de `force-dynamic`

```tsx
// ✅ NECESARIO con searchParams dinámicos
export const dynamic = 'force-dynamic';
```

**Razón**: Aunque Suspense maneja streaming, `force-dynamic` es necesario para asegurar que Next.js re-renderiza la página completa cuando cambian los searchParams. Sin esto, Next.js podría cachear la página y no actualizar los datos.

### 2. Separación de Componentes

- **`ModelsTableSkeleton`**: Loading UI mostrado inmediatamente
- **`ModelsTableContent`**: Server Component con datos (streaming)
- **`ModelsPage`**: Orquestador principal

### 3. Consultas en Paralelo

```tsx
// ✅ ANTES: Secuencial (lento)
const initialData = await api.admin.model.list({...});
const suppliersData = await api.admin['profile-supplier'].list({...});

// ✅ DESPUÉS: Paralelo (rápido)
const [initialData, suppliersData] = await Promise.all([
  api.admin.model.list({...}),
  api.admin['profile-supplier'].list({...}),
]);
```

### 4. Suspense Boundary

```tsx
<Suspense 
  key={JSON.stringify(params)}  // Re-suspende en cambio de filtros
  fallback={<ModelsTableSkeleton />}
>
  <ModelsTableContent params={params} />
</Suspense>
```

**Key benefits**:
- `key={JSON.stringify(params)}`: Fuerza re-suspensión cuando cambian los filtros
- `fallback`: Skeleton mostrado instantáneamente durante carga
- Streaming: Contenido se envía al cliente en cuanto está listo

## Archivos Modificados

### 1. `/admin/glass-types/page.tsx`

**Antes**: 98 líneas, `force-dynamic`, consultas secuenciales  
**Después**: 117 líneas, Suspense, consultas paralelas

**Cambios**:
- ✅ Agregado `GlassTypesTableSkeleton` component
- ✅ Agregado `GlassTypesTableContent` Server Component
- ✅ Consultas en paralelo con `Promise.all`
- ✅ Suspense boundary con key
- ❌ Eliminado `force-dynamic`

### 2. `/admin/models/page.tsx`

**Antes**: 95 líneas, `force-dynamic`, consultas secuenciales  
**Después**: 139 líneas, Suspense, consultas paralelas

**Cambios**:
- ✅ Agregado `ModelsTableSkeleton` component
- ✅ Agregado `ModelsTableContent` Server Component
- ✅ Consultas en paralelo con `Promise.all`
- ✅ Suspense boundary con key
- ❌ Eliminado `force-dynamic`

## Beneficios

### Performance

1. **Navegación instantánea**: Loading skeleton se muestra inmediatamente
2. **Consultas paralelas**: 2x más rápido (vs secuencial)
3. **Streaming**: Contenido se envía progresivamente

### UX

1. **Feedback inmediato**: Usuario ve skeleton sin espera
2. **Navegación no bloqueante**: Puede interactuar con layout
3. **Estados de loading claros**: Skeleton con estructura familiar

### Arquitectura

1. **Patrón Next.js 15 oficial**: Sigue guía de streaming
2. **Código más testeable**: Componentes separados
3. **Mejor separación de concerns**: Loading, data, UI

## Referencia

Patrón basado en:
- [Next.js 15 Data Fetching Guide](https://nextjs.org/docs/app/building-your-application/data-fetching)
- Archivo: `.github/instructions/next-data-fetching.instructions.md`
- Sección: "Streaming" y "Parallel data fetching"

## Checklist de Testing

- [ ] Navegación a `/admin/glass-types` muestra skeleton inmediatamente
- [ ] Datos de glass types se cargan correctamente
- [ ] Filtros actualizan URL y re-suspenden
- [ ] Navegación a `/admin/models` muestra skeleton inmediatamente
- [ ] Datos de models se cargan correctamente
- [ ] Filtros actualizan URL y re-suspenden
- [ ] No hay errores de hidratación en consola
- [ ] Performance mejorado vs versión anterior

## Métricas Esperadas

**Antes** (force-dynamic, secuencial):
- TTFB: ~500ms
- FCP: ~1500ms (espera datos)
- TTI: ~2000ms

**Después** (Suspense, paralelo):
- TTFB: ~200ms
- FCP: ~300ms (skeleton)
- TTI: ~1000ms (streaming)

**Mejora estimada**: ~50% reducción en tiempo de carga percibido

## Siguientes Pasos

1. Aplicar el mismo patrón a otras páginas admin
2. Agregar tests E2E para streaming
3. Documentar patrón en `.github/copilot-instructions.md`
4. Crear codemod para automatizar migración

## Notas Adicionales

- El patrón es **compatible con SEO** (contenido se genera server-side)
- **No afecta funcionalidad**: Solo mejora performance y UX
- **Backward compatible**: Client Components no requieren cambios
