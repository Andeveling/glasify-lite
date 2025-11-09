# Migración de Comandos: Prisma → Drizzle Kit

**Fecha**: 8 de noviembre de 2025  
**Branch**: `fix/ORM`  
**Documento**: Mapeo de comandos npm para migración ORM

---

## 📋 Resumen de Cambios

Se han actualizado todos los comandos de npm scripts en `package.json` para usar **Drizzle Kit** en lugar de **Prisma CLI**.

---

## 🔄 Mapeo de Comandos

### Comandos Principales

| Comando Original (Prisma) | Comando Nuevo (Drizzle) | Descripción |
|----------------------------|--------------------------|-------------|
| `prisma generate` | `drizzle-kit generate` | Genera migraciones SQL desde schema |
| `prisma migrate dev` | `drizzle-kit generate` | Genera y aplica migraciones (dev) |
| `prisma migrate deploy` | `drizzle-kit migrate` | Aplica migraciones (producción) |
| `prisma db push` | `drizzle-kit push` | Push directo sin migraciones |
| `prisma studio` | `drizzle-kit studio` | UI para explorar base de datos |

### Scripts Actualizados

#### 1. **Build & Postinstall**

```json
// Antes
"build": "prisma generate && next build"
"postinstall": "prisma generate"

// Después
"build": "drizzle-kit generate && next build"
"postinstall": "drizzle-kit generate"
```

**Motivo**: Drizzle genera migraciones SQL desde `schema.ts` antes de construir la app.

---

#### 2. **Database Management**

```json
// Antes
"db:generate": "prisma migrate dev"
"db:migrate": "prisma migrate deploy"
"db:push": "prisma db push"
"db:studio": "prisma studio"
"db:studio:prod": "prisma studio --browser none"

// Después
"db:generate": "drizzle-kit generate"
"db:migrate": "drizzle-kit migrate"
"db:push": "drizzle-kit push"
"db:studio": "drizzle-kit studio"
"db:studio:prod": "drizzle-kit studio --host 0.0.0.0"
"db:pull": "drizzle-kit pull"           // NUEVO
"db:check": "drizzle-kit check"          // NUEVO
"db:up": "drizzle-kit up"                // NUEVO
```

**Nuevos comandos agregados**:
- `db:pull`: Introspecciona base de datos existente y genera schema
- `db:check`: Valida schema contra base de datos
- `db:up`: Aplica solo migraciones pendientes

---

#### 3. **Drizzle Namespace (Eliminado)**

```json
// ELIMINADO (comandos movidos a db:*)
"drizzle:generate": "drizzle-kit generate --name"
"drizzle:migrate": "drizzle-kit migrate"
"drizzle:migrate:prod": "NODE_ENV=production drizzle-kit migrate"
"drizzle:status": "drizzle-kit migrate --dry"
"drizzle:studio": "drizzle-kit studio"
```

**Motivo**: Consolidar bajo namespace `db:*` para consistencia (similar a Prisma).

---

#### 4. **Vercel & Production**

```json
// Antes
"vercel:migrate": "prisma migrate deploy"

// Después
"vercel:migrate": "drizzle-kit migrate"
```

**Nota**: `production:setup` permanece sin cambios (combina env pull + migrate + seed).

---

## 🛠️ Configuración Drizzle

**Archivo**: `drizzle.config.ts`

```typescript
export default defineConfig({
  schema: "./src/server/db/schema.ts",     // Schema TypeScript
  out: "./drizzle/migrations",             // Output migraciones SQL
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
  migrations: {
    prefix: "timestamp",                   // 20250110_143022_initial.sql
    table: "_drizzle_migrations",          // Tracking table
    schema: "public",
  },
  verbose: true,
  strict: true,
});
```

---

## 📦 Diferencias Clave: Prisma vs Drizzle

| Aspecto | Prisma | Drizzle |
|---------|--------|---------|
| **Schema Definition** | `.prisma` (DSL) | `.ts` (TypeScript) |
| **Type Generation** | Automática desde schema | Inferida desde schema TS |
| **Migraciones** | Automáticas con `migrate dev` | Generadas con `generate` |
| **Client Generation** | Requiere `prisma generate` | No requiere paso adicional |
| **Studio** | UI web incluida | UI web incluida |
| **Introspección** | `prisma db pull` | `drizzle-kit pull` |

---

## 🚀 Workflow de Desarrollo

### 1. **Modificar Schema**
```bash
# Editar: src/server/db/schema.ts
# Ejemplo: Agregar nueva tabla
export const newTable = pgTable('new_table', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
});
```

### 2. **Generar Migración**
```bash
pnpm db:generate
# Genera: drizzle/migrations/20250110_143022_add_new_table.sql
```

### 3. **Aplicar Migración**
```bash
pnpm db:migrate
# Aplica: Ejecuta SQL en base de datos
```

### 4. **Verificar en Studio**
```bash
pnpm db:studio
# Abre: http://localhost:4983
```

---

## ⚠️ Consideraciones de Migración

### Seeders
- **No afectados**: Scripts en `prisma/seeders/` siguen usando cliente actual
- **Migración futura**: Actualizar imports cuando se complete migración ORM

### Scripts de Migración
- **`scripts/migrate-*.ts`**: Requieren actualización para usar Drizzle client
- **Prioridad**: MEDIA - Funcionales con Prisma temporalmente

### Tests
- **Unit tests**: Actualizar mocks de Prisma a Drizzle
- **E2E tests**: Sin cambios (usan API, no ORM directamente)

---

## 📝 Commit Message Sugerido

```
chore(db): migrate npm scripts from prisma to drizzle-kit

Replace all Prisma CLI commands with Drizzle Kit equivalents:
- Update build & postinstall: prisma generate → drizzle-kit generate
- Consolidate db:* namespace: migrate, push, studio commands
- Add new commands: db:pull, db:check, db:up for introspection
- Update vercel:migrate for production deployments

Remove redundant drizzle:* namespace (consolidated to db:*)

Configuration in drizzle.config.ts supports:
- Schema: src/server/db/schema.ts
- Migrations: drizzle/migrations/
- Dialect: postgresql (Neon Database)

Breaking changes:
- Seeders/scripts still use Prisma client (migration in progress)
- Migration files now use timestamp prefix (20250110_143022_*)

Ref: https://orm.drizzle.team/docs/get-started/postgresql-new
```

---

## 🔗 Referencias

- [Drizzle Kit Overview](https://orm.drizzle.team/kit-docs/overview)
- [Drizzle Kit Commands](https://orm.drizzle.team/kit-docs/commands)
- [Drizzle + Next.js + Neon Tutorial](https://orm.drizzle.team/docs/tutorials/drizzle-nextjs-neon)
- [Migration from Prisma](https://orm.drizzle.team/docs/get-started-postgresql#migration-from-prisma)

---

## ✅ Checklist de Verificación

- [x] Actualizar `package.json` scripts
- [x] Verificar `drizzle.config.ts` configuración
- [ ] Actualizar seeders para usar Drizzle client
- [ ] Actualizar scripts de migración (`scripts/migrate-*.ts`)
- [ ] Actualizar tests unitarios (mocks de Prisma → Drizzle)
- [ ] Documentar en `CHANGELOG.md`
- [ ] Ejecutar `pnpm db:generate` para verificar setup
- [ ] Ejecutar `pnpm db:studio` para verificar conexión

---

**Estado**: ✅ Comandos npm actualizados  
**Próximos Pasos**: Migrar seeders y scripts de migración
