
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

### Source Code (repository root)
```
src/
├── app/
│  ├── (auth)/
│  │  ├── signin/
│  │  └── signup/
│  ├── (dashboard)/
│  │  └── admin/
│  └── _components/           # componentes compartidos de la app (privados)
├── components/
│  └── ui/                    # shadcn/ui tokens + wrappers
├── lib/                      # utilidades (logger, utils)
├── server/                   # backend (tRPC, Prisma, servicios)
│  ├── api/
│  │  ├── routers/
│  │  ├── root.ts
│  │  └── trpc.ts
│  ├── auth/
│  ├── price/
│  └── services/
└── styles/
    └── globals.css           # origen de variables de tema

tests/
├── contract/
├── integration/
├── perf/
└── unit/
```

**Structure Decision**: Next.js App Router con Route Groups por dominio (`(catalog)`, `(quote)`, `(admin)`), carpetas privadas prefijadas con `_` para utilidades internas por grupo y alias por vista (p.ej., `@views/auth/*`, `@views/dashboard/*`).

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved (generado)

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh copilot`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/* (tRPC + navegación UI), quickstart.md, archivo de agente actualizado

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model creation task [P] 
- Each user story → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:
- TDD order: Tests before implementation 
- Dependency order: Models before services before UI
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 25-30 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

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
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
