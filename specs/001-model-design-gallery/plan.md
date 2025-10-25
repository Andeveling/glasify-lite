# Implementation Plan: Galería de Diseños 2D para Modelos

**Branch**: `001-model-design-gallery` | **Date**: 2025-01-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-model-design-gallery/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Sistema de rendering de diseños 2D predefinidos para modelos de ventanas/puertas usando canvas 2D (Konva React). Permite a administradores asociar diseños visuales de una galería predefinida a cada modelo, y a clientes visualizar el diseño del producto en tarjetas del catálogo. Los diseños se adaptan dinámicamente a las dimensiones del modelo y reflejan el color base del material (PVC=blanco, ALUMINUM=gris, WOOD=marrón, MIXED=neutro).

**Enfoque técnico**: Extender schema Prisma con modelo `ModelDesign` y campo `type` en `Model`. Crear componente Client `DesignRenderer` con Konva para rendering en `ModelCard`. Agregar selector de diseños en formulario de modelo con validación de compatibilidad por tipo. Seeders poblaran galería inicial de diseños predefinidos.

## Technical Context

**Language/Version**: TypeScript 5.8.2 (strict mode), Node.js ES2022 target  
**Primary Dependencies**: 
- Next.js 15.2.3 (App Router, React Server Components 19.0.0)
- tRPC 11.0.0 (API layer)
- Prisma 6.16.2 (ORM)
- Konva 9.x + react-konva (2D canvas rendering) - **NEEDS RESEARCH: compatibility with Next.js 15 SSR/RSC**
- Zod 4.1.1 (validation)
- React Hook Form 7.63.0 (forms)
- Shadcn/ui + Radix UI + TailwindCSS (UI)

**Storage**: PostgreSQL (existing multi-tenant schema with Model, ProfileSupplier, User, Quote)  
**Testing**: 
- Vitest 3.2.4 (unit/integration with jsdom)
- Playwright 1.55.1 (E2E)

**Target Platform**: Web (Next.js SSR + Client Components for canvas rendering)  
**Project Type**: Web application (full-stack Next.js monolith)  
**Performance Goals**: 
- Catálogo carga 20+ diseños en <3s
- Rendering individual <100ms per card
- Preview en formulario instantáneo (<50ms)

**Constraints**: 
- Canvas rendering solo en Client Components (Konva no compatible con SSR)
- Diseños JSON <50KB cada uno (para serialización eficiente)
- Lazy loading de diseños en catálogo (solo renderizar visibles)
- **NEEDS RESEARCH: SSR strategy for catalog with Client Component islands**
- **NEEDS RESEARCH: Konva performance optimization patterns for multiple instances**

**Scale/Scope**: 
- ~20-50 diseños predefinidos iniciales
- ~100-500 modelos en catálogo típico
- Múltiples instancias de DesignRenderer en una página (grid de productos)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Reference: `.specify/memory/constitution.md` - verify feature complies with all principles.

### Core Values Compliance

- [x] **Clarity Over Complexity**: Design uses clear, descriptive names (`DesignRenderer`, `ModelDesign`, `designId`) and simple logic (parametric scaling, color mapping)
- [x] **Server-First Performance**: Heavy work done on server (design data fetching), rendering en cliente solo cuando necesario (canvas interactivo)
  - [x] Caching strategy documented: diseños rara vez cambian (5min cache), catálogo semi-static (30s ISR)
  - [x] SSR mutations use two-step invalidation: `invalidate()` + `router.refresh()` en formulario de modelo
- [x] **One Job, One Place**: Separación clara: `DesignRenderer` (UI), `model-design.ts` router (API), `ModelDesign` model (data), seeder (initial data)
- [x] **Flexible Testing**: Testing strategy: unit tests para adaptación de diseños, integration para tRPC, E2E para asignación en formulario
- [x] **Extend, Don't Modify**: Extiende Model existente con `designId` opcional, no modifica lógica actual de catálogo
- [x] **Security From the Start**: Input validation en todos los entry points
  - [x] User permissions checked server-side: admin-only en formulario de modelo (middleware RBAC)
  - [x] All user input validated: Zod schemas para designId, type, JSON structure
- [x] **Track Everything Important**: Logging strategy defined
  - [x] Winston logger usado SOLO en server-side (tRPC procedures, seeder)
  - [x] Error messages en español para usuarios, logs técnicos en inglés

### Language & Communication

- [x] Code/comments/commits en inglés únicamente
- [x] UI text en español (es-LA): "Seleccionar Diseño", "Tipo de Modelo", "Vista Previa"
- [x] Commit messages siguen Conventional Commits: `feat(models): add design gallery selector`

### Technology Constraints

- [x] Uses required stack: Next.js 15 (App Router), TypeScript strict, React 19 Server Components, tRPC, Prisma, PostgreSQL
- [x] No prohibited technologies (Konva es adicional permitido para canvas 2D, no reemplaza stack)
- [x] UI components usan Shadcn/ui + Radix UI + TailwindCSS para galería y selector

### Quality Gates

- [x] TypeScript strict mode habilitado, sin type errors esperados
- [x] Biome/Ultracite formatting rules seguidas
- [x] Tests planeados: unit (DesignRenderer adaptación), integration (tRPC model-design router), E2E (asignación en formulario)
- [x] Changelog entry planeado: nueva funcionalidad de diseños visuales
- [x] Migration notes preparadas: nueva tabla ModelDesign, campo type en Model

### Principle Priority Resolution

No hay conflictos de principios detectados. La solución:
- Es clara y simple (Client Component para canvas, Server Component para data)
- Optimiza performance (server-first data, client rendering solo cuando visible)
- Mantiene security (admin-only, validación server-side)
- Es extensible (nuevos diseños via seeders, no modifica código existente)

**Result**: ✅ PASS

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (public)/
│   │   └── catalog/
│   │       └── _components/
│   │           └── molecules/
│   │               ├── model-card.tsx                    # Modified: integrar DesignRenderer
│   │               └── model-card-atoms.tsx              # Existing (sin cambios)
│   ├── (dashboard)/
│   │   └── admin/
│   │       └── models/
│   │           ├── _components/
│   │           │   ├── model-form.tsx                    # Modified: agregar selector de diseño
│   │           │   ├── design-gallery-selector.tsx       # NEW: galería con preview
│   │           │   └── design-preview.tsx                # NEW: preview individual
│   │           ├── new/
│   │           │   └── page.tsx                          # Modified: incluir tipo de modelo
│   │           └── [id]/
│   │               └── page.tsx                          # Modified: mostrar diseño actual
│   └── _components/
│       └── design/
│           ├── design-renderer.tsx                       # NEW: Client Component con Konva
│           └── design-fallback.tsx                       # NEW: placeholder cuando no hay diseño
├── server/
│   ├── api/
│   │   └── routers/
│   │       └── admin/
│   │           └── model-design.ts                       # NEW: tRPC router para diseños
│   └── services/
│       └── design-renderer-service.ts                    # NEW: lógica adaptación parametrizada
├── lib/
│   ├── design/
│   │   ├── types.ts                                      # NEW: tipos para DesignConfig, ShapeDefinition
│   │   ├── material-colors.ts                            # NEW: mapeo material → color
│   │   └── validation.ts                                 # NEW: Zod schemas para diseños
│   └── format.ts                                         # Existing (sin cambios)

prisma/
├── schema.prisma                                         # Modified: agregar ModelDesign, type en Model
├── migrations/
│   └── YYYYMMDDHHMMSS_add_model_designs/                # NEW: migration
│       └── migration.sql
└── seeders/
    ├── seed-designs.ts                                   # NEW: seedear diseños predefinidos
    └── seed-cli.ts                                       # Modified: incluir seed-designs

tests/
├── unit/
│   ├── design-renderer.test.ts                           # NEW: test adaptación parametrizada
│   └── material-colors.test.ts                           # NEW: test mapeo colores
├── integration/
│   └── model-design-router.test.ts                       # NEW: test tRPC procedures
└── e2e/
    └── admin/
        └── model-design-assignment.spec.ts               # NEW: test flujo asignación
```

**Structure Decision**: Web application (Next.js monolith) siguiendo estructura App Router existente. Los componentes de diseño se colocan en `app/_components/design/` para reutilización global. Client Components para Konva rendering (no compatible con SSR), Server Components para data fetching.

---

## Phase 0: Research & Technology Decisions

See [research.md](./research.md) for detailed findings.

### Research Tasks Completed ✅

1. ✅ **Konva + Next.js 15 Compatibility**: Compatible con Client Components, usar `'use client'` directive
2. ✅ **SSR Strategy for Canvas**: Client Component boundaries con Server Component data fetching
3. ✅ **Konva Performance Optimization**: Lazy rendering + Memoization + Proper cleanup con Intersection Observer
4. ✅ **Parametric Design System**: Constraint-based layout con reglas de adaptación simples
5. ✅ **Design JSON Structure**: Hierarchical con metadata, versionado, y shapes con roles

### Key Decisions

- **Canvas Library**: Konva + react-konva (estándar React, API declarativa)
- **SSR Pattern**: Client Components con `'use client'`, Server Components pre-fetch data
- **Performance**: `React.memo()` + Intersection Observer para lazy rendering
- **Adaptation**: Constraint-based (mantiene espesores lógicos, cristales llenan espacio)
- **Storage**: JSON hierarchical con versioning (`version: '1.0'`)

---

## Phase 1: Design & Contracts

### Artifacts Generated ✅

- ✅ [data-model.md](./data-model.md) - Database schema (ModelDesign, ModelType enum, Model extensions)
- ✅ [contracts/model-design-api.md](./contracts/model-design-api.md) - tRPC API contracts
- ✅ [quickstart.md](./quickstart.md) - Developer setup guide

### Database Schema Summary

**New Entities**:
- `ModelDesign`: Diseños predefinidos (id, name, type, config JSON, isActive, displayOrder)
- `ModelType` enum: Categorización (fixed_window, sliding_window_*, single_door, etc.)

**Modified Entities**:
- `Model`: Agregado `type: ModelType?` y `designId: String?` (relación opcional a ModelDesign)

**Business Rules**:
- Modelo DEBE tener `type` antes de asignar diseño
- Solo diseños compatibles por tipo pueden asignarse
- Diseños en uso NO se eliminan (soft delete via `isActive: false`)

### API Contracts Summary

**New Router**: `admin.model-design`
- `list`: Listar diseños con filtros (type, isActive) y paginación
- `get-by-id`: Obtener diseño completo por ID
- `get-by-ids`: Batch fetch múltiples diseños
- `toggle-active`: Activar/desactivar diseño

**Modified Routers**:
- `admin.model.list`: Incluye `design { id, name, nameEs, type }`
- `admin.model.get-by-id`: Incluye `design` completo con config JSON
- `admin.model.create/update`: Acepta `type` y `designId` con validación de compatibilidad
- `catalog.list`: Incluye `design { config }` y `profileSupplier { materialType }` para rendering

### Agent Context Update

Ejecutar script de actualización:

```bash
.specify/scripts/bash/update-agent-context.sh copilot
```

Esto agregará a `.github/copilot-instructions.md`:
- Konva 9.x + react-konva 18.x (canvas 2D rendering)
- ModelDesign entity y ModelType enum
- Design rendering patterns (Client Components, lazy loading)
- Material color mapping (PVC, ALUMINUM, WOOD, MIXED)

---

## Phase 2: Implementation Tasks

*(Will be generated by `/speckit.tasks` command - NOT part of `/speckit.plan`)*

See [tasks.md](./tasks.md) when ready to implement.

---

## Planning Summary

### ✅ Planning Complete

El plan de implementación para "Galería de Diseños 2D para Modelos" está completo y listo para la fase de tareas.

**Branch**: `001-model-design-gallery`  
**Status**: Ready for implementation

### Artifacts Generated

| Documento                                                        | Descripción                                  | Status     |
| ---------------------------------------------------------------- | -------------------------------------------- | ---------- |
| [plan.md](./plan.md)                                             | Este documento - plan completo               | ✅ Complete |
| [research.md](./research.md)                                     | Decisiones tecnológicas y research           | ✅ Complete |
| [data-model.md](./data-model.md)                                 | Schema de BD, tipos TypeScript, validaciones | ✅ Complete |
| [contracts/model-design-api.md](./contracts/model-design-api.md) | Contratos API tRPC                           | ✅ Complete |
| [quickstart.md](./quickstart.md)                                 | Guía de setup para desarrolladores           | ✅ Complete |

### Key Technologies

- **Canvas Rendering**: Konva 9.x + react-konva 18.x
- **Architecture**: Client Components (`'use client'`) con Server Component data fetching
- **Performance**: Lazy rendering con Intersection Observer + React.memo
- **Adaptation**: Constraint-based parametric system
- **Storage**: PostgreSQL JSON fields con Prisma

### Implementation Highlights

1. **Database**:
   - Nueva tabla `ModelDesign` para diseños predefinidos
   - Nuevo enum `ModelType` para categorización
   - Campos `type` y `designId` agregados a `Model`

2. **API**:
   - Nuevo router `admin.model-design` con 4 procedures
   - Extensiones a `admin.model` para soporte de diseños
   - Endpoint público `catalog.list` incluye diseños serializados

3. **UI Components**:
   - `DesignRenderer` (Client Component con Konva)
   - `DesignFallback` (placeholder cuando no hay diseño)
   - `DesignGallerySelector` (para formulario de modelo)
   - Modificación de `ModelCard` para renderizar diseños

4. **Seeders**:
   - `seed-designs.ts` para poblar galería inicial
   - Diseños predefinidos: ventana fija, corredera, puerta

### Constitution Compliance ✅

- ✅ Clarity Over Complexity (nombres descriptivos, lógica simple)
- ✅ Server-First Performance (data en servidor, rendering solo en cliente cuando visible)
- ✅ One Job, One Place (separación clara: renderer, API, data)
- ✅ Security From the Start (admin-only, validación Zod)
- ✅ All code in English, UI in Spanish

### Next Steps

1. Ejecutar `/speckit.tasks` para generar `tasks.md` con checklist de implementación
2. Seguir `quickstart.md` para setup inicial (deps, migrations, seeders)
3. Implementar componentes siguiendo TDD workflow
4. Poblar galería con más diseños predefinidos
5. Optimizar performance con lazy loading

---

## Questions?

Si algo no está claro durante implementación:
1. Revisar `research.md` para decisiones técnicas
2. Revisar `data-model.md` para estructura de datos
3. Revisar `contracts/model-design-api.md` para API
4. Revisar `quickstart.md` para setup paso a paso
5. Consultar `.github/copilot-instructions.md` para patrones del proyecto
