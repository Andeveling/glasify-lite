# Proposal: migrate-sqlite-compatible-glass-array

## Intent

Arreglar el desface arquitectónico donde `compatibleGlassTypeIds` era `String[]` en PostgreSQL, se convirtió a `String` para SQLite, pero el codebase completo sigue usando arrays. Esto afecta seeders, runtime queries, Zod schemas y domain services.

## Scope

### In Scope
- Convertir todos los archivos que escriben `compatibleGlassTypeIds` para usar `JSON.stringify()`
- Convertir todos los archivos que leen `compatibleGlassTypeIds` para usar `JSON.parse()` + `.includes()`
- Actualizar Zod schemas de `z.array(z.string())` a `z.string()` para inputs de API
- Ajustar domain services que filtran por este campo
- Verificar seed completo (minimal y vitro-rojas-panama)

### Out of Scope
- Nuevas features o refactors no relacionados
- Cambios en el schema (ya está hecho: `String`)

## Approach

### Estrategia: JSON Serialization Layer

El campo en schema es `String` (SQLite compatible). Se introduce una capa de conversión:

```
Writing: Array → JSON.stringify() → String en DB
Reading: String de DB → JSON.parse() → Array en memoria → .includes()
```

### Archivos a Modificar

| Categoría | Archivos | Cambio |
|-----------|----------|--------|
| Seeders data | `prisma/data/**/models-*.data.ts` | `["placeholder"]` → `"[\"placeholder\"]"` |
| Seed orchestrator | `prisma/seeders/seed-orchestrator.ts` | `JSON.stringify()` al crear models |
| Factories | `prisma/factories/model.factory.ts` | Serialize al crear |
| Runtime queries | `src/server/api/routers/catalog/catalog.queries.ts` | `JSON.parse()` + `.includes()` |
| Domain services | `src/domain/quotes/services/quote-validator.service.ts` | `JSON.parse()` |
| Referential integrity | `src/server/services/referential-integrity.service.ts` | Parse y filter |
| Zod schemas (admin) | `src/server/api/routers/admin/model.ts` | `z.array()` → `z.string()` |
| Zod schemas (catalog) | `src/server/api/routers/catalog/catalog.schemas.ts` | `z.array()` → `z.string()` |
| Form schemas | `src/app/(dashboard)/admin/models/_schemas/model-form.schema.ts` | `z.array()` → `z.string()` |
| Catalog utils | `src/app/(public)/catalog/_utils/catalog.utils.ts` | Tipo `string[]` → `string` con parse |
| Tests | `tests/unit/domain/quotes/*.ts` | Actualizar mocks |
| Presets | `prisma/data/presets/*.preset.ts` | String JSON en vez de arrays |

## Capabilities

### Modified Capabilities
- `model-management`: El campo compatibleGlassTypeIds ahora es JSON string, no array nativo
- `quote-calculation`: Validación de vidrios compatibles ahora parsea JSON
- `catalog-display`: Filtering de modelos por glass type ahora funciona con JSON

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `prisma/schema.prisma` | Done | Campo ya es String |
| `prisma/data/**/*.data.ts` | Modified | Arrays → JSON strings |
| `prisma/factories/model.factory.ts` | Modified | Serialize input |
| `src/server/api/routers/admin/model.ts` | Modified | Zod schema y mutation |
| `src/server/api/routers/catalog/catalog.*` | Modified | Query y schema |
| `src/domain/quotes/services/*` | Modified | Parse para validación |
| `src/server/services/referential-integrity.service.ts` | Modified | Parse para filter |
| `tests/unit/**` | Modified | Actualizar mocks |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Olvidar algún archivo que usa `.includes()` en array | Medium | Busqueda exhaustiva con grep post-migrate |
| Performance: JSON.parse en cada query | Low | Cache en memoria si es necesario |
| Breaking change si alguien lee directo sin parse | High | Documentar, crear helper util |

## Rollback Plan

1. Git revert del cambio completo
2. Volver a PostgreSQL ( Neon adapter ya está removido de deps, habría que reinstall)
3. Restaurar schema: `String` → `String[]` (PostgreSQL lo soporta)

## Dependencies

- Prisma 7.2.0 (ya instalado)
- libsql adapter (ya instalado)

## Success Criteria

- [ ] `pnpm seed:minimal` corre sin errores
- [ ] `pnpm seed --preset=vitro-rojas-panama` corre sin errores
- [ ] `pnpm dev` inicia sin errores
- [ ] Crear quote con glass type funciona (catalog queries)
- [ ] Tests pasan: `pnpm test`
- [ ] No warnings de "JSON.parse" faltante en runtime
