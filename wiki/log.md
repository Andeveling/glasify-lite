# Log

**Append-only record of wiki operations.**

---

### Client Preset: Vitro Rojas Panama
- **Source**: `docs/seeders/vitro-rojas-panama.md` (copied to `raw/seeders/vitro-rojas-panama.md`)
- **What changed**: Creado `wiki/wiki/30-clients/vitro-rojas-panama.md` con summary page
- **Action**: `docs/seeders/` eliminado

---

## 2026-04-13

### Initial setup
- **Source**: PRD v2.0 (CPQ model)
- **What changed**: Created wiki structure following LLM Wiki pattern
- **Files created**:
  - `wiki/wiki/00-glassify/prd.md` (source document)
  - `wiki/wiki/00-glassify/tech-stack.md`
  - `wiki/wiki/00-glassify/routes.md`
  - `wiki/wiki/00-glassify/entities.md`
  - `wiki/wiki/00-glassify/pricing-formula.md`
  - `wiki/wiki/index.md`
  - `wiki/wiki/log.md`
  - `wiki/wiki/CLAUDE.md`
  - `wiki/raw/` (empty, for source documents)

### Entities update
- **Source**: `prisma/schema.prisma` (fuente autoritativa)
- **What changed**: entities.md ahora referencia el schema real de Prisma en lugar de describir entidades manualmente
- **Entities basadas en**: User, Client, TenantConfig, Model, DesignTemplate, ProfileSupplier, GlassType, GlassSolution, GlassTypeSolution, GlassCharacteristic, GlassTypeCharacteristic, GlassSupplier, Service, Color, ModelColor, Quote, QuoteItem, QuoteItemService, Adjustment, ProjectAddress, ModelCostBreakdown, ModelPriceHistory
- From: Next.js 15, Prisma, PostgreSQL, Google OAuth
- To: Next.js 16, Drizzle ORM, SQLite, Better Auth (email/password)

### Model change
- From: Self-service catalog (public `/catalog`)
- To: CPQ managed by Admin (all routes require auth, only `/sign-in` public)

### Decision
- Wiki is now the single source of truth for documentation
- `/docs/prd.md` deleted in favor of `wiki/wiki/00-glassify/prd.md`

---

## 2025 (legacy — to be migrated)

### v1.6 — Self-service catalog model
- Public catalog for clients
- Budget cart with sessionStorage
- Google OAuth authentication
- Multi-tenant architecture

### v1.5 — Multi-tenant complete
- TenantConfig singleton
- Glass solutions (Many-to-Many)
- Quote workflow

