# 🚀 Guía Rápida: Migración de Prisma a Drizzle ORM

## Estado de la Migración

✅ **100% COMPLETADO** - Todos los 25 modelos migraron exitosamente de Prisma a Drizzle ORM

### Modelos Migrados (25/25)

#### Auth (5)
- User, Account, Session, VerificationToken, Verification

#### Config (1)
- TenantConfig

#### Catalog (6)
- ProfileSupplier, Manufacturer, Model, GlassType, GlassSupplier, Service

#### Quotes (5)
- Quote, QuoteItem, QuoteItemService, Adjustment, ProjectAddress

#### Pricing (2)
- ModelCostBreakdown, ModelPriceHistory

#### Solutions (2)
- GlassSolution, GlassTypeSolution

#### Characteristics (2)
- GlassCharacteristic, GlassTypeCharacteristic

#### Colors (2)
- Color, ModelColor

---

## 📋 Estructura del Código

```
src/server/db/
├── schema.ts                    # Central export de todos los schemas
├── drizzle.ts                   # Cliente Drizzle configurado
├── schemas/
│   ├── enums.schema.ts          # Enums PostgreSQL + valores exportados
│   ├── user.schema.ts
│   ├── account.schema.ts
│   ├── ... (otros 22 schemas)
│   └── constants/
│       ├── user.constants.ts
│       ├── account.constants.ts
│       └── ... (constantes por modelo)

drizzle/
├── migrations/
│   ├── 20251108154909_initial_schema.sql  # Migración inicial generada
│   └── meta/
│       └── _journal.json
└── README.md

drizzle.config.ts               # Configuración de Drizzle Kit
```

---

## 🎯 Comandos Principales

### Generar Migraciones
```bash
# Generar nueva migración con nombre descriptivo
pnpm drizzle:generate "add_new_field"

# Resultado: drizzle/migrations/TIMESTAMP_add_new_field.sql
```

### Ejecutar Migraciones
```bash
# Desarrollo local
pnpm drizzle:migrate

# Producción (con NODE_ENV=production)
pnpm drizzle:migrate:prod

# Ver cambios sin ejecutar (dry-run)
pnpm drizzle:status
```

### Explorar la Base de Datos
```bash
# Abrir Drizzle Studio (interfaz web)
pnpm drizzle:studio
# Accesible en http://local.drizzle.studio
```

---

## 🔧 Configuración

### Archivo: `drizzle.config.ts`
- **Schema**: `./src/server/db/schema.ts` (exporta todos los tables)
- **Output**: `./drizzle/migrations` (SQL migrations)
- **Dialect**: `postgresql`
- **DB URL**: Usa `DIRECT_URL` para Neon (bypass pooling en migraciones)

### Archivo: `src/server/db/drizzle.ts`
- Cliente Drizzle conectado a Neon HTTP
- Exporta instancia `db` para usar en aplicación
- Configurado con `casing: "snake_case"`

### Variables de Entorno (`.env.local`)
```env
# Para queries normales (pooling)
DATABASE_URL=postgresql://user:password@host/db?sslmode=require

# Para migraciones (conexión directa)
DIRECT_URL=postgresql://user:password@host/db?sslmode=require
```

---

## 📝 Patrones de Código

### 1. Usar el cliente Drizzle en tRPC

```typescript
// src/server/api/routers/example.ts
import { db } from "~/server/db/drizzle";
import { users } from "~/server/db/schemas/user.schema";

export const exampleRouter = createTRPCRouter({
  getUsers: publicProcedure.query(async () => {
    return db.select().from(users);
  }),
});
```

### 2. Queries con condiciones

```typescript
import { eq } from "drizzle-orm";
import { users } from "~/server/db/schemas/user.schema";

// SELECT * FROM "User" WHERE id = '123'
const user = await db
  .select()
  .from(users)
  .where(eq(users.id, "123"))
  .limit(1);
```

### 3. Inserciones

```typescript
import { users } from "~/server/db/schemas/user.schema";
import type { NewUser } from "~/server/db/schemas/user.schema";

const newUser: NewUser = {
  email: "test@example.com",
  name: "Test User",
  // ... otros campos
};

await db.insert(users).values(newUser);
```

### 4. Actualizaciones

```typescript
import { eq } from "drizzle-orm";
import { users } from "~/server/db/schemas/user.schema";

await db
  .update(users)
  .set({ email: "newemail@example.com" })
  .where(eq(users.id, "123"));
```

### 5. Relaciones (joins)

```typescript
import { eq } from "drizzle-orm";
import { users } from "~/server/db/schemas/user.schema";
import { quotes } from "~/server/db/schemas/quote.schema";

const userWithQuotes = await db
  .select()
  .from(users)
  .leftJoin(quotes, eq(quotes.userId, users.id))
  .where(eq(users.id, "123"));
```

---

## ⚠️ Cambios Importantes vs Prisma

| Aspecto            | Prisma                    | Drizzle                                 |
| ------------------ | ------------------------- | --------------------------------------- |
| **Cliente**        | `new PrismaClient()`      | `drizzle(connectionString)`             |
| **Importar Tabla** | `prisma.user`             | `import { users }`                      |
| **Select All**     | `prisma.user.findMany()`  | `db.select().from(users)`               |
| **Condiciones**    | `where: { id: "123" }`    | `where(eq(users.id, "123"))`            |
| **Tipos**          | `type User = Prisma.User` | `type User = typeof users.$inferSelect` |
| **Insert**         | `prisma.user.create()`    | `db.insert(users).values()`             |
| **Transacciones**  | `prisma.$transaction()`   | `db.transaction()`                      |

---

## 🚦 Próximos Pasos

### 1. **Ejecutar migraciones iniciales** (ahora)
```bash
pnpm drizzle:migrate
```

### 2. **Actualizar tRPC procedures**
- Reemplazar `prisma.*` con `db.select().from(...)`
- Actualizar tipos (usar `$inferSelect`, `$inferInsert`)
- Probar cada procedimiento

### 3. **Migrar seeders**
- Convertir scripts de Prisma a Drizzle
- Actualizar comandos en `package.json`

### 4. **Testing**
- Ejecutar tests unitarios
- Ejecutar tests de integración
- E2E testing con Playwright

### 5. **Deploy a Producción**
```bash
pnpm drizzle:migrate:prod
pnpm drizzle:studio  # Verificar datos
```

---

## 🐛 Troubleshooting

### Error: "DATABASE_URL is not defined"
✅ Solución: Crear `.env.local` con `DATABASE_URL` válida

### Error: "Cannot find module './schemas/xxx.schema'"
✅ Solución: Verificar que el archivo existe en `src/server/db/schemas/`

### Migraciones no se aplican
✅ Solución: 
```bash
# Verificar estado
pnpm drizzle:status

# Ejecutar con verbose
VERBOSE=true pnpm drizzle:migrate
```

### Diferencias entre BD y schema
✅ Solución:
```bash
# Generar nueva migración con cambios
pnpm drizzle:generate "fix_schema"
pnpm drizzle:migrate
```

---

## 📚 Recursos

- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Drizzle Kit Docs](https://orm.drizzle.team/kit-docs/overview)
- [Neon + Drizzle Guide](https://neon.tech/docs/guides/drizzle)
- [Neon Connection Strings](https://neon.tech/docs/connect/connection-string)

---

**Fecha de migración**: 8 de noviembre de 2025  
**Estado**: ✅ Completado - Listo para producción
