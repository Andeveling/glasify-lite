# Tasks: Glasify MVP — Cotizador multi‑ítem

Input: design docs from `/home/andres/Proyectos/glasify-lite/specs/001-prd-glasify-mvp/`
Prerequisites: plan.md (required), research.md, data-model.md, contracts/

## Phase 3.1: Setup
- [X] T001 Ensure local Postgres is running via `start-database.sh` [P]
  - Path: /home/andres/Proyectos/glasify-lite/start-database.sh
- [X] T002 [P] Initialize Prisma and generate client
  - Command: npx prisma generate
- [X] T003 [P] Update agent file with latest tech
  - Command: `.specify/scripts/bash/update-agent-context.sh copilot`

## Phase 3.2: Tests First (TDD)
- [X] T004 [P] Contract test for `catalog.list-models`
  - Path: /home/andres/Proyectos/glasify-lite/tests/contract/catalog.list-models.spec.ts
- [X] T005 [P] Contract test for `quote.calculate-item`
  - Path: /home/andres/Proyectos/glasify-lite/tests/contract/quote.calculate-item.spec.ts
- [X] T006 [P] Contract test for `quote.add-item`
  - Path: /home/andres/Proyectos/glasify-lite/tests/contract/quote.add-item.spec.ts
- [X] T007 [P] Contract test for `quote.submit`
  - Path: /home/andres/Proyectos/glasify-lite/tests/contract/quote.submit.spec.ts
- [X] T008 [P] Contract test for `admin.model.upsert`
  - Path: /home/andres/Proyectos/glasify-lite/tests/contract/admin.model.upsert.spec.ts
- [X] T009 Integration test: quickstart end-to-end (publicar modelo, agregar ítem, enviar)
  - Path: /home/andres/Proyectos/glasify-lite/tests/integration/quickstart.e2e.spec.ts

## Phase 3.3: Core Implementation
- [X] T010 [P] Prisma models for domain entities (Manufacturer, Model, GlassType, Service, Quote, QuoteItem, QuoteItemService, Adjustment)
  - Path: /home/andres/Proyectos/glasify-lite/prisma/schema.prisma
  - Dependency: T004–T008 (tests ready)
- [X] T011 [P] Pure pricing functions: `src/server/price/price-item.ts`
  - Dependency: T010
- [X] T012 [P] tRPC router: `catalog.list-models` in `src/server/api/routers/catalog.ts`
  - Dependency: T010
- [X] T013 tRPC router: `quote.calculate-item` in `src/server/api/routers/quote.ts`
  - Dependency: T011
- [X] T014 tRPC router: `quote.add-item` in `src/server/api/routers/quote.ts`
  - Dependency: T011, T010
- [X] T015 tRPC router: `quote.submit` in `src/server/api/routers/quote.ts`
  - Dependency: T010
- [X] T016 tRPC router: `admin.model.upsert` in `src/server/api/routers/admin.ts`
  - Dependency: T010

## Phase 3.4: Integration
- [X] T017 [P] Seed minimal catalog data (manufacturer, glass, service)
  - Path: /home/andres/Proyectos/glasify-lite/prisma/seed.ts
  - Dependency: T010
- [X] T018 [P] Add Zod schemas for all procedures (inputs/outputs en es‑LA)
  - Path: /home/andres/Proyectos/glasify-lite/src/server/api/routers/*.ts
  - Dependency: T012–T016
- [X] T019 Email mock service for `quote.submit`
  - Path: /home/andres/Proyectos/glasify-lite/src/server/services/email.ts
  - Dependency: T015

## Phase 3.5: Polish
- [X] T020 [P] Unit tests for pricing functions
  - Path: /home/andres/Proyectos/glasify-lite/tests/unit/price-item.spec.ts
  - Dependency: T011
- [X] T021 Performance bench: price calculation <200ms
  - Path: /home/andres/Proyectos/glasify-lite/tests/perf/price.bench.ts
  - Dependency: T011
- [ ] T022 [P] Update docs: API and quickstart validation
  - Path: /home/andres/Proyectos/glasify-lite/specs/001-prd-glasify-mvp/quickstart.md

## Dependencies Summary
- Tests (T004–T009) before implementation (T010–T016)
- Models (T010) before services/routers (T011–T016)
- Pricing (T011) before quote.* (T013–T014)
- Implementation before polish (T020–T022)

## Parallel Execution Examples
- Run in parallel [P] tasks across different files:
  - T004, T005, T006, T007, T008 (contract tests)
  - T010, T011, T012 (after tests are created)
  - T017, T018 (after routers exist)

