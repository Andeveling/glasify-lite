# Log

**Append-only record of wiki operations.**

---

### Brief document ingested
- **Source**: `docs/brief.md` (copied to `wiki/wiki/00-glassify/brief.md`)
- **What changed**: 
  - Creado `brief.md` en wiki (summary page del documento)
  - Creado `ecosistema-participantes.md` en `20-manufacturers/`
  - Creado `ia-arquitectura.md` en `00-glassify/`
  - Creado `roadmap.md` en `00-glassify/`
  - Creado `kpis-metricas.md` en `00-glassify/`
  - Actualizado `wiki/index.md` con nuevas páginas
- **Action**: Original permanece en `docs/brief.md` (source)

---

### DesignTemplate System spec
- **Source**: `docs/superpowers/specs/2026-04-12-design-template-system.md` (copied to `raw/superpowers/specs/`)
- **What changed**: Creado `wiki/wiki/40-design/design-template-system.md`
- **Action**: `docs/superpowers/` eliminado

---

### Client Preset: Vitro Rojas Panama
- **Source**: `docs/seeders/vitro-rojas-panama.md` (copied to `raw/seeders/vitro-rojas-panama.md`)
- **What changed**: Creado `wiki/wiki/30-clients/vitro-rojas-panama.md`
- **Action**: `docs/seeders/` eliminado

### Correction: Pricing info in Vitro Rojas
- **Issue**: Raw doc decía "USD/m²" pero el sistema usa basePrice + costPerMm
- **Verification**: Leído `src/domain/pricing/` — formula es:
  - profileCost = basePrice + (costPerMmWidth × extraWidth) + (costPerMmHeight × extraHeight)
- **Action**: Actualizado wiki page para corregir el pricing,注明不再使用平方米计价

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

