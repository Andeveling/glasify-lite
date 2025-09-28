
# Plan de Implementación: UI/UX Glasify MVP

**Branch**: `002-ui-ux-requirements` | **Date**: 2025-09-28 | **Spec**: /home/andres/Proyectos/glasify-lite/specs/002-ui-ux-requirements/spec.md
**Input**: Feature specification from `/specs/002-ui-ux-requirements/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
La interfaz debe permitir: explorar catálogo, configurar ítems con validaciones y compatibilidades, cotizar en tiempo real (<200ms), gestionar envío y ver historial; además, panel admin para gestionar catálogo, precios, servicios y usuarios. Técnica: Next.js 15 (App Router) + shadcn/ui v3 con Tailwind v4, tRPC + Zod, Prisma + PostgreSQL, NextAuth v5. Estructura por dominios usando route groups `(domain)` y carpetas privadas `_(privadas)`; alias por vista. Tokens de color tipografía y sombras provienen exclusivamente de `src/styles/globals.css` (sin colores hardcodeados).

## Technical Context
**Language/Version**: TypeScript 5.8+ (strict)  
**Primary Dependencies**: Next.js 15 (App Router), shadcn/ui v3 + Tailwind v4, TanStack Query v5, tRPC, Zod, Prisma, NextAuth v5, Winston logger  
**Storage**: PostgreSQL (Prisma ORM)  
**Testing**: Vitest (unit/contract/integration), Playwright (E2E), Perf tests en `tests/perf`  
**Target Platform**: Web (Linux server Vercel/Node 20+), navegadores modernos (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)  
**Project Type**: Web (frontend+backend en el mismo repo Next App Router)  
**Performance Goals**: pricing <200ms p95; catálogo <500ms p95; updates UI <200ms p95  
**Constraints**: Accesibilidad WCAG 2.1 AA; UI en español (es‑LA); no colores hardcodeados, usar variables CSS de `globals.css`  
**Scale/Scope**: Hasta 100 modelos por fabricante; hasta 20 ítems por cotización

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Business Logic Integrity
- [x] All pricing calculations implemented como funciones puras con unit tests (ya existen tests de `price-item`; mantener cobertura ≥90%)
- [x] Mathematical specifications match PRD exactamente (basePrice + deltas)
- [x] No business logic shortcuts or approximations

### Type Safety First  
- [x] TypeScript strict mode enabled, sin `any` en producción (ver `tsconfig.json`)
- [x] Prisma schemas with proper type generation
- [x] Zod validation para todos los endpoints tRPC y formularios

### Validation at Boundaries
- [x] Server-side validation (dimensiones, compatibilidad) via Zod en tRPC
- [x] Mensajes de error claros en español (es‑LA)
- [x] Reglas de negocio aplicadas en server sin depender del cliente

### Performance Targets
- [x] Price calculations <200ms (tests en `tests/perf/price.bench.spec.ts`)
- [x] API catalog <500ms (agregar medición en integration tests)
- [x] Client-side updates <200ms (usar memoización y streaming where applicable)

### Accessibility & Internationalization
- [x] WCAG 2.1 AA plan: componentes shadcn auditados + reglas a11y del repo
- [x] Español (es‑LA) + Intl.NumberFormat('es-LA')
- [x] Mobile-first responsive

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root) - Next.js App Router Structure
```
src/
├── app/
│  ├── layout.tsx             # Root layout con providers, metadata
│  ├── page.tsx               # Home redirect a /catalog
│  ├── global-error.tsx       # Error boundary global
│  ├── not-found.tsx          # 404 global
│  ├── (public)/              # Rutas públicas (sin auth)
│  │  ├── layout.tsx          # Layout con navegación principal
│  │  ├── loading.tsx         # Loading states públicos
│  │  ├── error.tsx           # Error handling público
│  │  ├── not-found.tsx       # 404 público
│  │  ├── _components/        # Componentes compartidos públicos
│  │  ├── catalog/            # Catálogo de vidrios
│  │  │  ├── page.tsx         # Lista de catálogo
│  │  │  ├── loading.tsx      # Loading catálogo
│  │  │  ├── [modelId]/       # Rutas dinámicas modelo
│  │  │  │  └── page.tsx      # Detalle modelo
│  │  │  └── _components/     # Componentes específicos catálogo
│  │  └── quote/              # Creación de cotización
│  │     ├── page.tsx         # Configuración cotización
│  │     ├── review/          # Revisión cotización
│  │     │  └── page.tsx      
│  │     ├── loading.tsx      # Loading states cotización
│  │     └── _components/     # Componentes específicos cotización
│  ├── (auth)/                # Rutas de autenticación  
│  │  ├── layout.tsx          # Layout auth (formularios centrados)
│  │  ├── loading.tsx         # Loading states auth
│  │  ├── error.tsx           # Error handling auth
│  │  ├── signin/             # Página sign in
│  │  │  └── page.tsx
│  │  └── _components/        # Componentes específicos auth
│  └── (dashboard)/           # Rutas admin protegidas
│     ├── layout.tsx          # Layout dashboard con sidebar
│     ├── loading.tsx         # Loading states dashboard
│     ├── error.tsx           # Error handling dashboard
│     ├── not-found.tsx       # 404 protegido
│     ├── page.tsx            # Home dashboard
│     ├── _components/        # Componentes específicos dashboard
│     ├── models/             # Gestión modelos
│     │  └── page.tsx
│     ├── quotes/             # Gestión cotizaciones  
│     │  └── page.tsx
│     └── settings/           # Configuración
│        └── page.tsx
├── components/               # Componentes globales reutilizables
│  └── ui/                   # Componentes shadcn/ui
├── lib/                     # Utilidades y configuraciones
├── server/                  # Lógica backend (tRPC, Prisma)
│  ├── api/                  # Routers tRPC
│  ├── auth/                 # Configuración NextAuth
│  └── services/             # Lógica de negocio
└── trpc/                    # Configuración cliente tRPC

tests/
├── contract/                # Tests de contrato tRPC
├── integration/             # Tests de integración
├── unit/                   # Tests unitarios
└── perf/                   # Tests de performance

e2e/                        # Tests E2E Playwright
```

**Structure Decision**: Web application usando Next.js 15 App Router con route groups para separar dominios de negocio (público, auth, dashboard). Cada route group tiene su propio layout, loading, error y componentes específicos. Componentes reutilizables globales en `/components` y lógica de negocio en `/server`.

## Phase 0: Outline & Research ✅ COMPLETED
Investigación técnica completada en `research.md`:
- **Next.js 15 App Router** con route groups para separación de dominios
- **shadcn/ui v3 + Tailwind v4** para componentes accesibles con variables CSS
- **tRPC + Zod** para contratos tipados end-to-end
- **Prisma + PostgreSQL** manteniendo esquema existente
- **NextAuth v5** para autenticación admin
- **TanStack Query v5** para estado y caché de datos
- **Vitest + Playwright** para testing completo

**Output**: ✅ research.md completado con decisiones técnicas justificadas

## Phase 1: Design & Contracts ✅ COMPLETED
*Prerequisites: research.md complete*

Artefactos de diseño completados:

1. **Data Model** → `data-model.md`: ✅
   - Entidades: Modelo, GlassType, Service, Quote, QuoteItem
   - Validaciones y reglas de negocio
   - Relaciones entre entidades

2. **API Contracts** → `/contracts/`: ✅  
   - `trpc-contracts.md`: Contratos tRPC (catalog.list-models, quote.calculate-item, etc.)
   - `ui-navigation.md`: Patrones de navegación y estado UI
   - Schemas de request/response con SLAs (<200ms pricing, <500ms catalog)

3. **Contract Tests**: ✅ Referenciados en tasks.md
   - Tests que fallan para cada endpoint tRPC
   - Validación de schemas request/response
   - Tests de integración para flujos de usuario

4. **Quickstart**: ✅ `quickstart.md`
   - Criterios de validación end-to-end
   - Métricas de performance y accesibilidad
   - Pasos de verificación manual

5. **Agent Context**: ✅ Actualizado en `.github/copilot-instructions.md`
   - Stack técnico actual integrado
   - Convenciones del proyecto documentadas
   - Reglas de arquitectura Next.js App Router

**Output**: ✅ data-model.md, /contracts/*, tests preparados, quickstart.md, contexto de agente actualizado

## Phase 2: Task Planning Approach ✅ COMPLETED 
*tasks.md ha sido generado con 70 tareas estructuradas*

**Task Generation Strategy Implemented**:
- Base: Next.js App Router estructura con route groups por dominio
- **TDD Approach**: Tests (T011-T017) antes de implementación (T018-T041)
- **Route Group Separation**: Tareas paralelas [P] por dominios diferentes
- **Component Co-location**: Componentes cerca de su uso específico
- **Next.js Special Files**: loading.tsx, error.tsx, not-found.tsx explícitos

**Ordering Strategy Applied**:
- **Phase 3.1-3.2**: Setup y layouts base (T001-T010)
- **Phase 3.3**: Tests contractuales que DEBEN fallar (T011-T017) ⚠️
- **Phase 3.4-3.7**: Componentes y páginas por route group (T018-T041)
- **Phase 3.8-3.10**: Next.js special files por contexto (T042-T048)
- **Phase 3.11-3.13**: Estado, integración y accesibilidad (T049-T060)
- **Phase 3.14-3.15**: Características avanzadas y testing final (T061-T070)

**Parallel Execution Strategy**:
- Route groups diferentes = [P] (pueden ejecutarse en paralelo)
- Mismo archivo/componente = secuencial
- Tests contractuales = todos [P] (archivos diferentes)
- Loading/error states = [P] por route group

**Output Delivered**: ✅ 70 tareas numeradas y ordenadas en tasks.md con dependencias claras y marcadores [P] para ejecución paralela

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |


## Progress Tracking
*Este checklist se actualiza durante el flujo de ejecución*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command) - ✅ research.md
- [x] Phase 1: Design complete (/plan command) - ✅ data-model.md, contracts/, quickstart.md
- [x] Phase 2: Task planning complete (/tasks command) - ✅ tasks.md con 70 tareas
- [ ] Phase 3: Tasks execution in progress - **CURRENT PHASE** (implementación de tareas)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS - Todos los principios constitucionales alineados
- [x] Post-Design Constitution Check: PASS - Design respeta performance, a11y, type safety
- [x] All NEEDS CLARIFICATION resolved - ✅ Clarificaciones completadas en spec.md
- [x] Complexity deviations documented - Sin desviaciones encontradas

**Current Implementation Status** (from tasks.md):
- ✅ **Phases 3.1-3.3 COMPLETE**: Setup, layouts, tests contractuales
- 🔄 **Phase 3.4 IN PROGRESS**: Componentes UI compartidos (línea 115 seleccionada)
- ⏳ **Phases 3.5+**: Pending - Componentes por route group, states, testing final

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
