# TODO: Migración de schemas Prisma → Drizzle

Este archivo sirve para marcar el avance de la migración, siguiendo el orden recomendado. Marca cada ítem como `[x]` cuando esté migrado y validado.

```markdown
- [X] Migrar enums globales a Drizzle (`enums.schema.ts`)
- [X] Migrar modelo User (`user.schema.ts`)
- [X] Migrar modelo Account (`account.schema.ts`)
- [X] Migrar modelo Session (`session.schema.ts`)
- [X] Migrar modelo VerificationToken y Verification (`verification.schema.ts`)
- [X] Migrar modelo TenantConfig (`tenant-config.schema.ts`)
- [ ] Migrar modelo ProfileSupplier (`profile-supplier.schema.ts`)
- [ ] Migrar modelo Manufacturer (`manufacturer.schema.ts`)
- [ ] Migrar modelo Model (`model.schema.ts`)
- [ ] Migrar modelo GlassType (`glass-type.schema.ts`)
- [ ] Migrar modelo GlassSupplier (`glass-supplier.schema.ts`)
- [ ] Migrar modelo Service (`service.schema.ts`)
- [ ] Migrar modelo Quote (`quote.schema.ts`)
- [ ] Migrar modelo QuoteItem (`quote-item.schema.ts`)
- [ ] Migrar modelo QuoteItemService (`quote-item-service.schema.ts`)
- [ ] Migrar modelo Adjustment (`adjustment.schema.ts`)
- [ ] Migrar modelo ModelCostBreakdown (`model-cost-breakdown.schema.ts`)
- [ ] Migrar modelo ModelPriceHistory (`model-price-history.schema.ts`)
- [ ] Migrar modelo GlassSolution (`glass-solution.schema.ts`)
- [ ] Migrar modelo GlassTypeSolution (`glass-type-solution.schema.ts`)
- [ ] Migrar modelo GlassCharacteristic (`glass-characteristic.schema.ts`)
- [ ] Migrar modelo GlassTypeCharacteristic (`glass-type-characteristic.schema.ts`)
- [ ] Migrar modelo Color (`color.schema.ts`)
- [ ] Migrar modelo ModelColor (`model-color.schema.ts`)
- [ ] Migrar modelo ProjectAddress (`project-address.schema.ts`)
```

> Actualiza este archivo conforme avances. Si algún modelo depende de otro, respeta el orden para evitar errores de referencia.
