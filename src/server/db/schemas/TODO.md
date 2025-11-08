# TODO: Migración de schemas Prisma → Drizzle

Este archivo sirve para marcar el avance de la migración, siguiendo el orden recomendado. Marca cada ítem como `[x]` cuando esté migrado y validado.

```markdown
- [X] Migrar enums globales a Drizzle (`enums.schema.ts`)
- [X] Migrar modelo User (`user.schema.ts`)
- [X] Migrar modelo Account (`account.schema.ts`)
- [X] Migrar modelo Session (`session.schema.ts`)
- [X] Migrar modelo VerificationToken y Verification (`verification.schema.ts`)
- [X] Migrar modelo TenantConfig (`tenant-config.schema.ts`)
- [X] Migrar modelo ProfileSupplier (`profile-supplier.schema.ts`)
- [X] Migrar modelo Manufacturer (`manufacturer.schema.ts`)
- [X] Migrar modelo Model (`model.schema.ts`)
- [X] Migrar modelo GlassType (`glass-type.schema.ts`)
- [X] Migrar modelo GlassSupplier (`glass-supplier.schema.ts`)
- [X] Migrar modelo Service (`service.schema.ts`)
- [X] Migrar modelo Quote (`quote.schema.ts`)
- [X] Migrar modelo QuoteItem (`quote-item.schema.ts`)
- [X] Migrar modelo QuoteItemService (`quote-item-service.schema.ts`)
- [X] Migrar modelo Adjustment (`adjustment.schema.ts`)
- [X] Migrar modelo ModelCostBreakdown (`model-cost-breakdown.schema.ts`)
- [X] Migrar modelo ModelPriceHistory (`model-price-history.schema.ts`)
- [X] Migrar modelo GlassSolution (`glass-solution.schema.ts`)
- [X] Migrar modelo GlassTypeSolution (`glass-type-solution.schema.ts`)
- [X] Migrar modelo GlassCharacteristic (`glass-characteristic.schema.ts`)
- [X] Migrar modelo GlassTypeCharacteristic (`glass-type-characteristic.schema.ts`)
- [X] Migrar modelo Color (`color.schema.ts`)
- [X] Migrar modelo ModelColor (`model-color.schema.ts`)
- [X] Migrar modelo ProjectAddress (`project-address.schema.ts`)
```

> ✅ **MIGRACIÓN COMPLETADA** - Todos los 25 modelos han sido migrados exitosamente de Prisma a Drizzle ORM.
