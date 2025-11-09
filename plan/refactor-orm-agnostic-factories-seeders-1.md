---
goal: Migrar Sistema de Factories y Seeders a Arquitectura ORM-Agnostic
version: 1.0
date_created: 2025-11-09
last_updated: 2025-11-09
owner: Glasify Lite Team
status: 'Planned'
tags: [refactor, architecture, migration, seeding, factories, drizzle, zod]
---

# Migración: Sistema de Factories y Seeders ORM-Agnostic

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

## Introducción

Este plan establece una arquitectura de factories y seeders completamente independiente de cualquier ORM (Prisma, Drizzle, etc.) para mitigar problemas futuros durante migraciones de infraestructura de datos. La arquitectura se basa en:

1. **Zod schemas** como única fuente de verdad para validación
2. **Plain TypeScript types** derivados de Drizzle schemas (no del ORM directamente)
3. **Factory functions puras** que generan objetos JavaScript validados
4. **Seeder orchestrators** que manejan la inserción en base de datos con cualquier cliente

**Principio fundamental**: Los factories producen objetos de datos planos (POJOs) validados con Zod. La responsabilidad de persistencia queda en los seeders, que pueden usar cualquier ORM/cliente de base de datos.

---

## 1. Requirements & Constraints

### Arquitectura

- **REQ-001**: Factories DEBEN producir objetos JavaScript planos (POJOs) sin dependencias de ORM
- **REQ-002**: Validación DEBE hacerse exclusivamente con Zod schemas
- **REQ-003**: Types DEBEN derivarse de Drizzle schemas usando `createInsertSchema`
- **REQ-004**: Seeders DEBEN ser el único componente con conocimiento del cliente de base de datos
- **REQ-005**: Factory functions DEBEN ser puras (sin efectos secundarios, sin I/O)
- **REQ-006**: DEBE mantenerse retrocompatibilidad durante la migración (parallel running)

### Performance & Seguridad

- **SEC-001**: Validación Zod DEBE ejecutarse en factories antes de persistencia
- **SEC-002**: Decimal handling DEBE usar `decimal.js` (no Prisma Decimal)
- **PER-001**: Skip validation DEBE estar disponible para seeds grandes (opt-in)
- **PER-002**: Batch inserts DEBEN soportarse para entidades relacionadas

### Testing & Calidad

- **TEST-001**: Factories DEBEN poder testearse sin base de datos (unit tests)
- **TEST-002**: Seeders DEBEN tener integration tests con base de datos real
- **COV-001**: Coverage mínimo 80% para factories y utilities

### Directrices de Código

- **GUD-001**: NO crear barrel files (`index.ts`) - imports directos solamente
- **GUD-002**: Usar naming convention: `<entity>.factory.ts`, `<entity>.seeder.ts`
- **GUD-003**: Comentarios en inglés, tipos y esquemas documentados con JSDoc
- **GUD-004**: Seguir Clean Code principles (SRP, DRY, KISS)

### Patrones Establecidos

- **PAT-001**: Factory Pattern - Pure functions que retornan `FactoryResult<T>`
- **PAT-002**: Repository Pattern - Seeders actúan como repositories específicos
- **PAT-003**: Result Pattern - Siempre retornar `{ success, data, errors }`
- **PAT-004**: Orchestrator Pattern - Coordinación de múltiples seeders

### Constraints

- **CON-001**: DEBE mantener compatibilidad con seed scripts existentes durante migración
- **CON-002**: NO puede romper seeding actual hasta completar migración completa
- **CON-003**: Decimal.js DEBE usarse consistentemente (no mezclar con Prisma Decimal)
- **CON-004**: Package.json NO debe incluir `@prisma/client` al final de migración

---

## 2. Implementation Steps

### Implementation Phase 1: Infraestructura Base (Foundation)

**GOAL-001**: Crear nueva arquitectura base ORM-agnostic sin romper sistema existente

| Task     | Description                                                                     | Completed | Date |
| -------- | ------------------------------------------------------------------------------- | --------- | ---- |
| TASK-001 | Crear `/src/lib/seeding/` directory structure                                   |           |      |
| TASK-002 | Crear `/src/lib/seeding/types/base.types.ts` con tipos base ORM-agnostic        |           |      |
| TASK-003 | Crear `/src/lib/seeding/utils/validation.utils.ts` con utilities Zod            |           |      |
| TASK-004 | Crear `/src/lib/seeding/utils/decimal.utils.ts` para manejo de decimales        |           |      |
| TASK-005 | Crear `/src/lib/seeding/contracts/seeder.interface.ts` con contratos de seeders |           |      |
| TASK-006 | Migrar utilities de `/prisma/factories/utils.ts` a nueva ubicación              |           |      |
| TASK-007 | Crear tests unitarios para utilities (`validation.utils.test.ts`)               |           |      |

**Estructura esperada**:
```
src/lib/seeding/
├── types/
│   ├── base.types.ts          # FactoryResult, SeederOptions, ValidationError
│   └── entity.types.ts        # Derived types from Drizzle schemas
├── utils/
│   ├── validation.utils.ts    # validateWithSchema, mapZodErrors
│   ├── decimal.utils.ts       # Decimal handling with decimal.js
│   └── formatting.utils.ts    # Phone, currency formatting
├── contracts/
│   └── seeder.interface.ts    # ISeeder, IOrchestrator interfaces
└── README.md                  # Architecture documentation
```

---

### Implementation Phase 2: Factory Migration - ProfileSupplier (Pilot)

**GOAL-002**: Migrar ProfileSupplier factory como caso piloto (entidad simple, sin relaciones complejas)

| Task     | Description                                                                          | Completed | Date |
| -------- | ------------------------------------------------------------------------------------ | --------- | ---- |
| TASK-008 | Crear Zod schema derivado: `/src/lib/seeding/schemas/profile-supplier.schema.ts`     |           |      |
| TASK-009 | Crear factory ORM-agnostic: `/src/lib/seeding/factories/profile-supplier.factory.ts` |           |      |
| TASK-010 | Crear seeder Drizzle: `/src/lib/seeding/seeders/profile-supplier.seeder.ts`          |           |      |
| TASK-011 | Crear unit tests para factory (sin DB): `profile-supplier.factory.test.ts`           |           |      |
| TASK-012 | Crear integration tests para seeder: `profile-supplier.seeder.test.ts`               |           |      |
| TASK-013 | Actualizar `/prisma/seed-tenant.ts` para usar nueva implementación (parallel)        |           |      |
| TASK-014 | Validar seeding funcional con ambos sistemas (old + new)                             |           |      |

**Validation criteria**:
- Factory genera objetos válidos sin base de datos
- Seeder inserta correctamente con Drizzle client
- Tests pasan con 100% coverage
- Seed scripts funcionan sin cambios visibles

---

### Implementation Phase 3: Factory Migration - GlassSupplier

**GOAL-003**: Migrar GlassSupplier factory (segunda entidad simple)

| Task     | Description                                                           | Completed | Date |
| -------- | --------------------------------------------------------------------- | --------- | ---- |
| TASK-015 | Crear Zod schema: `/src/lib/seeding/schemas/glass-supplier.schema.ts` |           |      |
| TASK-016 | Crear factory: `/src/lib/seeding/factories/glass-supplier.factory.ts` |           |      |
| TASK-017 | Crear seeder: `/src/lib/seeding/seeders/glass-supplier.seeder.ts`     |           |      |
| TASK-018 | Crear unit tests: `glass-supplier.factory.test.ts`                    |           |      |
| TASK-019 | Crear integration tests: `glass-supplier.seeder.test.ts`              |           |      |
| TASK-020 | Actualizar `/prisma/seed-tenant.ts` para usar nueva implementación    |           |      |
| TASK-021 | Validar seeding funcional                                             |           |      |

---

### Implementation Phase 4: Factory Migration - GlassCharacteristic

**GOAL-004**: Migrar GlassCharacteristic factory (tercera entidad simple)

| Task     | Description                                                                 | Completed | Date |
| -------- | --------------------------------------------------------------------------- | --------- | ---- |
| TASK-022 | Crear Zod schema: `/src/lib/seeding/schemas/glass-characteristic.schema.ts` |           |      |
| TASK-023 | Crear factory: `/src/lib/seeding/factories/glass-characteristic.factory.ts` |           |      |
| TASK-024 | Crear seeder: `/src/lib/seeding/seeders/glass-characteristic.seeder.ts`     |           |      |
| TASK-025 | Crear unit tests: `glass-characteristic.factory.test.ts`                    |           |      |
| TASK-026 | Crear integration tests: `glass-characteristic.seeder.test.ts`              |           |      |
| TASK-027 | Actualizar `/prisma/seed-tenant.ts` para usar nueva implementación          |           |      |
| TASK-028 | Validar seeding funcional                                                   |           |      |

---

### Implementation Phase 5: Factory Migration - Service

**GOAL-005**: Migrar Service factory (entidad con Decimal handling)

| Task     | Description                                                                         | Completed | Date |
| -------- | ----------------------------------------------------------------------------------- | --------- | ---- |
| TASK-029 | Crear Zod schema: `/src/lib/seeding/schemas/service.schema.ts`                      |           |      |
| TASK-030 | Implementar factory con Decimal.js: `/src/lib/seeding/factories/service.factory.ts` |           |      |
| TASK-031 | Crear seeder: `/src/lib/seeding/seeders/service.seeder.ts`                          |           |      |
| TASK-032 | Crear unit tests: `service.factory.test.ts` (validar decimal handling)              |           |      |
| TASK-033 | Crear integration tests: `service.seeder.test.ts`                                   |           |      |
| TASK-034 | Actualizar orchestrator para usar nueva implementación                              |           |      |
| TASK-035 | Validar seeding funcional                                                           |           |      |

---

### Implementation Phase 6: Factory Migration - GlassType (Entidad Compleja)

**GOAL-006**: Migrar GlassType factory (entidad con relaciones y campos complejos)

| Task     | Description                                                                   | Completed | Date |
| -------- | ----------------------------------------------------------------------------- | --------- | ---- |
| TASK-036 | Crear Zod schema: `/src/lib/seeding/schemas/glass-type.schema.ts`             |           |      |
| TASK-037 | Implementar factory: `/src/lib/seeding/factories/glass-type.factory.ts`       |           |      |
| TASK-038 | Crear seeder con FK handling: `/src/lib/seeding/seeders/glass-type.seeder.ts` |           |      |
| TASK-039 | Crear unit tests: `glass-type.factory.test.ts`                                |           |      |
| TASK-040 | Crear integration tests: `glass-type.seeder.test.ts`                          |           |      |
| TASK-041 | Actualizar orchestrator para manejar relaciones                               |           |      |
| TASK-042 | Validar seeding funcional con relaciones                                      |           |      |

---

### Implementation Phase 7: Factory Migration - GlassSolution

**GOAL-007**: Migrar GlassSolution factory (entidad con slug generation)

| Task     | Description                                                                 | Completed | Date |
| -------- | --------------------------------------------------------------------------- | --------- | ---- |
| TASK-043 | Crear Zod schema: `/src/lib/seeding/schemas/glass-solution.schema.ts`       |           |      |
| TASK-044 | Implementar factory: `/src/lib/seeding/factories/glass-solution.factory.ts` |           |      |
| TASK-045 | Crear seeder: `/src/lib/seeding/seeders/glass-solution.seeder.ts`           |           |      |
| TASK-046 | Crear unit tests: `glass-solution.factory.test.ts`                          |           |      |
| TASK-047 | Crear integration tests: `glass-solution.seeder.test.ts`                    |           |      |
| TASK-048 | Actualizar orchestrator                                                     |           |      |
| TASK-049 | Validar seeding funcional                                                   |           |      |

---

### Implementation Phase 8: Factory Migration - Model (Most Complex)

**GOAL-008**: Migrar Model factory (entidad más compleja con múltiples Decimals y validaciones)

| Task     | Description                                                                                   | Completed | Date |
| -------- | --------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-050 | Crear Zod schema: `/src/lib/seeding/schemas/model.schema.ts`                                  |           |      |
| TASK-051 | Implementar factory con validaciones complejas: `/src/lib/seeding/factories/model.factory.ts` |           |      |
| TASK-052 | Crear seeder: `/src/lib/seeding/seeders/model.seeder.ts`                                      |           |      |
| TASK-053 | Crear unit tests extensivos: `model.factory.test.ts`                                          |           |      |
| TASK-054 | Crear integration tests: `model.seeder.test.ts`                                               |           |      |
| TASK-055 | Actualizar orchestrator para manejar Model seeding                                            |           |      |
| TASK-056 | Validar seeding funcional con todos los presets                                               |           |      |

---

### Implementation Phase 9: Orchestrator Refactor

**GOAL-009**: Refactorizar Seed Orchestrator para arquitectura ORM-agnostic

| Task     | Description                                                                     | Completed | Date |
| -------- | ------------------------------------------------------------------------------- | --------- | ---- |
| TASK-057 | Crear nuevo orchestrator: `/src/lib/seeding/orchestrators/seed-orchestrator.ts` |           |      |
| TASK-058 | Implementar dependency injection para seeders (ISeeder interface)               |           |      |
| TASK-059 | Implementar preset loading desde `/src/lib/seeding/presets/`                    |           |      |
| TASK-060 | Crear logging system independiente de Prisma                                    |           |      |
| TASK-061 | Implementar error handling y rollback strategies                                |           |      |
| TASK-062 | Migrar todos los presets existentes a nueva estructura                          |           |      |
| TASK-063 | Crear tests para orchestrator: `seed-orchestrator.test.ts`                      |           |      |
| TASK-064 | Validar seeding completo con todos los presets                                  |           |      |

---

### Implementation Phase 10: Seed Scripts Migration

**GOAL-010**: Migrar seed scripts para usar nueva arquitectura

| Task     | Description                                                                | Completed | Date |
| -------- | -------------------------------------------------------------------------- | --------- | ---- |
| TASK-065 | Crear nuevo seed CLI: `/src/lib/seeding/cli/seed.cli.ts`                   |           |      |
| TASK-066 | Migrar `prisma/seed-tenant.ts` a `/src/lib/seeding/scripts/seed-tenant.ts` |           |      |
| TASK-067 | Migrar `prisma/seed-cli.ts` a `/src/lib/seeding/scripts/seed-cli.ts`       |           |      |
| TASK-068 | Actualizar `package.json` scripts para usar nueva ubicación                |           |      |
| TASK-069 | Crear documentación de uso: `/src/lib/seeding/README.md`                   |           |      |
| TASK-070 | Validar todos los comandos seed funcionan correctamente                    |           |      |

---

### Implementation Phase 11: Cleanup & Deprecation

**GOAL-011**: Eliminar código legacy de Prisma factories y seeders

| Task     | Description                                                                 | Completed | Date |
| -------- | --------------------------------------------------------------------------- | --------- | ---- |
| TASK-071 | Marcar `/prisma/factories/` como deprecated (agregar README.md)             |           |      |
| TASK-072 | Marcar `/prisma/seeders/` como deprecated                                   |           |      |
| TASK-073 | Eliminar imports de `@prisma/client` en factories                           |           |      |
| TASK-074 | Eliminar imports de `Decimal` de Prisma (usar decimal.js)                   |           |      |
| TASK-075 | Actualizar imports en todo el proyecto para usar nueva ubicación            |           |      |
| TASK-076 | Ejecutar tests E2E completos de seeding                                     |           |      |
| TASK-077 | Actualizar informe de auditoría Prisma (`docs/informe-auditoria-prisma.md`) |           |      |

---

### Implementation Phase 12: Final Validation & Documentation

**GOAL-012**: Validación final y documentación completa

| Task     | Description                                                            | Completed | Date |
| -------- | ---------------------------------------------------------------------- | --------- | ---- |
| TASK-078 | Ejecutar seeding completo en ambiente fresh (todas las entidades)      |           |      |
| TASK-079 | Validar performance benchmarks (comparar old vs new)                   |           |      |
| TASK-080 | Crear migration guide: `/docs/architecture/seeding-migration-guide.md` |           |      |
| TASK-081 | Actualizar ADRs (Architecture Decision Records)                        |           |      |
| TASK-082 | Crear video/tutorial de nueva arquitectura (opcional)                  |           |      |
| TASK-083 | Eliminar `/prisma/factories/` y `/prisma/seeders/` directories         |           |      |
| TASK-084 | Actualizar CHANGELOG.md con cambios                                    |           |      |
| TASK-085 | Crear PR con revisión completa de arquitectura                         |           |      |

---

## 3. Alternatives

- **ALT-001**: **Keep Prisma factories** - Mantener factories con Prisma y solo migrar seeders
  - **Rechazado**: No resuelve el problema de dependencia de ORM, solo lo pospone
  
- **ALT-002**: **Use TypeORM factories** - Migrar a TypeORM en lugar de arquitectura ORM-agnostic
  - **Rechazado**: Reemplazar una dependencia de ORM con otra no resuelve el problema raíz
  
- **ALT-003**: **Generate factories from database** - Auto-generar factories desde esquema DB
  - **Rechazado**: Pierde flexibilidad para validaciones custom y business logic en factories
  
- **ALT-004**: **Use external seeding libraries** (faker, factory-bot)
  - **Rechazado**: Agrega dependencias externas innecesarias, mejor control con implementación custom
  
- **ALT-005**: **Migrate all at once (Big Bang)** - Migrar todo el sistema de una vez
  - **Rechazado**: Alto riesgo, preferimos migración incremental (entidad por entidad)

---

## 4. Dependencies

### Paquetes NPM

- **DEP-001**: `zod` (^3.24.1) - Ya instalado ✅
- **DEP-002**: `decimal.js` (^10.6.0) - Ya instalado ✅
- **DEP-003**: `drizzle-zod` (latest) - Para generar schemas Zod desde Drizzle
- **DEP-004**: `drizzle-orm` (^0.44.7) - Ya instalado ✅

### Infraestructura

- **DEP-005**: Drizzle client configurado (`src/server/db/index.ts`)
- **DEP-006**: PostgreSQL database con esquemas Drizzle migrados
- **DEP-007**: TypeScript 5.9.3+ para typed schemas

### Código Existente

- **DEP-008**: `/src/server/db/schemas/` - Drizzle schemas como fuente de verdad
- **DEP-009**: `/prisma/data/` - Datos JSON de presets (reusar sin cambios)
- **DEP-010**: `/prisma/factories/types.ts` y `utils.ts` - Lógica reutilizable

---

## 5. Files

### Nuevos Archivos (Core)

- **FILE-001**: `/src/lib/seeding/types/base.types.ts` - Tipos base ORM-agnostic
- **FILE-002**: `/src/lib/seeding/utils/validation.utils.ts` - Utilities Zod
- **FILE-003**: `/src/lib/seeding/utils/decimal.utils.ts` - Decimal handling
- **FILE-004**: `/src/lib/seeding/contracts/seeder.interface.ts` - Interfaces

### Nuevos Archivos (Factories)

- **FILE-005**: `/src/lib/seeding/factories/profile-supplier.factory.ts`
- **FILE-006**: `/src/lib/seeding/factories/glass-supplier.factory.ts`
- **FILE-007**: `/src/lib/seeding/factories/glass-characteristic.factory.ts`
- **FILE-008**: `/src/lib/seeding/factories/service.factory.ts`
- **FILE-009**: `/src/lib/seeding/factories/glass-type.factory.ts`
- **FILE-010**: `/src/lib/seeding/factories/glass-solution.factory.ts`
- **FILE-011**: `/src/lib/seeding/factories/model.factory.ts`

### Nuevos Archivos (Seeders)

- **FILE-012**: `/src/lib/seeding/seeders/profile-supplier.seeder.ts`
- **FILE-013**: `/src/lib/seeding/seeders/glass-supplier.seeder.ts`
- **FILE-014**: `/src/lib/seeding/seeders/glass-characteristic.seeder.ts`
- **FILE-015**: `/src/lib/seeding/seeders/service.seeder.ts`
- **FILE-016**: `/src/lib/seeding/seeders/glass-type.seeder.ts`
- **FILE-017**: `/src/lib/seeding/seeders/glass-solution.seeder.ts`
- **FILE-018**: `/src/lib/seeding/seeders/model.seeder.ts`

### Archivos Modificados

- **FILE-019**: `/prisma/seed-tenant.ts` - Actualizar para parallel running
- **FILE-020**: `/prisma/seed-cli.ts` - Actualizar para parallel running
- **FILE-021**: `/package.json` - Actualizar seed scripts
- **FILE-022**: `/docs/informe-auditoria-prisma.md` - Actualizar progreso

### Archivos a Eliminar (Fase Final)

- **FILE-023**: `/prisma/factories/*.factory.ts` (7 archivos)
- **FILE-024**: `/prisma/seeders/*.seeder.ts` (6 archivos)
- **FILE-025**: `/prisma/migrations-scripts/migrate-project-addresses.ts`

---

## 6. Testing

### Unit Tests (sin base de datos)

- **TEST-001**: `validation.utils.test.ts` - Test utilities Zod
  - Validar `validateWithSchema` con schemas válidos/inválidos
  - Validar `mapZodErrors` formatea correctamente
  
- **TEST-002**: `decimal.utils.test.ts` - Test decimal handling
  - Validar conversión string → Decimal → number
  - Validar edge cases (null, undefined, invalid strings)
  
- **TEST-003**: `profile-supplier.factory.test.ts` - Test factory ProfileSupplier
  - Genera objetos válidos con datos mínimos
  - Valida campos requeridos vs opcionales
  - Maneja overrides correctamente
  
- **TEST-004**: `glass-supplier.factory.test.ts` - Test factory GlassSupplier
- **TEST-005**: `glass-characteristic.factory.test.ts` - Test factory GlassCharacteristic
- **TEST-006**: `service.factory.test.ts` - Test factory Service (decimal handling)
- **TEST-007**: `glass-type.factory.test.ts` - Test factory GlassType
- **TEST-008**: `glass-solution.factory.test.ts` - Test factory GlassSolution
- **TEST-009**: `model.factory.test.ts` - Test factory Model (casos complejos)

### Integration Tests (con base de datos)

- **TEST-010**: `profile-supplier.seeder.test.ts` - Test seeder ProfileSupplier
  - Inserta correctamente con Drizzle
  - Maneja duplicados (upsert)
  - Rollback en caso de error
  
- **TEST-011**: `glass-supplier.seeder.test.ts` - Test seeder GlassSupplier
- **TEST-012**: `glass-characteristic.seeder.test.ts` - Test seeder GlassCharacteristic
- **TEST-013**: `service.seeder.test.ts` - Test seeder Service
- **TEST-014**: `glass-type.seeder.test.ts` - Test seeder GlassType (FK validation)
- **TEST-015**: `glass-solution.seeder.test.ts` - Test seeder GlassSolution
- **TEST-016**: `model.seeder.test.ts` - Test seeder Model

### E2E Tests (seeding completo)

- **TEST-017**: `seed-orchestrator.e2e.test.ts` - Test orchestrator completo
  - Seed preset "minimal" exitoso
  - Seed preset "full-catalog" exitoso
  - Manejo de errores en cadena de dependencias
  - Performance benchmarks (tiempo de ejecución)

---

## 7. Risks & Assumptions

### Riesgos Críticos

- **RISK-001**: **Breaking changes durante migración** - Seed scripts existentes dejan de funcionar
  - **Mitigación**: Parallel running durante toda la migración (old + new system coexisten)
  - **Contingencia**: Rollback inmediato si hay problemas en seeding
  
- **RISK-002**: **Performance degradation** - Nueva arquitectura más lenta que Prisma
  - **Mitigación**: Benchmarks en cada fase, optimizar batch inserts
  - **Contingencia**: Revertir a Prisma si performance cae >30%
  
- **RISK-003**: **Decimal handling inconsistencies** - Conversión Prisma Decimal → decimal.js rompe cálculos
  - **Mitigación**: Tests exhaustivos de precision en conversiones
  - **Contingencia**: Mantener Prisma Decimal como fallback temporal

### Riesgos Moderados

- **RISK-004**: **Zod schema drift** - Schemas Zod desincronizados con Drizzle schemas
  - **Mitigación**: Usar `drizzle-zod` para generar automáticamente
  - **Contingencia**: CI pipeline valida sincronización en cada PR
  
- **RISK-005**: **Complex relationships** - GlassTypeSolution mapping difícil de migrar
  - **Mitigación**: Migrar entidades simples primero, aprender patrones
  - **Contingencia**: Mantener lógica legacy para esta entidad específica

### Assumptions

- **ASSUMPTION-001**: Drizzle client está correctamente configurado y funcional
- **ASSUMPTION-002**: Todos los schemas Drizzle están actualizados y sincronizados con DB
- **ASSUMPTION-003**: decimal.js tiene API compatible con Prisma Decimal para casos de uso actuales
- **ASSUMPTION-004**: Team tiene capacidad de revisar PRs incrementales (1 entidad por PR)
- **ASSUMPTION-005**: No hay cambios mayores en schemas Drizzle durante migración

---

## 8. Related Specifications / Further Reading

### Documentación Interna

- [Informe Auditoría Prisma](/docs/informe-auditoria-prisma.md) - Estado actual de dependencias Prisma
- [Architecture Overview](/docs/architecture.md) - Arquitectura general del proyecto
- [Glasify Copilot Instructions](/.github/copilot-instructions.md) - Guidelines de desarrollo

### Especificaciones Relacionadas

- [SPEC-014: Static Glass Taxonomy](/specs/014-static-glass-taxonomy/) - Contexto de GlassType/GlassSolution
- [Migration Prisma to Drizzle](/docs/migration-prisma-to-drizzle.md) - Migración ORM principal

### Referencias Externas

- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview) - ORM target
- [Drizzle Zod](https://orm.drizzle.team/docs/zod) - Schema generation
- [Zod Documentation](https://zod.dev/) - Validation library
- [Decimal.js Documentation](https://mikemcl.github.io/decimal.js/) - Decimal handling
- [Factory Pattern](https://refactoring.guru/design-patterns/factory-method) - Design pattern reference

### Best Practices

- [Clean Architecture Principles](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)

---

## Notas de Implementación

### Orden de Ejecución Recomendado

1. **Week 1-2**: Phases 1-2 (Foundation + ProfileSupplier pilot)
2. **Week 3**: Phases 3-4 (GlassSupplier + GlassCharacteristic)
3. **Week 4**: Phases 5-6 (Service + GlassType)
4. **Week 5**: Phases 7-8 (GlassSolution + Model)
5. **Week 6**: Phases 9-10 (Orchestrator + Scripts)
6. **Week 7**: Phases 11-12 (Cleanup + Documentation)

### PR Strategy

- Cada entidad migrada = 1 PR independiente
- PRs pequeños y reviewables (máximo 500 líneas)
- Merge incremental a branch `fix/ORM`
- Testing exhaustivo antes de cada merge

### Rollback Plan

Si en cualquier fase se detectan problemas críticos:

1. **Revertir último commit** en branch `fix/ORM`
2. **Restaurar seeds legacy** temporalmente
3. **Análisis de root cause** antes de reintentar
4. **Ajustar plan** según lecciones aprendidas

---

**Versión**: 1.0  
**Última actualización**: 2025-11-09  
**Propietario**: Glasify Lite Team  
**Estado**: Planned - Pendiente aprobación y kick-off
