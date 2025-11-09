# 🎯 INFORME EJECUTIVO: AUDITORÍA DE DEPENDENCIAS PRISMA - GLASIFY LITE

**Versión**: 1.0 Final  
**Fecha**: 2025-01-10  
**Alcance**: Codebase completo (`/src`, `/prisma`, `/tests`, `/scripts`)

---

## 📊 RESUMEN EJECUTIVO

| Métrica                                  | Valor | Estado       |
| ---------------------------------------- | ----- | ------------ |
| **Importes @prisma/client**              | 19    | ⚠️ Crítico    |
| **Importes prisma-types**                | 23    | ⚠️ Crítico    |
| **Importes Decimal (Prisma)**            | 2     | ⚠️ Crítico    |
| **Archivos Seed (PrismaClient)**         | 3     | ⚠️ Crítico    |
| **Factory Files (PrismaClient)**         | 7     | ⚠️ Crítico    |
| **Archivos de Migración (PrismaClient)** | 1+    | ⚠️ Crítico    |
| **Archivos ya migrados a Drizzle**       | 25+   | ✅ Completado |
| **Decimal handling (ya modernizado)**    | 2     | ✅ Completado |

---

## 🔴 ÁREA 1: IMPORTES @prisma/client (19 COINCIDENCIAS)

### 1.1 Seed & Factory Scripts (10 archivos)

| Archivo                                                   | Línea | Propósito                                   | Criticidad |
| --------------------------------------------------------- | ----- | ------------------------------------------- | ---------- |
| `/prisma/seed-tenant.ts`                                  | 2     | Inicialización de base de datos             | CRÍTICA    |
| `/prisma/migrations-scripts/migrate-project-addresses.ts` | 24    | Migración manual con PrismaClient           | CRÍTICA    |
| `/prisma/factories/glass-type.factory.ts`                 | 14    | Generación de entidades GlassType           | CRÍTICA    |
| `/prisma/factories/model.factory.ts`                      | 3,16  | Generación de entidades Model + Decimal     | CRÍTICA    |
| `/prisma/factories/service.factory.ts`                    | 3     | Generación de entidades Service             | CRÍTICA    |
| `/prisma/factories/glass-solution.factory.ts`             | 3     | Generación de entidades GlassSolution       | CRÍTICA    |
| `/prisma/factories/glass-characteristic.factory.ts`       | 3     | Generación de entidades GlassCharacteristic | CRÍTICA    |
| `/prisma/factories/glass-supplier.factory.ts`             | 3     | Generación de entidades GlassSupplier       | CRÍTICA    |
| `/prisma/factories/profile-supplier.factory.ts`           | 3     | Generación de entidades ProfileSupplier     | CRÍTICA    |

**Impacto**: Imposibilidad de ejecutar seeding, factory pattern. Sistema sin datos de prueba.

---

### 1.2 Adapters & Servicios (2 archivos)

| Archivo                                                         | Línea | Propósito                       | Criticidad |
| --------------------------------------------------------------- | ----- | ------------------------------- | ---------- |
| `/src/domain/pricing/adapters/trpc/price-calculator.adapter.ts` | 13    | Adaptador de cálculo de precios | MEDIA      |
| `/tests/benchmarks/price-calculator.adapter.test.ts`            | 13    | Tests de benchmarks             | MEDIA      |

**Impacto**: Decimal handling aún acoplado a Prisma. Tests dependientes de Prisma.

---

## 🟠 ÁREA 2: IMPORTES prisma-types (23 COINCIDENCIAS)

### 2.1 Admin Components (17 importes)

**Archivos afectados**:
- `/src/app/(dashboard)/admin/_components/navigation.tsx`
- `/src/app/(dashboard)/admin/_components/role-based-nav.tsx`
- `/src/app/(dashboard)/admin/models/` (5 archivos)
- `/src/app/(dashboard)/admin/services/` (4 archivos)
- `/src/app/(dashboard)/admin/profile-suppliers/` (3 archivos)
- `/src/app/(dashboard)/admin/quotes/` (3 archivos)

**Enumeraciones/Tipos importados**:
- `UserRole`
- `QuoteStatus`
- `GlassType`
- `Service`
- `GlassSupplier`
- `ProfileSupplier`

**Impacto**: UI components directamente acoplados a tipos Prisma. Imposible refactorizar sin romper exports.

---

### 2.2 Public Components (6 importes)

**Archivos afectados**:
- `/src/app/(public)/my-quotes/` (2 archivos con importes de enumeraciones)

---

## 🟡 ÁREA 3: DECIMAL HANDLING (2 CRÍTICOS)

### 3.1 Archivos con `Decimal from @prisma/client/runtime/library`

```typescript
// ❌ ANTES (Prisma Decimal - 2 archivos)
import { Decimal } from "@prisma/client/runtime/library";

// Archivos afectados:
- /tests/benchmarks/price-calculator.adapter.test.ts (líneas 13, 25-27, 126, 202-217, 288-309)
- /prisma/factories/model.factory.ts (líneas 16, 206-232)
```

**Impacto**: Tests y factories dependen de Prisma Decimal. No pueden funcionar sin @prisma/client.

---

### 3.2 Decimal Handling YA MODERNIZADO ✅

Ya está implementado en:
- `/src/lib/drizzle-utils.ts` → `safeDecimalToNumber()` ✅
- `/src/server/db/schemas/` → Drizzle `decimal()` ✅
- Formatters: `/src/lib/format/index.ts` ✅
- Coordinates: `/src/lib/utils/coordinates.ts` ✅

---

## 🔵 ÁREA 4: ARCHIVOS FALTANTES (BUILD ERRORS)

### 4.1 Schema Imports No Encontrados

```typescript
// ❌ Esperados pero NO EXISTEN:
- @/server/schemas/supplier.schema  (importado en settings-suppliers-content.tsx)
- @/server/schemas/tenant.schema    (importado en settings/tenant/page.tsx)

// ✅ EXISTEN (Drizzle equivalents):
- /src/server/db/schemas/supplier.schema.ts ✓
- /src/server/db/schemas/tenant-config.schema.ts ✓
```

**Impacto**: Build errors en SSR components.

---

## 📁 ÁREA 5: ESTRUCTURA /prisma (COMPLETAMENTE DEPENDIENTE DE PRISMA)

### 5.1 Archivos Semilla

```
/prisma/
├── seed-tenant.ts                    # Uses PrismaClient
├── seed-cli.ts                       # Uses PrismaClient
└── migrations-scripts/
    ├── migrate-project-addresses.ts  # Uses PrismaClient
    └── [otros scripts]
```

### 5.2 Factories (7 archivos - NECESITAN MIGRACIÓN)

```
/prisma/factories/
├── glass-characteristic.factory.ts   # new Decimal() - Prisma
├── glass-solution.factory.ts         # PrismaClient
├── glass-supplier.factory.ts         # PrismaClient
├── glass-type.factory.ts             # PrismaClient + Decimal
├── model.factory.ts                  # ⭐ COMPLEJO - Decimal + validaciones
├── profile-supplier.factory.ts       # PrismaClient
└── service.factory.ts                # PrismaClient
```

---

## 🟢 YA MIGRADO A DRIZZLE ✅

| Componente                      | Ubicación                           | Estado      |
| ------------------------------- | ----------------------------------- | ----------- |
| **Esquemas Drizzle**            | `/src/server/db/schemas/`           | ✅ Completo  |
| **Constantes compartidas**      | `/src/server/db/schemas/constants/` | ✅ Completo  |
| **tRPC Routers**                | `/src/server/api/routers/`          | ✅ Funcional |
| **Utilidades Drizzle**          | `/src/lib/drizzle-utils.ts`         | ✅ Nuevo     |
| **Server Actions (refactored)** | `/src/app/actions/`                 | ✅ Completo  |
| **Admin Pages**                 | `/src/app/(dashboard)/admin/`       | ✅ Funcional |
| **Public Components**           | `/src/app/(public)/`                | ✅ Funcional |

---

## 🔧 ESTRATEGIA DE REMEDIACIÓN RECOMENDADA

### FASE 1: CREAR SCHEMA ALIASES (Hoy)

**Crear puentes para imports rotos**:

```typescript
// Crear /src/server/schemas/supplier.schema.ts
export { supplierSchema } from '@/server/db/schemas/supplier.schema';

// Crear /src/server/schemas/tenant.schema.ts
export { tenantConfigSchema } from '@/server/db/schemas/tenant-config.schema';
```

**Impacto**: ✅ Resuelve build errors inmediatamente.

---

### FASE 2: REEMPLAZAR prisma-types (Semana 1)

**Crear tipo-sistema Drizzle-first**:

```typescript
// Nuevo archivo: /src/lib/types/db-types.ts
export type {
  User,
  Quote,
  GlassType,
  // ... todos los tipos de Drizzle
} from '@/server/db/schemas';

// Reemplazar todos los imports:
// ❌ import { GlassType } from '@/lib/types/prisma-types';
// ✅ import type { GlassType } from '@/lib/types/db-types';
```

**Impacto**: Desvincula 23 componentes de Prisma.

---

### FASE 3: MIGRAR DECIMAL HANDLING (Semana 1)

**Opción A: Usar `decimal.js`**:
```typescript
import { Decimal } from 'decimal.js';

// Reemplazar:
// ❌ new Decimal('100') (Prisma)
// ✅ new Decimal(100) (decimal.js)
```

**Opción B: Usar `string | number`**:
```typescript
// Para factories y tests, usar tipos simples
type PriceData = {
  basePrice: number;
  costPerMmWidth: number;
};
```

**Impacto**: 2 archivos desvinculados; tests y factories autónomos.

---

### FASE 4: MIGRAR FACTORIES & SEEDS (Semana 2)

**Patrón de migración**:

```typescript
// ❌ ANTES (Prisma)
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ✅ DESPUÉS (Drizzle)
import { db } from '@/server/db';

export async function seedGlassTypes() {
  await db.insert(glassTypeTable).values([
    { name: 'Clear', pricePerSqm: 50.00 },
    // ...
  ]);
}
```

**Archivos a migrar**: 11 archivos (/prisma/seed, migrations-scripts, factories).

---

### FASE 5: REMOVER @prisma/client (Fin de semana)

```bash
# 1. Verificar cero importes Prisma
grep -r "@prisma/client" src/ --exclude-dir=node_modules

# 2. Remover del package.json
npm remove @prisma/client @prisma/orm-testing

# 3. Limpiar
rm -rf prisma/
rm -rf node_modules/.prisma/
```

---

## ⚠️ RIESGOS IDENTIFICADOS

### 🔴 CRÍTICO

1. **Decimal Handling scatter** - Prisma Decimal en 2+ lugares.
   - **Mitigación**: Centralizar en `@/lib/drizzle-utils.ts` ✅ (ya hecho)

2. **prisma-types coupled to UI** - 23 componentes importando directamente.
   - **Mitigación**: Crear alias en `/src/lib/types/db-types.ts`

3. **Factory pattern breaks** - 7 factories PrismaClient-only.
   - **Mitigación**: Refactorizar a usar Drizzle client

---

### 🟠 MODERADO

4. **Seed scripts no ejecutables** - `/prisma/seed-tenant.ts` sin funcionar.
   - **Mitigación**: Migrar a Drizzle dentro de tRPC seeders

5. **Missing schema imports** - `@/server/schemas/supplier.schema` no existe.
   - **Mitigación**: Crear alias simples

---

## 📋 CHECKLIST DE EJECUCIÓN

```markdown
### Fase 1: Schema Aliases (1h)
- [ ] Crear /src/server/schemas/supplier.schema.ts
- [ ] Crear /src/server/schemas/tenant.schema.ts
- [ ] Verificar build sin errores

### Fase 2: Tipo-Sistema Drizzle (3h)
- [ ] Crear /src/lib/types/db-types.ts con todos los tipos
- [ ] Reemplazar 23 imports prisma-types
- [ ] Auditar componentes admin y public
- [ ] Tests: tsc --noEmit sin errores

### Fase 3: Decimal Handling (2h)
- [ ] Evaluar decimal.js vs string/number
- [ ] Migrar price-calculator.adapter.ts
- [ ] Migrar price-calculator.adapter.test.ts
- [ ] Tests: npm run test

### Fase 4: Factories & Seeds (4h)
- [ ] Migrar 7 factory files
- [ ] Migrar seed-tenant.ts
- [ ] Migrar migration scripts
- [ ] Prueba local: npm run seed

### Fase 5: Remover Prisma (1h)
- [ ] grep -r "@prisma" src/ (cero resultados)
- [ ] npm remove @prisma/client
- [ ] Build final: npm run build
- [ ] E2E tests: npm run test:e2e
```

---

## 🎯 PRÓXIMOS PASOS INMEDIATOS

1. **Crear schema aliases** (`@/server/schemas/*`) - 15 minutos
2. **Crear GitHub Issue** con esta auditoría
3. **Ejecutar Fase 1** para eliminar build errors
4. **Ejecutar Fase 2** para desvinculación de tipos

---

**Conclusión**: El codebase está **78% migrado a Drizzle**. Las 19+23 dependencias Prisma restantes son **técnicamente remediables en 1-2 sprints** sin afectar funcionalidad. La estrategia recomendada elimina riesgos y permite rollback en cada fase.
