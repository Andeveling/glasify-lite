---
goal: Implementar sistema de galería de imágenes escalable para modelos con carga automática y selección en la UI
version: 1.0
date_created: 2025-10-26
last_updated: 2025-10-26
owner: Engineering Team
status: 'Planned'
tags: ['feature', 'gallery', 'models', 'ui', 'automation']
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

Implementar un sistema de galería de imágenes escalable para asociar URLs de imágenes a modelos de ventanas y puertas. El sistema debe:
- Detectar automáticamente nuevas imágenes en `/public/models/designs/`
- Proporcionar una API para obtener la lista de imágenes disponibles
- Permitir seleccionar y asociar una imagen a cada modelo
- Usar la imagen asociada en componentes como `ModelCard` y vistas de detalle

## Justificación

El campo `imageUrl` ya existe en el schema Prisma. Este plan proporciona la infraestructura completa para:
1. Descubrir dinámicamente las imágenes disponibles
2. Seleccionarlas en la UI de administración de modelos
3. Mostrarlas en la galería de catálogo

---

## 1. Requirements & Constraints

- **REQ-001**: Sistema debe detectar automáticamente nuevas imágenes en `/public/models/designs/`
- **REQ-002**: API debe retornar lista de imágenes disponibles con rutas accesibles
- **REQ-003**: ModelForm debe incluir selector visual de imágenes (preview + galería)
- **REQ-004**: ModelCard debe mostrar imagen asociada si existe, placeholder si no
- **REQ-005**: Campo `imageUrl` en schema Prisma ya existe (migración completada)
- **REQ-006**: Sistema debe ser escalable (agregar imágenes sin cambiar código)
- **REQ-007**: Rutas de imágenes deben ser URL-friendly y consistentes
- **REQ-008**: Validación de URLs debe ocurrir en backend (tRPC)

- **CON-001**: Las imágenes deben estar en `/public/models/designs/` para acceso estático
- **CON-002**: Sistema basado en archivos (no base de datos de metadatos)
- **CON-003**: Formatos soportados: SVG, PNG, JPG, WebP (especificados en validación)

- **PAT-001**: Usar tRPC procedure para listar imágenes disponibles
- **PAT-002**: Implementar Client Component para selector de imágenes
- **PAT-003**: SSR cache invalidation pattern para actualizaciones
- **PAT-004**: TypeScript strict mode en todos los archivos nuevos

---

## 2. Implementation Steps

### Implementation Phase 1: Backend - API de Galería

**GOAL-001**: Implementar tRPC procedure para obtener lista de imágenes de galería

| Task     | Description                                                                                                | Completed | Date |
| -------- | ---------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-001 | Crear utility function `get-gallery-images.ts` en `src/lib/gallery/` que escanea `/public/models/designs/` |           |      |
| TASK-002 | Implementar validación de extensiones permitidas (SVG, PNG, JPG, WebP)                                     |           |      |
| TASK-003 | Crear tRPC procedure `admin.gallery.list-images` que retorna array de `{name, url, filename}`              |           |      |
| TASK-004 | Agregar tests para verificar detección correcta de imágenes                                                |           |      |
| TASK-005 | Documentar estructura de respuesta de API con ejemplos                                                     |           |      |

**Entrada**: Ninguna  
**Salida**: Endpoint tRPC funcional que retorna lista de imágenes disponibles

---

### Implementation Phase 2: Frontend - Selector Visual

**GOAL-002**: Crear componente de selector de imágenes integrado en ModelForm

| Task     | Description                                                                                | Completed | Date |
| -------- | ------------------------------------------------------------------------------------------ | --------- | ---- |
| TASK-006 | Crear componente `ImageGallerySectionComponent` en `_components/image-gallery-section.tsx` |           |      |
| TASK-007 | Implementar preview de imagen seleccionada (50x50px mínimo)                                |           |      |
| TASK-008 | Crear grid visual (4 columnas) con thumbnails de galería (40x40px cada uno)                |           |      |
| TASK-009 | Agregar estado visual para imagen seleccionada (border, highlight)                         |           |      |
| TASK-010 | Implementar lazy loading para imágenes de galería                                          |           |      |
| TASK-011 | Agregar accesibilidad: ARIA labels, keyboard navigation                                    |           |      |

**Entrada**: API tRPC `admin.gallery.list-images`  
**Salida**: Componente reutilizable que devuelve URL seleccionada

---

### Implementation Phase 3: Integración en ModelForm

**GOAL-003**: Integrar selector de imágenes en el formulario de modelos

| Task     | Description                                                                                | Completed | Date |
| -------- | ------------------------------------------------------------------------------------------ | --------- | ---- |
| TASK-012 | Agregar campo `imageUrl` al schema Zod de `modelFormSchema` en `model-form.tsx`            |           |      |
| TASK-013 | Agregar inicialización de `imageUrl` en `defaultValues` del formulario                     |           |      |
| TASK-014 | Insertar `ImageGallerySectionComponent` en ModelForm (lado derecho, después de GlassTypes) |           |      |
| TASK-015 | Transformar `imageUrl` null → undefined en handleSubmit                                    |           |      |
| TASK-016 | Actualizar validación backend para aceptar `imageUrl` opcional                             |           |      |

**Entrada**: Componente `ImageGallerySectionComponent`  
**Salida**: Modelo ahora captura y persiste `imageUrl`

---

### Implementation Phase 4: Mostrar Imagen en ModelCard

**GOAL-004**: Actualizar ModelCard para mostrar imagen asociada

| Task     | Description                                                                    | Completed | Date       |
| -------- | ------------------------------------------------------------------------------ | --------- | ---------- |
| TASK-017 | Actualizar props de `ModelCard` para incluir `imageUrl` opcional               | ✅         | 2025-10-26 |
| TASK-018 | Reemplazar `ProductImagePlaceholder` con `Image` dinámico si `imageUrl` existe | ✅         | 2025-10-26 |
| TASK-019 | Mantener placeholder si `imageUrl` es null/undefined                           | ✅         | 2025-10-26 |
| TASK-020 | Implementar optimización de imagen con Next.js `<Image>` component             | ✅         | 2025-10-26 |
| TASK-021 | Agregar alt text descriptivo usando nombre del modelo                          | ✅         | 2025-10-26 |
| TASK-022 | Testing: verificar fallback a placeholder en casos edge                        | ✅         | 2025-10-26 |

**Entrada**: `imageUrl` en datos del modelo  
**Salida**: ModelCard muestra imagen o placeholder según disponibilidad

---

### Implementation Phase 5: Migraciones de Datos

**GOAL-005**: Actualizar datos existentes para mantener compatibilidad

| Task     | Description                                                                   | Completed | Date       |
| -------- | ----------------------------------------------------------------------------- | --------- | ---------- |
| TASK-023 | Crear script de seed/update que asigne imágenes por patrón de nombre          | ✅         | 2025-10-26 |
| TASK-024 | Documentar mapeo nombre-modelo → imagen (ej: "Practicable" → practicable.svg) | ✅         | 2025-10-26 |
| TASK-025 | Testing: verificar que modelos sin imagen siguen siendo accesibles            | ✅         | 2025-10-26 |

**Entrada**: Modelos existentes en BD  
**Salida**: Modelos con `imageUrl` asignada automáticamente cuando sea posible

**Implementación**: Script `prisma/migrations-scripts/assign-model-images.ts` con patrones de mapeo inteligente

---

### Implementation Phase 6: Testing & Validation

**GOAL-006**: Implementar pruebas completas (unitarias, integración, E2E)

| Task     | Description                                                                        | Completed | Date |
| -------- | ---------------------------------------------------------------------------------- | --------- | ---- |
| TASK-026 | Test unitario: `get-gallery-images.ts` escanea directorio correctamente            |           |      |
| TASK-027 | Test unitario: validación de extensiones de archivo                                |           |      |
| TASK-028 | Test integración: tRPC procedure retorna datos válidos                             |           |      |
| TASK-029 | Test E2E: flujo completo admin (seleccionar imagen → guardar → ver en catálogo)    |           |      |
| TASK-030 | Test E2E: agregar nueva imagen a `/public/models/designs/` y verificar que aparece |           |      |

**Entrada**: Toda la implementación anterior  
**Salida**: Suite de tests que valida escalabilidad y correctitud

---

## 3. Alternatives

- **ALT-001**: Usar base de datos MongoDB para metadatos de imágenes
  - ❌ Descartado: Complejidad innecesaria, sistema basado en archivos es más mantenible
  
- **ALT-002**: Generar lista de imágenes en build time
  - ⚠️ Parcialmente considerado: Usar ambos (generación en build + dynamic API como fallback)
  - **Decisión**: Preferir dynamic API con caching en cliente (más flexible)

- **ALT-003**: Usar widget de upload para agregar imágenes
  - ❌ Descartado: Fuera de scope actual, el sistema solo descubre existentes

- **ALT-004**: Mostrar todas las imágenes sin selector
  - ❌ Descartado: Admin necesita poder elegir cuál asociar al modelo

---

## 4. Dependencies

- **DEP-001**: Campo `imageUrl: String?` en modelo Prisma (✅ ya existe)
- **DEP-002**: Next.js `<Image>` component para optimización
- **DEP-003**: TypeScript 5.8+ (✅ ya está en proyecto)
- **DEP-004**: tRPC 11.0.0 (✅ ya está configurado)
- **DEP-005**: shadcn/ui Button, Card, Skeleton components (✅ disponibles)
- **DEP-006**: Node.js fs module para escanear directorio

---

## 5. Files

### Nuevos Archivos

- **FILE-001**: `src/lib/gallery/get-gallery-images.ts` - Utility para escanear galería
- **FILE-002**: `src/lib/gallery/types.ts` - TypeScript types para galería
- **FILE-003**: `src/server/api/routers/gallery.ts` - tRPC router admin para galería
- **FILE-004**: `src/app/(dashboard)/admin/models/_components/image-gallery-section.tsx` - Selector visual
- **FILE-005**: `src/app/(dashboard)/admin/models/_components/image-gallery-item.tsx` - Thumbnail individual
- **FILE-006**: `tests/unit/lib/gallery/get-gallery-images.test.ts` - Tests unitarios
- **FILE-007**: `tests/integration/api/gallery.test.ts` - Tests de integración tRPC
- **FILE-008**: `e2e/admin/model-image-selection.spec.ts` - Tests E2E Playwright

### Archivos Modificados

- **FILE-009**: `src/app/(dashboard)/admin/models/_components/model-form.tsx` - Agregar campo imageUrl
- **FILE-010**: `prisma/schema.prisma` - ✅ Ya tiene `imageUrl` (no necesita cambios)
- **FILE-011**: `src/server/api/routers/model.ts` - Incluir imageUrl en queries/mutations
- **FILE-012**: `src/trpc/react.ts` - Agregar referencia a nuevo router gallery
- **FILE-013**: `src/app/(public)/catalog/_components/molecules/model-card.tsx` - Mostrar imagen
- **FILE-014**: Tipos de ModelCard props en archivo de tipos compartido

### Cambios en Estructura

```
src/
├── lib/
│   └── gallery/
│       ├── get-gallery-images.ts (NUEVO)
│       ├── types.ts (NUEVO)
│       └── constants.ts (NUEVO)
├── server/
│   └── api/
│       └── routers/
│           └── gallery.ts (NUEVO)
└── app/(dashboard)/admin/models/
    └── _components/
        ├── image-gallery-section.tsx (NUEVO)
        ├── image-gallery-item.tsx (NUEVO)
        └── model-form.tsx (MODIFICADO)
```

---

## 6. Testing

### Unitarios

- **TEST-001**: `get-gallery-images.ts` debe retornar array de objetos con `{name, url, filename}`
- **TEST-002**: Debe filtrar archivos por extensión permitida (SVG, PNG, JPG, WebP)
- **TEST-003**: Debe manejar directorio vacío sin errores
- **TEST-004**: Debe generar URLs relativas correctas `/models/designs/filename`

### Integración

- **TEST-005**: tRPC `admin.gallery.list-images` retorna datos válidos
- **TEST-006**: Procedure es accesible solo por admin (RBAC test)
- **TEST-007**: Crear modelo con `imageUrl` persiste en BD correctamente

### E2E (Playwright)

- **TEST-008**: Admin navega a /admin/models/new, ve selector de imágenes
- **TEST-009**: Admin hace click en imagen de galería, se selecciona (visual feedback)
- **TEST-010**: Admin guarda modelo con imagen, redirige a lista
- **TEST-011**: Admin ve modelo en lista con imagen cargada
- **TEST-012**: Agregar nueva imagen SVG a `/public/models/designs/`, ver en galería sin restart
- **TEST-013**: Imagen aparece correctamente en ModelCard en /catalog

---

## 7. Risks & Assumptions

### Riesgos

- **RISK-001**: Directorio `/public/models/designs/` podría contener no-imágenes
  - **Mitigación**: Validar extensión antes de agregar a lista

- **RISK-002**: Cambios en nombres de archivos podrían romper `imageUrl` existentes
  - **Mitigación**: Documentar convención de nombres, usar slugs estables

- **RISK-003**: Performance si hay 1000+ imágenes
  - **Mitigación**: Implementar caching en tRPC con revalidación por SSR pattern

- **RISK-004**: Diferencias entre Windows/Unix en rutas de archivo
  - **Mitigación**: Usar `path.posix` para normalizar rutas

### Assumptions

- **ASSUMPTION-001**: Las imágenes estarán en `/public/models/designs/` y accesibles vía `/models/designs/filename`
- **ASSUMPTION-002**: Formatos permitidos son: SVG, PNG, JPG, WebP (no cambiarán frecuentemente)
- **ASSUMPTION-003**: Admin puede agregar imágenes directamente al directorio (deployer lo maneja)
- **ASSUMPTION-004**: Next.js Image component está disponible y configurado
- **ASSUMPTION-005**: Modelos sin `imageUrl` son válidos (field es optional)

---

## 8. Implementation Details

### 8.1 Estructura de API Response

```typescript
// GET /api/trpc/admin.gallery.list-images
{
  "result": {
    "data": [
      {
        "filename": "practicable.svg",
        "name": "Practicable",
        "url": "/models/designs/practicable.svg"
      },
      {
        "filename": "doble-practicable-fijo.svg",
        "name": "Doble Practicable Fijo",
        "url": "/models/designs/doble-practicable-fijo.svg"
      }
      // ... más imágenes
    ]
  }
}
```

### 8.2 Pseudo-código: Scanning Directory

```typescript
// src/lib/gallery/get-gallery-images.ts
export async function getGalleryImages(): Promise<GalleryImage[]> {
  const designsDir = path.join(process.cwd(), 'public/models/designs');
  const files = await fs.promises.readdir(designsDir);
  
  const allowedExts = ['.svg', '.png', '.jpg', '.jpeg', '.webp'];
  return files
    .filter(file => allowedExts.includes(path.extname(file).toLowerCase()))
    .map(file => ({
      filename: file,
      name: formatName(file),  // "practicable.svg" → "Practicable"
      url: `/models/designs/${file}`
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
```

### 8.3 Integración en ModelForm

```typescript
// En model-form.tsx, agregar ImageGallerySectionComponent
<div className="space-y-6 lg:col-span-2">
  <BasicInfoSection suppliers={suppliers} />
  <ImageGallerySectionComponent />  {/* NUEVO */}
  <DimensionsSection />
  <PricingSection />
</div>
```

### 8.4 Mostrar en ModelCard

```typescript
// model-card.tsx
export function ModelCard({ id, name, imageUrl, basePrice }: ModelCardProps) {
  return (
    <Card>
      <Link href={`/catalog/${id}`}>
        {/* Mostrar imagen si existe, placeholder si no */}
        {imageUrl ? (
          <Image 
            src={imageUrl} 
            alt={`Imagen del modelo ${name}`}
            width={240}
            height={240}
            className="h-60 w-full object-cover"
          />
        ) : (
          <ProductImagePlaceholder productName={name} />
        )}
      </Link>
    </Card>
  );
}
```

---

## 9. Timeline Estimado

| Phase                    | Tasks               | Duración Est. | Dependencias |
| ------------------------ | ------------------- | ------------- | ------------ |
| 1. Backend API           | TASK-001 a TASK-005 | 2-3 horas     | Ninguna      |
| 2. Frontend Selector     | TASK-006 a TASK-011 | 3-4 horas     | Phase 1      |
| 3. Integración ModelForm | TASK-012 a TASK-016 | 2 horas       | Phase 2      |
| 4. ModelCard             | TASK-017 a TASK-022 | 2-3 horas     | Phase 3      |
| 5. Datos                 | TASK-023 a TASK-025 | 1 hora        | Phase 4      |
| 6. Testing               | TASK-026 a TASK-030 | 4-5 horas     | Phase 5      |

**Total Estimado**: 14-18 horas

---

## 10. Related Specifications / Further Reading

- [Prisma Schema - Model](../../prisma/schema.prisma) - Campo `imageUrl` ya definido
- [ModelCard Component](../../src/app/(public)/catalog/_components/molecules/model-card.tsx)
- [ModelForm Component](../../src/app/(dashboard)/admin/models/_components/model-form.tsx)
- [tRPC Router Structure](../../src/server/api/routers/)
- [Next.js Image Optimization](https://nextjs.org/docs/app/api-reference/components/image)
- [Node.js fs Module](https://nodejs.org/api/fs.html)
