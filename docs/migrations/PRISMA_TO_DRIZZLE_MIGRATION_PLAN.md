# Plan de Migración: Prisma → Drizzle ORM

## Resumen Ejecutivo

**Problema**: 40+ intentos de despliegue en Vercel fallidos por conflictos de tipos entre:
- Tipos generados por Prisma (`@prisma/client`)
- Tipos TypeScript duplicados
- Esquemas Zod duplicados
- Incompatibilidad con bundlers en edge runtime

**Solución**: Drizzle ORM elimina esta fricción mediante:
- **Fuente única de verdad**: Schema Drizzle genera tipos automáticamente
- **Sin generación de código**: Los tipos se infieren directamente del schema
- **Edge-compatible**: Funciona sin problemas en Vercel Edge Functions
- **Mejor tree-shaking**: Reduce tamaño del bundle

---

## 📊 Análisis de Alcance

### Cambios Requeridos

```
✅ Schema: prisma/schema.prisma → drizzle/schema.ts (20+ tablas)
✅ Migraciones: Prisma Migrate → Drizzle migrations
✅ Cliente ORM: Prisma Client → Drizzle + Neon Serverless
✅ tRPC Procedures: Actualizar queries/mutations
✅ Server Actions: Convertir a Drizzle
✅ Seeders: Prisma seeders → Drizzle inserts
✅ Tests: Actualizar fixtures y mocks
✅ Scripts: Migración de datos → Drizzle
✅ CI/CD: Build scripts, linting
```

### Dependencias Actuales

| Categoría | Versión Actual | Cambios |
|-----------|----------------|---------|
| **Prisma** | `6.18.0` | ❌ REMOVER |
| **TypeScript** | `5.9.3` | ✅ MANTENER |
| **Next.js** | `16.0.1` | ✅ MANTENER |
| **React** | `19.2.0` | ✅ MANTENER |
| **tRPC** | `11.6.0` | ✅ MANTENER |
| **Zod** | `4.1.12` | ✅ MANTENER (usar con Drizzle) |
| **PostgreSQL** | Neon | ✅ MANTENER |

### Nuevas Dependencias

```json
{
  "dependencies": {
    "drizzle-orm": "^0.34.0",
    "drizzle-zod": "^0.5.0",
    "pg": "^8.12.0",
    "@neondatabase/serverless": "^1.0.2" // ✅ ya existe
  },
  "devDependencies": {
    "drizzle-kit": "^0.24.0"
  }
}
```

---

## 🗂️ Estructura del Proyecto (Post-Migración)

```
src/
├── server/
│   ├── db.ts                    # Drizzle client singleton
│   ├── db/
│   │   ├── index.ts             # Re-export de cliente + schema
│   │   ├── schema.ts            # Esquema Drizzle (reemplaza prisma/schema.prisma)
│   │   ├── relations.ts         # Relaciones Drizzle (referencias entre tablas)
│   │   └── seeds/               # Seeders con Drizzle
│   │
│   └── api/routers/
│       ├── catalog/
│       │   ├── catalog.queries.ts    # Queries actualizadas
│       │   └── catalog.mutations.ts  # Mutations actualizadas
│       ├── admin/
│       │   └── *.ts                  # Actualizadas
│       └── ...
│
├── app/
│   ├── api/trpc/
│   └── (dashboard)/
│
drizzle/                           # Config Drizzle
├── migrations/                    # Migraciones generadas
└── config.ts                      # drizzle.config.ts

prisma/                            # ❌ ELIMINAR (después de migración)
└── schema.prisma.backup           # Backup para referencia
```

---

## 📋 Plan Fase por Fase

### Fase 1: Preparación (1-2 días)

- [ ] Crear rama `feat/prisma-to-drizzle`
- [ ] Instalar dependencias Drizzle
- [ ] Configurar `drizzle.config.ts`
- [ ] Convertir schema Prisma → Drizzle
- [ ] Crear migraciones iniciales
- [ ] Documentar mapping de tipos

**Deliverables**:
- `src/server/db/schema.ts` (completo)
- `drizzle/migrations/0001_initial.sql`
- `drizzle.config.ts`

---

### Fase 2: Migraciones y Setup Base (2-3 días)

- [ ] Crear cliente Drizzle (`src/server/db.ts`)
- [ ] Implementar relaciones
- [ ] Actualizar seeders
- [ ] Crear fixtures para tests
- [ ] Migrar datos en dev

**Deliverables**:
- `src/server/db/index.ts` (cliente + schema)
- `src/server/db/relations.ts`
- Seeders migrados
- Test fixtures

---

### Fase 3: tRPC & Server Logic (3-4 días)

- [ ] Actualizar routers tRPC (queries)
- [ ] Actualizar mutations
- [ ] Migrar servicios de negocio
- [ ] Actualizar procedimientos administrativos
- [ ] Validar tipos generados automáticamente

**Routers a Actualizar** (en orden de dependencia):
1. `catalog.queries.ts` (base sin dependencias complejas)
2. `glass-type.ts`, `glass-solution.ts`
3. `tenant-config.ts`, `profile-supplier.ts`
4. `quote.ts` (más complejo, depende de otros)
5. `admin/*` (últimos, menos críticos)

**Deliverables**:
- Todos los routers actualizados
- Tipos generados automáticamente por Drizzle

---

### Fase 4: Acciones del Servidor (2 días)

- [ ] Migrar Server Actions
- [ ] Actualizar datos revalidation
- [ ] Validar cache invalidation

**Deliverables**:
- Todas las Server Actions funcionando

---

### Fase 5: Tests & QA (2-3 días)

- [ ] Unit tests (Vitest)
- [ ] Integration tests (tRPC)
- [ ] E2E tests (Playwright)
- [ ] Validar migraciones

**Criterios de Éxito**:
- ✅ 0 errores de compilación TypeScript
- ✅ 100% cobertura de tipos Drizzle
- ✅ Tests pasando
- ✅ Sin duplicación de tipos

---

### Fase 6: Build & Despliegue (1-2 días)

- [ ] Actualizar `build` script en `package.json`
- [ ] Probar build local
- [ ] Deploy a staging (Vercel preview)
- [ ] Validar en production

**Scripts a Cambiar**:
```json
{
  "build": "next build",  // ✅ Sin "prisma generate"
  "db:migrate": "drizzle-kit migrate",
  "db:push": "drizzle-kit push:pg",
  "db:drop": "drizzle-kit drop",
  "seed": "tsx prisma/seed-cli.ts"  // Adaptar a Drizzle
}
```

---

## 🔄 Mapping: Prisma → Drizzle

### Tipos Comunes

| Prisma | Drizzle | TypeScript |
|--------|---------|-----------|
| `String` | `varchar()` / `text()` | `string` |
| `Int` | `integer()` | `number` |
| `Decimal` | `decimal()` | `Decimal` |
| `DateTime` | `timestamp()` | `Date` |
| `Boolean` | `boolean()` | `boolean` |
| `Json` | `json()` | `Record<string, any>` |
| `Enum` | `pgEnum()` | `string` (literal types) |

### Relaciones

| Patrón | Prisma | Drizzle |
|--------|--------|---------|
| One-to-Many | `@relation()` | `relations()` helper |
| Many-to-One | FK implicit | `references()` |
| Many-to-Many | Junction table | Tabla explícita |

---

## 🎯 Beneficios Esperados

| Métrica | Antes | Después |
|---------|-------|---------|
| Tipos duplicados | 3+ fuentes | 1 única (Drizzle) |
| Errores Vercel | 40+ intentos | 0 esperados |
| Bundle size | +2-3MB (Prisma) | -500KB+ |
| Compilación | Lenta (generación) | Rápida (inferencia) |
| Type safety | Manual | Automática |
| Edge compatible | ❌ No | ✅ Sí |

---

## 🚨 Riesgos y Mitigaciones

| Riesgo | Mitigación |
|--------|-----------|
| **Pérdida de datos** | Backup pre-migración, tests en staging |
| **Downtime** | Transición gradual si es posible |
| **Debugging más lento** | Documentación completa + ejemplos |
| **Queries complejas** | Testing exhaustivo de SQL generado |

---

## 📞 Contactos y Referencias

- **Drizzle Docs**: https://orm.drizzle.team/docs/prisma
- **Next.js + Drizzle**: https://create.t3.gg/en/usage/drizzle
- **Drizzle PostgreSQL**: https://orm.drizzle.team/docs/postgresql
- **Neon + Drizzle**: https://neon.tech/docs/guides/drizzle

---

## ✅ Checklist Pre-Migración

- [ ] **Backup completo** de la base de datos
- [ ] **Rama nueva** `feat/prisma-to-drizzle`
- [ ] **Ambiente dev limpio** sin cambios pendientes
- [ ] **Git status clean** (sin archivos modificados)
- [ ] **Dependencias instaladas** (post-plan)
- [ ] **Tests pasando** (baseline actual)
- [ ] **Documentación actualizada** (este plan)

---

## 📝 Notas Importantes

1. **No es necesario reescribir todo de una vez**: Podemos hacer una migración gradual si preferimos
2. **Drizzle preserva el SQL**: Más control sobre queries complejas
3. **Mejor debugging**: Errores SQL explícitos vs abstracciones de Prisma
4. **Mejor performance**: Sin overhead de generación de código en cada build
5. **DX mejorada**: IntelliSense automático desde el schema

---

*Plan actualizado: 2025-01-10*  
*Estado: Listo para iniciar Fase 1*
