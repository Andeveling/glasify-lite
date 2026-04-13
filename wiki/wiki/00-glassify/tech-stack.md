# Tech Stack

**Summary**: Stack tecnológico de Glasify Lite v2.0 — Next.js 16 + Drizzle ORM + SQLite + Better Auth.

**Sources**: (source: internal)

**Last updated**: 2026-04-13

---

## Stack Actual (v2.0)

### Frontend
- **Framework**: Next.js 16 (App Router, SSR solo para auth)
- **React**: React 19
- **Styling**: TailwindCSS 4 + shadcn/ui
- **Forms**: React Hook Form + Zod
- **State**: TanStack Query
- **Icons**: Lucide React

### Backend
- **API Layer**: tRPC 11 (type-safe)
- **ORM**: Drizzle ORM
- **Database**: SQLite (Better SQLite)
- **Auth**: Better Auth (email/password)

### Export
- **PDF**: @react-pdf/renderer
- **Excel**: exceljs

### Testing
- **Unit/Integration**: Vitest
- **E2E**: Playwright

### Dev Tools
- **Linting**: Biome
- **Git Hooks**: Lefthook
- **Package Manager**: pnpm

## Stack Anterior (v1.6 — Deprecated)

| Componente | Anterior | Actual |
|-----------|----------|--------|
| Framework | Next.js 15 | Next.js 16 |
| ORM | Prisma 6 | Drizzle ORM |
| Database | PostgreSQL | SQLite |
| Auth | NextAuth.js (Google OAuth) | Better Auth (email/password) |
| Multi-tenant | Sí | No (single-tenant) |

## Decisión de Arquitectura

**¿Por qué SQLite?**
- Simplicidad: Sin servidor de base de datos externo
- Portabilidad: Un archivo `.db` para todo
- Performance: Mejor SQLite con Better SQLite (native bindings)

**¿Por qué Drizzle en lugar de Prisma?**
- Lightweight: Schema-first sin magic
- Type-safe: Inferencia automática de tipos
- SQL-like: Queries son SQL legible, no abstraction layer oculta

**¿Por qué Better Auth en lugar de NextAuth?**
- Simplicidad: Email/password sin OAuth providers
- Standalone: No depende de servicios externos
- Control: Auth completo sin Third-party dependencies

## Related pages

- [[prd]]
- [[routes]]
