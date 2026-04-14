# Structure — Directory Layout & Key Files

## Root Structure

```
glasify-lite/
├── prisma/                          # Database schema & client
│   ├── schema.prisma                # Prisma schema (source of truth)
│   ├── generated/client/            # Generated Prisma client (READ ONLY)
│   ├── migrations/                  # Versioned migrations
│   ├── migrations-scripts/          # One-off migration utilities
│   ├── seeders/                     # Individual seed files
│   ├── seed-cli.ts                  # Seed orchestrator
│   ├── factories/                   # Test data generators
│   ├── data/                        # Reference data
│   │   ├── catalog/                 # Catalog reference data
│   │   ├── clients/                 # Per-client data
│   │   │   └── vitro-rojas/         # Client: Vitro Rojas Panama
│   │   └── presets/                 # Seed presets
│   ├── check-user.ts               # User lookup utility
│   └── test-password.ts            # Password hashing test
├── src/                             # Application source
│   ├── app/                         # Next.js App Router
│   ├── lib/                         # Utilities & shared code
│   ├── server/                      # Server-side code
│   ├── trpc/                        # tRPC client setup
│   └── domain/                      # Business logic (if used)
├── scripts/                         # Shell scripts
├── tests/                           # Test files
├── skills/                          # AI agent skills
├── .opencode/                       # OpenCode configuration
│   └── get-shit-done/              # GSD workflow templates
├── .agents/                         # Agent skills
├── .planning/                       # GSD planning artifacts (not gitignored by default)
│   └── codebase/                   # Codebase map documents
├── biome.json                       # Biome configuration
├── next.config.ts                  # Next.js configuration
├── package.json
├── tsconfig.json
└── playwright.config.ts            # Playwright E2E config
```

## `src/` Structure

```
src/
├── app/                          # Next.js App Router pages
│   └── (routes)/                 # Route groups
│
├── lib/                          # Shared utilities
│   ├── utils.ts                  # General utilities (cn, etc.)
│   ├── logger.ts                 # Logging utility
│   ├── prisma-utils.ts          # Prisma helpers
│   ├── server-auth.ts           # Server auth utilities
│   ├── auth-client.ts           # Client auth utilities
│   ├── middleware-utils.ts      # Middleware helpers
│   │
│   ├── validations/             # Zod schemas for validation
│   │   ├── admin/               # Admin panel schemas
│   │   │   ├── glass-type.schema.ts
│   │   │   ├── glass-supplier.schema.ts
│   │   │   ├── service.schema.ts
│   │   │   ├── profile-supplier.schema.ts
│   │   │   ├── glass-solution.schema.ts
│   │   │   └── model.schema.ts
│   │   ├── color.ts
│   │   ├── model-color.ts
│   │   ├── shared.schema.ts
│   │   ├── design-template.ts
│   │   └── tenant.config.ts
│   │
│   ├── export/                  # Export utilities
│   │   ├── excel/
│   │   │   ├── quote-excel-workbook.ts
│   │   │   └── excel-styles.ts
│   │   ├── pdf/
│   │   │   ├── quote-pdf-document.tsx
│   │   │   ├── pdf-styles.ts
│   │   │   └── pdf-utils.ts
│   │   └── excel/
│   │       └── excel-utils.ts
│   │
│   ├── gallery/                 # Gallery utilities
│   │   ├── get-gallery-images.ts
│   │   ├── types.ts
│   │   ├── constants.ts
│   │
│   ├── format/                 # Formatting utilities
│   │   └── index.ts
│   │
│   └── utils/                   # Specific utilities
│       ├── table-params-parser.ts
│       ├── table-query-builder.ts
│       ├── cursor-pagination.ts
│       ├── cart.utils.ts
│       ├── image-utils.ts
│       ├── generate-item-name.ts
│       ├── window-diagram-map.ts
│       ├── coordinates.ts
│       └── compatible-glass-types.ts
│
├── server/                       # Server-side code
│   ├── db.ts                     # Prisma client singleton
│   │
│   ├── api/                      # tRPC API layer
│   │   ├── root.ts              # Root router
│   │   ├── trpc.ts              # tRPC initialization
│   │   └── routers/             # Route definitions
│   │       ├── admin/           # Admin panel routers
│   │       │   ├── admin.ts
│   │       │   ├── admin.schemas.ts
│   │       │   ├── clients.ts
│   │       │   ├── colors.ts
│   │       │   ├── glass-type.ts
│   │       │   ├── glass-solution.ts
│   │       │   ├── glass-supplier.ts
│   │       │   ├── model.ts
│   │       │   ├── model-colors.ts
│   │       │   ├── profile-supplier.ts
│   │       │   ├── service.ts
│   │       │   ├── tenant-config.ts
│   │       │   ├── design-template.ts
│   │       │   └── gallery.ts
│   │       ├── catalog/         # Catalog routers
│   │       │   ├── index.ts
│   │       │   ├── catalog.schemas.ts
│   │       │   ├── catalog.queries.ts
│   │       │   ├── catalog.mutations.ts
│   │       │   ├── catalog.utils.ts
│   │       │   ├── glass-solutions.queries.ts
│   │       │   ├── catalog.migration-utils.ts
│   │       │   └── README.md
│   │       ├── quote/          # Quote routers
│   │       │   ├── quote.ts
│   │       │   ├── quote.schemas.ts
│   │       │   └── quote.service.ts
│   │       ├── dashboard.ts
│   │       ├── address.ts
│   │       ├── user.ts
│   │       ├── geocoding.ts
│   │       └── transportation.ts
│   │
│   ├── auth/                    # Authentication
│   │   ├── config.ts
│   │   └── index.ts
│   │
│   ├── ai/                      # AI system
│   │   ├── agents/
│   │   │   ├── model-assistant.agents.ts
│   │   │   ├── model-assistant.executor.ts
│   │   │   └── model-assistant.tools.ts
│   │   ├── providers/
│   │   │   └── minimax.ts
│   │   └── tools/
│   │       ├── model-tools.ts
│   │       └── catalog-tools.ts
│   │
│   ├── services/               # Business services
│   │   ├── dashboard-metrics.ts
│   │   ├── email.ts
│   │   ├── file-upload.service.ts
│   │   ├── geocoding.service.ts
│   │   ├── glass-price-history.service.ts
│   │   ├── model-price-history.service.ts
│   │   ├── price-adapter.ts
│   │   ├── referential-integrity.service.ts
│   │   ├── transportation.service.ts
│   │   ├── model-assistant.service.ts
│   │   ├── model-assistant-session.service.ts
│   │   └── model-assistant-message.service.ts
│   │
│   ├── schemas/               # Server schemas
│   │   ├── supplier.schema.ts
│   │   └── tenant.schema.ts
│   │
│   └── utils/                 # Server utilities
│       └── tenant.ts
│
├── trpc/                       # tRPC client
│   ├── query-client.ts
│   ├── react.tsx
│   └── server-client.ts
│
└── domain/                    # Domain layer (if used)
```

## Key Files by Function

### Database
- `src/server/db.ts` — Prisma singleton
- `prisma/schema.prisma` — Schema definition

### Authentication
- `src/server/auth/config.ts` — better-auth config
- `src/server/auth/index.ts` — Auth exports
- `src/lib/server-auth.ts` — Server auth utilities
- `src/lib/auth-client.ts` — Client auth utilities

### API
- `src/server/api/root.ts` — Router aggregation
- `src/server/api/trpc.ts` — tRPC init

### Services
- `src/server/services/` — All business services

### Validations
- `src/lib/validations/` — Zod schemas

### Exports
- `src/lib/export/excel/` — Excel generation
- `src/lib/export/pdf/` — PDF generation

## Naming Conventions

### Directories
- lowercase with hyphens: `seeders/`, `migrations-scripts/`
- camelCase for special: `ai/`, `api/`

### Files
- kebab-case: `quote-excel-workbook.ts`, `glass-type.schema.ts`
- Some files use camelCase: `db.ts`, `trpc.ts`

### Routes/Modules
- Route-based naming matching domain

## Key Locations

| Purpose | Path |
|---------|------|
| Prisma Schema | `prisma/schema.prisma` |
| Generated Client | `prisma/generated/client` |
| tRPC Root | `src/server/api/root.ts` |
| Auth Config | `src/server/auth/config.ts` |
| Main DB | `src/server/db.ts` |
| UI Components | `src/app/` |
| API Routers | `src/server/api/routers/` |