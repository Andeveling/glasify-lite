# 💻 Developer Tips: Trabajar con Drizzle

## Durante la Migración (Fases 2-6)

Estos tips te ayudarán a mantener la productividad mientras refactorizas.

---

## 🔧 Desarrollo Local

### Hot Reload Development

Drizzle con Next.js 16 soporta hot reload perfecto:

```bash
# Terminal 1: Dev server
pnpm dev

# Terminal 2: TypeScript watch
pnpm typecheck --watch

# Terminal 3: Logs (opcional)
tail -f logs/combined.log
```

Cambios en `schema.ts` se reflejan automáticamente sin restart.

---

### Drizzle Studio

Visualiza y gestiona datos fácilmente:

```bash
# Abrir interfaz web
pnpm db:studio

# Abre en http://localhost:5555
# ✅ Ver todas las tablas
# ✅ Editar datos directamente
# ✅ Ejecutar queries custom
```

---

## 📝 Patrones TypeScript

### Inferir Tipos Automáticamente

```typescript
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { users } from '@/server/db/schema';

// Tipo para SELECT (lectura)
type User = InferSelectModel<typeof users>;

// Tipo para INSERT (creación)
type NewUser = InferInsertModel<typeof users>;

// O usando typeof (más conciso)
import { typeof users } from '@/server/db/schema';
type UserRow = typeof users.$inferSelect;
```

### Validación con Zod + Drizzle

```typescript
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { users } from '@/server/db/schema';
import { z } from 'zod';

// Schema de insert (con validaciones)
const insertUserSchema = createInsertSchema(users, {
  email: z.string().email('Email inválido'),
  name: z.string().min(2, 'Nombre muy corto'),
});

// Schema de select (lectura)
const selectUserSchema = createSelectSchema(users);

// En tRPC
export const userRouter = createRouter({
  create: publicProcedure
    .input(insertUserSchema)
    .mutation(async ({ input }) => {
      return db.insert(users).values(input).returning();
    }),
});
```

---

## 🔍 Debugging

### Ver SQL Generado

```typescript
// Opción 1: Logs en consola
import { drizzle } from 'drizzle-orm/node-postgres';

const db = drizzle(pool, {
  schema,
  logger: true,  // Activar logs
});

// Ejecutar query
const result = await db.select().from(users);
// En consola verás: SELECT "id", "email", "name" FROM "User"

// Opción 2: Ver la query antes de ejecutar
const query = db
  .select()
  .from(users)
  .where(eq(users.email, 'test@example.com'));

console.log(query.toSQL());
// Output: { sql: "SELECT ... FROM ...", params: [...] }
```

### Debugging de Relaciones

```typescript
// Si las relaciones no funcionan, verifica:

// 1. relations.ts está definido
import { relations } from '@/server/db/relations';

// 2. Usas 'with' en la query
const quotes = await db.query.quotes.findMany({
  with: {
    items: true,      // ✅ Correcto
    user: true,       // ✅ Correcto
  }
});

// 3. Si no aparecen los datos, verifica:
// - Foreign key existe en BD
// - IDs coinciden en ambas tablas
// - Usa eq() para comparaciones
```

---

## 🧪 Testing

### Setup Fixtures Drizzle

```typescript
// tests/fixtures/users.ts
import { db, users } from '@/server/db';

export const createTestUser = async (overrides = {}) => {
  const [user] = await db
    .insert(users)
    .values({
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
      ...overrides,
    })
    .returning();
  return user;
};

// tests/api/user.test.ts
import { describe, it, expect } from 'vitest';
import { createTestUser } from '../fixtures/users';

describe('User API', () => {
  it('should create user', async () => {
    const user = await createTestUser();
    expect(user.email).toBe('test@example.com');
  });
});
```

### Tests de Queries

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { db, quotes, quoteItems } from '@/server/db';
import { eq } from 'drizzle-orm';

describe('Quote Queries', () => {
  beforeEach(async () => {
    // Cleanup antes de cada test
    await db.delete(quoteItems);
    await db.delete(quotes);
  });

  it('should find quote by id', async () => {
    // Setup
    const [quote] = await db
      .insert(quotes)
      .values({
        userId: 'test-user',
        status: 'draft',
        currency: 'COP',
        total: 1000,
      })
      .returning();

    // Execute
    const found = await db
      .select()
      .from(quotes)
      .where(eq(quotes.id, quote.id))
      .limit(1);

    // Verify
    expect(found).toHaveLength(1);
    expect(found[0].id).toBe(quote.id);
  });
});
```

---

## ⚡ Performance Tips

### Índices Adecuados

Drizzle ya los incluye en schema.ts. Verifica:

```typescript
// En schema.ts ya están definidos:
@@index([userId])               // ✅
@@index([status])               // ✅
@@unique([email])               // ✅
@@index([createdAt(sort: Desc)]) // ✅ Para sorting
```

### Seleccionar Solo Campos Necesarios

```typescript
// ❌ Inefficient - Todas las columnas
const users = await db.select().from(users);

// ✅ Efficient - Solo lo necesario
const users = await db
  .select({ id: users.id, email: users.email })
  .from(users);
```

### Batch Operations

```typescript
import { chunk } from 'lodash'; // o similar

// ❌ N queries (slow)
for (const item of items) {
  await db.insert(quoteItems).values(item);
}

// ✅ 1 query con batch (fast)
await db.insert(quoteItems).values(items);

// ✅ Multiple chunks si > 1000 items
const chunks = chunk(items, 1000);
for (const chk of chunks) {
  await db.insert(quoteItems).values(chk);
}
```

### Preload con WITH

```typescript
// ❌ N queries (N+1)
const quotes = await db.select().from(quotes);
for (const quote of quotes) {
  const items = await db
    .select()
    .from(quoteItems)
    .where(eq(quoteItems.quoteId, quote.id));
}

// ✅ 1 query con JOIN (fast)
const quotes = await db.query.quotes.findMany({
  with: { quoteItems: true },
});
```

---

## 🔒 Seguridad

### Prepared Statements (Automático)

Drizzle usa prepared statements por defecto:

```typescript
// ✅ Seguro - Automáticamente parameterizado
const user = await db
  .select()
  .from(users)
  .where(eq(users.email, userInput))  // Parameterized
  .limit(1);

// Nunca hagas:
// ❌ .where(sql`email = '${userInput}'`)  // SQL injection!
```

### Validación con Zod

```typescript
// Siempre validar inputs
import { z } from 'zod';

const inputSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
});

export const userRouter = createTRouter({
  create: publicProcedure
    .input(inputSchema)  // ✅ Validación aquí
    .mutation(async ({ input }) => {
      return db.insert(users).values(input).returning();
    }),
});
```

### Autorización en Queries

```typescript
// ✅ Filtrar por usuario actual (server)
export async function getMyQuotes(userId: string) {
  "use server";
  return db.query.quotes.findMany({
    where: eq(quotes.userId, userId),  // ✅ Servidor controla
  });
}

// ❌ Nunca confíes en userId del cliente
// const quotes = await db.query.quotes.findMany({
//   where: eq(quotes.userId, body.userId)  // ❌ Usuario podría cambiar
// });
```

---

## 📊 Migration Status Tracking

Durante la refactorización, mantén control:

```typescript
// .github/MIGRATION_STATUS.md (crear)
# Migración Prisma → Drizzle

## Fase 3: tRPC Migrations

### Completados ✅
- [x] catalog/catalog.queries.ts (6 queries)
- [x] admin/profile-supplier.ts (4 endpoints)

### En Progreso 🔄
- [ ] admin/glass-type.ts (5 endpoints)
- [ ] quote/quote.ts (10 endpoints)

### Pendientes ⏳
- [ ] admin/tenant-config.ts
- [ ] cart/cart.ts
- [ ] ... (total: 45 endpoints)

### Completadas: 10/45
```

---

## 🐛 Errores Comunes

### Error: "Table not found"
```typescript
// ❌ Problema: usando nombre incorrecto
const result = await db.select().from('users');

// ✅ Solución: usar objeto
import { users } from '@/server/db/schema';
const result = await db.select().from(users);
```

### Error: "No relations found"
```typescript
// ❌ Problema: relations no importadas
const quotes = await db.query.quotes.findMany({
  with: { items: true },  // ❌ Error: relations undefined
});

// ✅ Solución: crear relations.ts
// Ver: PHASE_2_RELATIONS_SEEDERS.md
```

### Error: "Type is not assignable"
```typescript
// ❌ Problema: tipos no sincronizados
const user: User = await db.select().from(users).limit(1);

// ✅ Solución: usar tipos generados
import { InferSelectModel } from 'drizzle-orm';
type User = InferSelectModel<typeof users>;
const [user] = await db.select().from(users).limit(1);
```

### Error: "Database is locked"
```typescript
// Usualmente en testing con SQLite (no aplica a PostgreSQL)
// Si ocurre en Neon, verifica:
// 1. Solo 1 conexión activa
// 2. Pool no exhausto
// 3. Queries completadas
```

---

## ✅ Checklist Diario

Cuando trabajes en migración:

- [ ] ✅ `pnpm typecheck` = 0 errores
- [ ] ✅ `pnpm lint` = sin warnings
- [ ] ✅ `pnpm test` = tests pasando
- [ ] ✅ `pnpm build` = build limpio
- [ ] ✅ Commits con mensajes claros
- [ ] ✅ Branch actualizada con develop

---

## 📚 Referencias Rápidas

- **Query Syntax**: CONVERSION_GUIDE.md
- **Relations**: PHASE_2_RELATIONS_SEEDERS.md
- **Troubleshooting**: EXECUTION_GUIDE_PHASE1.md
- **Official Docs**: https://orm.drizzle.team/

---

*Tips compilados de experiencia migrando Prisma → Drizzle. Actualizar según se descubran nuevos patrones.*
