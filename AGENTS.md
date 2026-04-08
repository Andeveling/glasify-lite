# AGENTS.md — Glasify Lite

## Stack (Verificado Abril 2026)

| Component | Version | Notes |
|-----------|---------|-------|
| Next.js | 16.2.2 | App Router, Turbopack |
| React | 19.2.0 | Server Components |
| Prisma | 7.2.0 | **SQLite** via libsql adapter |
| DB | SQLite | File: `./prisma/dev.db` |
| tRPC | 11.6.0 | superjson transformer |
| better-auth | 1.5.6 | Auth provider |
| Tailwind | 4.1.14 | CSS-first (no .config.js) |
| Biome | 2.3.0 | Lint + format |
| Zod | 4.1.12 | Validation |

## Critical Commands

```bash
# DB (SQLite — DATABASE_URL required)
DATABASE_URL="file:./prisma/dev.db" pnpm db:push      # Sync schema to DB
pnpm prisma generate                                     # Regenerate client
pnpm seed:minimal                                       # Seed with minimal preset
pnpm seed --preset=vitro-rojas-panama                  # Real client data

# Dev
pnpm dev                                                # Next dev with turbo
pnpm build                                              # prisma generate && next build

# Quality
pnpm lint:errors                                        # Biome errors only
pnpm typecheck                                          # tsc --noEmit
pnpm test                                               # Vitest
```

## Architecture Notes

### Prisma Client Location
**Generated to `prisma/generated/client`**, NOT `node_modules/@prisma/client`. Import from generated path:
```ts
import { PrismaClient } from "./generated/client"
```

### Prisma 7 SQLite Adapter
Uses `@prisma/adapter-libsql` + `@libsql/client`. Config in `prisma.config.ts`. The `DATABASE_URL` env var or fallback `file:./prisma/dev.db` is used.

### compatibleGlassTypeIds Field
**This field is a JSON string** (not an array) due to SQLite limitations. When reading: `JSON.parse(model.compatibleGlassTypeIds)`. When writing: `JSON.stringify(array)`. 30+ files in the codebase still assume it's an array — this is a known architectural debt.

### Schema @map() Annotations
Account/Session models use `@map()` for legacy NextAuth compatibility. Don't remove these.

### Seed Presets
- `minimal` — CI/testing only
- `vitro-rojas-panama` — **Primary client** (Panama aluminum windows)
- `vidrios-la-equidad-colombia` — Secondary client
- `demo-client`, `full-catalog` — Other presets

## Known Issues

1. **compatibleGlassTypeIds**: Mismatch between schema (String/JSON) and codebase (expects String[]). See `openspec/changes/migrate-sqlite-compatible-glass-array/proposal.md`
2. **better-sqlite3 won't compile** on Node 25. Use `@libsql/client` + `@prisma/adapter-libsql` instead.
3. **Schema-seeders drift**: TenantConfig schema may not match what seeders expect. Check fields before running seeds.

## Directory Structure (Key Paths)

```
prisma/
├── schema.prisma              # Schema fuente
├── generated/client/           # Prisma client generado
├── seed-cli.ts                # Seed orchestrator
├── seeders/                    # Individual seeders
├── data/presets/              # Seed presets por cliente
│   └── vitro-rojas-panama/   # Client data
src/
├── server/
│   ├── db.ts                  # Prisma client singleton
│   └── api/routers/           # tRPC routers
├── domain/                    # Business logic
└── app/                       # Next.js App Router
```

## Env Variables

```
DATABASE_URL=file:./prisma/dev.db    # SQLite path (required for prisma commands)
```

## Don't

- Don't `import { PrismaClient } from "@prisma/client"` — use the generated client
- Don't assume `compatibleGlassTypeIds` is an array — it's a JSON string
- Don't use `better-sqlite3` directly — use `@libsql/client`
- Don't edit `prisma/generated/client/` — it's generated
- Don't use comments this lied the code not

## Codigo
- Condigo autodocumentado, no se necesitan comentarios adicionales. Si algo no es claro, es un indicativo de que el código podría ser refactorizado para mejorar su legibilidad.
