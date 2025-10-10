# Prisma Migrations

Este directorio contiene todas las migraciones de base de datos generadas por Prisma.

## Migraciones Importantes

### `20251010151508_refactor_manufacturer_to_tenant_config`
**Propósito**: Refactorización arquitectónica de Manufacturer a TenantConfig + ProfileSupplier

**Cambios**:
- ✅ Creación de `TenantConfig` (singleton para configuración del negocio)
- ✅ Creación de `ProfileSupplier` (fabricantes de perfiles como Rehau, Deceuninck)
- ✅ Actualización de `Model` para usar `profileSupplierId`
- ⚠️ Deprecación de `Manufacturer` (marcado como obsoleto)

**Documentación**: Ver `docs/migrations/manufacturer-to-tenant-migration.md`

---

### `20251010203325_fix_tenant_config_singleton_with_fields`
**Propósito**: Corrección del patrón singleton en TenantConfig

**Cambios**:
- ✅ Cambio de `id String @id @default(cuid())` a `id String @id @default("1")`
- ✅ Agregado de todos los campos del modelo TenantConfig:
  - `businessName`: Nombre del negocio
  - `currency`: Código de moneda (ISO 4217)
  - `locale`: Localización (BCP 47)
  - `timezone`: Zona horaria (IANA)
  - `quoteValidityDays`: Días de validez de cotizaciones
  - `contactEmail`, `contactPhone`, `businessAddress`: Información de contacto (opcional)
- ✅ Índice en campo `currency`
- ✅ Timestamps `createdAt`, `updatedAt`

**Por qué**: 
El patrón singleton requiere un ID fijo (`"1"`) en lugar de CUID generado aleatoriamente.
Esto garantiza que:
1. Solo existe UN registro de configuración del tenant
2. El `upsert` en seed funciona correctamente (`where: { id: "1" }`)
3. Las queries siempre encuentran el mismo registro

**Validación de Entorno**:
- Variables `TENANT_*` validadas con `@t3-oss/env-nextjs`
- Ver `src/env-seed.ts` para schemas de validación
- Ver `.env.example` para variables requeridas

**Testing**:
```sql
-- Verificar singleton (debe retornar 1)
SELECT COUNT(*) FROM "TenantConfig";

-- Ver registro único
SELECT id, "businessName", currency, locale FROM "TenantConfig";
```

---

## Cómo Trabajar con Migraciones

### Crear Nueva Migración
```bash
# Modificar prisma/schema.prisma
# Luego generar migración
pnpm prisma migrate dev --name descriptive_migration_name
```

### Aplicar Migraciones en Producción
```bash
pnpm prisma migrate deploy
```

### Reset Database (Solo Desarrollo)
```bash
# ⚠️ DESTRUCTIVO: Borra todos los datos
pnpm prisma migrate reset --force
```

### Ver Estado de Migraciones
```bash
pnpm prisma migrate status
```

## Orden de Ejecución

Las migraciones se ejecutan en orden cronológico según su timestamp:
1. `20250927160157_init_auth` - Configuración inicial de NextAuth
2. `20250927170216_update_schema` - Actualización inicial del schema
3. `20250928153124_add_glass_pricing_and_model_discounts` - Pricing y descuentos
4. `20251004095213_add` - [descripción pendiente]
5. `20251009023317_add_glass_solutions_many_to_many` - Sistema de soluciones de vidrio
6. `20251009211936_add_quote_project_fields` - Campos de proyecto en cotizaciones
7. `20251010120656_add_index_in_quote` - Índices de performance
8. `20251010151508_refactor_manufacturer_to_tenant_config` - Refactorización arquitectónica
9. `20251010203325_fix_tenant_config_singleton_with_fields` - Fix singleton pattern

## Rollback Strategy

Cada migración debe ser reversible. Para rollback manual:

1. Crear migración con cambios inversos
2. Aplicar con `prisma migrate deploy`
3. Verificar integridad de datos

**Importante**: No usar `prisma migrate rollback` en producción (no existe en Prisma).
Usar estrategia forward-only con migraciones compensatorias.

## Recursos

- [Prisma Migrate Docs](https://www.prisma.io/docs/orm/prisma-migrate)
- [Migration Troubleshooting](https://www.prisma.io/docs/orm/prisma-migrate/workflows/troubleshooting)
- Guía del proyecto: `docs/migrations/manufacturer-to-tenant-migration.md`
