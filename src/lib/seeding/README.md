# Seeding Architecture (Drizzle ORM)

**Last Updated**: 2025-11-09  
**Version**: 2.0.0 - Complete Migration  
**Status**: ✅ Production Ready

---

## 📋 Overview

Drizzle-based seeding system for Glasify Lite. Old Prisma system completely removed.

**Commands**:
```bash
pnpm seed          # Minimal test data
pnpm seed:fresh    # Clean DB + seed
pnpm seed:vitro    # Production data (Vitro Rojas)
```

**Key Principles**:
- ✅ ORM-Independent factories (POJOs)
- ✅ Zod validation
- ✅ Type-safe with TypeScript
- ✅ Testable pure functions

---

## 🏗️ Directory Structure

```
src/lib/seeding/
├── cli/seed.cli.ts                  # Entry point
├── orchestrators/                   # Coordinates seeding
├── presets/                         # Data configurations
├── seeders/                         # Database operations
├── factories/                       # Test data generation
├── data/                            # Reference data (from prisma/)
├── contracts/                       # Base classes
├── types/                           # Type definitions
└── utils/                           # Utilities
```

---

## 📝 Migration Notes

### Removed (Old Prisma System)
- ❌ `prisma/data/`, `prisma/factories/`, `prisma/seeders/`
- ❌ `prisma/seed-cli.ts`, `prisma/seed-tenant.ts`
- ❌ `prisma/migrations/` (using Drizzle now)

### Moved (Reference Data)---

- ✅ `prisma/data/vitro-rojas/` → `src/lib/seeding/data/vitro-rojas/`
- ✅ `prisma/data/glass-*.json` → `src/lib/seeding/data/`
- ✅ `prisma/migrations-scripts/` → `scripts/migrations/`
- ✅ `prisma/schema.prisma` → `docs/reference/` (archived)


