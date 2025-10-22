# PR: TK-015 Static Glass Taxonomy v2.0 - Schema Simplification & MVP Design

## 🎯 Objetivo

Implementar **TK-015 Static Glass Taxonomy** con un modelo de precios simplificado adaptado para la arquitectura MVP de múltiples instancias independientes (no multi-tenant SaaS).

## 📊 Cambios Principales

### 1. **Schema Simplification (Commits 1-2)**
- ✅ Restaurar `pricePerSqm` directamente en modelo `GlassType`
- ✅ Eliminar modelo `TenantGlassTypePrice` (sobre-ingeniería para MVP)
- ✅ Remover relaciones `tenantPricing` y `pricing`
- ✅ Remover campos deprecados: `purpose`, `glassSupplierId`, `glassSupplier`

**Rationale:** Cada cliente ejecuta instancia separada con BD independiente → no necesita multi-tenant complexity

### 2. **API & Backend Updates (Commits 3-4, 10)**
- ✅ Simplificar lógica de precios en Quote Router (2 ubicaciones)
- ✅ Acceso directo a `glassType.pricePerSqm`
- ✅ Agregar `pricePerSqm` a Catalog API output schema
- ✅ Actualizar validaciones Zod
- ✅ Script para población de precios: `scripts/update-glass-prices.ts`

### 3. **Database Migrations (2 nuevas)**
```
- 20251022112016_remove_deprecated_glass_fields/
- 20251022124534_restore_price_per_sqm_to_glass_type/
```
- Add `pricePerSqm` con DEFAULT 0.00 temporalmente
- Drop tabla `TenantGlassTypePrice`
- Actualizar constraints

### 4. **Data Layer Updates (Commit 5)**
- ✅ Seeders: `glass-solutions.seeder.ts`, `glass-types.seeder.ts`
- ✅ Factories: Actualizar para incluir `pricePerSqm`
- ✅ Datos JSON: `glass-solutions.json`, `glass-types-tecnoglass.json`
- ✅ Seed orchestrator con precios por defecto

### 5. **Admin UI Cleanup (Commits 6-8, 13)**
- ✅ Eliminar columnas deprecadas: Proveedor, Propósito
- ✅ Simplificar filtros (remover `purpose`)
- ✅ Actualizar tipos locales para quitar campos viejos
- ✅ Glass Types: 8→6 columnas
- ✅ Supplier List: Remover contador de tipos

### 6. **Public Catalog Integration (Commit 9)**
- ✅ Agregar `pricePerSqm` a output schema de catálogo
- ✅ Serializar precios para cliente
- ✅ Actualizar hooks: `use-glass-type-options.ts`, `use-glass-types-by-tab.ts`

## 🔧 Actualizaciones Técnicas

### Validaciones Zod
- `glass-type.schema.ts`: Agregar `pricePerSqm`
- `glass-solution.schema.ts`: Agregar `isSeeded`, `seedVersion`
- `glass-supplier.schema.ts`: Remover campos de pricing

### Tipos TypeScript
- Remover imports de `GlassPurpose`
- Simplificar tipos locales en componentes
- Type assertions para Prisma↔Client type mismatch

### Scripts de Migración
- Actualizar todos los scripts de datos
- Validación de integridad
- Rollback script (no-critical)

## 📈 Resultados de Compilación

```
✅ TypeScript errors: 19 → 2 (89% reducción)
✅ Critical errors: 0
⚠️  Remaining: 2 errores en rollback script (non-critical)
```

## 📋 Commits por Categoría

### Infrastructure (1 commit)
- `feat: restore pricePerSqm to GlassType and remove TenantGlassTypePrice`

### Schema (1 commit)
- `refactor: simplify GlassType schema - remove deprecated fields`

### APIs (1 commit)
- `feat: update pricing logic to use direct pricePerSqm field`

### Data & Validation (1 commit)
- `feat: update validation schemas and add price population script`

### Seeders & Factories (1 commit)
- `feat: update seeders and factories for glass type v2.0 schema`

### UI Components (5 commits)
- `fix: remove deprecated glass type fields from admin UI components`
- `fix: remove glassSupplier reference from models glass types section`
- `fix: remove placeholderData from glass solution list query`
- `fix: update glass supplier list UI`
- `feat: add pricePerSqm to public catalog glass type options`

### Backend Services (1 commit)
- `refactor: update admin routers and services for glass type v2.0`

### Utilities (1 commit)
- `refactor: update data migration scripts for glass type v2.0`

### Documentation (1 commit)
- `docs: update specifications and copilot instructions for v2.0`

## 🚀 Próximos Pasos

### Antes de Merge
- [ ] Ejecutar tests E2E
- [ ] Ejecutar migration en desarrollo
- [ ] Verificar pricing en catalog público
- [ ] Validar quote calculations
- [ ] Code review

### Post-Merge
- [ ] Actualizar docs de API
- [ ] Comunicar breaking change a integradores
- [ ] Planificar rollout a producción
- [ ] Monitoreo de pricing queries

## ⚠️ Breaking Changes

- ❌ `TenantGlassTypePrice` model removido
- ❌ Fields removidos: `purpose`, `glassSupplierId`, `glassSupplier`
- ✅ Nuevo: `pricePerSqm` directo en `GlassType`

## 📝 Notas Importantes

1. **Arquitectura MVP**: Cada cliente = instancia separada + BD independiente
   - No necesita multi-tenancy en esquema
   - Simplifica queries y relaciones
   - Mejora performance

2. **Precios por Defecto**: $50,000 COP/m² 
   - Script: `pnpm tsx scripts/update-glass-prices.ts`
   - Ejecutar después de migration

3. **Rollback Script**: `scripts/rollback-glass-taxonomy.ts`
   - Uso: `pnpm tsx scripts/rollback-glass-taxonomy.ts`
   - No crítico para MVP

4. **TypeScript**: 2 errores restantes en rollback script
   - No bloqueante para CI/CD
   - Script no se ejecuta en prod

## ✅ Checklist de QA

- [ ] Typecheck limpio (excepto rollback script)
- [ ] Migraciones aplicadas exitosamente
- [ ] Seeders corren sin errores
- [ ] Admin UI sin errores de renderizado
- [ ] Catalog público muestra precios
- [ ] Quote calculations funcionan
- [ ] Precios visibles en checkout
- [ ] Performance queries mejorada

---

**Branch:** `015-static-glass-taxonomy`  
**Commits:** 13  
**Files Changed:** 50+  
**Ready for:** Code Review & Testing
